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
  Swords,
  Edit3,
  Trash2,
  Save,
  Loader2
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
  const [selectedDetailsTournament, setSelectedDetailsTournament] = useState(null);
  const [editingTournament, setEditingTournament] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', tournament_held_date: '', end_date: '', maximum_team_limit: '', rules: '', prize_details: '' });
  const [completedDetailsLoading, setCompletedDetailsLoading] = useState(false);
  const [completedDrawData, setCompletedDrawData] = useState(null);
  const [completedTeams, setCompletedTeams] = useState([]);

  // Deletion Request State
  const [deletingTournament, setDeletingTournament] = useState(null);
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);

  const handleRequestTournamentDeletion = async () => {
    if (!deletingTournament) return;
    try {
      setIsSubmittingDeletion(true);
      setError(null);
      setSuccessMsg(null);
      const res = await api.post(`/organizer/tournament/${deletingTournament.tournament_id || deletingTournament.id}/request-deletion`);
      if (res.data && res.data.success !== false) {
        setSuccessMsg("Tournament deletion request submitted to Admin for approval.");
        setDeletingTournament(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(res.data.message || "Failed to request tournament deletion.");
      }
    } catch (err) {
      console.error("Deletion request error:", err);
      setError(err.response?.data?.message || err.message || "Could not request tournament deletion.");
      setDeletingTournament(null);
    } finally {
      setIsSubmittingDeletion(false);
    }
  };

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

      if (!organizerId) {
        try {
          const profileRes = await api.get('/user/profile');
          if (profileRes.data && profileRes.data.data) {
            const pData = profileRes.data.data;
            organizerId = pData.userId || pData.user_id || pData.id;
          }
        } catch (e) {
          console.warn("Could not fetch profile fallback:", e);
        }
      }

      await fetchTournaments(organizerId);
    };

    loadDashboard();
  }, []);

  const fetchTournaments = async (targetOrganizerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = targetOrganizerId ? `/organizer/${targetOrganizerId}/tournaments` : `/organizer/tournaments`;
      const response = await api.get(endpoint);
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

    const handleOpenEditModal = (t) => {
    const isFinalized = Number(t.is_finalized || t.is_draw_finalized || t.isFinalized) === 1 || 
                        ['FINALIZED', 'COMPLETED', 'FINISHED'].includes((t.status || '').toUpperCase());
    if (isFinalized) {
      alert("This tournament has been finalized & locked. Editing details is disabled.");
      return;
    }
    const tId = t.tournament_id || t.id;
    setEditingTournament(t);
    setEditForm({
      title: t.title || '',
      description: t.description || '',
      location: t.location || '',
      tournament_held_date: t.tournament_held_date || '',
      end_date: t.end_date || '',
      maximum_team_limit: t.maximum_team_limit || '16',
      rules: t.rules || '',
      prize_details: t.prize_details || t.prizeDetails || ''
    });
  };

  const handleUpdateTournamentSubmit = async (e) => {
    e.preventDefault();
    if (!editingTournament) return;
    const tId = editingTournament.tournament_id || editingTournament.id;
    setIsUpdating(true);

    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        tournamentHeldDate: editForm.tournament_held_date,
        endDate: editForm.end_date,
        maximumTeamLimit: parseInt(editForm.maximum_team_limit || 16, 10),
        rules: editForm.rules,
        prizeDetails: editForm.prize_details
      };

      const res = await api.put(`/tournament/${tId}`, payload);
      if (res.data && res.data.success !== false) {
        // Update local list
        setTournaments(prev => prev.map(item => {
          if (String(item.tournament_id || item.id) === String(tId)) {
            return {
              ...item,
              ...payload,
              tournament_held_date: editForm.tournament_held_date,
              end_date: editForm.end_date,
              maximum_team_limit: editForm.maximum_team_limit,
              prize_details: editForm.prize_details
            };
          }
          return item;
        }));

        // Also update selected details if open
        if (selectedDetailsTournament && String(selectedDetailsTournament.tournament_id || selectedDetailsTournament.id) === String(tId)) {
          setSelectedDetailsTournament(prev => ({ ...prev, ...payload, tournament_held_date: editForm.tournament_held_date }));
        }

        setEditingTournament(null);
        setSuccessMsg("Tournament details updated successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(res.data?.message || "Failed to update tournament details.");
      }
    } catch (err) {
      console.error("Update tournament error:", err);
      alert(err.response?.data?.message || err.message || "Failed to update tournament.");
    } finally {
      setIsUpdating(false);
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

    const getFallbackImage = (index) => {
    const images = [
      "/images/elle1.jpeg",
      "/images/elle2.jpeg",
      "/images/elle3.jpeg",
      "/images/elle4.jpeg",
      "/images/elle5.jpeg"
    ];
    return images[index % images.length];
  };

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
      {/* SUCCESS TOAST POPUP NOTIFICATION */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#08733e] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-3.5 font-extrabold text-sm backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Success</p>
              <p className="text-sm font-bold text-white">{successMsg}</p>
            </div>
            <button 
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="ml-3 p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
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
          {filteredTournaments.map((t, idx) => (
            <div 
              key={t.tournament_id || t.id}
              className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/15 hover:-translate-y-1.5 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Banner */}
              <div className="h-44 relative bg-slate-950 overflow-hidden flex items-start justify-end p-4">
                <img 
                  src={(t.image_url && t.image_url.trim() !== '') ? t.image_url : getFallbackImage(idx)} 
                  alt={t.title} 
                  onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(idx); }}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-110 group-hover:opacity-95 transition-all duration-700 ease-out pointer-events-none" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                <div className="relative z-10">
                  {getStatusBadge(t)}
                </div>

                {/* Location Pill Overlay on Image */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 backdrop-blur-md text-white rounded-full text-[11px] font-bold border border-white/20 shadow-xs">
                  <MapPin size={12} className="text-emerald-400" />
                  <span className="truncate max-w-[140px]">{t.location || 'Sri Lanka'}</span>
                </div>
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
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setSelectedDetailsTournament(t)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1 border border-slate-200 shadow-xs cursor-pointer"
                        >
                          View Details
                        </button>
                        <Link 
                          to={`/organizer/tournaments/manage/${t.tournament_id || t.id}`}
                          className="flex-1 py-2 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          Manage
                        </Link>
                      </div>
                      {(t.deletion_status || '').toUpperCase() === 'DELETION_PENDING' ? (
                        <span className="w-full text-center py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase rounded-xl">
                          Deletion Request Pending Admin Review
                        </span>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setDeletingTournament(t)}
                          className="w-full py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Request Deletion
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setSelectedDetailsTournament(t)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1 border border-slate-200 shadow-xs cursor-pointer"
                      >
                        View Details
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleOpenEditModal(t)}
                        className="flex-1 py-2 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Edit3 size={13} /> Update
                      </button>
                    </div>
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

      {/* --- TOURNAMENT ALL DETAILS POPUP MODAL --- */}
      {selectedDetailsTournament && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 z-[999999] animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto relative space-y-0">
            
            {/* Cover Image Header with Dark Gradient & Badges */}
            <div className="relative h-56 md:h-64 w-full bg-slate-950 overflow-hidden">
              <img 
                src={(selectedDetailsTournament.image_url && selectedDetailsTournament.image_url.trim() !== '') ? selectedDetailsTournament.image_url : getFallbackImage(0)} 
                alt={selectedDetailsTournament.title} 
                onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(0); }}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedDetailsTournament(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20"
              >
                <X size={18} />
              </button>

              {/* Top Status Pill */}
              <div className="absolute top-4 left-4 z-10">
                {getStatusBadge(selectedDetailsTournament)}
              </div>

              {/* Floating Tournament Title & Location */}
              <div className="absolute bottom-4 left-6 right-6 z-10 text-white space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/80 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20 inline-block mb-1">
                  Elle Tournament
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white capitalize leading-tight">
                  {selectedDetailsTournament.title || selectedDetailsTournament.tournament_title}
                </h2>
                <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 pt-0.5">
                  <MapPin size={14} className="text-emerald-400" /> {selectedDetailsTournament.location || 'Sri Lanka'}
                </p>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Quick Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                    <Calendar size={13} className="text-[#08733e]" /> Held Date
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {formatDate(selectedDetailsTournament.tournament_held_date)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                    <Users size={13} className="text-[#08733e]" /> Max Teams
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {selectedDetailsTournament.maximum_team_limit || '16'} Teams
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                    <ShieldCheck size={13} className="text-[#08733e]" /> Referees
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {selectedDetailsTournament.maximum_referee_limit || '2'} Officials
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                    <Clock size={13} className="text-[#08733e]" /> Registration
                  </div>
                  <p className="text-[11px] font-black text-slate-800 truncate">
                    {formatDate(selectedDetailsTournament.start_date)} - {formatDate(selectedDetailsTournament.end_date)}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              {selectedDetailsTournament.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tournament Overview</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    {selectedDetailsTournament.description}
                  </p>
                </div>
              )}

              {/* Prize Details & Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={15} className="text-amber-600" /> Prize Details & Awards
                  </h4>
                  <p className="text-xs text-amber-900/80 font-medium leading-relaxed">
                    {selectedDetailsTournament.prize_details || selectedDetailsTournament.prizeDetails || "Trophies, Certificates & Cash prizes awarded to Champions & Runners-up."}
                  </p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={15} className="text-emerald-700" /> Rules & Match Format
                  </h4>
                  <p className="text-xs text-emerald-900/80 font-medium leading-relaxed">
                    {selectedDetailsTournament.rules || "Standard Sri Lanka National Elle Federation Tournament rules and knockout match format."}
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 md:px-8 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedDetailsTournament(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Close
              </button>

              {((selectedDetailsTournament.is_finalized || selectedDetailsTournament.is_draw_finalized || selectedDetailsTournament.isFinalized) == 1 || 
                ['FINALIZED', 'COMPLETED', 'FINISHED'].includes((selectedDetailsTournament.status || '').toUpperCase())) ? (
                <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs">
                  🔒 Finalized & Locked (Editing Disabled)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedDetailsTournament)}
                  className="px-6 py-2.5 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 size={15} /> Update Tournament
                </button>
              )}
            </div>

          </div>
        </div>
      )}
      {/* --- UPDATE TOURNAMENT MODAL --- */}
      {editingTournament && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 z-[999999] animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto p-6 md:p-8 space-y-6 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-[#08733e] font-black text-base">
                <Edit3 size={20} /> Update Tournament Details
              </div>
              <button
                type="button"
                onClick={() => setEditingTournament(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdateTournamentSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tournament Title</label>
                <input 
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                />
              </div>

              {/* Location & Held Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location / Venue</label>
                  <input 
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Held Date</label>
                  <input 
                    type="date"
                    required
                    value={editForm.tournament_held_date}
                    onChange={(e) => setEditForm({ ...editForm, tournament_held_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  />
                </div>
              </div>

              {/* End Date & Max Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registration Deadline</label>
                  <input 
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Teams Limit</label>
                  <input 
                    type="number"
                    min="2"
                    max="64"
                    value={editForm.maximum_team_limit}
                    onChange={(e) => setEditForm({ ...editForm, maximum_team_limit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tournament Description</label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                ></textarea>
              </div>

              {/* Prize Details & Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prize Details</label>
                  <textarea 
                    rows="2"
                    value={editForm.prize_details}
                    onChange={(e) => setEditForm({ ...editForm, prize_details: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rules & Format</label>
                  <textarea 
                    rows="2"
                    value={editForm.rules}
                    onChange={(e) => setEditForm({ ...editForm, rules: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#08733e]"
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isUpdating ? "Updating..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    
      {/* TOURNAMENT DELETION REQUEST CONFIRMATION MODAL */}
      {deletingTournament && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Request Tournament Deletion</h3>
                <p className="text-xs text-gray-500 font-semibold">Admin Approval Required</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Are you sure you want to request deletion for tournament <strong className="text-gray-900">{deletingTournament.title}</strong>? 
              A deletion request will be sent to the System Administrator for review and final approval.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTournament(null)}
                disabled={isSubmittingDeletion}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestTournamentDeletion}
                disabled={isSubmittingDeletion}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingDeletion ? "Submitting..." : "Submit Deletion Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrganizerDashboard;
