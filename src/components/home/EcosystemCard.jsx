import { ArrowRight } from "lucide-react";

function EcosystemCard({
  step,
  image,
  Icon,
  title,
  description,
}) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[10px]
        border
        border-[#d8ddd9]
        bg-white
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-lg
      "
    >
     
      <div className="h-[220px] overflow-hidden bg-[#e8ebe8]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

     
      <div
        className="
          absolute
          left-1/2
          top-[195px]
          flex
          h-[52px]
          w-[52px]
          -translate-x-1/2
          items-center
          justify-center
          rounded-full
          border-2
          border-white
          bg-[#003326]
          text-[16px]
          font-semibold
          text-white
        "
      >
        {step}
      </div>

      
      <div className="px-5 pb-6 pt-12 text-center">
        <div
          className="
            mx-auto
            flex
            h-[48px]
            w-[48px]
            items-center
            justify-center
            rounded-full
            bg-[#f7efd0]
            text-[#b18800]
          "
        >
          <Icon size={24} strokeWidth={2.2} />
        </div>

        <h3 className="mt-4 text-[21px] font-bold text-[#111513]">
          {title}
        </h3>

        <p className="mx-auto mt-3 min-h-[72px] max-w-[220px] text-[14px] leading-6 text-[#68706c]">
          {description}
        </p>

        <button
          type="button"
          className="
            mx-auto
            mt-5
            flex
            items-center
            gap-2
            text-[14px]
            font-semibold
            text-[#b18800]
            cursor-pointer
            hover:text-[#7d6100]
            transition-colors
          "
        >
          Learn More
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

export default EcosystemCard;