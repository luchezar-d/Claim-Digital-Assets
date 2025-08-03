import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BonusList from '../components/BonusList';
import AboutSection from '../components/AboutSection';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="bg-[#0a0a0a] text-white">
      <Navbar />
      
      {/* Hero Section - Full viewport height minus navbar */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 md:px-12 bg-[#0a0a0a] pt-20">
        <HeroSection />
      </section>
      
      {/* Featured Bonuses */}
      <BonusList />
      
      {/* About Claimify */}
      <AboutSection />
      
      {/* Call to Action */}
      <CallToAction />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
