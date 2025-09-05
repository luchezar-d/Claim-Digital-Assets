import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiClock, FiExternalLink, FiRotateCcw, FiCheckSquare } from 'react-icons/fi';
import { getPlatformGuide, getMyPackages } from '../api/packages';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const PlatformGuide = () => {
  const { packageId, platformId } = useParams();
  const navigate = useNavigate();
  const [platformGuide, setPlatformGuide] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Storage key for progress persistence
  const storageKey = `guide:${packageId}:${platformId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get platform guide
        const guide = await getPlatformGuide(packageId, platformId);
        setPlatformGuide(guide);
        
        // Get package info for breadcrumbs
        const packages = await getMyPackages();
        const currentPackage = packages.find(pkg => pkg.id === packageId);
        setPackageInfo(currentPackage);
        
        // Load saved progress
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
          setCompletedSteps(new Set(JSON.parse(savedProgress)));
        }
        
      } catch (err) {
        console.error('Error loading platform guide:', err);
        setError('Failed to load platform guide');
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId && platformId) {
      fetchData();
    }
  }, [packageId, platformId, storageKey]);

  const toggleStepCompletion = (stepId) => {
    const newCompleted = new Set(completedSteps);
    
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    
    setCompletedSteps(newCompleted);
    localStorage.setItem(storageKey, JSON.stringify([...newCompleted]));
  };

  const markAllComplete = () => {
    if (!platformGuide?.steps) return;
    
    const allStepIds = platformGuide.steps.map(step => step.id);
    const newCompleted = new Set(allStepIds);
    setCompletedSteps(newCompleted);
    localStorage.setItem(storageKey, JSON.stringify(allStepIds));
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    localStorage.removeItem(storageKey);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/60 bg-white/10 border-white/10';
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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Loading...', href: '#' },
            { label: 'Platform Guide' }
          ]} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-[#0f1220] border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <LoadingSkeleton lines={2} height="large" className="w-1/2" />
                  <LoadingSkeleton lines={2} height="medium" className="w-20" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border border-white/10 rounded-lg p-4">
                      <LoadingSkeleton lines={2} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar Skeleton */}
            <div className="rounded-2xl bg-[#0f1220] border border-white/10 p-6">
              <LoadingSkeleton lines={4} className="mb-6" />
              <div className="space-y-3">
                <LoadingSkeleton lines={1} height="large" />
                <LoadingSkeleton lines={1} height="large" />
              </div>
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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Error</h2>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => navigate(`/packages/${packageId}`)}
              className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2"
            >
              <FiArrowLeft className="h-4 w-4" />
              <span>Back to Package</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = completedSteps.size;
  const totalSteps = platformGuide?.steps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: packageInfo?.name || packageId, href: `/packages/${packageId}` },
          { label: platformGuide?.name || 'Platform Guide' }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Steps Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-[#0f1220] border border-white/10 shadow-xl shadow-black/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-2">{platformGuide?.name} Guide</h1>
                  <p className="text-white/60">{platformGuide?.blurb}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white">{progressPercent}%</div>
                  <div className="text-sm text-white/60">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>Progress</span>
                  <span>{completedCount} of {totalSteps} steps</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Steps to complete</h2>
                
                {platformGuide?.steps?.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex gap-3 items-start py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center
                          ${completedSteps.has(step.id) 
                            ? 'bg-indigo-500 border-indigo-500' 
                            : 'border-white/30 hover:border-indigo-400'
                          }`}
                      >
                        {completedSteps.has(step.id) && (
                          <FiCheck className="h-3 w-3 text-white" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className={`font-medium transition-all duration-200 ${
                            completedSteps.has(step.id) 
                              ? 'text-white/60 line-through' 
                              : 'text-white'
                          }`}>
                            {index + 1}. {step.title}
                          </h3>
                          {step.detail && (
                            <p className={`text-sm mt-1 transition-all duration-200 ${
                              completedSteps.has(step.id) 
                                ? 'text-white/40 line-through' 
                                : 'text-white/70'
                            }`}>
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!platformGuide?.steps || platformGuide.steps.length === 0) && (
                  <div className="text-center py-8 text-white/60">
                    <p>No steps available for this platform yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Meta */}
            <div className="rounded-2xl bg-[#0f1220] border border-white/10 shadow-xl shadow-black/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Info</h3>
              
              <div className="space-y-4">
                {platformGuide?.difficulty && (
                  <div>
                    <span className="text-sm text-white/60 block mb-2">Difficulty</span>
                    <div className={`inline-flex px-3 py-1.5 rounded-lg border ${getDifficultyColor(platformGuide.difficulty)}`}>
                      <span className="mr-2">{getDifficultyIcon(platformGuide.difficulty)}</span>
                      {platformGuide.difficulty.charAt(0).toUpperCase() + platformGuide.difficulty.slice(1)}
                    </div>
                  </div>
                )}
                
                {platformGuide?.estTimeMins && (
                  <div>
                    <span className="text-sm text-white/60 block mb-2">Estimated Time</span>
                    <div className="flex items-center space-x-2 text-white">
                      <FiClock className="h-4 w-4 text-indigo-400" />
                      <span>{platformGuide.estTimeMins} minutes</span>
                    </div>
                  </div>
                )}
                
                {platformGuide?.externalUrl && (
                  <div>
                    <span className="text-sm text-white/60 block mb-2">Official Site</span>
                    <a
                      href={platformGuide.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <FiExternalLink className="h-4 w-4" />
                      <span>Visit Platform</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Actions */}
            <div className="rounded-2xl bg-[#0f1220] border border-white/10 shadow-xl shadow-black/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progress Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={markAllComplete}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-sm font-medium transition-colors"
                  disabled={completedCount === totalSteps}
                >
                  <FiCheckSquare className="h-4 w-4" />
                  <span>Mark all complete</span>
                </button>
                
                <button
                  onClick={resetProgress}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition-colors"
                  disabled={completedCount === 0}
                >
                  <FiRotateCcw className="h-4 w-4" />
                  <span>Reset progress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformGuide;
