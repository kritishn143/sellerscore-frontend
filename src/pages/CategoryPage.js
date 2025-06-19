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
            <div key={business._id} className="category-page-business-card">
              <div className="category-page-business-image-container">{business.imageUrl && (
              <img src={`${REACT_APP_API_URL.split('/api')[0]}${business.imageUrl}`}
                 alt={business.businessName}className="category-page-business-image"/>
              )}
              <div className="category-page-business-rating">
                <span className="rating-display">
      {averageRatings[business._id] || 0}★
    </span>
    <span className="review-count">
      ({reviewCounts[business._id] || 0} reviews)
    </span>
  </div>
</div>
              <div className="category-page-business-info">
                <h2 className="category-page-business-name">
                  <Link to={`/business/${business.businessName}`}>{business.businessName}</Link>
                  {business.verificationStatus === 'approved' && (
                    <span title="Verified" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#0095F6"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                      </svg>
                    </span>
                  )}
                </h2>
                <p className="category-page-business-address">{business.address}</p>
                <p className="category-page-business-website">{business.website}</p>
                <p className="category-page-business-category">{business.category}</p>
                
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
