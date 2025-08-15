import { Player } from '@lottiefiles/react-lottie-player';
import cryptoPhoneAnimation from '../assets/animations/Crypto  Phone.json';

const HeroSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-10 md:gap-12">
        {/* Left Column - Text Content */}
        <div className="flex-1 max-w-lg space-y-6 text-center md:text-left">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in-up">
            Unlock free crypto, stocks & perks —
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}
              no fluff, just real bonuses.
            </span>
          </h1>

          <p className="font-body text-lg md:text-xl text-gray-300 leading-relaxed animate-fade-in-up animation-delay-200">
            Start with trusted platforms like Revolut, Coinbase, Robinhood & more.
          </p>

          <div className="animate-fade-in-up animation-delay-400">
            <button
              onClick={() => scrollToSection('packages')}
              className="font-body bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right Column - Lottie Animation */}
        <div className="flex-1 flex items-center justify-center animate-fade-in-right">
          <div className="w-full max-w-sm md:max-w-lg">
            <Player
              autoplay
              loop
              src={cryptoPhoneAnimation}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '500px',
                minHeight: '300px',
              }}
              className="drop-shadow-2xl"
              fallback={
                <div className="w-full h-80 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱💰</div>
                    <p className="text-gray-400">Crypto Phone Animation</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
