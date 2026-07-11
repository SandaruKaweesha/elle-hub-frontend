function StatCard({ value, label, goldText = false, active = false }) {
  return (
    <div
      className={`
        h-[205px]
        w-full
        rounded-[10px]
        border
        border-[#cfd5d1]
        bg-white
        flex
        flex-col
        items-center
        justify-center
        text-center
        shadow-[0_1px_2px_rgba(0,0,0,0.03)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md

        ${active ? "border-b-[5px] border-b-[#8b7000]" : ""}
      `}
    >
      <h3
        className={`
          text-[56px]
          leading-none
          font-extrabold
          tracking-[-2px]

          ${goldText ? "text-[#8b7000]" : "text-[#001f16]"}
        `}
      >
        {value}
      </h3>

      <p className="mt-5 text-[17px] font-semibold uppercase tracking-[0.5px] text-[#26342f]">
        {label}
      </p>
    </div>
  );
}

export default StatCard;