import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NavBar from './components/NavBar'; // Import your Navbar component
import './App.css';
import './components/NavBar.css'; // Correct path for Navbar.css

const Home = React.lazy(() => import('./pages/Home'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const BusinessRequestForm = React.lazy(() => import('./components/BusinessRequestForm'));
const UserAccount = React.lazy(() => import('./pages/UserAccount'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const BusinessDetails = React.lazy(() => import('./pages/BusinessDetails'));
const ClaimBusiness = React.lazy(() => import('./pages/ClaimBusiness'));

const App = () => {
  return (
    <Router>
      <div className="App">
        
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-dashboard" element={<AdminRoute component={AdminDashboard} />} />
            <Route path="/business-request" element={<ProtectedRoute component={BusinessRequestForm} />} />
            <Route path="/useraccount" element={<ProtectedRoute component={UserAccount} />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/business/:name" element={<BusinessDetails />} />
            <Route path="/claim-business/:id" element={<ProtectedRoute component={ClaimBusiness} />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
