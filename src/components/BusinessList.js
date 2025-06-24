import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [averageRatings, setAverageRatings] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/approved-businesses`);
        setBusinesses(response.data);
        await fetchRatingsAndReviews(response.data);
      } catch (error) {
        console.error('Error fetching approved businesses:', error);
      }
    };

    fetchBusinesses();
  }, []);

  const fetchRatingsAndReviews = async (businesses) => {
    const ratings = {};
    const counts = {};
    for (const business of businesses) {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/reviews`, {
          params: { businessId: business._id }
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
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  const renderStars = (currentRating) => {
    const fullStars = Math.floor(currentRating);
    const hasHalfStar = currentRating % 1 !== 0;
    const totalStars = 5;

    return (
      <div className="flex text-yellow-400 text-xl">
        {[...Array(fullStars)].map((_, index) => (
          <span key={`full-${index}`}>★</span>
        ))}
        {hasHalfStar && <span>★</span>}
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, index) => (
          <span key={`empty-${index}`} className="text-gray-300">★</span>
        ))}
      </div>
    );
  };

  const filteredBusinesses = businesses.filter(business =>
    business.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search businesses..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map(business => (
          <div key={business._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition">
            <img
              src={business.imageUrl && (business.imageUrl.startsWith('http://') || business.imageUrl.startsWith('https://')
                ? business.imageUrl
                : `${process.env.REACT_APP_API_URL.split('/api')[0]}${business.imageUrl}`)}
              alt={business.businessName}
              className="w-24 h-24 rounded-full object-cover mb-4 shadow"
            />
            <h2 className="text-xl font-bold text-blue-700 mb-1 text-center">
              <Link to={`/business/${business.businessName}`}>{business.businessName}</Link>
              {business.verificationStatus === 'approved' && (
                <span className="inline-block align-middle ml-1 relative group">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32743L14.431 11.1325L14.1082 13.5126L11.8223 14.1741L10.277 16L8 15.308L5.72296 16L4.17772 14.1741L1.89183 13.5126L1.569 11.1325L0 9.32743L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.6304 1.29622L6.00818 1.3121L8 0Z" fill="#6B7280"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.4036 5.20536L7.18853 8.61884L6.12875 7.49364C5.8814 7.23102 5.46798 7.21864 5.20536 7.466C4.94274 7.71335 4.93036 8.12677 5.17771 8.38939L6.71301 10.0195C6.9709 10.2933 7.40616 10.2933 7.66405 10.0195L11.3546 6.10111C11.6019 5.83848 11.5896 5.42507 11.3269 5.17771C11.0643 4.93036 10.6509 4.94274 10.4036 5.20536Z" fill="white"></path>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap z-10">
                    Claimed Business
                  </div>
                </span>
              )}
            </h2>
            <div className="text-gray-600 mb-2 text-center">{business.category}</div>
            <div className="text-gray-500 mb-2 text-center text-sm">{business.address}</div>
            <a
              href={business.website?.startsWith('http') ? business.website : `http://${business.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mb-2 text-center"
            >
              {business.website}
            </a>
            <div className="flex items-center gap-2 mt-2">
              {renderStars(averageRatings[business._id] || 0)}
              <span className="text-gray-500 text-sm">({reviewCounts[business._id] || 0} reviews)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessList;
