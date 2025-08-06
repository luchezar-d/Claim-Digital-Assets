import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiLogOut, FiSettings, FiShield } from 'react-icons/fi';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import cLogo from '../assets/images/clogo.png';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      // Only fetch fresh profile data if needed, not on every load
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        // Don't call updateUser here to avoid loops
        // updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If token is invalid, redirect to login (handled by interceptor)
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Use main navbar component */}
      <Navbar />

      {/* Main Content with top padding to account for fixed navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to your Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your account and track your rewards progress
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <FiShield className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Account Status</h3>
                  <p className="text-gray-400">{user?.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Member Since</h3>
                  <p className="text-gray-400">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FiUser className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Last Login</h3>
                  <p className="text-gray-400">
                    {user?.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('en-US')
                      : 'First time'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              <button className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                <FiSettings size={18} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiUser className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{user?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiMail className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Account Created
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{formatDate(user?.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Last Login
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                    <span className="text-white">
                      {user?.lastLogin ? formatDate(user.lastLogin) : 'First time login'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">More Features Coming Soon!</h3>
            <p className="text-gray-300 mb-6">
              We're working on exciting new features including rewards tracking, 
              offer management, and personalized recommendations.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
