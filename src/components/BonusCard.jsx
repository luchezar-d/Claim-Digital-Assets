const BonusCard = ({ icon: Icon, title, description, buttonLabel, buttonLink, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (buttonLink) {
      window.open(buttonLink, '_blank');
    }
  };

  return (
    <div className="bg-[#1a1a2e] border border-gray-700/50 rounded-lg p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 hover:border-purple-500/30 group">
      <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
        <Icon size={48} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 text-center">
        {title}
      </h3>
      <p className="text-gray-300 mb-6 text-sm leading-relaxed text-center">
        {description}
      </p>
      <button 
        onClick={handleClick}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default BonusCard;
