import BonusCard from './BonusCard';
import { FiTrendingUp } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { MdShowChart } from 'react-icons/md';

const BonusList = () => {
  const bonuses = [
    {
      icon: FiTrendingUp,
      title: 'Revolut',
      description: 'Sign up & complete a short crypto lesson',
      buttonLabel: 'Get free crypto',
      buttonLink: 'https://revolut.com',
    },
    {
      icon: FaBitcoin,
      title: 'Coinbase',
      description: 'Open an account & verify your identity',
      buttonLabel: 'Earn $10 in BTC',
      buttonLink: 'https://coinbase.com',
    },
    {
      icon: MdShowChart,
      title: 'Robinhood',
      description: 'Complete KYC (no deposit required)',
      buttonLabel: 'Get free stock',
      buttonLink: 'https://robinhood.com',
    },
  ];

  return (
    <section id="offers" className="py-20 px-6 bg-[#0f0f1a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
            Featured Bonuses
          </h2>
          <p className="font-body text-gray-300 text-lg max-w-2xl mx-auto">
            No deposits required. Start earning today with these exclusive offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bonuses.map((bonus, index) => (
            <BonusCard
              key={index}
              icon={bonus.icon}
              title={bonus.title}
              description={bonus.description}
              buttonLabel={bonus.buttonLabel}
              buttonLink={bonus.buttonLink}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BonusList;
