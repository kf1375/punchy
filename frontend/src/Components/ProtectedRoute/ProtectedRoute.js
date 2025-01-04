import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userState }) => {
  const { isAuthenticated } = userState || {};

  // Redirect to login if the user is not authenticated
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
