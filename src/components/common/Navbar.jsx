import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="relative w-full h-16 md:h-[68px] border-b border-[#d6d8d4] bg-[#f8f7f4] z-50">
      <div className="w-full h-full px-4 md:px-[60px] flex items-center justify-between">

        {/* Logo / Website Name */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold text-[#111111] cursor-pointer"
        >
          The Elle Hub
        </Link>

        {/* Middle Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8 text-lg text-[#252525]">
          <Link to="/tournaments" className="relative py-2 hover:text-[#08733e] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full">Tournaments</Link>
          <Link to="/matches" className="relative py-2 hover:text-[#08733e] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full">Matches</Link>
          <Link to="/rankings" className="relative py-2 hover:text-[#08733e] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full">Rankings</Link>
          <Link to="/about" className="relative py-2 hover:text-[#08733e] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full">About</Link>
        </div>

        {/* Right Side Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="bg-[#003326] text-[#8eb7a7] px-8 py-2.5 rounded text-base cursor-pointer hover:bg-[#08733e] hover:text-white active:scale-95 transition-all duration-300">Login</Link>
          <Link to="/register" className="bg-[#D6A900] text-[#111111] px-8 py-2.5 rounded text-base font-semibold cursor-pointer hover:bg-[#F2C94C] active:scale-95 transition-all duration-300">Register</Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden flex items-center justify-center p-2 text-[#111111] cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 md:top-[68px] left-0 w-full bg-[#f8f7f4] border-b border-[#d6d8d4] flex flex-col items-center py-8 gap-6 lg:hidden shadow-xl z-50">
          <Link to="/tournaments" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-[#252525] hover:text-[#08733e] w-full text-center py-2">Tournaments</Link>
          <Link to="/matches" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-[#252525] hover:text-[#08733e] w-full text-center py-2">Matches</Link>
          <Link to="/rankings" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-[#252525] hover:text-[#08733e] w-full text-center py-2">Rankings</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-[#252525] hover:text-[#08733e] w-full text-center py-2">About</Link>
          
          <div className="flex flex-col gap-4 mt-4 w-full px-8">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-[#003326] text-[#8eb7a7] px-6 py-3 rounded-lg text-lg cursor-pointer hover:bg-[#08733e] hover:text-white">Login</Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-[#D6A900] text-[#111111] px-6 py-3 rounded-lg text-lg font-semibold cursor-pointer hover:bg-[#F2C94C]">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;