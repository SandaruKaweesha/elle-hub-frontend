import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { 
  PlusCircle, 
  Award, 
  Hourglass, 
  MapPin, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Clock, 
  XCircle,
  Trophy,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  FileText,
  X,
  Users,
  CheckCircle2,
  Swords
} from "lucide-react";
import KnockoutBracketDisplay from "../../components/organizer/KnockoutBracketDisplay";

function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'

  // Completed Details Modal State
  const [selectedCompletedTournament, setSelectedCompletedTournament] = useState(null);
  const [completedDetailsLoading, setCompletedDetailsLoading] = useState(false);
  const [completedDrawData, setCompletedDrawData] = useState(null);
  const [completedTeams, setCompletedTeams] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      let organizerId = null;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const currentUser = JSON.parse(userString);
          organizerId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.organizer_id;
        }
      } catch (e) {
        console.error("Error reading user from localStorage:", e);
      }

      if (organizerId) {
        await fetchTournaments(organizerId);
      } else {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const fetchTournaments = async (targetOrganizerId) => {
    if (!targetOrganizerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/organizer/${targetOrganizerId}/tournaments`);
      if (response.data && response.data.success !== false) {
        setTournaments(response.data.data || []);
      } else {
        setTournaments([]);
      }
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError("Failed to retrieve your tournament list.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompletedDetails = async (t) => {
    setSelectedCompletedTournament(t);
    setCompletedDetailsLoading(true);
    try {
      const res = await api.get(`/tournament/${t.tournament_id || t.id}/draw`);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setCompletedDrawData(data.drawData || null);
        setCompletedTeams(data.teams || []);
      }
    } catch (err) {
      console.error("Error fetching completed tournament draw details:", err);
    } finally {
      setCompletedDetailsLoading(false);
    }
  };

  const getStatusBadge = (t) => {
    const isCompleted = (t.status || '').toUpperCase() === 'COMPLETED';
    if (isCompleted) {
      return (
        <span className="bg-emerald-600 text-white shadow-xs border border-emerald-500 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
          <Trophy size={12} className="text-amber-300" /> Completed
        </span>
      );
    }

    const status = (t.approval_status || 'PENDING').toUpperCase();
    if (status === 'APPROVED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck size={12} /> Approved
        </span>
      );
    } else if (status === 'REJECTED') {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <Clock size={12} /> Pending Admin
      </span>
    );
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = t.status && t.status.toUpperCase() === 'COMPLETED';
    } else {
      matchesStatus = t.approval_status && t.approval_status.toUpperCase() === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-['Poppins']">
      
      {/* Top Banner / Welcome */}
      <div className="bg-[#00382D] text-white rounded-3xl p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Organizer Console
          </h1>
          <p className="text-xs text-gray-300 leading-relaxed font-normal">
            Manage your tournaments, review team registrations, allocate official referees, and control live match draw brackets.
          </p>
        </div>

        <Link 
          to="/organizer/create-tournament"
          className="z-10 inline-flex items-center gap-2 px-6 py-3.5 bg-[#08733e] hover:bg-[#065b31] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-[#08733e]"
        >
          <PlusCircle size={16} /> Create Tournament
        </Link>

        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#08733e]/30 rounded-full blur-2xl"></div>
      </div>

      {/* Organizer Tournament Statistics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tournaments */}
        <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">Total Created</span>
            <span className="text-2xl font-black text-gray-900">{tournaments.length}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center font-bold">
            <Trophy size={22} />
          </div>
        </div>

        {/* Ongoing Tournaments */}
        <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">Ongoing Matches</span>
            <span className="text-2xl font-black text-[#08733e]">
              {tournaments.filter(t => (t.status || '').toUpperCase() === 'ONGOING' || (t.is_finalized && (t.status || '').toUpperCase() !== 'COMPLETED')).length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#08733e] flex items-center justify-center font-bold">
            <Swords size={22} />
          </div>
        </div>

        {/* Completed Tournaments */}
        <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-amber-600">
              {tournaments.filter(t => (t.status || '').toUpperCase() === 'COMPLETED').length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">Pending Admin</span>
            <span className="text-2xl font-black text-amber-700">
              {tournaments.filter(t => (t.approval_status || '').toUpperCase() === 'PENDING').length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-xs">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#00382D] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab === 'ALL' ? 'ALL TOURNAMENTS' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00382D]"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-[#00382D]/20 border-t-[#00382D] rounded-full animate-spin mb-4"></div>
          Loading your tournaments...
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-3xl p-12 text-center space-y-3">
          <Award size={40} className="mx-auto text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">No Tournaments Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {statusFilter !== 'ALL' 
              ? `You have no tournaments with '${statusFilter}' status.`
              : 'You haven\'t created any tournaments yet. Click Create Tournament to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t) => (
            <div 
              key={t.tournament_id || t.id}
              className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
            >
              {/* Cover Banner */}
              <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex items-start justify-end">
                {getStatusBadge(t)}
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-[#111111] leading-tight mb-3 group-hover:text-[#00382D] transition-colors">
                    {t.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs font-semibold text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span>{t.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      <span>Held Date: {formatDate(t.tournament_held_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f4f4f4] space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Registrations</span>
                    <span className="text-gray-600">{formatDate(t.start_date)} - {formatDate(t.end_date)}</span>
                  </div>
                  
                  {(t.status || '').toUpperCase() === 'COMPLETED' ? (
                    /* COMPLETED TOURNAMENT: SHOW ONLY VIEW DETAILS BUTTON */
                    <button 
                      onClick={() => handleOpenCompletedDetails(t)}
                      className="w-full py-2.5 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <FileText size={14} /> View Details
                    </button>
                  ) : (t.approval_status || '').toUpperCase() === 'APPROVED' ? (
                    <div className="flex gap-2">
                      <Link 
                        to={`/tournaments/${t.tournament_id || t.id}`}
                        className="flex-1 py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-[#e5e5e5] shadow-sm cursor-pointer"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/organizer/tournaments/manage/${t.tournament_id || t.id}`}
                        className="flex-1 py-2.5 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        Manage
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      to={`/tournaments/${t.tournament_id || t.id}`}
                      className="w-full py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 group/btn border border-[#e5e5e5] shadow-sm cursor-pointer"
                    >
                      View Details
                      <ChevronRight size={14} className="text-[#888888] group-hover/btn:text-[#333333] transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLETED TOURNAMENT DETAILS POP-UP MODAL CARD */}
      {selectedCompletedTournament && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#08733e] flex items-center justify-center font-bold">
                  <Trophy size={26} className="text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{selectedCompletedTournament.title}</h3>
                    <span className="bg-emerald-700 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    📍 {selectedCompletedTournament.location} • Held Date: {formatDate(selectedCompletedTournament.tournament_held_date)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCompletedTournament(null)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {completedDetailsLoading ? (
              <div className="py-16 text-center text-gray-400 font-bold">
                <div className="w-8 h-8 border-4 border-[#08733e] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                Loading completed tournament report...
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 🏆 Official Podium Winners Cards (Separated) */}
                {completedDrawData?.bracketWinners?.champion && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Official Tournament Winners & Podium</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 🥇 Official Champion Card (1st Place) */}
                      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 p-4.5 rounded-2xl flex items-center justify-between shadow-md border border-amber-300">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-2xl font-black shrink-0">
                            🥇
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-900/80 block">Champion (1st Place)</span>
                            <h4 className="text-lg font-black text-slate-950 leading-tight">{completedDrawData.bracketWinners.champion}</h4>
                          </div>
                        </div>
                        <Trophy size={26} className="text-slate-900 shrink-0" />
                      </div>

                      {/* 🥈 Runner-Up Card (2nd Place) */}
                      {completedDrawData.bracketWinners.groupA_SF && completedDrawData.bracketWinners.groupB_SF && (
                        <div className="bg-slate-100 border border-slate-300 text-slate-900 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl font-black shrink-0">
                              🥈
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Runner-Up (2nd Place)</span>
                              <h4 className="text-lg font-extrabold text-gray-900 leading-tight">
                                {completedDrawData.bracketWinners.champion === completedDrawData.bracketWinners.groupA_SF 
                                  ? completedDrawData.bracketWinners.groupB_SF 
                                  : completedDrawData.bracketWinners.groupA_SF}
                              </h4>
                            </div>
                          </div>
                          <Award size={26} className="text-slate-500 shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ⚔️ Completed Match Draw Bracket */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Official Tournament Bracket & Match Scores</h4>
                  <KnockoutBracketDisplay
                    tournamentTitle={selectedCompletedTournament.title}
                    teams={completedTeams}
                    drawData={completedDrawData}
                    readOnly={true}
                    isTournamentCompleted={true}
                  />
                </div>

              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedCompletedTournament(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Summary
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default OrganizerDashboard;
