import { Share2, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#001E15] text-white min-h-[205px] flex items-center font-['Poppins']">
      
      <div className="w-full max-w-[1500px] mx-auto px-12 flex items-center justify-between">

        {/* LEFT */}
        <div className="w-[340px]">
          <h2 className="text-[26px] font-semibold mb-3">
            The Elle Hub
          </h2>

          <p className="text-[#58A98F] text-[15px] leading-[1.7]">
            Setting the gold standard for sports
            <br />
            tournament administration and athlete
            <br />
            certification.
          </p>
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center gap-9 text-[14px] text-[#58A98F]">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>

          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>

          <a href="#" className="hover:text-white transition-colors">
            Contact Us
          </a>

          <a href="#" className="hover:text-white transition-colors">
            Sitemap
          </a>

          <a href="#" className="hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        {/* RIGHT */}
        <div className="w-[300px] flex flex-col items-end justify-center">
          
          <div className="flex gap-4 mb-4">
            <button
              className="
                w-12 h-12
                bg-[#12352C]
                rounded-xl
                flex items-center justify-center
                cursor-pointer
                hover:bg-[#1A493C]
                active:scale-95
                transition-all
              "
            >
              <Share2 size={22} />
            </button>

            <button
              className="
                w-12 h-12
                bg-[#12352C]
                rounded-xl
                flex items-center justify-center
                cursor-pointer
                hover:bg-[#1A493C]
                active:scale-95
                transition-all
              "
            >
              <Mail size={22} />
            </button>
          </div>

          <p className="text-[#58A98F] text-[13px] whitespace-nowrap">
            © 2026 The Elle Hub. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;