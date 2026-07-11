import Navbar from "../components/common/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedTournaments from "../components/home/FeaturedTournaments";
import StatisticsSection from "../components/home/StatisticsSection";
import VerificationSection from "../components/home/VerificationSection";
import EcosystemSection from "../components/home/EcosystemSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/common/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <HeroSection />
      <FeaturedTournaments />
      <StatisticsSection />
      <VerificationSection />
     <EcosystemSection/>
     <CTASection/>
     <Footer/>

    </div>
  );
}

export default Home;    