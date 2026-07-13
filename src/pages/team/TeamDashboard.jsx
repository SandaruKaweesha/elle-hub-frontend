import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Medal, Bell, ChevronRight, BarChart, Clock, Filter, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';

function TeamDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoadingTournaments(true);
        const response = await api.get('/tournaments');
        if (response.data.success) {
          setTournaments(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch tournaments", error);
      } finally {
        setLoadingTournaments(false);
      }
    };
    fetchTournaments();
  }, []);

  const getStatusDisplay = (status, startDate, endDate) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED") return "COMPLETED";
    if (s === "ONGOING") return "ONGOING";
    if (s === "UPCOMING") {
      const now = new Date();
      if (startDate && new Date(startDate) > now) return "UPCOMING";
      return "REGISTRATION OPEN";
    }
    return s || "ACTIVE TOURNAMENT";
  };
  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      
      {/* Header & Rating */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] tracking-tight">Team Dashboard</h1>
          <p className="text-[#666666] mt-1 text-sm md:text-base">Performance overview for Elite Strikers FC</p>
        </div>
        
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 md:p-4 flex items-center gap-4 shadow-sm self-start">
          <div className="w-12 h-12 bg-[#98F5E1] rounded-lg flex items-center justify-center text-[#002c21]">
            <Medal size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Team Rating</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#111111]">2,840</span>
              <span className="text-xs font-bold text-[#08733e]">↗12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hero + Key Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tournaments Slider */}
        <div className="lg:col-span-2 flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-2 scroll-smooth">
          {loadingTournaments ? (
            <div className="w-full min-h-[320px] bg-white rounded-2xl border border-[#e5e5e5] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#08733e]" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="w-full min-h-[320px] bg-white rounded-2xl border border-[#e5e5e5] flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-[#eaf1ec] rounded-full flex items-center justify-center mb-4">
                <Medal size={24} className="text-[#08733e]" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">No Active Tournaments</h3>
              <p className="text-[#666666] text-sm">There are currently no tournaments available to join.</p>
            </div>
          ) : (
            tournaments.map((tournament, index) => {
              const defaultImage = index % 2 === 0 
                ? "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop";
              const tag = getStatusDisplay(tournament.status, tournament.start_date, tournament.end_date);
              
              return (
              <div key={tournament.tournament_id || index} className="relative rounded-2xl overflow-hidden bg-[#002c21] text-white p-6 md:p-10 flex flex-col justify-end min-h-[320px] shadow-sm w-full shrink-0 snap-center">
                <div className="absolute inset-0 z-0">
                  <img src={tournament.image_url || defaultImage} alt={tournament.title} className="w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002c21] via-[#002c21]/80 to-transparent"></div>
                </div>
                
                <div className="relative z-10">
                  <span className="inline-block bg-[#98F5E1] text-[#002c21] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
                    {tag}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mb-3">{tournament.title}</h2>
                  <p className="text-[#8eb7a7] text-sm md:text-base max-w-lg mb-8 leading-relaxed line-clamp-2">
                    {tournament.description || "The pinnacle of seasonal competition. Compete with top-tier athletes for the ultimate glory."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to={`/team/join-tournament/${tournament.tournament_id}`} className="inline-flex bg-[#08733e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#065b31] transition-colors shadow-sm">
                      Join Tournament
                    </Link>
                    <Link to={`/tournaments/${tournament.tournament_id}`} className="border border-white/30 text-white hover:bg-white/10 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {/* Key Performance Stats */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#111111]">Key Performance</h3>
            <button className="text-gray-400 hover:text-gray-600"><BarChart size={18} /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-auto">
            <div className="bg-[#f8f7f4] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-1">Played</span>
              <span className="text-xl font-black text-[#111111]">48</span>
            </div>
            <div className="bg-[#f8f7f4] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-1">Wins</span>
              <span className="text-xl font-black text-[#08733e]">32</span>
            </div>
            <div className="bg-[#f8f7f4] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-1">Losses</span>
              <span className="text-xl font-black text-red-500">12</span>
            </div>
            <div className="bg-[#f8f7f4] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-1">Win Rate</span>
              <span className="text-xl font-black text-[#111111]">66.7%</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#666666]">Tournament Goal</span>
              <span className="text-xs font-black text-[#111111]">75%</span>
            </div>
            <div className="w-full h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
              <div className="w-[75%] h-full bg-[#98F5E1] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Matches + Team Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Matches */}
        <div className="lg:col-span-2 bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#111111]">Upcoming Matches</h3>
            <button className="text-xs font-bold text-[#08733e] hover:text-[#065b31]">View All</button>
          </div>

          <div className="space-y-4">
            {/* Match 1 */}
            <div className="flex items-center gap-4 bg-[#f8f7f4] rounded-xl p-3 hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-[#e5e5e5] rounded-lg flex flex-col items-center justify-center text-[#111111] shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest">Nov</span>
                <span className="text-lg font-black">12</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#111111] mb-1">VS. Apex Guardians</h4>
                <p className="text-xs font-medium text-[#666666] flex items-center gap-1">
                  Main Arena • 18:30 PM
                </p>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <div className="w-8 h-8 rounded-full bg-[#111111] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">ES</div>
                <div className="w-8 h-8 rounded-full bg-[#98F5E1] border-2 border-white shadow-sm -ml-4 flex items-center justify-center text-[#002c21] text-[10px] font-bold">AG</div>
              </div>
            </div>

            {/* Match 2 */}
            <div className="flex items-center gap-4 bg-[#f8f7f4] rounded-xl p-3 hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-[#e5e5e5] rounded-lg flex flex-col items-center justify-center text-[#111111] shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest">Nov</span>
                <span className="text-lg font-black">15</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#111111] mb-1">VS. Zenith Titans</h4>
                <p className="text-xs font-medium text-[#666666] flex items-center gap-1">
                  North Field • 20:00 PM
                </p>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <div className="w-8 h-8 rounded-full bg-[#111111] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">ES</div>
                <div className="w-8 h-8 rounded-full bg-[#98F5E1] border-2 border-white shadow-sm -ml-4 flex items-center justify-center text-[#002c21] text-[10px] font-bold">ZT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Feed */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#111111]">Team Feed</h3>
            <Link to="/team/notifications" className="text-gray-400 hover:text-gray-600 transition-colors" title="View all notifications">
              <Bell size={18} />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 relative">
              <div className="absolute left-[5px] top-4 bottom-[-24px] w-0.5 bg-[#e5e5e5]"></div>
              <div className="w-3 h-3 bg-[#08733e] rounded-full mt-1.5 shrink-0 z-10 border-2 border-white"></div>
              <div>
                <p className="text-sm text-[#111111]"><span className="font-bold">Roster Updated:</span> Marcus V. has been added to the starting lineup for Friday's match.</p>
                <span className="text-[11px] font-semibold text-[#666666] mt-1 block">2 hours ago</span>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="w-3 h-3 bg-[#08733e] rounded-full mt-1.5 shrink-0 z-10 border-2 border-white"></div>
              <div>
                <p className="text-sm text-[#111111]"><span className="font-bold">Match Confirmed:</span> Tournament organizers confirmed Zenith Titans match on North Field.</p>
                <span className="text-[11px] font-semibold text-[#666666] mt-1 block">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Results Table */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-[#e5e5e5] flex justify-between items-center bg-white">
          <h3 className="text-sm font-bold text-[#111111]">Recent Results</h3>
          <div className="flex gap-2">
            <button className="p-1.5 border border-[#e5e5e5] rounded text-gray-500 hover:bg-gray-50"><Filter size={16} /></button>
            <button className="p-1.5 border border-[#e5e5e5] rounded text-gray-500 hover:bg-gray-50"><Download size={16} /></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f7f4] text-[#666666] font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Opponent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] text-[#111111] font-medium">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[#666666]">Oct 28, 2024</td>
                <td className="px-6 py-4 font-bold">Storm Breakers FC</td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-[#98F5E1] text-[#002c21] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Win</span>
                </td>
                <td className="px-6 py-4 font-black text-lg">3 - 1</td>
                <td className="px-6 py-4 text-[#08733e] font-black">+125</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-700"><BarChart size={18} /></button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[#666666]">Oct 24, 2024</td>
                <td className="px-6 py-4 font-bold">Night Raiders</td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Loss</span>
                </td>
                <td className="px-6 py-4 font-black text-lg">0 - 2</td>
                <td className="px-6 py-4 text-red-500 font-black">-45</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-700"><BarChart size={18} /></button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[#666666]">Oct 20, 2024</td>
                <td className="px-6 py-4 font-bold">Swift Arrows</td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-[#98F5E1] text-[#002c21] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Win</span>
                </td>
                <td className="px-6 py-4 font-black text-lg">2 - 0</td>
                <td className="px-6 py-4 text-[#08733e] font-black">+85</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-700"><BarChart size={18} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default TeamDashboard;
