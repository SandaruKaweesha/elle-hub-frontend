import { CalendarDays, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

function TournamentCard({image,imagePosition,title,date,prize,status,buttonText,}){

   return(
     <article className="overflow-hidden rounded-md border border-[#d8ddd9] bg-white">
      <div className="relative w-full aspect-[16/7] overflow-hidden">
  <img
    src={image}
    alt={title}
    style={{ objectPosition: imagePosition }}
    className="
      w-full
      h-full
      object-cover
      transition-transform
      duration-300
      hover:scale-105
    "
  />

  <span className="
    absolute
    top-3
    right-3
    rounded-full
    bg-[#FFD65A]
    px-3
    py-1
    text-[12px]
    font-semibold
    text-[#302700]
  ">
    {status}
  </span>
</div>
        <div className="p-5">
  <h3 className="text-[21px] font-semibold text-[#111513]">
    {title}
  </h3>

  <div className="mt-3 flex items-center gap-2 text-[13px] text-[#69706c]">
    <CalendarDays size={16} />
    <span>{date}</span>
  </div>

  <div className="mt-2 flex items-center gap-2 text-[13px] text-[#69706c]">
    <Trophy size={16} />
    <span>{prize}</span>
  </div>

  <Link
    to="/tournaments"
    className="
      mt-5
      flex
      h-[46px]
      w-full
      items-center
      justify-center
      rounded-sm
      bg-[#002c21]
      text-[14px]
      font-semibold
      text-white
      transition-all
      duration-200
      hover:bg-[#08733e]
      hover:-translate-y-[2px]
      active:translate-y-0
      active:scale-[0.98]
    "
  >
    {buttonText}
  </Link>
</div>
    </article>

   );

}

export default TournamentCard;