import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BonusList from '../components/BonusList';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="bg-[#0f0f1a] text-white">
      <Navbar />
      
      {/* Hero Section - Full viewport height minus navbar */}
      <section id="home" className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 md:px-12 bg-[#0f0f1a]">
        <HeroSection />
      </section>
      
      {/* Rest of the content */}
      <BonusList />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default HomePage;
