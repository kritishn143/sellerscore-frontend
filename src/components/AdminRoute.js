// frontend/src/components/AdminRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = ({ component: Component, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/api/users/myprofile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setIsAuthenticated(true);
        setIsAdmin(res.data.role === 'admin');
        setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/useraccount" />;
  return <Component {...rest} />;
};

export default AdminRoute;