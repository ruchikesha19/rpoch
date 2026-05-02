import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.user_type)) {
    // Redirect to appropriate dashboard based on user type
    const redirectMap = {
      volunteer: '/volunteers',
      restaurant: '/restaurants'
    };
    return <Navigate to={redirectMap[currentUser.user_type] || '/login'} />;
  }

  return children;
};

export default ProtectedRoute;
