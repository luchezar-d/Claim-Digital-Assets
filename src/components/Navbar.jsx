import React, { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiUserPlus, FiLogIn } from 'react-icons/fi';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext.jsx';
import NavCart from './NavCart.jsx';
import cLogo from '../assets/images/clogo.png';

const Navbar = forwardRef(function Navbar(props, cartRef) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { openCart, itemCount } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Offers', href: '/#offers' },
    { name: 'Upgrade', href: '/#upgrade' },
    { name: 'About', href: '/#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={cLogo}
                alt="Claim Nest Logo"
                className="h-16 w-auto filter brightness-0 invert"
              />
              <span className="font-heading text-2xl font-bold text-white">Claim Nest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between w-full ml-8">
            {/* Navigation Links - positioned towards center */}
            <div className="flex items-center space-x-8 mx-auto">
              {navLinks.map((link) =>
                link.name === 'Home' ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="font-body text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="font-body text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </a>
                )
              )}
            </div>

            {/* Login/User Menu - stays on the right */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-600">
                {/* Cart Button */}
                <NavCart ref={cartRef} count={itemCount} />
                
                <Link
                  to="/dashboard"
                  className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
                  title={`Profile - ${user?.name}`}
                >
                  <FiUser size={20} />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
                  title="Logout"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/register"
                  className="p-2 font-body text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  title="Sign up"
                >
                  <FiUserPlus size={20} />
                </Link>
                <Link
                  to="/login"
                  className="p-2 font-body text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  title="Login"
                >
                  <FiLogIn size={20} />
                </Link>
              </div>
            )}
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
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) =>
              link.name === 'Home' ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="font-body block text-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="font-body block text-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              )
            )}
            <div className="pt-4 border-t border-gray-700/50">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* Cart Button for Mobile */}
                  <button
                    onClick={() => {
                      openCart();
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-body flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                  >
                    <ShoppingCart size={18} />
                    <span>Cart ({itemCount})</span>
                  </button>
                  <Link
                    to="/dashboard"
                    className="font-body flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUser size={18} />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-body flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="font-body flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUserPlus size={18} />
                    <span>Sign up</span>
                  </Link>
                  <Link
                    to="/login"
                    className="font-body flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiLogIn size={18} />
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
