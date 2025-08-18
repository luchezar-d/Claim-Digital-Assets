import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import { STORAGE_KEYS } from '../constants/storage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Fallback check: if React state hasn't updated yet, check localStorage directly
  const hasToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const isActuallyAuthenticated = isAuthenticated || !!hasToken;

  if (isLoading && !hasToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return isActuallyAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
