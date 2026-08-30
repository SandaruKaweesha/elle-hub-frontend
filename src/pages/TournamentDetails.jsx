import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { 
  MapPin, 
  Calendar, 
  Banknote, 
  Users, 
  Info, 
  ChevronRight, 
  ShieldCheck, 
  Award, 
  Building, 
  DollarSign,
  Phone,
  UserCheck,
  CheckCircle2,
  Trophy
} from "lucide-react";

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tournaments/${id}`);
        if (response.data && response.data.success !== false) {
          setTournament(response.data.data);
        } else {
          setError(response.data?.message || "Failed to load tournament");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching tournament details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#002c21] border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col py-20">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-[#69706c]">{error || "Tournament not found"}</p>
          <Link to="/tournaments" className="mt-4 px-6 py-2.5 bg-[#002c21] text-white rounded-xl font-semibold text-sm">
            Back to All Tournaments
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const confirmedTeams = tournament.confirmedTeams || [];
  const confirmedReferees = tournament.confirmedReferees || [];
  const confirmedPlaygrounds = tournament.confirmedPlaygrounds || [];
  const confirmedSponsors = tournament.confirmedSponsors || [];

  const capacity = tournament.maximum_team_limit || 16;
  const statusDisplay = (tournament.status || tournament.approval_status || "ACTIVE").toUpperCase();
  const isCompleted = statusDisplay === "COMPLETED" || statusDisplay === "FINISHED";

  const progressPercent = Math.min(100, Math.round((confirmedTeams.length / capacity) * 100));

  // Format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const generateOverview = (tourney) => {
    if (tourney.description && tourney.description.length > 50) return tourney.description;
    
    let overview = `Welcome to the highly anticipated ${tourney.title || "Elle tournament"}! `;
    if (tourney.location) overview += `Set to take place in ${tourney.location}, `;
    else overview += `Set to take place soon, `;
    
    if (tourney.tournament_held_date || tourney.start_date) {
      overview += `scheduled for ${formatDate(tourney.tournament_held_date || tourney.start_date)}. `;
    }
    
    overview += `It brings together top-tier Elle teams to compete for glory`;
    if (tourney.prize_details) overview += ` and an incredible prize pool of ${tourney.prize_details}`;
    overview += `. `;
    
    if (tourney.maximum_team_limit) {
      overview += `With a capacity of ${tourney.maximum_team_limit} teams, competition will be fierce. `;
    }
    
    if (tourney.rules) {
      overview += `Official Rules: ${tourney.rules}. `;
    }
    
    return overview;
  };

  // Drag to scroll logic for teams carousel
  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.classList.add('cursor-grabbing');
      scrollContainerRef.current.classList.remove('cursor-grab');
      startX = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft = scrollContainerRef.current.scrollLeft;
    }
  };
  const handleMouseLeave = () => {
    isDown = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.classList.remove('cursor-grabbing');
      scrollContainerRef.current.classList.add('cursor-grab');
    }
  };
  const handleMouseUp = () => {
    isDown = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.classList.remove('cursor-grabbing');
      scrollContainerRef.current.classList.add('cursor-grab');
    }
  };
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative w-full h-[360px] md:h-[460px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url('${tournament.image_url || "/images/elle1.jpeg"}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#002c21]/95 via-[#002c21]/80 to-transparent"></div>
        
        <div className="relative z-10 w-full max-w-[1450px] mx-auto px-4 md:px-[60px]">
          <span className="inline-block bg-[#98F5E1] text-[#002c21] text-xs font-black px-3.5 py-1.5 rounded-full mb-4 tracking-wider uppercase shadow-sm">
            ● {statusDisplay}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 max-w-3xl leading-tight drop-shadow-md">
            {tournament.title}
          </h1>

          <p className="text-white/80 text-sm md:text-base max-w-2xl mb-8 font-medium">
            Organized by <strong className="text-[#98F5E1]">{tournament.organization_name || tournament.organizerName || "Elle Sports Association"}</strong>
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="bg-[#08733e] hover:bg-[#065c32] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2">
              <UserCheck size={18} />
              {isCompleted ? "View Tournament Records" : "Register Team"}
            </Link>
            <a href="#teams" className="border border-white/40 bg-white/10 backdrop-blur-md text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-all">
              Confirmed Stakeholders
            </a>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full max-w-[1450px] mx-auto px-4 md:px-[60px] py-12 space-y-12">
        
        {/* Overview & Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Tournament Overview */}
          <div className="lg:col-span-2 bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4 flex items-center gap-2">
                <Trophy size={24} className="text-[#00382D]" /> Tournament Overview
              </h2>
              <p className="text-[#555555] text-sm leading-relaxed mb-8 whitespace-pre-wrap font-medium">
                {generateOverview(tournament)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#f0f0f0]">
              <div className="flex flex-col">
                <MapPin size={18} className="text-[#00382D] mb-1.5" />
                <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">District / Region</span>
                <span className="text-xs font-bold text-[#111111] capitalize">{tournament.location || tournament.district || "Sri Lanka"}</span>
              </div>
              <div className="flex flex-col">
                <Calendar size={18} className="text-[#00382D] mb-1.5" />
                <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">Held Date</span>
                <span className="text-xs font-bold text-[#111111]">
                  {formatDate(tournament.tournament_held_date || tournament.start_date)}
                </span>
              </div>
              <div className="flex flex-col">
                <Banknote size={18} className="text-amber-600 mb-1.5" />
                <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">Prize Pool</span>
                <span className="text-xs font-black text-[#111111]">{tournament.prize_details || "TBD"}</span>
              </div>
              <div className="flex flex-col">
                <Users size={18} className="text-[#00382D] mb-1.5" />
                <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">Team Limit</span>
                <span className="text-xs font-bold text-[#111111]">{capacity} Teams Max</span>
              </div>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="bg-gradient-to-br from-[#00382D] via-[#002c21] to-[#044c3c] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-md relative overflow-hidden justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            
            <div>
              <span className="bg-[#98F5E1] text-[#002c21] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">
                REGISTRATION & CAPACITY
              </span>
              <h2 className="text-xl font-bold mb-2">Confirmed Team Slots</h2>
              <p className="text-emerald-100/80 text-xs mb-6 font-medium">
                {isCompleted ? "Registration closed. Tournament concluded." : "Confirmed teams registered for tournament brackets."}
              </p>
            </div>
            
            <div className="my-auto">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="bg-white/10 px-2.5 py-1 rounded-md text-[#98F5E1] border border-white/10">
                  {confirmedTeams.length} / {capacity} TEAMS CONFIRMED
                </span>
                <span className="text-white font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#98F5E1] rounded-full transition-all duration-1000 ease-in-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-6 bg-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm border border-white/10">
              <Info size={18} className="text-[#98F5E1] shrink-0" />
              <span className="text-xs text-white/90 font-medium">
                Official Date: <strong>{formatDate(tournament.tournament_held_date || tournament.start_date)}</strong>
              </span>
            </div>
          </div>
          
        </div>

        {/* SECTION 1: CONFIRMED TEAMS */}
        <section id="teams" className="space-y-4">
          <div className="flex justify-between items-end border-b border-[#e5e5e5] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00382D]">Confirmed Participants</span>
              <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-2">
                <Users size={22} className="text-[#00382D]" /> Confirmed Teams ({confirmedTeams.length})
              </h2>
            </div>
          </div>
          
          {confirmedTeams.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center text-gray-500 text-sm">
              No team entries confirmed yet. Teams are currently in registration process.
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex overflow-x-auto gap-4 pb-4 pt-2 snap-x hide-scrollbar cursor-grab"
            >
              {confirmedTeams.map((team, index) => {
                const teamName = team.team_name || "Elle Team";
                const district = team.district || "Sri Lanka";
                return (
                  <div 
                    key={team.user_id || index} 
                    className="flex-shrink-0 w-48 bg-white border border-[#e5e5e5] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 snap-start hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm border border-[#e5e5e5] overflow-hidden group-hover:scale-105 transition-transform">
                      <img 
                        src={team.profile_picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(teamName)}`} 
                        alt={teamName} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(teamName)}`;
                        }}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111111] line-clamp-1 group-hover:text-[#00382D] transition-colors">{teamName}</h4>
                      <span className="text-[11px] text-[#666666] flex items-center justify-center gap-1 mt-0.5 capitalize">
                        <MapPin size={11} /> {district}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={10} /> Confirmed
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: CONFIRMED REFEREES (MATCH OFFICIALS) */}
        <section className="space-y-4">
          <div className="flex justify-between items-end border-b border-[#e5e5e5] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00382D]">Match Officials</span>
              <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#00382D]" /> Confirmed Referees ({confirmedReferees.length})
              </h2>
            </div>
          </div>

          {confirmedReferees.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center text-gray-500 text-sm">
              No match referees assigned yet for this tournament.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {confirmedReferees.map((ref, index) => {
                const refName = ref.referee_name || "Official Referee";
                const exp = ref.experience_years ? `${ref.experience_years} Yrs Exp` : "Certified Official";
                return (
                  <div key={ref.user_id || index} className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-[#e5e5e5] shrink-0 overflow-hidden">
                      <img 
                        src={ref.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(refName)}`} 
                        alt={refName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(refName)}`;
                        }}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#111111] truncate">{refName}</h4>
                      <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                        <Award size={12} /> {exp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: CONFIRMED PLAYGROUND VENUE & CORPORATE SPONSORS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Confirmed Playground Venue */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Building size={20} className="text-[#00382D]" /> Confirmed Playground Venue
              </h3>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase">
                Host Venue
              </span>
            </div>

            {confirmedPlaygrounds.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                Playground venue booking is currently being finalized.
              </div>
            ) : (
              confirmedPlaygrounds.map((pg, index) => (
                <div key={pg.user_id || index} className="bg-[#f8f7f4] p-5 rounded-2xl border border-[#e5e5e5] flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-[#e5e5e5] shrink-0 overflow-hidden shadow-xs">
                    <img 
                      src={pg.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pg.playground_name || 'Playground')}`} 
                      alt={pg.playground_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pg.playground_name || 'Playground')}`;
                      }}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#111111]">{pg.playground_name || "Official Elle Ground"}</h4>
                    <p className="text-xs text-[#555555] font-medium flex items-center gap-1 capitalize">
                      <MapPin size={13} className="text-[#00382D]" /> Location: <strong>{pg.located_district || pg.location || "Sri Lanka"}</strong>
                    </p>
                    {pg.contact_number && (
                      <p className="text-xs text-[#555555] font-medium flex items-center gap-1">
                        <Phone size={13} className="text-[#00382D]" /> Contact: <strong>{pg.contact_number}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Confirmed Corporate Sponsors */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <DollarSign size={20} className="text-[#00382D]" /> Official Corporate Sponsors
              </h3>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md uppercase">
                Sponsors
              </span>
            </div>

            {confirmedSponsors.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                Sponsorship partners are currently being confirmed.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {confirmedSponsors.map((spon, index) => (
                  <div key={spon.user_id || index} className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#e5e5e5] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-[#e5e5e5] shrink-0 overflow-hidden">
                      <img 
                        src={spon.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(spon.company_name || 'Sponsor')}`} 
                        alt={spon.company_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(spon.company_name || 'Sponsor')}`;
                        }}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#111111] truncate">{spon.company_name}</h4>
                      <span className="text-[11px] text-[#666666] font-medium block truncate">
                        Contact: {spon.contact_person || "Official Partner"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default TournamentDetails;