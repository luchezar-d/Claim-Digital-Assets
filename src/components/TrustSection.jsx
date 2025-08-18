import { FiCheck, FiShield, FiUsers, FiRefreshCw } from 'react-icons/fi';

const TrustSection = () => {
  const features = [
    {
      icon: FiRefreshCw,
      label: 'Offers checked daily',
    },
    {
      icon: FiShield,
      label: 'No hidden requirements',
    },
    {
      icon: FiCheck,
      label: 'Only trusted platforms',
    },
    {
      icon: FiUsers,
      label: 'Community-tested bonuses',
    },
  ];

  return (
    <section className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <p className="font-body text-sm text-gray-300">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
