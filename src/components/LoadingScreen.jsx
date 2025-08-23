import { useState, useEffect } from 'react';

const LoadingScreen = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasShownBefore, setHasShownBefore] = useState(false);

  useEffect(() => {
    // Check if we've shown the loading screen before in this session
    const hasShown = sessionStorage.getItem('loadingScreenShown');
    
    if (hasShown) {
      setIsLoaded(true);
      setHasShownBefore(true);
      return;
    }

    // Simulate loading progress only on first load
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsLoaded(true);
            sessionStorage.setItem('loadingScreenShown', 'true');
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  if (isLoaded || hasShownBefore) {
    return <div className="animate-fade-in">{children}</div>;
  }

  return (
    <>
      {/* Loading Overlay */}
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0a] via-black to-gray-900 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
                radial-gradient(circle at 50% 80%, rgba(255,255,255,0.03) 0%, transparent 40%)
              `,
            }}
          />
        </div>

        {/* Loading Content */}
        <div className="text-center relative z-10">
          {/* Logo and Loading Animation */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            {/* Claim Digital Assets Logo/Text */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                Claim Digital Assets
              </h1>
              <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
                Loading Experience...
              </p>
            </div>

            {/* Animated Loading Rings */}
            <div className="relative flex items-center justify-center">
              {/* Outer ring */}
              <div className="relative w-16 h-16 border-2 border-white/20 rounded-full animate-spin">
                {/* Middle ring */}
                <div
                  className="absolute top-2 left-2 w-12 h-12 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                />
                {/* Inner ring */}
                <div
                  className="absolute top-4 left-4 w-8 h-8 border-2 border-blue-400/60 border-t-blue-400 rounded-full animate-spin"
                  style={{ animationDuration: '0.8s' }}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-80 max-w-sm mx-auto">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              />
            </div>
            <p className="text-white/60 text-xs tracking-wider">
              {Math.round(Math.min(loadingProgress, 100))}% Complete
            </p>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) scale(1.2);
            opacity: 0.8;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default LoadingScreen;
