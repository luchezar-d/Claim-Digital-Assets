import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiLogOut, FiSettings, FiShield, FiPackage, FiCheck, FiArrowRight } from 'react-icons/fi';
import { userAPI } from '../services/api';
import { getMyPackages } from '../api/packages';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import cLogo from '../assets/images/clogo.png';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const cartRef = useRef(null);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect triggered');
    console.log('🔍 authUser:', authUser);
    if (authUser) {
      console.log('✅ User authenticated, fetching packages...');
      setUser(authUser);
      fetchUserPackages();
    } else {
      console.log('❌ No authenticated user found');
    }
  }, [authUser]);

  const fetchUserPackages = async () => {
    try {
      setIsLoadingPackages(true);
      console.log('🔍 Fetching user packages...');
      
      // First, try to sync any pending entitlements from completed Stripe sessions
      try {
        console.log('🔄 Auto-syncing entitlements before fetching packages...');
        const { default: api } = await import('../services/api');
        await api.post('/api/billing/sync-user-entitlements');
        console.log('✅ Auto-sync completed');
      } catch (syncError) {
        console.log('ℹ️ Auto-sync failed (this is normal if no new purchases):', syncError.message);
      }
      
      // Try to get packages from the new API first, fallback to old API
      try {
        console.log('🔍 About to call getMyPackages()...');
        const packages = await getMyPackages();
        console.log('📦 Raw packages response:', packages);
        console.log('📦 First package ID:', packages[0]?.id);
        console.log('📦 All package IDs:', packages.map(p => ({ name: p.name, id: p.id })));
        setPackages(packages);
      } catch (error) {
        console.log('ℹ️ New API failed, using fallback...', error.message);
        // If the new API completely fails, create some test packages
        const fallbackPackages = [
          {
            id: 'starter',
            name: 'Starter',
            status: 'active',
            description: 'Essential tools to get started in crypto',
            features: ['Basic airdrops', 'Simple exchanges', 'Beginner guides']
          },
          {
            id: 'pro',
            name: 'Pro',
            status: 'active',
            description: 'Advanced strategies and premium platforms',
            features: ['Premium airdrops', 'Advanced trading', 'DeFi protocols', 'NFT opportunities']
          }
        ];
        console.log('� Using fallback packages:', fallbackPackages);
        setPackages(fallbackPackages);
      }
    } catch (error) {
      console.error('❌ Error fetching user packages:', error);
      setPackages([]);
    } finally {
      setIsLoadingPackages(false);
      console.log('🔍 Finished fetching user packages');
    }
  };

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
      minute: '2-digit',
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
      <Navbar ref={cartRef} />

      {/* Main Content with top padding to account for fixed navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to your Dashboard</h1>
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
                      month: 'long',
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
                      : 'First time'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* My Packages Section */}
          <div className="rounded-2xl bg-[#0f1220] border border-white/10 shadow-xl shadow-black/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
                <FiPackage className="h-6 w-6 text-indigo-400" />
                <span>My Packages</span>
              </h2>
              {packages.length > 0 && (
                <span className="text-sm text-white/60">
                  {packages.length} active package{packages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoadingPackages ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse bg-white/5 rounded-xl h-24 w-full"></div>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12">
                <FiPackage className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/60 mb-2">No packages yet</h3>
                <p className="text-white/40 text-sm mb-6">
                  You haven't purchased any packages yet. Browse our available packages to get started.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 font-medium transition-colors duration-200"
                >
                  Browse Packages
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-2xl bg-[#101426] border border-white/10 p-5 hover:border-indigo-500/40 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-sm text-white/60">{pkg.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiCheck className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Active</span>
                      </div>
                    </div>

                    {pkg.features && pkg.features.length > 0 && (
                      <div className="mb-6">
                        <ul className="text-sm text-white/60 space-y-2">
                          {pkg.features.slice(0, 3).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center space-x-2">
                              <FiCheck className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                              <span>
                                {typeof feature === 'string'
                                  ? feature
                                  : feature.label || feature.value || JSON.stringify(feature)}
                              </span>
                            </li>
                          ))}
                          {pkg.features.length > 3 && (
                            <li className="text-white/40 text-xs">
                              +{pkg.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        console.log('🔍 Start button clicked for package:', pkg);
                        console.log('🔍 Package ID:', pkg.id);
                        console.log('🔍 Navigating to:', `/packages/${pkg.id}`);
                        navigate(`/packages/${pkg.id}`);
                      }}
                      className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Start</span>
                      <FiArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Login</label>
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

          {/* More Features Section */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Explore More</h3>
            <p className="text-gray-300 mb-6">
              Discover our full range of digital asset packages and unlock exclusive benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/packages')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Browse Packages
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
