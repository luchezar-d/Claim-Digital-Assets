const DisclaimerSection = () => {
  return (
    <section className="py-16 px-6 bg-[#0f0f1a]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-8">
          <h3 className="font-heading text-lg text-amber-400 mb-4 text-center">
            Important Disclaimer
          </h3>
          <p className="font-body text-sm text-gray-300 leading-relaxed text-center">
            Availability of offers can change at any time. Some require deposits or ID verification.
            We do our best to keep listings up to date, but please double-check terms on the
            provider's website.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection;
