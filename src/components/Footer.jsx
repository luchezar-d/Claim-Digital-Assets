import { FiTwitter, FiMail } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-[#0f0f1a] border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Left Column - Copyright */}
          <div className="text-center md:text-left">
            <p className="font-body text-gray-400">
              © 2025 Claimify. All rights reserved.
            </p>
          </div>
          
          {/* Center Column - Navigation Links */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <a href="#home" className="font-body text-gray-400 hover:text-white transition-colors duration-200">
                Home
              </a>
              <a href="#offers" className="font-body text-gray-400 hover:text-white transition-colors duration-200">
                Offers
              </a>
              <a href="#about" className="font-body text-gray-400 hover:text-white transition-colors duration-200">
                About
              </a>
              <a href="#upgrade" className="font-body text-gray-400 hover:text-white transition-colors duration-200">
                Upgrade
              </a>
              <a href="#terms" className="font-body text-gray-400 hover:text-white transition-colors duration-200">
                Terms
              </a>
            </div>
          </div>
          
          {/* Right Column - Social Icons */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end space-x-4">
              <a 
                href="https://twitter.com/claimify" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter size={20} />
              </a>
              <a 
                href="https://discord.gg/claimify" 
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiDiscord size={20} />
              </a>
              <a 
                href="mailto:hello@claimify.com" 
                className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
