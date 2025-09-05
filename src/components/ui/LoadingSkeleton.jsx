/**
 * Loading skeleton component for consistent loading states
 * @param {{ className?: string, lines?: number, height?: 'small' | 'medium' | 'large' }} props
 */
export default function LoadingSkeleton({ className = '', lines = 3, height = 'medium' }) {
  const heightClasses = {
    small: 'h-4',
    medium: 'h-6',
    large: 'h-8'
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={`bg-white/10 rounded mb-3 ${heightClasses[height]} ${
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for package/platform cards
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/5 border border-white/10 p-6 ${className}`}>
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-4 bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-white/10 rounded w-5/6 mb-4" />
      <div className="h-10 bg-white/10 rounded w-32" />
    </div>
  );
}
