import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiClock, FiExternalLink } from 'react-icons/fi';
import { getMyPackages, getPackagePlatforms } from '../api/packages';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LoadingSkeleton, { CardSkeleton } from '../components/ui/LoadingSkeleton';

const PackageOverview = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageInfo, setPackageInfo] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        console.log('🔍 PackageOverview: packageId from URL params:', packageId);
        
        // Get package info
        const packages = await getMyPackages();
        console.log('🔍 PackageOverview: All packages received:', packages);
        console.log('🔍 PackageOverview: Package IDs:', packages.map(p => p.id));
        
        const currentPackage = packages.find(pkg => pkg.id === packageId);
        console.log('🔍 PackageOverview: Current package found:', currentPackage);
        
        if (!currentPackage) {
          console.error('❌ PackageOverview: Package not found for ID:', packageId);
          setError('Package not found');
          return;
        }
        
        setPackageInfo(currentPackage);
        
        // Get platforms for this package
        const platformsData = await getPackagePlatforms(packageId);
        console.log('🔍 PackageOverview: Platforms data:', platformsData);
        setPlatforms(platformsData);
        
      } catch (err) {
        console.error('Error loading package data:', err);
        setError('Failed to load package data');
      } finally {
        setIsLoading(false);
      }
    };

    console.log('🔍 PackageOverview useEffect: packageId =', packageId);
    if (packageId) {
      fetchData();
    } else {
      console.error('❌ PackageOverview: No packageId provided');
      setError('No package ID provided');
    }
  }, [packageId]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '●';
      case 'medium': return '●●';
      case 'hard': return '●●●';
      default: return '●';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Loading...' }
          ]} />
          
          {/* Package Header Skeleton */}
          <div className="rounded-2xl bg-[#0f1220] border border-white/10 p-8 mb-8">
            <LoadingSkeleton lines={3} height="large" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LoadingSkeleton lines={2} height="small" />
              <LoadingSkeleton lines={2} height="small" />
              <LoadingSkeleton lines={2} height="small" />
            </div>
          </div>
          
          {/* Platforms Grid Skeleton */}
          <div>
            <LoadingSkeleton lines={1} height="large" className="mb-6 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Error</h2>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2"
            >
              <FiArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: packageInfo?.name || 'Package' }
        ]} />

        {/* Package Header */}
        <div className="rounded-2xl bg-[#0f1220] border border-white/10 shadow-xl shadow-black/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">{packageInfo?.name} Package</h1>
              {packageInfo?.description && (
                <p className="text-lg text-white/70 mb-4">{packageInfo.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-400/10">
              <FiCheck className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Active</span>
            </div>
          </div>

          {packageInfo?.features && packageInfo.features.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-3">What you get:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packageInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <FiCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-white/80">
                      {typeof feature === 'string' ? feature : feature.label || feature.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Platforms Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Platforms in this package</h2>
          <p className="text-white/60">Choose a platform to start your learning journey</p>
        </div>

        {platforms.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-2xl bg-[#0f1220] border border-white/10 p-8">
              <h3 className="text-xl font-semibold text-white/60 mb-2">No platforms available</h3>
              <p className="text-white/40">Platforms for this package are coming soon.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="rounded-2xl bg-[#101426] border border-white/10 p-5 hover:border-indigo-500/40 transition-all duration-200"
              >
                {/* Platform Icon Placeholder */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                    <span className="text-indigo-400 font-semibold text-lg">
                      {platform.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                    {platform.blurb && (
                      <p className="text-sm text-white/60">{platform.blurb}</p>
                    )}
                  </div>
                </div>

                {/* Platform Meta */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  {platform.difficulty && (
                    <div className={`px-2 py-1 rounded-lg ${getDifficultyColor(platform.difficulty)}`}>
                      <span className="mr-1">{getDifficultyIcon(platform.difficulty)}</span>
                      {platform.difficulty.charAt(0).toUpperCase() + platform.difficulty.slice(1)}
                    </div>
                  )}
                  {platform.estTimeMins && (
                    <div className="flex items-center space-x-1 text-white/60">
                      <FiClock className="h-4 w-4" />
                      <span>{platform.estTimeMins}min</span>
                    </div>
                  )}
                </div>

                {/* External Link */}
                {platform.externalUrl && (
                  <div className="mb-4">
                    <a
                      href={platform.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <FiExternalLink className="h-4 w-4" />
                      <span>Visit Platform</span>
                    </a>
                  </div>
                )}

                {/* Open Guide Button */}
                <button
                  onClick={() => navigate(`/packages/${packageId}/platforms/${platform.id}`)}
                  className="mt-4 w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  <span>Open Guide</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageOverview;
