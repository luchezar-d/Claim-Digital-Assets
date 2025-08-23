import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const PlanContext = createContext();

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = async () => {
    if (!user || !token) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription({ plan: 'free', subscriptionStatus: 'incomplete' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user, token]);

  const isPro = () => subscription?.plan === 'pro' || subscription?.plan === 'elite';
  const isElite = () => subscription?.plan === 'elite';
  const isPlanActive = () => subscription?.subscriptionStatus === 'active' || subscription?.subscriptionStatus === 'trialing';

  const value = {
    subscription,
    loading,
    isPro: isPro(),
    isElite: isElite(),
    isPlanActive: isPlanActive(),
    refreshSubscription: fetchSubscription
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};

export default PlanContext;
