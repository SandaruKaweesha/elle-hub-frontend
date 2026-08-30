import React from "react";
import { Calendar, Trophy, MapPin, ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

function TournamentCard({
  id,
  image,
  imagePosition,
  title,
  date,
  prize,
  status,
  location,
  buttonText,
  maxTeams,
}) {
  const displayStatus = (status || "ACTIVE").toUpperCase();
  const isLive = displayStatus === "LIVE" || displayStatus === "ACTIVE";
  const isCompleted = displayStatus === "COMPLETED" || displayStatus === "FINISHED";

  // Clean format for Prize
  let formattedPrize = prize || "Prize Details TBD";
  if (
    formattedPrize !== "TBD" && 
    !formattedPrize.toLowerCase().includes("lkr") && 
    !formattedPrize.toLowerCase().includes("$") && 
    !formattedPrize.toLowerCase().includes("prize")
  ) {
    const num = parseFloat(formattedPrize.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      formattedPrize = `LKR ${num.toLocaleString()}`;
    }
  }

  return (
    <article className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-xl hover:border-[#00382D]/20 transition-all duration-300 overflow-hidden group flex flex-col justify-between h-full font-['Poppins']">
      
      <div>
        {/* Top Cover Image with Gradient & Floating Badges */}
        <div className="relative w-full h-52 overflow-hidden bg-slate-900">
          <img
            src={image || "/images/elle1.jpeg"}
            alt={title || "Tournament"}
            style={{ objectPosition: imagePosition || "center" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/elle1.jpeg";
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />

          {/* Dark Overlay Gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Left: Location Badge */}
          {location && (
            <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/15 shadow-sm">
              <MapPin size={12} className="text-[#98F5E1]" />
              <span className="capitalize">{location}</span>
            </span>
          )}

          {/* Top Right: Status Badge */}
          <span
            className={`absolute top-4 right-4 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1.5 border ${
              isLive
                ? "bg-emerald-500/90 text-white border-emerald-400/40 animate-pulse"
                : isCompleted
                ? "bg-slate-900/80 text-gray-300 border-white/10"
                : "bg-amber-400 text-slate-950 border-amber-300/50"
            }`}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            {displayStatus}
          </span>

          {/* Bottom Title inside Image Banner for Extra Visual Punch */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#98F5E1] bg-black/40 px-2.5 py-0.5 rounded-md inline-block mb-1 border border-white/10 backdrop-blur-xs">
              Official Tournament
            </span>
            <h3 className="text-xl font-black text-white leading-tight drop-shadow-md line-clamp-1 group-hover:text-[#98F5E1] transition-colors">
              {title || "Elle Championship"}
            </h3>
          </div>
        </div>

        {/* Card Info Section */}
        <div className="p-6 space-y-4">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Date Box */}
            <div className="bg-[#f8f7f4] p-3 rounded-2xl border border-[#e5e5e5] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider block">Held Date</span>
                <span className="text-xs font-bold text-[#111111] truncate block">{date || "TBD"}</span>
              </div>
            </div>

            {/* Prize Box */}
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Trophy size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">Grand Prize</span>
                <span className="text-xs font-black text-[#111111] truncate block">{formattedPrize}</span>
              </div>
            </div>

          </div>

          {/* Additional details bar if available */}
          {maxTeams && (
            <div className="flex items-center justify-between text-xs text-[#555555] bg-[#f9faf9] px-3.5 py-2 rounded-xl border border-[#f0f0f0]">
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-[#00382D]" /> Team Capacity
              </span>
              <span className="font-bold text-[#111111]">{maxTeams} Teams Max</span>
            </div>
          )}

        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-6 pt-0">
        <Link
          to={`/tournaments/${id || 1}`}
          className="w-full h-12 bg-gradient-to-r from-[#00382D] via-[#044c3c] to-[#08733e] hover:from-[#00271f] hover:to-[#065c32] text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group-hover:gap-3 cursor-pointer"
        >
          <span>{buttonText || "View Details"}</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

    </article>
  );
}

export default TournamentCard;