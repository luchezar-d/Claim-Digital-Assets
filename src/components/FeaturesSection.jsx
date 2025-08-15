import React from 'react';
import { FiTrendingUp, FiCheck, FiShield, FiUsers, FiInfo } from 'react-icons/fi';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: <FiTrendingUp size={24} />,
      title: 'Daily Updates',
      description: '150+ platforms verified daily',
    },
    {
      id: 2,
      icon: <FiCheck size={24} />,
      title: 'Clear Terms',
      description: 'No hidden requirements',
    },
    {
      id: 3,
      icon: <FiShield size={24} />,
      title: 'Trusted Only',
      description: 'Licensed platforms exclusively',
    },
    {
      id: 4,
      icon: <FiUsers size={24} />,
      title: 'Community Verified',
      description: '10k+ successful claims',
    },
  ];

  return (
    <section className="py-12 px-6 bg-[#0b0b10]">
      <div className="max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {features.map((feature) => (
            <div key={feature.id} className="text-center group">
              {/* Icon */}
              <div className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-200 mb-3 flex justify-center">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-white font-medium text-lg mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Inline Disclaimer */}
        <div className="flex items-center justify-center space-x-2 text-center">
          <FiInfo className="text-gray-400 flex-shrink-0" size={14} />
          <p className="text-gray-400 text-xs">
            Offers subject to change. Always verify with providers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
