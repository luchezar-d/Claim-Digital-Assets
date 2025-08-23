import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

const Billing = () => {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setActionLoading(plan);
    try {
      const response = await api.post('/billing/create-checkout-session', 
        { plan }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading('portal');
    try {
      const response = await api.post('/billing/create-portal-session', 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to create portal session:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Basic features to get started',
      features: [
        'Access to free bonuses',
        'Basic product listings',
        'Community support'
      ],
      current: subscription?.plan === 'free',
      buttonText: 'Current Plan',
      disabled: true
    },
    {
      name: 'Pro',
      price: 'BGN 19.90',
      period: '/month',
      description: 'Perfect for active users',
      features: [
        'All Free features',
        'Premium bonuses',
        'Priority support',
        'Advanced filtering'
      ],
      current: subscription?.plan === 'pro',
      buttonText: subscription?.plan === 'pro' ? 'Current Plan' : 'Choose Pro',
      plan: 'pro'
    },
    {
      name: 'Elite',
      price: 'BGN 29.99',
      period: '/month',
      description: 'Maximum earning potential',
      features: [
        'All Pro features',
        'Exclusive VIP bonuses',
        'Personal account manager',
        'Early access to new features',
        'Custom integrations'
      ],
      current: subscription?.plan === 'elite',
      buttonText: subscription?.plan === 'elite' ? 'Current Plan' : 'Choose Elite',
      plan: 'elite'
    }
  ];

  if (!user) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please log in to view billing</h1>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Claim Digital Assets</h1>
        <p className="text-xl text-gray-600 mb-8">Discover. Claim. Earn.</p>
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        {loading ? (
          <p className="text-gray-600">Loading subscription info...</p>
        ) : (
          <p className="text-gray-600">
            Current plan: <span className="font-semibold capitalize">{subscription?.plan || 'free'}</span>
            {subscription?.subscriptionStatus && subscription?.subscriptionStatus !== 'incomplete' && (
              <span className="ml-2 text-sm">({subscription.subscriptionStatus})</span>
            )}
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border-2 p-8 relative ${
              plan.current
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.name === 'Pro' ? 'transform scale-105 border-blue-400' : ''}`}
          >
            {plan.name === 'Pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-600">{plan.period}</span>}
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan.plan)}
              disabled={plan.disabled || plan.current || actionLoading}
              loading={actionLoading === plan.plan}
              className={`w-full ${
                plan.current
                  ? 'bg-gray-400 cursor-not-allowed'
                  : plan.name === 'Pro'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-800 hover:bg-gray-900'
              }`}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      {/* Manage Billing */}
      {subscription?.plan !== 'free' && (
        <div className="text-center">
          <Button
            onClick={handleManageBilling}
            loading={actionLoading === 'portal'}
            variant="outline"
            className="mx-auto"
          >
            Manage Billing & Subscriptions
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Update payment method, view invoices, or cancel subscription
          </p>
        </div>
      )}
    </Container>
  );
};

export default Billing;
