const CallToAction = () => {
  return (
    <section id="upgrade" className="py-20 px-6 bg-[#1a1a2e]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
          Unlock All Bonuses
        </h2>
        <p className="font-body text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Access the full list of 50+ offers and start claiming today
        </p>
        <button className="font-body relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-5 px-16 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 text-xl group overflow-hidden">
          <span className="relative z-10">Get All Bonuses</span>
          <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 group-hover:scale-110"></div>
        </button>
      </div>
    </section>
  );
};

export default CallToAction;
