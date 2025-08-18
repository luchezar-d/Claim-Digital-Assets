import { FiTwitter, FiMail } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';
import cLogo from '../assets/images/clogo.png';

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-gradient-to-t from-[#050505] to-[#0a0a0a] border-t border-gray-800/30">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 mb-8">
          {/* Left - Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={cLogo}
                alt="Claim Nest Logo"
                className="h-8 w-auto filter brightness-0 invert"
              />
              <span className="font-heading text-xl font-bold text-white">Claim Nest</span>
            </div>
            <p className="font-body text-gray-400 text-sm text-center md:text-left">
              Your gateway to exclusive signup rewards
            </p>
          </div>

          {/* Right - Social Media */}
          <div className="flex flex-col items-center space-y-3">
            <span className="font-body text-gray-300 text-sm font-medium">Connect with us</span>
            <div className="flex space-x-5">
              <a
                href="https://twitter.com/claimnest"
                className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:scale-110 transform p-2 rounded-full hover:bg-blue-400/10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://discord.gg/claimnest"
                className="text-gray-400 hover:text-indigo-400 transition-all duration-200 hover:scale-110 transform p-2 rounded-full hover:bg-indigo-400/10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join our Discord"
              >
                <SiDiscord size={20} />
              </a>
              <a
                href="mailto:hello@claimnest.io"
                className="text-gray-400 hover:text-green-400 transition-all duration-200 hover:scale-110 transform p-2 rounded-full hover:bg-green-400/10"
                aria-label="Email us"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom - Copyright and Legal */}
        <div className="pt-6 border-t border-gray-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="font-body text-gray-500 text-sm">
              © 2025 Claim Nest. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#privacy"
                className="font-body text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="font-body text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#disclaimer"
                className="font-body text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
