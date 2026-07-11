import { BadgeCheck, Search } from "lucide-react";

function VerificationSection() {
  function handleSubmit(e) {
    e.preventDefault();

    const certificateId = e.target.certificateId.value;

    console.log("Certificate ID:", certificateId);
  }

  return (
    <section className="bg-[#003326] px-4 md:px-[60px] py-10 md:py-[75px] font-['Poppins'] text-white">
      <div className="mx-auto max-w-[900px] text-center">

        {/* Icon */}
        <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-[12px] bg-[#FFD65A] text-[#003326]">
          <BadgeCheck size={30} strokeWidth={2.3} />
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-[34px] font-bold">
          Validate Your Achievement
        </h2>

        {/* Description ek*/}
        <p className="mx-auto mt-3 max-w-[680px] text-[14px] leading-6 text-[#9bc4b5]">
          Every tournament completion grants a unique, blockchain-verified
          digital certificate. Enter your ID below to confirm authenticity instantly.
        </p>

        {/* Verification Form  eka*/}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex flex-col sm:flex-row max-w-[720px] overflow-hidden rounded-md bg-white sm:bg-white bg-transparent gap-2 sm:gap-0"
        >
          <div className="flex flex-1 items-center gap-3 px-5 bg-white rounded-md sm:rounded-none">
            <Search size={18} className="text-[#6b716e]" />

            <input
              type="text"
              name="certificateId"
              placeholder="Enter Certificate ID (e.g., ELLE-2024-XXXX)"
              className="h-[58px] w-full bg-transparent text-[14px] text-[#111513] outline-none"
            />
          </div>

          <button
            type="submit"
            className="
              w-full sm:w-auto
              sm:min-w-[180px]
              h-[58px]
              bg-[#C9A227]
              px-7
              text-[15px]
              font-semibold
              text-[#111513]
              cursor-pointer
              hover:bg-[#E1BC37]
              active:scale-[0.98]
              transition-all
              duration-200
              rounded-md sm:rounded-none
            "
          >
            Verify Now
          </button>
        </form>

        
        <p className="mt-5 text-[11px] text-[#6f9c8c]">
          Trusted by over 40+ national athletic associations.
        </p>

      </div>
    </section>
  );
}

export default VerificationSection;