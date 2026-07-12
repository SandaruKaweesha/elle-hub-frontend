import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Banknote, Users, Info, ChevronRight, Bell } from "lucide-react";

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
        if (response.data.success) {
          setTournament(response.data.data);
        } else {
          setError(response.data.message || "Failed to load tournament");
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

  const teams = [
    { name: "Kandy Lions", short: "KL", logo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&h=150&fit=crop&q=80" },
    { name: "Colombo Strikers", short: "CS", logo: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&h=150&fit=crop&q=80" },
    { name: "Jaffna Warriors", short: "JW", logo: "https://images.unsplash.com/photo-1508344928928-7137b29de216?w=150&h=150&fit=crop&q=80" },
    { name: "Southern Sharks", short: "SS", logo: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=150&h=150&fit=crop&q=80" },
    { name: "Gampaha Eagles", short: "GE", logo: "https://images.unsplash.com/photo-1629824637777-62aeb288ecad?w=150&h=150&fit=crop&q=80" },
    { name: "Kurunegala Giants", short: "KG", logo: "https://images.unsplash.com/photo-1550064506-696eb80a459b?w=150&h=150&fit=crop&q=80" },
  ];

  // Fixtures are defined dynamically below based on tournament status

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c21]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-[#69706c]">{error || "Tournament not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const capacity = tournament.maximum_team_limit || 16;
  const statusDisplay = tournament.status || "REGISTRATION OPEN";
  
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

  const isCompleted = statusDisplay.toUpperCase() === "COMPLETED" || statusDisplay.toUpperCase() === "ONGOING";

  const fixtures = isCompleted ? [
    {
      team1: teams[4],
      team2: teams[5],
      stage: "FINALS",
      date: formatDate(tournament.end_date) || "Nov 30, 2024",
      time: "09:00 AM",
      status: "past",
      score: "42 - 38"
    }
  ] : [
    {
      team1: teams[0],
      team2: teams[1],
      stage: "QUARTER FINALS",
      date: formatDate(tournament.start_date) || "Dec 15, 2024",
      time: "10:30 AM",
      status: "upcoming"
    },
    {
      team1: teams[2],
      team2: teams[3],
      stage: "QUARTER FINALS",
      date: formatDate(tournament.start_date) || "Dec 15, 2024",
      time: "02:00 PM",
      status: "upcoming"
    }
  ];

  const generateOverview = (tourney) => {
    if (tourney.description && tourney.description.length > 100) return tourney.description;
    
    let overview = `Welcome to the highly anticipated ${tourney.title || "tournament"}! `;
    
    if (tourney.location) overview += `Set to take place in the vibrant location of ${tourney.location}, `;
    else overview += `Set to take place soon, `;
    
    if (tourney.start_date && tourney.end_date) {
      overview += `this exciting event will run from ${formatDate(tourney.start_date)} to ${formatDate(tourney.end_date)}. `;
    } else if (tourney.start_date) {
      overview += `kicking off on ${formatDate(tourney.start_date)}. `;
    }
    
    overview += `It brings together passionate Elle teams to compete for glory`;
    if (tourney.prize_details) overview += ` and an incredible prize pool of ${tourney.prize_details}`;
    overview += `. `;
    
    if (tourney.maximum_team_limit) {
      overview += `With a maximum capacity of ${tourney.maximum_team_limit} teams, the competition will be fierce. `;
    }
    
    if (tourney.rules) {
      overview += `Teams are expected to adhere strictly to the tournament rules: ${tourney.rules}. `;
    }
    
    overview += `Don't miss out on the action—register your team and be part of this spectacular sporting event!`;
    
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

  const filteredFixtures = fixtures.filter(f => f.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-['Poppins']">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative w-full h-[400px] md:h-[500px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-[#002c21]/80"></div>
        
        <div className="relative z-10 w-full max-w-[1450px] mx-auto px-4 md:px-[60px] select-none">
          <span className="inline-block bg-[#98F5E1] text-[#002c21] text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase cursor-default">
            ● {statusDisplay}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 max-w-3xl leading-tight select-none cursor-default">
            {tournament.title}
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="border border-white bg-transparent text-white font-semibold px-6 py-3 rounded-md hover:bg-white/10 transition-colors">
              {isCompleted ? "View Tournament" : "Join Tournament"}
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full max-w-[1450px] mx-auto px-4 md:px-[60px] py-12 space-y-12">
        
        {/* Overview & Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Tournament Overview */}
          <div className="lg:col-span-2 bg-white border border-[#d8ddd9] rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#111513] mb-4">Tournament Overview</h2>
              <p className="text-[#69706c] text-[15px] leading-relaxed mb-8 whitespace-pre-wrap">
                {generateOverview(tournament)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <MapPin size={20} className="text-[#08733e] mb-2" />
                <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-1">Location</span>
                <span className="text-[13px] font-semibold text-[#111513]">{tournament.location || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <Calendar size={20} className="text-[#08733e] mb-2" />
                <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-1">Date</span>
                <span className="text-[13px] font-semibold text-[#111513]">
                  {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                </span>
              </div>
              <div className="flex flex-col">
                <Banknote size={20} className="text-[#08733e] mb-2" />
                <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-1">Prize Pool</span>
                <span className="text-[13px] font-semibold text-[#111513]">{tournament.prize_details || "TBD"}</span>
              </div>
              <div className="flex flex-col">
                <Users size={20} className="text-[#08733e] mb-2" />
                <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-1">Capacity</span>
                <span className="text-[13px] font-semibold text-[#111513]">{capacity} Teams</span>
              </div>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="bg-[#002c21] rounded-xl p-6 md:p-8 flex flex-col text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h2 className="text-xl font-bold mb-2 relative z-10">Registration Progress</h2>
            <p className="text-[#8eb7a7] text-[14px] mb-8 relative z-10">
              {isCompleted ? "Registration closed. Tournament concluded." : "Register your team before the deadline."}
            </p>
            
            <div className="mb-auto relative z-10">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="bg-[#08733e] px-2 py-1 rounded shadow-sm">
                  {isCompleted ? capacity : 0}/{capacity} TEAMS
                </span>
                <span>{isCompleted ? "100%" : "0%"}</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#08733e] rounded-full transition-all duration-1000 ease-in-out" style={{ width: isCompleted ? '100%' : '0%' }}></div>
              </div>
            </div>
            
            <div className="mt-8 bg-white/10 rounded-lg p-4 flex items-center gap-3 relative z-10 backdrop-blur-sm border border-white/5">
              <Info size={18} className="text-[#98F5E1]" />
              <span className="text-[13px] text-white/90 font-medium">
                Starts: {formatDate(tournament.start_date)}
              </span>
            </div>
          </div>
          
        </div>

        {/* Participating Teams */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[#111513]">Participating Teams</h2>
            <button className="text-[14px] font-semibold text-[#08733e] hover:text-[#002c21] flex items-center gap-1 transition-colors group">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex overflow-x-auto gap-5 pb-6 pt-2 snap-x hide-scrollbar cursor-grab"
          >
            {teams.map((team, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[140px] md:w-[160px] bg-white border border-[#d8ddd9] rounded-2xl p-5 flex flex-col items-center justify-center gap-4 snap-start hover:-translate-y-2 hover:shadow-xl hover:border-[#08733e]/30 transition-all duration-300 group"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl p-1 border-2 border-transparent group-hover:border-[#08733e] transition-colors duration-300 overflow-hidden">
                  <img src={team.logo} alt={team.name} className="w-full h-full rounded-xl object-cover shadow-inner pointer-events-none" />
                </div>
                <span className="text-[14px] font-bold text-[#111513] text-center leading-tight select-none">{team.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Fixtures & Results */}
        <section>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#111513]">Fixtures & Results</h2>
            <div className="flex bg-[#e8e9e6] rounded-lg p-1 relative overflow-hidden">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 md:flex-none px-6 py-2.5 text-[13px] font-bold rounded-md transition-all duration-300 relative z-10 ${activeTab === 'upcoming' ? 'bg-[#002c21] text-white shadow-md' : 'text-[#69706c] hover:text-[#111513]'}`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`flex-1 md:flex-none px-6 py-2.5 text-[13px] font-bold rounded-md transition-all duration-300 relative z-10 ${activeTab === 'past' ? 'bg-[#002c21] text-white shadow-md' : 'text-[#69706c] hover:text-[#111513]'}`}
              >
                Past Results
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredFixtures.length === 0 ? (
               <div className="bg-white border border-[#d8ddd9] border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3">
                 <div className="w-16 h-16 bg-[#e8e9e6] rounded-full flex items-center justify-center mb-2">
                   <Calendar size={24} className="text-[#69706c]" />
                 </div>
                 <span className="text-xl font-bold text-[#111513]">
                   {activeTab === 'upcoming' ? "No Upcoming Matches" : "No Past Results"}
                 </span>
                 <span className="text-[14px] text-[#69706c] max-w-sm">
                   {activeTab === 'upcoming' 
                     ? "There are currently no upcoming fixtures scheduled for this tournament." 
                     : "This tournament hasn't started yet. Results will appear here once matches have concluded."}
                 </span>
               </div>
            ) : (
              filteredFixtures.map((fixture, index) => (
                <div 
                  key={index} 
                  className={`group bg-white border ${activeTab === 'past' ? 'border-[#e8e9e6] bg-gray-50/50' : 'border-[#d8ddd9]'} rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg hover:border-[#08733e]/40 transition-all duration-300`}
                >
                  
                  {/* Team 1 */}
                  <div className={`flex items-center gap-4 w-full md:w-[30%] justify-end md:justify-end ${activeTab === 'past' ? 'opacity-90 hover:opacity-100' : ''}`}>
                    <span className={`text-lg md:text-xl font-bold transition-colors ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'text-[#08733e]' : 'text-[#111513] group-hover:text-[#08733e]'}`}>
                      {fixture.team1.name}
                    </span>
                    <img src={fixture.team1.logo} alt={fixture.team1.name} className={`w-14 h-14 rounded-xl object-cover border-2 shadow-sm ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'border-[#08733e]' : 'border-[#e8e9e6]'}`} />
                  </div>

                  {/* Match Details */}
                  <div className="flex flex-col items-center justify-center md:border-x border-[#d8ddd9] px-4 md:px-8 w-full md:w-[40%] text-center relative">
                    {activeTab === 'past' && (
                      <span className="absolute -top-3 bg-[#111513] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Full Time
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-[#08733e] tracking-widest uppercase mb-2 bg-[#08733e]/10 px-3 py-1 rounded-full">{fixture.stage}</span>
                    
                    {activeTab === 'upcoming' ? (
                      <span className="text-2xl font-black text-[#111513] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">VS</span>
                    ) : (
                      <div className="flex items-center gap-3 my-2">
                        <span className={`text-3xl font-black ${parseInt(fixture.score.split('-')[0]) > parseInt(fixture.score.split('-')[1]) ? 'text-[#08733e]' : 'text-[#111513]'}`}>{fixture.score.split('-')[0].trim()}</span>
                        <span className="text-xl font-bold text-[#69706c]">-</span>
                        <span className={`text-3xl font-black ${parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'text-[#08733e]' : 'text-[#111513]'}`}>{fixture.score.split('-')[1].trim()}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-[12px] text-[#69706c] font-medium mt-1">
                      <span>{fixture.date}</span>
                    </div>
                  </div>

                  {/* Team 2 & Action */}
                  <div className="flex items-center gap-4 w-full md:w-[30%] justify-between md:justify-start flex-row-reverse md:flex-row">
                    <div className={`flex items-center gap-4 ${activeTab === 'past' ? 'opacity-90 hover:opacity-100' : ''}`}>
                      <img src={fixture.team2.logo} alt={fixture.team2.name} className={`w-14 h-14 rounded-xl object-cover border-2 shadow-sm ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'border-[#08733e]' : 'border-[#e8e9e6]'}`} />
                      <span className={`text-lg md:text-xl font-bold transition-colors ${activeTab === 'past' && fixture.score && parseInt(fixture.score.split('-')[1]) > parseInt(fixture.score.split('-')[0]) ? 'text-[#08733e]' : 'text-[#111513] group-hover:text-[#08733e]'}`}>
                        {fixture.team2.name}
                      </span>
                    </div>
                    
                    {activeTab === 'upcoming' ? (
                      <button className="hidden lg:flex items-center justify-center bg-[#f0f2ef] hover:bg-[#002c21] hover:text-white text-[#111513] text-[12px] font-bold px-4 py-2 rounded-md transition-all duration-300 ml-auto whitespace-nowrap shadow-sm">
                        Set Reminder
                      </button>
                    ) : (
                      <button className="hidden lg:flex items-center justify-center bg-[#08733e]/10 hover:bg-[#08733e] text-[#08733e] hover:text-white text-[12px] font-bold px-4 py-2 rounded-md transition-all duration-300 ml-auto whitespace-nowrap">
                        Match Details
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile action button */}
                  {activeTab === 'upcoming' ? (
                    <button className="w-full lg:hidden flex items-center justify-center bg-[#f0f2ef] hover:bg-[#002c21] hover:text-white text-[#111513] text-[13px] font-bold px-4 py-3 rounded-md transition-colors mt-2">
                      <Bell size={16} className="mr-2" /> Set Reminder
                    </button>
                  ) : (
                    <button className="w-full lg:hidden flex items-center justify-center bg-[#08733e]/10 text-[#08733e] text-[13px] font-bold px-4 py-3 rounded-md mt-2">
                      View Match Details
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
        
      </main>

      <Footer />
    </div>
  );
}

export default TournamentDetails;
