import { FiTwitter, FiMail } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';
import cLogo from '../assets/images/clogo.png';

const Footer = () => {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Offers', href: '#packages' },
    { name: 'Upgrade', href: '#upgrade' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <footer className="py-16 px-6 bg-[#0a0a0a] border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          
          {/* Left - Logo and Copyright */}
          <div className="flex items-center space-x-3">
            <img 
              src={cLogo} 
              alt="Claimify Logo" 
              className="h-8 w-auto filter brightness-0 invert"
            />
            <span className="font-heading text-lg font-bold text-white">Claimify</span>
            <span className="font-body text-gray-400 ml-4">© 2025</span>
          </div>
          
          {/* Right - Navigation and Social */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center space-x-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="font-body text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/claimify" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter size={18} />
              </a>
              <a 
                href="https://discord.gg/claimify" 
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiDiscord size={18} />
              </a>
              <a 
                href="mailto:hello@claimify.com" 
                className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <FiMail size={18} />
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
