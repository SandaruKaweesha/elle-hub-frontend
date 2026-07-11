import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Target, 
  Globe, 
  Users, 
  History, 
  Medal,
  Activity,
  Handshake
} from "lucide-react";

function About() {
  return (
    <div className="bg-[#f8f7f4] min-h-screen font-['Poppins']">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-[80px] px-4 md:px-8 lg:px-[64px] text-center bg-[#003326] text-white overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full border-[40px] border-[#00783f]"></div>
          <div className="absolute -bottom-[50px] -left-[50px] w-[300px] h-[300px] rounded-full border-[20px] border-[#D6A900]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-[56px] font-extrabold tracking-tight leading-[1.1] mb-6">
            Elevating the Traditional <br />
            <span className="text-[#D6A900]">Sport of Elle</span>
          </h1>
          <p className="text-lg md:text-xl text-[#8eb7a7] leading-relaxed max-w-2xl mx-auto">
            The Elle Hub is Sri Lanka's premier digital platform dedicated to organizing, managing, and celebrating the rich heritage of Elle. We connect players, organizers, and fans in one unified ecosystem.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-[100px] px-4 md:px-8 lg:px-[64px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Mission Card */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-[#e5e5e5] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00783f]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-16 h-16 bg-[#00783f]/10 text-[#00783f] rounded-2xl flex items-center justify-center mb-6">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-[#111111] mb-4">Our Mission</h2>
            <p className="text-[#666666] leading-relaxed text-lg">
              To digitize and professionalize the sport of Elle across Sri Lanka by providing a comprehensive, easy-to-use platform for tournament management, team registration, and community engagement.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-[#e5e5e5] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D6A900]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-16 h-16 bg-[#D6A900]/20 text-[#b58f00] rounded-2xl flex items-center justify-center mb-6">
              <Globe size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-[#111111] mb-4">Our Vision</h2>
            <p className="text-[#666666] leading-relaxed text-lg">
              To bring local talent to the national and global spotlight, ensuring that the cultural heritage of Elle not only survives but thrives in the modern digital age.
            </p>
          </div>

        </div>
      </section>

      {/* What is The Elle Hub Section */}
      <section className="py-16 md:py-[100px] px-4 md:px-8 lg:px-[64px] bg-white border-y border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111]">What Makes Us <span className="text-[#00783f]">Different</span></h2>
          <p className="mt-4 text-[#666666] max-w-2xl mx-auto text-lg">
            We are more than just a registry. We provide end-to-end solutions for everyone involved in the sport.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#f8f7f4] border border-[#e5e5e5] text-[#00783f] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Trophy size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-3">For Organizers</h3>
            <p className="text-[#666666]">Effortlessly create tournaments, manage brackets, and update live scores.</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#f8f7f4] border border-[#e5e5e5] text-[#00783f] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-3">For Teams</h3>
            <p className="text-[#666666]">Register players, track match history, and build your squad's legacy.</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#f8f7f4] border border-[#e5e5e5] text-[#00783f] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Activity size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-3">For Referees</h3>
            <p className="text-[#666666]">Receive match assignments and submit official reports digitally.</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#f8f7f4] border border-[#e5e5e5] text-[#00783f] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Handshake size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-3">For Sponsors</h3>
            <p className="text-[#666666]">Discover and sponsor local talent to boost brand visibility.</p>
          </div>

        </div>
      </section>

      {/* Cultural Heritage Section */}
      <section className="py-16 md:py-[100px] px-4 md:px-8 lg:px-[64px] max-w-5xl mx-auto">
        <div className="bg-[#00783f] rounded-3xl p-8 md:p-16 text-white text-center shadow-xl relative overflow-hidden">
          {/* Watermark Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <History size={400} />
          </div>
          
          <div className="relative z-10">
            <Medal size={48} className="mx-auto mb-6 text-[#D6A900]" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Honoring Our Heritage</h2>
            <p className="text-lg md:text-xl text-[#e0e8e4] leading-relaxed max-w-3xl mx-auto">
              Elle is deeply rooted in Sri Lankan culture. It requires speed, agility, and immense teamwork. 
              By merging this traditional game with modern technology, The Elle Hub ensures that the spirit of 
              the game is preserved and celebrated by future generations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center px-4">
        <h2 className="text-3xl font-extrabold text-[#111111] mb-6">Ready to Step onto the Pitch?</h2>
        <Link 
          to="/register" 
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-[#111111] rounded-full hover:bg-[#00783f] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Join The Community Today
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default About;
