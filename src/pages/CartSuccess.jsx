import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

const CartSuccess = () => {
  const [syncStatus, setSyncStatus] = useState('syncing'); // 'syncing', 'success', 'error'
  const { clearCart } = useCart();

  useEffect(() => {
    const syncEntitlements = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      console.log('Cart checkout session completed:', sessionId);
      
      if (sessionId) {
        try {
          console.log('🔄 Syncing entitlements after successful payment...');
          
          // Get auth token
          const token = localStorage.getItem('token');
          
          // Trigger entitlement sync for the current user
          const response = await axios.post(
            'http://localhost:3001/api/billing/sync-user-entitlements',
            { sessionId }, // Pass the specific session ID
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data.success) {
            console.log('✅ Entitlements synced successfully:', response.data.entitlementsCreated, 'created');
            
            // Clear the cart after successful purchase to prevent reusing old cart items
            try {
              console.log('🧹 Clearing cart after successful purchase...');
              await clearCart();
              console.log('✅ Cart cleared successfully');
            } catch (clearError) {
              console.log('⚠️ Could not clear cart (non-critical):', clearError.message);
            }
            
            setSyncStatus('success');
          } else {
            console.error('❌ Entitlement sync failed:', response.data);
            setSyncStatus('error');
          }
        } catch (error) {
          console.error('❌ Error syncing entitlements:', error);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('success'); // No session ID, assume success
      }
    };

    syncEntitlements();
  }, [clearCart]);

  return (
    <Container className="py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Claim Digital Assets</h1>
          <p className="text-xl text-gray-600">Discover. Claim. Earn.</p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
          <div className="flex justify-center mb-4">
            {syncStatus === 'syncing' ? (
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            {syncStatus === 'syncing' ? '🔄 Processing Your Purchase...' : '🎉 Purchase Successful!'}
          </h2>
          
          <p className="text-lg text-green-700 mb-6">
            {syncStatus === 'syncing' 
              ? 'We\'re setting up your digital bonus packages. This will only take a moment...'
              : syncStatus === 'success'
              ? 'Your digital bonus packages have been successfully purchased and are now available in your account.'
              : 'Your payment was successful! Please check your dashboard or contact support if your packages don\'t appear shortly.'
            }
          </p>
          
          {syncStatus === 'success' && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li>✅ Your bonuses have been added to your account</li>
                <li>✅ You'll receive a receipt via email shortly</li>
                <li>✅ All purchased items are now accessible</li>
                <li>✅ Start claiming your digital assets!</li>
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Questions about your purchase? Contact our support team at{' '}
            <a href="mailto:support@claimdigitalassets.com" className="text-blue-600 hover:underline">
              support@claimdigitalassets.com
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default CartSuccess;
