import { Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="bg-[#F8F7F4] px-4 md:px-8 lg:px-[64px] pb-12 lg:pb-[95px] font-['Poppins']">
      <div
        className="
          relative
          mx-auto
          max-w-[1500px]
          min-h-[295px]
          overflow-hidden
          rounded-[18px]
          bg-[#00382D]
          px-6
          py-10
          lg:px-[75px]
          lg:py-[55px]
          flex
          flex-col
          lg:flex-row
          items-center
          justify-between
          gap-10
          lg:gap-0
        "
      >
        {/* Decorative circles */}
        <div className="absolute -right-[70px] -top-[85px] h-[220px] w-[220px] rounded-full bg-white/[0.06]" />
        <div className="absolute right-[70px] -bottom-[95px] h-[160px] w-[160px] rounded-full bg-white/[0.05]" />

        {/* Left content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-[34px] text-center lg:text-left">
          <div
            className="
              flex
              h-20
              w-20
              lg:h-[96px]
              lg:w-[96px]
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[#C9A227]
              text-[#D6AD27]
            "
          >
            <Trophy className="w-10 h-10 lg:w-[44px] lg:h-[44px]" strokeWidth={2.2} />
          </div>

          <div>
            <h2 className="max-w-[860px] text-3xl md:text-4xl lg:text-[46px] font-extrabold leading-[1.45] tracking-[-1.2px] text-white">
              Ready to Elevate Your Tournament
              <br className="hidden lg:block" />
              Experience?
            </h2>

            <p className="mt-4 text-base lg:text-[18px] text-[#B9D3C9]">
              Join The Elle Hub and become part of Sri Lanka&apos;s modern
              tournament management platform.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          to="/register"
          className="
            relative
            z-10
            flex
            h-16
            lg:h-[104px]
            w-full
            max-w-[280px]
            lg:w-[225px]
            shrink-0
            items-center
            justify-center
            gap-4
            lg:gap-6
            rounded-[13px]
            bg-[#D5AC27]
            px-8
            text-lg
            lg:text-[20px]
            font-bold
            leading-7
            text-[#111111]
            shadow-md
            transition-all
            duration-200
            hover:-translate-y-1
            hover:bg-[#E5BE3D]
            active:translate-y-0
            active:scale-95
          "
        >
          <span className="text-center">
            Get
            <br />
            Started
          </span>

          <ArrowRight size={24} strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}

export default CTASection;