import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BusinessList from '../components/BusinessList';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/approved-businesses`);
        setBusinesses(response.data);
        await fetchRatingsAndReviews(response.data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchCategories();
    fetchBusinesses();

    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  const fetchRatingsAndReviews = async (businesses) => {
    const ratings = {};
    const counts = {};
    for (const business of businesses) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/reviews`, {
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
    return (totalRating / reviews.length).toFixed(1);
  };

  const getRecommendations = () => {
    const recommendations = {};
    businesses.forEach((business) => {
      const category = business.category;
      const averageRating = averageRatings[business._id] || 0;

      if (!recommendations[category] || averageRating > recommendations[category].average) {
        recommendations[category] = {
          business,
          average: averageRating,
          reviewCount: reviewCounts[business._id] || 0,
        };
      }
    });
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Navbar
        navItems={
          isLoggedIn ? (
            <button
              className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
              onClick={() => navigate('/useraccount')}
            >
              Profile
            </button>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )
        }
      />
      {/* Hero Section */}
      <section className="pt-28 pb-10 px-4 md:px-0 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow">Welcome to Sellerscore</h1>
        <p className="text-lg md:text-xl text-blue-600 mb-8">Discover, review, and recommend the best businesses in every category.</p>
        <div className="flex justify-center gap-4">
          {isLoggedIn ? (
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200"
              onClick={() => navigate('/useraccount')}
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200"
              onClick={() => navigate('/login')}
            >
              Login / Signup
            </button>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto w-full mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Top Categories</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <li key={category} className="bg-white p-6 rounded-xl shadow hover:bg-blue-50 transition cursor-pointer">
              <Link to={`/category/${category}`} className="text-blue-700 font-semibold text-lg">
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Business List */}
      <section className="max-w-5xl mx-auto w-full mb-10">
        <BusinessList />
      </section>

      {/* Recommendations */}
      <section className="max-w-5xl mx-auto w-full mb-16">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Recommended Businesses by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(recommendations)
            .sort((a, b) => {
              if (recommendations[b].average !== recommendations[a].average) {
                return recommendations[b].average - recommendations[a].average;
              }
              return recommendations[b].reviewCount - recommendations[a].reviewCount;
            })
            .map((category) => (
              <div key={category} className="bg-white p-6 rounded-xl shadow-md flex flex-col items-start">
                <h3 className="text-xl font-bold text-blue-800 mb-2">{category}</h3>
                <h4 className="text-lg font-semibold text-blue-600 mb-1">
                  <Link to={`/business/${recommendations[category].business.businessName}`}>
                    {recommendations[category].business.businessName}
                  </Link>
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-yellow-500 font-bold">{recommendations[category].average}★</span>
                  <span className="text-gray-500">({recommendations[category].reviewCount} reviews)</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
