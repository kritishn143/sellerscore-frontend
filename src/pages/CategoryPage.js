import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const CategoryPage = () => {
  const { category } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});
  const [currentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/approved-businesses?category=${category}`);
        const businessesData = response.data;
        setBusinesses(businessesData);
        await fetchRatingsAndReviews(businessesData);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchBusinesses();
  }, [category]);

  const fetchRatingsAndReviews = async (businesses) => {
    const ratings = {};
    const counts = {};
    for (const business of businesses) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/reviews`, {
          params: { businessId: business._id },
        });
        const reviews = response.data;
        ratings[business._id] = calculateAverageRating(reviews);
        counts[business._id] = reviews.length;
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    }
    setAverageRatings(ratings);
    setReviewCounts(counts);
  };

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = (totalRating / reviews.length).toFixed(1);
    return parseFloat(average);
  };

  const sortedBusinesses = businesses.sort((a, b) => {
    const ratingA = averageRatings[a._id] || 0;
    const ratingB = averageRatings[b._id] || 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA; // Sort by average rating (high to low)
    }
    const reviewsA = reviewCounts[a._id] || 0;
    const reviewsB = reviewCounts[b._id] || 0;
    return reviewsB - reviewsA; // Sort by review count (high to low if ratings are tied)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <NavBar
        navItems={
          <button
            className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
            onClick={() => navigate('/useraccount')}
          >
            Dashboard
          </button>
        }
      />
      <main className="flex-grow pt-28 pb-10 px-4 md:px-0 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Businesses in {category}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBusinesses.map((business) => (
            <div key={business._id} className="category-page-business-card hover:shadow-lg transition-transform duration-200">
              <div className="category-page-business-image-container flex flex-col items-center justify-center">
                {business.imageUrl && (
                  <img
                    src={business.imageUrl.startsWith('http://') || business.imageUrl.startsWith('https://')
                      ? business.imageUrl
                      : `${REACT_APP_API_URL.split('/api')[0]}${business.imageUrl}`}
                    alt={business.businessName}
                    className="category-page-business-image mb-2 shadow"
                    style={{ border: 'none' }}
                  />
                )}
                <div className="category-page-business-rating flex flex-col items-center">
                  <span className="rating-display text-lg font-semibold text-yellow-600">
                    {averageRatings[business._id] || 0}★
                  </span>
                  <span className="review-count text-gray-500 text-sm">
                    ({reviewCounts[business._id] || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="category-page-business-info flex-1 ml-6">
                <h2 className="category-page-business-name flex items-center gap-2 text-xl font-bold text-blue-800 mb-1">
                  <Link to={`/business/${business.businessName}`}>{business.businessName}</Link>
                  {business.verificationStatus === 'approved' && (
                    <span className="inline-block align-middle ml-1 relative group">
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#0095F6"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-10">
                        Verified
                      </div>
                    </span>
                  )}
                  {business.claimStatus === 'approved' && business.verificationStatus !== 'approved' && (
                    <span className="inline-block align-middle ml-1 relative group">
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#6B7280"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-10">
                        Claimed Business
                      </div>
                    </span>
                  )}
                </h2>
                <p className="category-page-business-address text-gray-700 mb-1">{business.address}</p>
                <a
                  href={business.website?.startsWith('http') ? business.website : `http://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="category-page-business-website text-blue-500 hover:underline mb-1 block"
                >
                  {business.website}
                </a>
                <span className="category-page-business-category inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold mt-1">
                  {business.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
