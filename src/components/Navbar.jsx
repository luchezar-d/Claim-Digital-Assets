import { useState } from 'react';
import { HiMenu, HiX, HiBell, HiCog, HiUserCircle } from 'react-icons/hi';
import logoImage from '../assets/images/clogo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Claimify Logo" 
                className="h-14 w-14 object-contain"
              />
              <h1 className="text-2xl font-bold text-white">Claimify</h1>
            </div>
          </div>
          
          {/* Center: Main Menu Links (Desktop) */}
          <div className="hidden lg:flex items-center justify-center flex-1 ml-24">
            <ul className="flex space-x-8 text-white font-medium">
              <li>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10">
                  Home
                </a>
              </li>
              <li>
                <a href="#offers" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10">
                  Offers
                </a>
              </li>
              <li>
                <a href="#upgrade" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10">
                  Upgrade
                </a>
              </li>
            </ul>
          </div>

          {/* Right: Icons + Login Button (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-pink-400 transition-all duration-200 p-2 rounded-lg hover:bg-white/10 hover:scale-105" aria-label="notifications">
              <HiBell size={22} />
            </button>
            <button className="text-gray-300 hover:text-purple-300 transition-all duration-200 p-2 rounded-lg hover:bg-white/10 hover:rotate-12 hover:scale-105" aria-label="settings">
              <HiCog size={22} />
            </button>
            <button className="text-gray-300 hover:text-purple-300 transition-all duration-200 p-2 rounded-lg hover:bg-white/10 hover:scale-105" aria-label="profile">
              <HiUserCircle size={22} />
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ml-2">
              Login
            </button>
          </div>

          {/* Medium screens: Menu links without icons */}
          <div className="hidden md:flex lg:hidden items-center space-x-6">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200">
              Home
            </a>
            <a href="#offers" className="text-gray-300 hover:text-white transition-colors duration-200">
              Offers
            </a>
            <a href="#upgrade" className="text-gray-300 hover:text-white transition-colors duration-200">
              Upgrade
            </a>
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200">
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition-colors duration-200"
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#0f0f1a] border-t border-gray-800/50">
              <a
                href="#home"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#offers"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Offers
              </a>
              <a
                href="#upgrade"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Upgrade
              </a>
              
              {/* Mobile Icons */}
              <div className="flex items-center justify-center space-x-6 py-3 border-t border-gray-800/50 mt-3 pt-3">
                <button className="text-gray-300 hover:text-pink-400 transition-all duration-200 p-2 hover:scale-105" aria-label="notifications">
                  <HiBell size={22} />
                </button>
                <button className="text-gray-300 hover:text-purple-300 transition-all duration-200 p-2 hover:rotate-12 hover:scale-105" aria-label="settings">
                  <HiCog size={22} />
                </button>
                <button className="text-gray-300 hover:text-purple-300 transition-all duration-200 p-2 hover:scale-105" aria-label="profile">
                  <HiUserCircle size={22} />
                </button>
              </div>
              
              <button className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200">
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
