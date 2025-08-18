import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const PackagesSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, openCart } = useCart();

  const packages = [
    {
      id: 'starter',
      title: 'Free-Only Deals',
      reward: 'Up to $50',
      price: 'Free',
      priceCents: 0,
      icon: '🎁',
      color: 'green',
      description: 'Sign up. Earn instantly. No strings attached.',
      features: ['100% free signup', 'Instant rewards', 'No KYC needed', 'Trusted platforms'],
      cta: 'Add to Cart',
      route: '/packages/free',
      highlight: false,
    },
    {
      id: 'pro',
      title: 'No-Deposit Perks',
      reward: 'Up to $500',
      price: '€9.90',
      priceCents: 990,
      icon: '💎',
      color: 'purple',
      description: 'Earn real assets like crypto or stocks — no deposit required.',
      features: [
        'Revolut crypto rewards',
        'Trading212 free stock',
        'No payment upfront',
        'Verified offers only',
      ],
      cta: 'Add to Cart',
      route: '/packages/no-deposit',
      highlight: true,
    },
    {
      id: 'elite',
      title: 'Verified Deposit Bonuses',
      reward: 'Up to $300',
      price: '€29.90',
      priceCents: 2990,
      icon: '🏦',
      color: 'blue',
      description: 'Earn high-value rewards with transparent deposit offers.',
      features: [
        'Binance deposit bonuses',
        'eToro trading perks',
        'Transparent terms',
        'Real cash or crypto',
      ],
      cta: 'Add to Cart',
      route: '/packages/deposit',
      highlight: false,
    },
  ];

  const handleAddToCart = async (pkg) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      console.log('Adding to cart:', pkg.id);
      
      // Find the product by slug from the database
      const response = await api.get(`/products/${pkg.id}`);
      const product = response.data;
      
      console.log('Found product:', product);
      
      await addToCart(product._id, 1);
      console.log('Added to cart successfully');
      openCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      
      // Don't show alert for duplicate items, just open cart to show what's there
      if (error.message === 'This package is already in your cart') {
        openCart();
        return;
      }
      
      alert(`Failed to add item to cart: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-[#0e0e15] to-[#0b0b10] text-white overflow-visible">
      <div className="container mx-auto">
        <h2 className="font-heading text-4xl font-bold text-center mb-4">Choose Your Package</h2>
        <p className="font-body text-center mb-4 text-gray-400">
          Explore verified signup rewards, crypto bonuses, fintech perks & more.
        </p>
        <p className="font-body text-center mb-12 text-sm text-purple-400 font-medium">
          ✨ One-time purchase • No subscription • Lifetime access
        </p>

        {/* Cards Container - Responsive sizing */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-stretch overflow-visible relative z-10 max-w-6xl mx-auto pt-6">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`
                group relative cursor-pointer transition-transform duration-150 ease-out hover:z-20
                rounded-2xl lg:rounded-3xl shadow-lg flex flex-col justify-between text-center
                w-full max-w-[320px] lg:max-w-[320px] min-h-[380px] lg:min-h-[480px] mx-auto
                ${pkg.highlight ? 'lg:scale-110 lg:hover:scale-[1.155]' : 'hover:scale-105'}
                ${
                  pkg.highlight
                    ? 'bg-gradient-to-br from-purple-600/30 via-pink-500/30 to-purple-800/20 border-2 border-pink-400 shadow-pink-500/40 shadow-2xl'
                    : `bg-[#14141f] border-2 ${pkg.color === 'green' ? 'border-green-600/60' : 'border-blue-600/60'} shadow-xl`
                }
                hover:shadow-2xl
                ${
                  pkg.color === 'green'
                    ? 'hover:border-green-400 hover:shadow-green-500/30'
                    : pkg.color === 'blue'
                      ? 'hover:border-blue-400 hover:shadow-blue-500/30'
                      : pkg.highlight
                        ? 'hover:border-pink-300 hover:shadow-pink-500/50'
                        : ''
                }
              `}
            >
              {/* Popular Badge for Highlighted Card */}
              {pkg.highlight && (
                <div className="absolute -top-3 lg:-top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-xl border-2 border-white/20">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Purple/Pink Glow Effect for Middle Card */}
              {pkg.highlight && (
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-60 pointer-events-none"></div>
              )}

              {/* Card Content */}
              <div className="relative z-10 p-5 lg:p-8 h-full flex flex-col justify-between">
                {/* Icon & Badge */}
                <div className="flex flex-col items-center mb-4 lg:mb-6">
                  <div
                    className={`
                    text-3xl lg:text-5xl mb-3 lg:mb-4 p-3 lg:p-4 rounded-full transition-transform duration-300
                    group-hover:scale-110 group-hover:rotate-6
                    ${
                      pkg.highlight
                        ? 'bg-purple-500/20'
                        : pkg.color === 'green'
                          ? 'bg-green-500/20'
                          : 'bg-blue-500/20'
                    }
                  `}
                  >
                    {pkg.icon}
                  </div>
                  <span
                    className={`
                    text-xs lg:text-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 font-semibold mb-2
                    ${
                      pkg.highlight
                        ? 'bg-white text-purple-600'
                        : pkg.color === 'green'
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white'
                    }
                  `}
                  >
                    {pkg.reward}
                  </span>
                  <div
                    className={`
                    text-xl lg:text-2xl font-bold
                    ${
                      pkg.highlight
                        ? 'text-white'
                        : pkg.color === 'green'
                          ? 'text-green-400'
                          : 'text-blue-400'
                    }
                  `}
                  >
                    {pkg.price}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mb-4 lg:mb-6">
                  <h3 className="font-heading text-lg lg:text-xl font-bold mb-2 lg:mb-3">
                    {pkg.title}
                  </h3>
                  <p
                    className={`font-body text-xs lg:text-sm leading-relaxed ${pkg.highlight ? 'text-white' : 'text-gray-400'}`}
                  >
                    {pkg.description}
                  </p>
                </div>

                {/* Feature List */}
                <ul className="text-xs lg:text-sm space-y-2 lg:space-y-3 mb-6 lg:mb-8 flex-grow text-left">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 lg:gap-3 font-body">
                      <span
                        className={`
                        text-sm lg:text-lg font-bold flex-shrink-0
                        ${
                          pkg.highlight
                            ? 'text-white'
                            : pkg.color === 'green'
                              ? 'text-green-400'
                              : 'text-blue-400'
                        }
                      `}
                      >
                        ✔
                      </span>
                      <span className={pkg.highlight ? 'text-white' : 'text-gray-300'}>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(pkg);
                  }}
                  className={`
                  w-full py-2 lg:py-2.5 rounded-lg font-semibold text-xs lg:text-sm
                  transition-all duration-300 transform group-hover:scale-105 group-hover:-translate-y-1
                  shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-30
                  flex items-center justify-center gap-2
                  ${
                    pkg.highlight
                      ? 'bg-white text-purple-600 hover:bg-pink-100 focus:ring-purple-500'
                      : pkg.color === 'green'
                        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }
                `}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {pkg.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
