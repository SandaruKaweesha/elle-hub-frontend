import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Search, MapPin, Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";

// Mock Data - To be replaced with PHP backend API call
const mockRankings = [
  { id: 1, rank: 1, name: "Negombo Lions", district: "Gampaha", played: 45, won: 40, points: 2450, trend: "up" },
  { id: 2, rank: 2, name: "Colombo Kings", district: "Colombo", played: 42, won: 36, points: 2180, trend: "same" },
  { id: 3, rank: 3, name: "Galle Gladiators", district: "Galle", played: 38, won: 31, points: 1950, trend: "up" },
  { id: 4, rank: 4, name: "Kandy Warriors", district: "Kandy", played: 40, won: 30, points: 1820, trend: "down" },
  { id: 5, rank: 5, name: "Kurunegala Knights", district: "Kurunegala", played: 35, won: 26, points: 1600, trend: "up" },
  { id: 6, rank: 6, name: "Matara Mariners", district: "Matara", played: 30, won: 20, points: 1250, trend: "down" },
  { id: 7, rank: 7, name: "Jaffna Stallions", district: "Jaffna", played: 28, won: 18, points: 1100, trend: "same" },
  { id: 8, rank: 8, name: "Anuradhapura Archers", district: "Anuradhapura", played: 25, won: 15, points: 950, trend: "up" },
];

function PodiumCard({ team, position }) {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  let bgColor = "bg-white";
  let borderColor = "border-[#e5e5e5]";
  let heightClass = "h-[180px]";
  let medalColor = "text-[#D6A900]"; // Gold default

  if (isFirst) {
    bgColor = "bg-gradient-to-b from-[#fffae5] to-white";
    borderColor = "border-[#D6A900]";
    heightClass = "h-[240px] md:-mt-10 z-10 shadow-xl shadow-[#D6A900]/20";
    medalColor = "text-[#D6A900]";
  } else if (isSecond) {
    bgColor = "bg-gradient-to-b from-[#f5f5f5] to-white";
    borderColor = "border-[#C0C0C0]";
    heightClass = "h-[200px] shadow-lg shadow-[#C0C0C0]/20";
    medalColor = "text-[#C0C0C0]";
  } else if (isThird) {
    bgColor = "bg-gradient-to-b from-[#fff0e5] to-white";
    borderColor = "border-[#CD7F32]";
    heightClass = "h-[180px] shadow-lg shadow-[#CD7F32]/20";
    medalColor = "text-[#CD7F32]";
  }

  return (
    <div className={`relative flex flex-col items-center justify-end w-full max-w-[250px] rounded-t-2xl border-t-4 border-l border-r ${borderColor} ${bgColor} ${heightClass} p-6 transition-transform hover:-translate-y-2`}>
      <div className={`absolute -top-8 w-16 h-16 rounded-full bg-white border-4 ${borderColor} flex items-center justify-center shadow-md`}>
        <Trophy size={28} className={medalColor} />
      </div>
      <div className="text-center mt-4">
        <h3 className="font-extrabold text-[#111111] text-lg leading-tight mb-1">{team.name}</h3>
        <p className="text-sm text-[#666666] flex items-center justify-center gap-1 mb-3">
          <MapPin size={14} /> {team.district}
        </p>
        <div className="inline-block bg-[#111111] text-white px-4 py-1.5 rounded-full font-bold text-sm">
          {team.points} pts
        </div>
      </div>
      <div className={`absolute bottom-0 w-full h-2 ${isFirst ? 'bg-[#D6A900]' : isSecond ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'}`}></div>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up") return <ChevronUp size={18} className="text-green-600" />;
  if (trend === "down") return <ChevronDown size={18} className="text-red-600" />;
  return <Minus size={18} className="text-gray-400" />;
}

function Rankings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("All");

  const top3 = mockRankings.slice(0, 3);
  // Reorder for podium layout: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]]; 
  
  const restOfTeams = mockRankings.slice(3).filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = filterDistrict === "All" || team.district === filterDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="bg-[#f8f7f4] min-h-screen font-['Poppins']">
      <Navbar />

      {/* Header */}
      <div className="bg-[#003326] text-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">National Team Rankings</h1>
          <p className="text-[#8eb7a7] max-w-2xl mx-auto text-lg">
            The official leaderboard of Sri Lanka's finest Elle teams. Rankings are determined by tournament performances, match wins, and overall points.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        
        {/* Podium Section */}
        <div className="mb-20 hidden md:flex items-end justify-center gap-4 lg:gap-8 pt-10">
          {podiumOrder[0] && <PodiumCard team={podiumOrder[0]} position={2} />}
          {podiumOrder[1] && <PodiumCard team={podiumOrder[1]} position={1} />}
          {podiumOrder[2] && <PodiumCard team={podiumOrder[2]} position={3} />}
        </div>

        {/* Mobile Podium Fallback */}
        <div className="mb-12 md:hidden flex flex-col gap-4">
          {top3.map((team) => (
             <div key={team.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border-l-4 ${team.rank === 1 ? 'border-[#D6A900]' : team.rank === 2 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]'}`}>
               <div className={`font-bold text-2xl w-8 text-center ${team.rank === 1 ? 'text-[#D6A900]' : team.rank === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'}`}>
                 #{team.rank}
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-[#111111]">{team.name}</h3>
                 <p className="text-xs text-[#666666]">{team.district}</p>
               </div>
               <div className="font-bold text-[#00783f]">{team.points} pts</div>
             </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-[#e5e5e5]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search team name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#cfd6d2] rounded-lg focus:outline-none focus:border-[#00783f] focus:ring-1 focus:ring-[#00783f]"
            />
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-3">
            <label className="text-sm font-medium text-[#666666]">District:</label>
            <select 
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full md:w-48 px-4 py-2.5 bg-[#f8f7f4] border border-[#cfd6d2] rounded-lg focus:outline-none focus:border-[#00783f]"
            >
              <option value="All">All Districts</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Kurunegala">Kurunegala</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f2f1] text-[#4b4f4d] border-b border-[#e5e5e5]">
                  <th className="py-4 px-6 font-semibold w-20 text-center">Rank</th>
                  <th className="py-4 px-6 font-semibold">Team Name</th>
                  <th className="py-4 px-6 font-semibold hidden md:table-cell">Played</th>
                  <th className="py-4 px-6 font-semibold hidden sm:table-cell">Won</th>
                  <th className="py-4 px-6 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {restOfTeams.length > 0 ? (
                  restOfTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-[#f8f7f4] transition-colors">
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-[#111111]">{team.rank}</span>
                          <TrendIcon trend={team.trend} />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <h4 className="font-bold text-[#111111]">{team.name}</h4>
                        <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {team.district}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-[#666666] hidden md:table-cell">{team.played}</td>
                      <td className="py-4 px-6 text-[#666666] hidden sm:table-cell">{team.won}</td>
                      <td className="py-4 px-6 text-right font-bold text-[#00783f]">{team.points}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 px-6 text-center text-[#666666]">
                      No teams found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Rankings;
