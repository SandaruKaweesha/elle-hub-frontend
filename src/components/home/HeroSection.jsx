import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Users, Trophy } from "lucide-react";

function HeroSection() {
  return (
    <section className="bg-[#f8f7f4] px-[60px] pt-[70px] pb-[90px] font-['Poppins']">
      <div className="max-w-[1450px] mx-auto grid grid-cols-2 items-center gap-[70px]">

        {/* Left Content */}
        <div>
          <p className="text-[#D6A900] text-[15px] font-semibold uppercase tracking-[2px] mb-5">
            Sri Lanka's Premier Elle Platform
          </p>

          <h1 className="text-[58px] font-extrabold leading-[1.08] tracking-[-1.5px] text-[#111513]">
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
<div className="mt-9 flex items-center gap-5">

  {/* Join Elle Hub Button */}
  <Link
    to="/register"
    className="
      bg-[#003326]
      text-white
      min-w-[250px]
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
      min-w-[250px]
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

        {/* Right Image Placeholder */}
        <div className="h-[470px] rounded-[18px] bg-[#e7e5de] flex items-center justify-center border border-[#d6d8d4]">
          <p className="text-[#6b716e]">
            Hero Image Here
          </p>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;