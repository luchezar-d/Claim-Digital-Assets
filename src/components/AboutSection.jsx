const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 animate-fade-in-up">
          Your One-Stop Hub for Free Crypto, Stocks & Financial Bonuses
        </h2>
        
        <p className="font-body text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto animate-fade-in-up">
          Claim Nest aggregates the best signup bonuses from leading fintech platforms into one convenient location. 
          Instead of hunting across dozens of websites, we track real-time offers from Revolut, Coinbase, Robinhood, 
          and 50+ other platforms so you can maximize your rewards effortlessly.
        </p>
        
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">⚠️</span>
            <h3 className="font-heading text-lg font-semibold text-amber-400">Important Disclaimer</h3>
          </div>
          <p className="font-body text-sm text-gray-300 leading-relaxed">
            Bonus availability may change in real time. We strive to keep offers updated, but terms and conditions 
            are subject to change by the respective platforms. Always verify current offers directly with the provider 
            before completing any signup process.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
