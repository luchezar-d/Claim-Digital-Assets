import React from 'react';
import { useNavigate } from 'react-router-dom';

const PackagesSection = () => {
  const navigate = useNavigate();

  const packages = [
    {
      id: 'free',
      title: 'Free-Only Deals',
      icon: '🎁',
      description: 'No deposit required. Just sign up and start earning.',
      features: [
        '100% Free',
        'Instant rewards',
        'Top trusted platforms'
      ],
      buttonText: 'Explore Free Deals',
      route: '/packages/free',
      accentColor: 'green',
      hoverClasses: 'hover:border-green-500 hover:shadow-green-500/20'
    },
    {
      id: 'deposit',
      title: 'Verified Deposit Bonuses',
      icon: '💵',
      description: 'Higher-value rewards with a small deposit.',
      features: [
        'Up to $100+ in bonuses',
        'Verified platforms only',
        'Deposit transparency'
      ],
      buttonText: 'View Bonuses',
      route: '/packages/deposit',
      accentColor: 'blue',
      hoverClasses: 'hover:border-blue-500 hover:shadow-blue-500/20 hover:bg-gradient-to-br hover:from-blue-900/10 hover:to-purple-900/10'
    },
    {
      id: 'casino',
      title: 'Casino & Misc Offers',
      icon: '🎰',
      description: 'Gaming & special offers with additional perks.',
      features: [
        'Fast payouts',
        'Game-related bonuses',
        'Mixed requirements'
      ],
      buttonText: 'Explore Offers',
      route: '/packages/casino',
      accentColor: 'pink',
      hoverClasses: 'hover:border-pink-500 hover:shadow-pink-500/20 hover:ring-2 hover:ring-pink-500/30'
    }
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  const getIconCircleClasses = (accentColor) => {
    const colorMap = {
      green: 'bg-green-500/20 border-green-500/30 text-green-400 shadow-green-500/30',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-blue-500/30',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400 shadow-pink-500/30'
    };
    return colorMap[accentColor] || colorMap.green;
  };

  const getButtonClasses = (accentColor) => {
    const colorMap = {
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      blue: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
      pink: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500'
    };
    return colorMap[accentColor] || colorMap.green;
  };

  return (
    <section id="packages" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your Package
          </h2>
          <p className="font-body text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find the perfect deals for your needs. All packages are curated and verified by our team.
          </p>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleCardClick(pkg.route)}
              className={`
                group cursor-pointer min-h-[400px] flex flex-col
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8
                transition-all duration-300 hover:scale-105 hover:shadow-xl
                ${pkg.hoverClasses}
              `}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`
                  w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl
                  shadow-lg transition-all duration-300 group-hover:scale-110
                  ${getIconCircleClasses(pkg.accentColor)}
                `}>
                  {pkg.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading text-2xl font-bold text-white mb-4 text-center">
                {pkg.title}
              </h3>

              {/* Description */}
              <p className="font-body text-gray-300 text-center mb-6 leading-relaxed">
                {pkg.description}
              </p>

              {/* Features List */}
              <div className="flex-1 mb-8">
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="font-body text-gray-300 flex items-center">
                      <svg 
                        className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button 
                className={`
                  font-body w-full py-3 px-6 rounded-lg text-white font-semibold
                  transition-all duration-300 transform group-hover:scale-105
                  focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg
                  ${getButtonClasses(pkg.accentColor)}
                `}
              >
                {pkg.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="font-body text-gray-400 text-sm">
            Can't decide? Start with our free deals and upgrade anytime.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PackagesSection;
