import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userExists }) => {
  // If userExists is true, show the protected content, otherwise redirect to login
  return userExists ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;