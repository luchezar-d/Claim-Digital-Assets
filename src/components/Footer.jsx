const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-[#0f0f1a] border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gray-400 text-lg mb-6">
          Want more offers?{' '}
          <button className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors duration-200">
            Upgrade to Pro
          </button>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
          <span>© 2025 Claimify. All rights reserved.</span>
          <div className="flex space-x-6">
            <button className="hover:text-gray-300 transition-colors duration-200">
              Terms of Service
            </button>
            <button className="hover:text-gray-300 transition-colors duration-200">
              Privacy Policy
            </button>
            <button className="hover:text-gray-300 transition-colors duration-200">
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
