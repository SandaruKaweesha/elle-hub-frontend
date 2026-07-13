import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Users, Trophy } from "lucide-react";

function HeroSection() {
  return (
    <section className="bg-[#f8f7f4] px-4 md:px-[60px] pt-10 md:pt-[70px] pb-12 md:pb-[90px] font-['Poppins']">
      <div className="max-w-[1450px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10 md:gap-[70px]">

        {/* Left Content */}
        <div>
          <p className="text-[#D6A900] text-[15px] font-semibold uppercase tracking-[2px] mb-5">
            Sri Lanka's Premier Elle Platform
          </p>

          <h1 className="text-4xl md:text-[58px] font-extrabold leading-[1.08] tracking-[-1.5px] text-[#111513]">
            Elevating the Game.
            <br />
            <span className="text-[#08733e]">
              Empowering Every Player.
            </span>
          </h1>

          <p className="mt-7 max-w-[620px] text-[17px] leading-[1.8] text-[#5f6662]">
            The complete digital ecosystem for Elle tournaments, teams,
            referees, organizers, sponsors, and playground management
            across Sri Lanka.
          </p>

          {/* Hero Buttons */}
<div className="mt-9 flex flex-col sm:flex-row items-center gap-5">

  {/* Join Elle Hub Button */}
  <Link
    to="/register"
    className="
      bg-[#003326]
      text-white
      w-full sm:min-w-[250px]
      px-8
      py-4
      rounded-[4px]
      font-semibold
      flex
      items-center
      justify-center
      gap-3
      shadow-lg
      cursor-pointer
      hover:bg-[#08733e]
      hover:-translate-y-1
      active:translate-y-0
      active:scale-95
      transition-all
      duration-200
    "
  >
    Join Elle Hub
    <Users size={21} strokeWidth={2.2} />
  </Link>

  {/* Explore Tournaments Button */}
  <Link
    to="/tournaments"
    className="
      bg-[#D6A900]
      text-[#111513]
      w-full sm:min-w-[250px]
      px-8
      py-4
      rounded-[4px]
      font-semibold
      flex
      items-center
      justify-center
      gap-3
      shadow-lg
      cursor-pointer
      hover:bg-[#F2C94C]
      hover:-translate-y-1
      active:translate-y-0
      active:scale-95
      transition-all
      duration-200
    "
  >
    Explore Tournaments
    <Trophy size={21} strokeWidth={2.2} />
  </Link>

</div>
        </div>

       
       {/* Hero Image */}
<div className="relative h-[500px] rounded-[22px] overflow-hidden shadow-2xl">

  <img
    src="/images/hero.jpeg"
    alt="Elle Tournament"
    className="
      w-full
      h-full
      object-cover
      transition-transform
      duration-700
      hover:scale-105
    "
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>

  {/* Live Badge */}
  <div className="absolute top-5 left-5">
    <span className="bg-[#D6A900] text-[#111] px-4 py-2 rounded-full text-xs font-bold">
      LIVE MATCH
    </span>
  </div>

  {/* Bottom Card */}
  <div className="absolute bottom-5 left-5 right-5">

    <div className="bg-white/95 backdrop-blur-md rounded-xl px-5 py-4 shadow-lg">

      <p className="text-xs text-[#777] uppercase tracking-wide">
        Featured Tournament
      </p>

      <h3 className="text-lg font-bold text-[#111] mt-1">
        Sri Lanka National Elle Championship
      </h3>

      <p className="text-sm text-[#666] mt-1">
        Colombo • Live Now
      </p>

    </div>

  </div>

</div>

      </div>
    </section>
  );
}

export default HeroSection;