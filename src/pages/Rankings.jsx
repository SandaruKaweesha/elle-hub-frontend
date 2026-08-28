import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Search, MapPin, Trophy, ChevronUp, ChevronDown, Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

function PodiumCard({ team, position }) {
  if (!team) return null;
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
        <h3 className="font-extrabold text-[#111111] text-lg leading-tight mb-1">{team.name || 'Team'}</h3>
        <p className="text-sm text-[#666666] flex items-center justify-center gap-1 mb-3 capitalize">
          <MapPin size={14} /> {team.district || 'General'}
        </p>
        <div className="inline-block bg-[#111111] text-white px-4 py-1.5 rounded-full font-bold text-sm">
          {team.points ?? 0} pts
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
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("All");

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams/rankings');
      const resData = res.data;
      if (resData && (resData.success || Array.isArray(resData.data) || Array.isArray(resData))) {
        const rawTeams = Array.isArray(resData) ? resData : (resData.data || []);
        // Sanitize team data to ensure non-null properties
        const sanitized = rawTeams.map((t, idx) => ({
          id: t.id || t.user_id || idx + 1,
          rank: t.rank || idx + 1,
          name: t.name || t.team_name || `Team #${t.id || idx + 1}`,
          district: t.district || 'General',
          played: Number(t.played || 0),
          won: Number(t.won || 0),
          points: Number(t.points || 0),
          rating: Number(t.rating || 0),
          trend: t.trend || 'same'
        }));
        setRankings(sanitized);
      }
    } catch (err) {
      console.error("Failed to fetch team rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = rankings.filter((team) => {
    const teamName = String(team?.name || "").toLowerCase();
    const teamDistrict = String(team?.district || "").toLowerCase();
    const matchesSearch = teamName.includes(searchTerm.toLowerCase());
    const matchesDistrict = filterDistrict === "All" || teamDistrict === filterDistrict.toLowerCase();
    return matchesSearch && matchesDistrict;
  });

  const top3 = filteredTeams.slice(0, 3);
  // Reorder for podium layout: 2nd, 1st, 3rd if 3 exist
  const podiumOrder = top3.length >= 3 
    ? [top3[1], top3[0], top3[2]] 
    : top3.length === 2 
      ? [top3[1], top3[0]] 
      : top3;

  const restOfTeams = filteredTeams.slice(3);

  const uniqueDistricts = Array.from(
    new Set(rankings.map((t) => (t.district || '').trim()).filter(Boolean))
  );

  return (
    <div className="bg-[#f8f7f4] min-h-screen font-['Poppins']">
      <Navbar />

      {/* Header */}
      <div className="bg-[#003326] text-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">National Team Rankings</h1>
          <p className="text-[#8eb7a7] max-w-2xl mx-auto text-lg">
            The official leaderboard of Sri Lanka's finest Elle teams. Rankings are determined by tournament participation, match wins, and overall points.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-[#00783f]" />
            <p className="text-sm font-semibold text-gray-600">Loading dynamic team rankings...</p>
          </div>
        ) : (
          <>
            {/* Podium Section */}
            {top3.length > 0 && (
              <div className="mb-20 hidden md:flex items-end justify-center gap-4 lg:gap-8 pt-10">
                {podiumOrder[0] && <PodiumCard team={podiumOrder[0]} position={top3.length >= 3 ? 2 : (podiumOrder[0].rank === 1 ? 1 : 2)} />}
                {podiumOrder[1] && <PodiumCard team={podiumOrder[1]} position={top3.length >= 3 ? 1 : (podiumOrder[1].rank === 1 ? 1 : 2)} />}
                {podiumOrder[2] && <PodiumCard team={podiumOrder[2]} position={3} />}
              </div>
            )}

            {/* Mobile Podium Fallback */}
            {top3.length > 0 && (
              <div className="mb-12 md:hidden flex flex-col gap-4">
                {top3.map((team) => (
                   <div key={team.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border-l-4 ${team.rank === 1 ? 'border-[#D6A900]' : team.rank === 2 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]'}`}>
                     <div className={`font-bold text-2xl w-8 text-center ${team.rank === 1 ? 'text-[#D6A900]' : team.rank === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'}`}>
                       #{team.rank}
                     </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-[#111111]">{team.name}</h3>
                       <p className="text-xs text-[#666666] capitalize">{team.district}</p>
                     </div>
                     <div className="font-bold text-[#00783f]">{team.points} pts</div>
                   </div>
                ))}
              </div>
            )}

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
                  className="w-full md:w-48 px-4 py-2.5 bg-[#f8f7f4] border border-[#cfd6d2] rounded-lg focus:outline-none focus:border-[#00783f] capitalize"
                >
                  <option value="All">All Districts</option>
                  {uniqueDistricts.map((d) => (
                    <option key={d} value={d} className="capitalize">
                      {d}
                    </option>
                  ))}
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
                      restOfTeams.map((team) => {
                        const hasActivity = team.played > 0 || team.won > 0;
                        return (
                          <tr key={team.id} className="hover:bg-[#f8f7f4] transition-colors">
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-bold ${team.rank <= 3 ? 'text-[#00783f] text-base' : 'text-[#111111]'}`}>
                                  {team.rank}
                                </span>
                                {hasActivity ? (
                                  <TrendIcon trend={team.trend} />
                                ) : (
                                  <Minus size={18} className="text-gray-400" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <h4 className="font-bold text-[#111111]">{team.name}</h4>
                              <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5 capitalize">
                                <MapPin size={12} /> {team.district}
                              </p>
                            </td>
                            <td className="py-4 px-6 text-[#666666] hidden md:table-cell font-medium">
                              {team.played > 0 ? team.played : "-"}
                            </td>
                            <td className="py-4 px-6 text-[#666666] hidden sm:table-cell font-medium">
                              {team.won > 0 ? team.won : "-"}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-[#00783f]">
                              {team.points > 0 ? team.points : "-"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 px-6 text-center text-[#666666]">
                          {rankings.length === 0 ? "No registered teams found in system." : "No teams found matching your criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Rankings;

