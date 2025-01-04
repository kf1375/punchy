import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userState }) => {
  const navigate = useNavigate();
  // Redirect to login if the user is not authenticated
  return userState ? children : navigate('/login');
};

export default ProtectedRoute;
