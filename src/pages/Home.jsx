import Navbar from "../components/common/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedTournaments from "../components/home/FeaturedTournaments";
import StatisticsSection from "../components/home/StatisticsSection";
import VerificationSection from "../components/home/VerificationSection";

function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <HeroSection />
      <FeaturedTournaments />
      <StatisticsSection />
      <VerificationSection />

    </div>
  );
}

export default Home;    