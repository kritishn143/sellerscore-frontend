import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './BusinessDetails.css';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const BusinessDetails = () => {
  const { name } = useParams();
  const [business, setBusiness] = useState(null);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [editingReview, setEditingReview] = useState(null);
  const [user, setUser] = useState(null);
  const [userClaims, setUserClaims] = useState([]);
  const navigate = useNavigate();

  const fetchBusiness = useCallback(async () => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/users/business/name/${name}`);
      setBusiness(response.data);
    } catch (error) {
      console.error('Error fetching business details:', error);
    }
  }, [name]);

  const fetchReviews = useCallback(async () => {
    if (!business) return;
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/users/reviews?businessId=${business._id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [business]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/myprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    }
  }, []);

  const fetchUserClaims = useCallback(async (businessId) => {
    const token = localStorage.getItem('token');
    if (token && businessId) {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/my-claims`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserClaims(response.data.filter(claim => claim.businessId && claim.businessId._id === businessId));
      } catch (error) {
        // Optionally handle error
      }
    }
  }, []);

  useEffect(() => {
    fetchBusiness();
    fetchUser();
  }, [fetchBusiness, fetchUser]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (business && user) {
      fetchUserClaims(business._id);
    }
  }, [business, user, fetchUserClaims]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      alert('You must be logged in to submit a review.');
      return;
    }
    if (!comment.trim() || comment.length > 256) {
      alert('Comment is required and must be 256 characters or less.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      if (editingReview) {
        await axios.put(`${REACT_APP_API_URL}/api/users/review/${editingReview._id}`, {
          rating,
          comment,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingReview(null);
      } else {
        await axios.post(`${REACT_APP_API_URL}/api/users/review`, {
          businessId: business._id,
          rating,
          comment,
          userId: user._id, // Include user ID in review submission
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setRating(3); // Reset to default
      setComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setRating(review.rating || 3); // Default to 3 if missing
    setComment(review.comment);
  };

  const handleDelete = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/users/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const renderStars = (currentRating) => (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{ cursor: 'pointer', color: star <= currentRating ? '#ffd700' : '#e4e5e9' }}
        >
          &#9733;
        </span>
      ))}
    </div>
  );

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const calculateRatingCounts = () => {
    const counts = Array(5).fill(0);
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1] += 1;
      }
    });
    return counts;
  };

  const averageRating = calculateAverageRating();
  const ratingCounts = calculateRatingCounts();
  const totalReviews = reviews.length || 1; // Avoid division by zero

  if (!business) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <NavBar
        navItems={
          <div className="flex items-center gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
              onClick={() => navigate('/useraccount')}
            >
              Dashboard
            </button>
          </div>
        }
      />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 max-w-3xl mx-auto w-full">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col items-center text-center relative">
          {/* Claim/Resubmit Button - inside hero card, top right */}
          {!business.claimed && user && (() => {
            const hasPendingOrApproved = userClaims.some(claim => claim.status === 'pending' || claim.status === 'approved');
            const declinedClaim = userClaims.find(claim => claim.status === 'declined');
            if (hasPendingOrApproved) return null;
            if (declinedClaim) {
              return (
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200 absolute right-8 top-8"
                  onClick={() => navigate(`/claim-business/${business._id}`)}
                >
                  Resubmit Claim
                </button>
              );
            }
            return (
              <button
                className="bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200 absolute right-8 top-8"
                onClick={() => navigate(`/claim-business/${business._id}`)}
              >
                Claim Business
              </button>
            );
          })()}
          <img
            className="w-32 h-32 rounded-full object-cover shadow-lg mb-4"
            src={business.imageUrl && (business.imageUrl.startsWith('http://') || business.imageUrl.startsWith('https://')
              ? business.imageUrl
              : `${REACT_APP_API_URL.split('/api')[0]}${business.imageUrl}`)}
            alt={business.businessName}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 flex items-center justify-center gap-2 mb-2">
            {business.businessName}
            {business.verificationStatus === 'approved' && (
              <span className="inline-block align-middle ml-2 relative group">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#0095F6"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-10">
                  Verified
                </div>
              </span>
            )}
            {business.claimStatus === 'approved' && business.verificationStatus !== 'approved' && (
              <span className="inline-block align-middle ml-2 relative group">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#6B7280"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-10">
                  Claimed Business
                </div>
              </span>
            )}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-2">
            <span className="inline-flex items-center gap-2 text-gray-600 text-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {business.address}
            </span>
            <span className="inline-flex items-center gap-2 text-gray-600 text-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              {business.category}
            </span>
            <span className="inline-flex items-center gap-2 text-gray-600 text-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {new URL(business.website.startsWith('http') ? business.website : `https://${business.website}`).hostname}
              </a>
            </span>
          </div>
          <div className="flex flex-col items-center mt-4">
            <span className="text-2xl font-bold text-yellow-500 flex items-center gap-2">{averageRating} <span className="text-lg text-gray-500">/ 5</span></span>
            <span className="text-gray-500 text-sm">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-2 mt-2">
              {[5,4,3,2,1].map(star => (
                <div key={star} className="flex items-center gap-1">
                  <span className="text-gray-700 font-semibold">{star}</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-500 text-xs">{ratingCounts[star-1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Review Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">{editingReview ? 'Edit Review' : 'Submit a Review'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Rating:</label>
              {renderStars(rating)}
            </div>
            <div>
              <label className="font-semibold text-gray-700">Comment:</label>
              <textarea
                value={comment}
                maxLength={256}
                onChange={(e) => setComment(e.target.value.slice(0, 256))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="text-right text-xs text-gray-500">{comment.length}/256</div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200" disabled={!user || !user._id}>
                {editingReview ? 'Update' : 'Submit'}
              </button>
              {editingReview && (
                <button type="button" onClick={() => setEditingReview(null)} className="bg-gray-400 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200">Cancel</button>
              )}
            </div>
            {!user && (
              <div className="text-red-600 text-sm mt-2">You must be logged in to submit a review.</div>
            )}
          </form>
        </div>
        {/* Reviews List */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-blue-700 mb-4">Reviews</h3>
          <div className="grid grid-cols-1 gap-6">
            {reviews.length === 0 ? (
              <div className="text-gray-500 text-center">No reviews yet. Be the first to review!</div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-blue-50 rounded-lg p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg">
                      {review.userId.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-blue-900">{review.userId.username}</span>
                    <span className="flex items-center gap-1 text-yellow-500 font-bold ml-2">{renderStars(review.rating)}</span>
                    {user && user._id === review.userId._id && (
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => handleEdit(review)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:underline text-xs">Delete</button>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm">{review.comment}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDetails;
