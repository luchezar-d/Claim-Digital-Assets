import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import cLogo from '../assets/images/clogo.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Offers', href: '#offers' },
    { name: 'Upgrade', href: '#upgrade' },
    { name: 'About', href: '#about' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <img 
              src={cLogo} 
              alt="Claimify Logo" 
              className="h-16 w-auto filter brightness-0 invert"
            />
            <span className="font-heading text-2xl font-bold text-white">Claimify</span>
          </div>

          {/* Desktop Navigation - Moved to the right side */}
          <div className="hidden md:flex items-center space-x-8 ml-auto">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-body text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.name}
              </a>
            ))}
            
            {/* Login Button integrated in the nav */}
            <button className="font-body bg-white text-black hover:bg-gray-100 px-6 py-2.5 rounded-lg transition-all duration-200 font-medium ml-4">
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/30">
          <div className="px-4 pt-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-body block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button className="font-body w-full mt-4 bg-white text-black hover:bg-gray-100 px-6 py-2.5 rounded-lg transition-all duration-200 font-medium">
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
