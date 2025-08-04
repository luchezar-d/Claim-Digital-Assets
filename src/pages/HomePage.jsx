import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import InformationalSection from '../components/InformationalSection';
import PackagesSection from '../components/PackagesSection';
import TrustSection from '../components/TrustSection';
import DisclaimerSection from '../components/DisclaimerSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* Hidden div to prevent Tailwind from purging font classes */}
      <div className="hidden font-heading font-body"></div>
      
      <Navbar />
      
      {/* Hero Section - Full viewport height minus navbar */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 md:px-12 bg-[#0a0a0a] pt-20">
        <HeroSection />
      </section>
      
      {/* Informational Section */}
      <InformationalSection />
      
      {/* Packages Section */}
      <PackagesSection />
      
      {/* Trust Section */}
      <TrustSection />
      
      {/* Disclaimer Section */}
      <DisclaimerSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
