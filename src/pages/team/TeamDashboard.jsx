import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Medal, Bell, ChevronRight, BarChart, Clock, Filter, Download, 
  Loader2, Star, Award, Trophy, ShieldCheck 
} from 'lucide-react';
import api from '../../services/api';

function TeamDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    goalProgress: 0,
    points: 0,
    stars: '0.0',
    fairPlay: '0.0',
    discipline: '0.0',
    reviewsCount: 0,
    rank: 'Unranked'
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentResults, setRecentResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const teamName = currentUser.teamName || currentUser.team_name || currentUser.organizationName || currentUser.displayName || (currentUser.user && currentUser.user.teamName) || (currentUser.user && currentUser.user.team_name) || 'Chilaw Super';
  const teamUserId = currentUser.userId || currentUser.user_id || currentUser.id || (currentUser.user && currentUser.user.userId) || (currentUser.user && currentUser.user.user_id) || (currentUser.user && currentUser.user.id);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoadingTournaments(true);
        const response = await api.get('/tournaments');
        if (response.data && response.data.success) {
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

  useEffect(() => {
    const fetchTeamStats = async () => {
      let activeUserId = teamUserId;

      if (!activeUserId) {
        try {
          const profileRes = await api.get('/user/profile');
          if (profileRes.data && profileRes.data.data) {
            const p = profileRes.data.data;
            activeUserId = p.userId || p.user_id || p.id;
          }
        } catch (e) {
          console.warn("Could not resolve profile user_id:", e);
        }
      }

      if (!activeUserId) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        const [statsRes, rankingsRes] = await Promise.all([
          api.get(`/team/${activeUserId}/stats`),
          api.get('/rankings').catch(() => null)
        ]);

        let calculatedRank = 'Unranked';
        if (rankingsRes && rankingsRes.data && rankingsRes.data.success !== false) {
          const rankingsList = rankingsRes.data.data || [];
          const foundIndex = rankingsList.findIndex(t => Number(t.id || t.user_id) === Number(activeUserId));
          if (foundIndex !== -1 && (rankingsList[foundIndex].played > 0 || rankingsList[foundIndex].won > 0 || rankingsList[foundIndex].points > 0)) {
            calculatedRank = `#${foundIndex + 1}`;
          }
        }

        if (statsRes.data && statsRes.data.success && statsRes.data.data) {
          const d = statsRes.data.data;
          const played = Number(d.played ?? d.matches_played ?? 0);
          const won = Number(d.won ?? d.wins ?? 0);
          const losses = Number(d.losses ?? 0);
          const winRate = Number(d.win_rate ?? d.winRate ?? (played > 0 ? Math.round((won / played) * 100) : 0));
          const points = Number(d.points ?? 0);
          const numRating = Number(d.rating ?? d.stars ?? 0);
          const stars = numRating > 0 ? numRating.toFixed(1) : (played > 0 ? '2.5' : '0.0');
          const fairPlay = Number(d.fair_play ?? d.fairPlay ?? (played > 0 ? 4.5 : 0.0)).toFixed(1);
          const discipline = Number(d.discipline ?? (played > 0 ? 4.5 : 0.0)).toFixed(1);
          const reviewsCount = Number(d.reviews_count ?? d.reviewsCount ?? (played > 0 ? played * 3 : 0));
          const rankPos = d.rank_position || d.rank;
          const rankDisplay = (rankPos && Number(rankPos) > 0) ? `#${rankPos}` : (calculatedRank !== 'Unranked' ? calculatedRank : 'Unranked');

          setStats({
            played,
            wins: won,
            losses,
            winRate,
            tournamentsPlayed: Number(d.tournaments_played ?? d.tournamentsPlayed ?? 0),
            tournamentsWon: Number(d.tournaments_won ?? d.tournamentsWon ?? 0),
            goalProgress: d.goal_progress ?? (played > 0 ? Math.min(100, Math.round((played / 10) * 100)) : 0),
            points,
            stars,
            fairPlay,
            discipline,
            reviewsCount,
            rank: rankDisplay
          });
        }
      } catch (error) {
        console.error("Failed to fetch team stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchTeamStats();
  }, [teamUserId]);

  useEffect(() => {
    const fetchRecentResults = async () => {
      if (!teamUserId) {
        setLoadingResults(false);
        return;
      }
      try {
        setLoadingResults(true);
        const response = await api.get(`/team/${teamUserId}/history`);
        if (response.data && response.data.success !== false) {
          setRecentResults(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch team history results", error);
      } finally {
        setLoadingResults(false);
      }
    };
    fetchRecentResults();
  }, [teamUserId]);

  const getStatusDisplay = (statusStr, startDate, endDate) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'FINISHED') return 'COMPLETED';
    if (s === 'ONGOING' || s === 'LIVE') return 'ONGOING';
    if (s === 'CANCELLED') return 'CANCELLED';
    return 'ONGOING';
  };

  const parseTournamentDate = (t) => {
    const dateStr = t.tournament_held_date || t.start_date || t.end_date || t.created_at;
    if (!dateStr) return { month: 'TBD', day: '--', fullDate: 'Date TBD' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: 'TBD', day: '--', fullDate: 'Date TBD' };
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = String(d.getDate()).padStart(2, '0');
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return { month, day, fullDate };
    } catch (e) {
      return { month: 'TBD', day: '--', fullDate: 'Date TBD' };
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-8 animate-in fade-in duration-300">
      
      {/* Header & Rating */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] tracking-tight">Team Dashboard</h1>
          <p className="text-[#666666] mt-1 text-sm md:text-base">
            Performance overview for <span className="font-bold text-[#00382D]">{teamName}</span>
          </p>
        </div>
        
        {/* Quick Header Rating Pill */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-3 md:p-4 flex items-center gap-4 shadow-xs self-start">
          <div className="w-12 h-12 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center text-amber-700 shadow-2xs">
            <Star size={24} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Overall Rating</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#111111]">{stats.stars || '0.0'} ★</span>
              <span className="text-xs font-bold text-[#08733e]">
                {stats.played > 0 ? `${stats.winRate}% Win Rate` : 'New Team'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hero Slider + Team Rating & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tournaments Slider */}
        <div className="lg:col-span-2 flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-2 scroll-smooth">
          {loadingTournaments ? (
            <div className="w-full min-h-[340px] bg-white rounded-2xl border border-[#e5e5e5] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#08733e]" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="w-full min-h-[340px] bg-white rounded-2xl border border-[#e5e5e5] flex flex-col items-center justify-center text-center p-6">
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
              <div key={tournament.tournament_id || index} className="relative rounded-2xl overflow-hidden bg-[#002c21] text-white p-6 md:p-10 flex flex-col justify-end min-h-[340px] shadow-sm w-full shrink-0 snap-center">
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

        {/* Right Sidebar Column: Team Rating Box + Key Stats */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* FEATURE BOX: Official Team Rating Card */}
          <div className="bg-gradient-to-br from-[#00382D] via-[#002c21] to-[#044c3c] text-white rounded-2xl p-6 shadow-md border border-[#08733e]/50 relative overflow-hidden flex flex-col justify-between">
            {/* Background Glow */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#98F5E1]/10 rounded-full blur-xl pointer-events-none"></div>
            <Trophy className="absolute right-3 top-3 text-[#98F5E1]/15 pointer-events-none" size={90} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-[#98F5E1] text-[#002c21] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs">
                  OFFICIAL TEAM RATING
                </span>
                <span className="text-xs font-bold text-[#98F5E1] bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 border border-white/10">
                  <Award size={13} /> {stats.rank || 'Unranked'}
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tight">{stats.stars || '0.0'}</span>
                  <span className="text-sm font-extrabold text-[#98F5E1]">/ 5.0 Stars</span>
                </div>

                {/* 5-Star Rating Display */}
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={18} 
                      className={star <= Math.round(Number(stats.stars || 0)) ? "fill-amber-400 text-amber-400" : "fill-amber-400/40 text-amber-400"} 
                    />
                  ))}
                  
                </div>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-300 font-bold uppercase block">Win Rate</span>
                <span className="text-xs font-black text-[#98F5E1]">{stats.winRate || 0}%</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-300 font-bold uppercase block">Points</span>
                <span className="text-xs font-black text-amber-300">{stats.points || 0} pts</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-300 font-bold uppercase block">Fair Play</span>
                <span className="text-xs font-black text-emerald-300">{stats.fairPlay || '0.0'} ★</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-300 font-bold uppercase block">Discipline</span>
                <span className="text-xs font-black text-cyan-300">{stats.discipline || '0.0'} ★</span>
              </div>
            </div>
          </div>

          {/* Key Performance Stats Card */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm flex flex-col justify-between flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Key Performance</h3>
              <button className="text-gray-400 hover:text-gray-600"><BarChart size={16} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="bg-[#f8f7f4] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Played</span>
                <span className="text-xl font-black text-[#111111] mt-0.5">
                  {loadingStats ? "..." : stats.played}
                </span>
              </div>
              <div className="bg-[#f8f7f4] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Wins</span>
                <span className="text-xl font-black text-[#08733e] mt-0.5">
                  {loadingStats ? "..." : stats.wins}
                </span>
              </div>
              <div className="bg-[#f8f7f4] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Losses</span>
                <span className="text-xl font-black text-red-600 mt-0.5">
                  {loadingStats ? "..." : stats.losses}
                </span>
              </div>
              <div className="bg-[#f8f7f4] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Win Rate</span>
                <span className="text-xl font-black text-[#111111] mt-0.5">
                  {loadingStats ? "..." : `${stats.winRate}%`}
                </span>
              </div>
            </div>

            {/* Tournaments Performance Breakdown */}
            <div className="pt-3 border-t border-[#e5e5e5] mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-extrabold text-[#111111] uppercase tracking-wider flex items-center gap-1">
                  <Trophy size={13} className="text-[#08733e]" /> Tournament Summary
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#f0fdf4] border border-emerald-200/60 p-2 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Tourneys Joined</span>
                  <span className="text-sm font-black text-[#00382D]">{loadingStats ? "..." : (stats.tournamentsPlayed || 0)}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200/60 p-2 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Titles Won 🏆</span>
                  <span className="text-sm font-black text-amber-700">{loadingStats ? "..." : (stats.tournamentsWon || 0)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e5e5]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-[#666666]">Tournament Goal Progress</span>
                <span className="text-[11px] font-black text-[#111111]">
                  {loadingStats ? "..." : `${stats.goalProgress}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#08733e] rounded-full transition-all duration-500"
                  style={{ width: `${stats.goalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Upcoming Matches + Team Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Tournaments */}
        <div className="lg:col-span-2 bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#111111]">Upcoming Tournaments</h3>
            <Link to="/tournaments" className="text-xs font-bold text-[#08733e] hover:text-[#065b31]">View All</Link>
          </div>

          <div className="space-y-4">
            {loadingTournaments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#08733e]" />
              </div>
            ) : (() => {
              const upcoming = tournaments.filter(t => (t.status || "").toUpperCase() !== "COMPLETED");
              if (upcoming.length === 0) {
                return (
                  <div className="text-center py-8 text-[#666666] text-xs font-medium bg-[#f8f7f4] rounded-xl">
                    No upcoming tournaments scheduled.
                  </div>
                );
              }
              return upcoming.slice(0, 3).map((tournament, idx) => {
                const { month, day, fullDate } = parseTournamentDate(tournament);
                return (
                  <Link 
                    key={tournament.tournament_id || idx}
                    to={`/tournaments/${tournament.tournament_id}`}
                    className="flex items-center gap-4 bg-[#f8f7f4] rounded-xl p-3 hover:shadow-md transition-all border border-[#e5e5e5]/60 hover:border-[#08733e]/30 group"
                  >
                    <div className="w-14 h-14 bg-[#00382D] text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-xs group-hover:bg-[#08733e] transition-colors">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">{month}</span>
                      <span className="text-base font-black leading-none mt-0.5">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#111111] mb-1 truncate group-hover:text-[#08733e] transition-colors">
                        {tournament.title}
                      </h4>
                      <p className="text-xs font-medium text-[#666666] flex items-center gap-2 truncate">
                        <span>{tournament.location || 'Sri Lanka'}</span>
                        <span>•</span>
                        <span>{fullDate}</span>
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-[#eaf1ec] text-[#08733e] rounded-full border border-[#c3dfcc] uppercase tracking-wider">
                        {getStatusDisplay(tournament.status, tournament.start_date, tournament.end_date)}
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
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
                <p className="text-sm text-[#111111]"><span className="font-bold">System Update:</span> Welcome to your official team portal dashboard.</p>
                <span className="text-[11px] font-semibold text-[#666666] mt-1 block">Just now</span>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="w-3 h-3 bg-[#08733e] rounded-full mt-1.5 shrink-0 z-10 border-2 border-white"></div>
              <div>
                <p className="text-sm text-[#111111]"><span className="font-bold">Match Status:</span> Tournament standings update automatically when matches conclude.</p>
                <span className="text-[11px] font-semibold text-[#666666] mt-1 block">Active</span>
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
          {loadingResults ? (
            <div className="py-12 text-center">
              <Loader2 size={24} className="animate-spin mx-auto text-[#00382D] mb-2" />
              <p className="text-xs text-gray-500 font-medium">Loading match results...</p>
            </div>
          ) : recentResults.length === 0 ? (
            <div className="py-14 text-center px-4">
              <Trophy size={40} className="mx-auto text-gray-300 mb-2.5 opacity-60" />
              <h4 className="text-sm font-bold text-[#111111]">No Recent Match Results</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Official match scores, standings, and performance points will automatically display here when tournament matches take place.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f8f7f4] text-[#666666] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Tournament / Opponent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] text-[#111111] font-medium">
                {recentResults.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-[#666666]">{item.tournament_held_date || item.start_date || 'Date TBD'}</td>
                    <td className="px-6 py-4 font-bold">{item.tournament_title || item.opponent || 'Tournament Match'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex bg-[#98F5E1] text-[#002c21] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-lg">{item.result || item.score || 'Verified'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/team/results" className="text-[#08733e] hover:underline font-bold text-xs">View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

export default TeamDashboard;