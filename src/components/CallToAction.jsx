const CallToAction = () => {
  return (
    <section className="py-20 px-6 bg-[#1a1a2e]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Unlock All Bonuses
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Access the full list of 50+ offers and start claiming today
        </p>
        <button className="relative bg-purple-500 hover:bg-purple-600 text-white font-bold py-5 px-16 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 text-xl group overflow-hidden">
          <span className="relative z-10">Get All Bonuses</span>
          <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 group-hover:scale-110"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </section>
  );
};

export default CallToAction;
