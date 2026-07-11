import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full h-17 border-b border-[#d6d8d4] bg-[#f8f7f4]">
      <div className="w-full h-full px-4 md:px-[60px] flex items-center justify-between">

        {/* Logo / Website Name */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold text-[#111111] cursor-pointer"
        >
          The Elle Hub
        </Link>

        {/* Middle Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-lg text-[#252525]">

  <Link
    to="/tournaments"
    className="
      relative py-2
      hover:text-[#08733e]
      transition-colors duration-300

      after:content-['']
      after:absolute
      after:left-0
      after:bottom-0
      after:w-0
      after:h-[2px]
      after:bg-[#C9A227]
      after:transition-all
      after:duration-300

      hover:after:w-full
    "
  >
    Tournaments
  </Link>

  <Link
    to="/matches"
    className="
      relative py-2
      hover:text-[#08733e]
      transition-colors duration-300

      after:content-['']
      after:absolute
      after:left-0
      after:bottom-0
      after:w-0
      after:h-[2px]
      after:bg-[#C9A227]
      after:transition-all
      after:duration-300

      hover:after:w-full
    "
  >
    Matches
  </Link>

  <Link
    to="/rankings"
    className="
      relative py-2
      hover:text-[#08733e]
      transition-colors duration-300

      after:content-['']
      after:absolute
      after:left-0
      after:bottom-0
      after:w-0
      after:h-[2px]
      after:bg-[#C9A227]
      after:transition-all
      after:duration-300

      hover:after:w-full
    "
  >
    Rankings
  </Link>

  <Link
    to="/about"
    className="
      relative py-2
      hover:text-[#08733e]
      transition-colors duration-300

      after:content-['']
      after:absolute
      after:left-0
      after:bottom-0
      after:w-0
      after:h-[2px]
      after:bg-[#C9A227]
      after:transition-all
      after:duration-300

      hover:after:w-full
    "
  >
    About
  </Link>

</div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/login"
            className="
              bg-[#003326]
              text-[#8eb7a7]
              px-4 md:px-8
              py-2 md:py-2.5
              rounded
              text-sm md:text-base
              cursor-pointer
              hover:bg-[#08733e]
              hover:text-white
              active:scale-95
              transition-all
              duration-300
            "
          >
            Login
          </Link>

          <Link
            to="/register"
            className="
              bg-[#D6A900]
              text-[#111111]
              px-4 md:px-8
              py-2 md:py-2.5
              rounded
              text-sm md:text-base
              font-semibold
              cursor-pointer
              hover:bg-[#F2C94C]
              active:scale-95
              transition-all
              duration-300
            "
          >
            Register
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;