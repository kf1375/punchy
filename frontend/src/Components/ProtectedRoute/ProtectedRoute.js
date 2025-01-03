import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
//   return isAuthenticated ? children : <Navigate to="/login" />;
    return children;
};

export default ProtectedRoute;
