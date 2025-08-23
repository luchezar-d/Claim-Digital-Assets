import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

const BillingCancel = () => {
  return (
    <Container className="py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Claim Digital Assets</h1>
          <p className="text-xl text-gray-600">Discover. Claim. Earn.</p>
        </div>

        {/* Cancel Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-yellow-800 mb-4">
            Checkout Cancelled
          </h2>
          
          <p className="text-lg text-yellow-700 mb-6">
            No worries! Your subscription was not processed. You can try again anytime or continue using our free features.
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">What You Can Do:</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✨ Continue using free features</li>
              <li>🔄 Try upgrading again later</li>
              <li>💬 Contact support if you need help</li>
              <li>📱 Explore available free bonuses</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/billing">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              View Plans Again
            </Button>
          </Link>
          
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help choosing a plan? Contact us at{' '}
            <a href="mailto:support@claimdigitalassets.com" className="text-blue-600 hover:underline">
              support@claimdigitalassets.com
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default BillingCancel;
