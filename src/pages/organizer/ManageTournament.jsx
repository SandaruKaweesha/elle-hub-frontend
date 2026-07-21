import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Trophy, MapPin, Calendar, Users, Star, Shield, 
  BadgeDollarSign, Map, Save, CheckSquare, AlertCircle, 
  CheckCircle2, ArrowLeft, Lock, Info,
  Zap, Edit, Radio, ChevronRight, FileText, Settings, QrCode
} from 'lucide-react';
import api from '../../services/api';

export default function ManageTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname.endsWith(`/manage/${id}`);
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Selection options from directory
  const [sponsors, setSponsors] = useState([]);
  const [referees, setReferees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [refereeRequests, setRefereeRequests] = useState([]);

  // Advanced Playground Requests
  const [playgroundRequests, setPlaygroundRequests] = useState([]);
  const [playgroundDistrictFilter, setPlaygroundDistrictFilter] = useState('All');

  // Selected values
  const [selectedReferees, setSelectedReferees] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [activeTab, setActiveTab] = useState('sponsor'); // 'sponsor', 'referees', 'teams', 'playgrounds', 'tools'

  useEffect(() => {
    if (id) {
      loadTournamentData();
    }
  }, [id]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const orgId = currentUser.userId || currentUser.user_id;

      // 1. Fetch tournament details and existing assignments
      const [detailsRes, assignmentsRes, directoryRes, playgroundReqsRes, sponsorReqsRes, teamReqsRes, refereeReqsRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournament/${id}/assignments`),
        api.get('/user/getAllUsers'),
        api.get(`/tournament/${id}/playground-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/sponsor-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/team-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/referee-requests`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (detailsRes.data && detailsRes.data.success) {
        setTournament(detailsRes.data.data);
      } else {
        throw new Error(detailsRes.data.message || "Failed to load tournament details.");
      }

      // Parse current assignments
      if (assignmentsRes.data && assignmentsRes.data.success) {
        const assigns = assignmentsRes.data.data;
        // Sponsor assignments handled separately now
        setSelectedReferees(assigns.refereeUserIds || []);
        setSelectedTeams(assigns.teamUserIds || []);
      }

      // Parse system directory resources
      if (directoryRes.data && directoryRes.data.success) {
        const users = directoryRes.data.data || [];
        setReferees(users.filter(u => u.role.toUpperCase() === 'REFEREE' && u.status.toUpperCase() === 'APPROVED'));
        setTeams(users.filter(u => u.role.toUpperCase() === 'TEAM' && u.status.toUpperCase() === 'APPROVED'));
      }

      if (playgroundReqsRes.data && playgroundReqsRes.data.success) {
        setPlaygroundRequests(playgroundReqsRes.data.data || []);
      }

      if (refereeReqsRes.data && refereeReqsRes.data.success) {
        setRefereeRequests(refereeReqsRes.data.data || []);
      }

      if (sponsorReqsRes.data && sponsorReqsRes.data.success) {
        setSponsors(sponsorReqsRes.data.data || []);
      }

      if (teamReqsRes.data && teamReqsRes.data.success) {
        setTeamRequests(teamReqsRes.data.data || []);
      }

    } catch (err) {
      console.error("Error loading tournament details:", err);
      setError(err.message || "Failed to query tournament management details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSponsorRequest = async (sponsorUserId) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/sponsor-requests/send`, {
        sponsorUserId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send sponsor request.");
    }
  };

  const handleRespondToSponsor = async (sponsorUserId, status) => {
    try {
      const res = await api.post(`/tournament/${id}/sponsor-requests/respond`, {
        sponsorUserId,
        status
      });

      if (res.data && res.data.success) {
        loadTournamentData();
      } else {
        alert(res.data.message || "Failed to respond to request.");
      }
    } catch (err) {
      console.error("Error responding to sponsor request:", err);
      alert("An error occurred while handling sponsor request.");
    }
  };

  const handleRespondToRefereeRequest = async (refereeUserId, status) => {
    const maxRefLimit = parseInt(tournament?.maximum_referee_limit || tournament?.maximumRefereeLimit || 2, 10);
    const approvedCount = refereeRequests.filter(r => (r.status || '').toUpperCase() === 'ACCEPTED' || (r.status || '').toUpperCase() === 'APPROVED').length;

    if ((status === 'ACCEPTED' || status === 'APPROVED') && maxRefLimit > 0 && approvedCount >= maxRefLimit) {
      alert(`Cannot approve referee: Maximum limit of ${maxRefLimit} referees has been reached for this tournament.`);
      return;
    }

    try {
      const res = await api.post(`/tournament/${id}/referee-requests/respond`, {
        refereeUserId,
        status
      });

      if (res.data && res.data.success) {
        if (status === 'ACCEPTED' || status === 'APPROVED') {
          setSelectedReferees(prev => prev.includes(refereeUserId) ? prev : [...prev, refereeUserId]);
        }
        loadTournamentData();
      } else {
        alert(res.data.message || "Failed to respond to referee request.");
      }
    } catch (err) {
      console.error("Error responding to referee request:", err);
      alert("An error occurred while handling referee request.");
    }
  };

  const handleRespondToTeamRequest = async (teamUserId, actionStatus) => {
    if (isFinalized) return;
    try {
      const endpoint = actionStatus === 'APPROVED' ? '/tournament/request/approve' : '/tournament/request/reject';
      const res = await api.post(endpoint, {
        tournamentId: parseInt(id, 10),
        teamUserId: parseInt(teamUserId, 10)
      });
      if (res.data && res.data.success !== false) {
        loadTournamentData();
      } else {
        setError(res.data.message || "Failed to update team request.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to respond to team request.");
    }
  };

  const handleRefereeToggle = (refereeId) => {
    if (tournament?.status === 'ONGOING') return; // Read-only if finalized
    setSelectedReferees(prev => 
      prev.includes(refereeId) 
        ? prev.filter(uid => uid !== refereeId) 
        : [...prev, refereeId]
    );
  };

  const handleTeamToggle = (teamId) => {
    if (tournament?.status === 'ONGOING') return; // Read-only if finalized
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(uid => uid !== teamId) 
        : [...prev, teamId]
    );
  };

  const handleSendPlaygroundRequest = async (playgroundUserId) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/playground-requests/send`, {
        playgroundUserId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send playground request.");
    }
  };

  const handleSendRefereeRequest = async (refereeUserId) => {
    if (isFinalized) return;

    const maxRefLimit = parseInt(tournament?.maximum_referee_limit || tournament?.maximumRefereeLimit || 2, 10);
    const approvedCount = refereeRequests.filter(r => (r.status || '').toUpperCase() === 'ACCEPTED' || (r.status || '').toUpperCase() === 'APPROVED').length;

    if (maxRefLimit > 0 && approvedCount >= maxRefLimit) {
      alert(`Cannot send request: Maximum limit of ${maxRefLimit} referees has been reached for this tournament.`);
      return;
    }

    try {
      const res = await api.post(`/tournament/${id}/referee-requests/send`, {
        refereeUserId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data && res.data.success) {
        loadTournamentData();
      } else {
        alert(res.data.message || "Failed to send referee request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending referee request.");
    }
  };

  const handleRespondToPlayground = async (playgroundUserId, status) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/playground-requests/respond`, {
        playgroundUserId,
        status
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to respond to playground request.");
    }
  };

  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        refereeUserIds: selectedReferees.map(uid => parseInt(uid, 10)),
        teamUserIds: selectedTeams.map(uid => parseInt(uid, 10))
      };

      const response = await api.post(`/tournament/${id}/assignments`, payload);
      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || "Assignments updated successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(response.data.message || "Failed to save assignments.");
      }
    } catch (err) {
      console.error("Error saving assignments:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeTournament = async () => {
    if (!window.confirm("Are you sure you want to finalize this tournament? Once finalized, teams can no longer opt out or leave the tournament.")) {
      return;
    }

    try {
      setFinalizing(true);
      setError(null);
      setSuccessMsg(null);

      // First save current assignments
      const payload = {
        refereeUserIds: selectedReferees.map(uid => parseInt(uid, 10)),
        teamUserIds: selectedTeams.map(uid => parseInt(uid, 10))
      };
      await api.post(`/tournament/${id}/assignments`, payload);

      // Then finalize
      const response = await api.post(`/tournament/${id}/finalize`);
      if (response.data && response.data.success) {
        setSuccessMsg("Tournament setup finalized successfully! Tournament status is now ONGOING.");
        // Reload details
        const detailsRes = await api.get(`/tournaments/${id}`);
        if (detailsRes.data && detailsRes.data.success) {
          setTournament(detailsRes.data.data);
        }
      } else {
        throw new Error(response.data.message || "Failed to finalize tournament.");
      }
    } catch (err) {
      console.error("Error finalising tournament:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
        Loading tournament console details...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Tournament Not Found</h3>
        <p className="text-gray-500 mt-2">The requested tournament was not found or is inaccessible.</p>
        <Link to="/organizer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#08733e] hover:underline uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const isFinalized = (tournament?.status || '').toUpperCase() === 'ONGOING';

  return (
    <div className="max-w-5xl mx-auto pb-16 font-['Poppins'] animate-in fade-in duration-300 font-medium">
      
      {/* Back button */}
      <Link 
        to={isRoot ? "/organizer" : `/organizer/tournaments/manage/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} /> {isRoot ? 'Back to console' : 'Back to tournament dashboard'}
      </Link>

      {/* Header Info */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-emerald-200/90 font-black uppercase tracking-wider bg-[#00382D] px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-500/20 shadow-sm shrink-0">
              <Trophy size={11} />
              Tournament Manage Console
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${
              isFinalized 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isFinalized ? 'ONGOING / FINALIZED' : 'ACTIVE / SETUP'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111111] leading-tight">{tournament.title}</h2>
          <p className="text-gray-500 text-sm max-w-2xl">{tournament.description || 'No description provided.'}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-2">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              {tournament.location}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-gray-400" />
              Event Date: {new Date(tournament.tournament_held_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {isFinalized && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm mb-6 flex items-start gap-2.5 font-semibold">
          <Lock size={16} className="mt-0.5 text-blue-600 shrink-0" />
          <div>
            <p className="font-bold">Setup Finalized</p>
            <p className="text-xs text-blue-700/90 font-medium mt-0.5">This tournament is currently ONGOING. Dropdowns, selections, and invitations are locked in read-only mode. Participating teams can no longer drop out of the roster.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Content Router */}
      {!isRoot ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm min-h-[400px]">
          <Outlet context={{ tournament }} />
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-100 pb-3">
            <button
              onClick={() => setActiveTab('sponsor')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'sponsor' 
                  ? 'bg-[#00382D] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Sponsor
            </button>
            <button
              onClick={() => setActiveTab('referees')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'referees' 
                  ? 'bg-[#00382D] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Referees
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'teams' 
                  ? 'bg-[#00382D] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveTab('playgrounds')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'playgrounds' 
                  ? 'bg-[#00382D] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Playground Directory
            </button>
            {isFinalized && (
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'tools' 
                    ? 'bg-[#00382D] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Settings size={16} /> Management Tools
              </button>
            )}
          </div>

          {/* Management Tools Grid (Only visible if Finalized and activeTab === tools) */}
          {isFinalized && activeTab === 'tools' && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={20} className="text-[#00382D]" />
                <h3 className="font-bold text-lg text-[#111111]">Management Tools</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button 
                  onClick={() => navigate(`/organizer/tournaments/manage/${id}/draw`)}
                  className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
                >
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
                     <FileText size={180} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Zap size={20} className="text-[#4ade80]" />
                      </div>
                      <h3 className="text-white font-bold text-[18px] leading-tight">Match Draw</h3>
                      <p className="text-white/70 text-[13px] mt-1">Automated bracket creation</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/organizer/tournaments/manage/${id}/results`)}
                  className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
                >
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
                     <FileText size={180} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Edit size={20} className="text-[#4ade80]" />
                      </div>
                      <h3 className="text-white font-bold text-[18px] leading-tight">Update Results</h3>
                      <p className="text-white/70 text-[13px] mt-1">Real-time scoring input</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/organizer/tournaments/manage/${id}/broadcast`)}
                  className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
                >
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
                     <FileText size={180} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Radio size={20} className="text-[#4ade80]" />
                      </div>
                      <h3 className="text-white font-bold text-[18px] leading-tight">Broadcast Hub</h3>
                      <p className="text-white/70 text-[13px] mt-1">Manage stream overlays</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/organizer/tournaments/manage/${id}/certificate-qr`)}
                  className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
                >
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
                     <QrCode size={180} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <QrCode size={20} className="text-[#4ade80]" />
                      </div>
                      <h3 className="text-white font-bold text-[18px] leading-tight">Certificate QR</h3>
                      <p className="text-white/70 text-[13px] mt-1">Generate verification QRs</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Playground Tab */}
          {activeTab === 'playgrounds' && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full space-y-6">
              
              {/* ROW 1: Selected Playground Venue */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <Map size={18} className="text-[#08733e]" />
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                    Selected Playground Venue
                  </h3>
                </div>

                {playgroundRequests.filter(p => p.status === 'ACCEPTED').length === 0 ? (
                  <div className="text-xs font-semibold text-gray-400 p-6 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                    No playground venue currently assigned for this tournament.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playgroundRequests.filter(p => p.status === 'ACCEPTED').map(p => (
                      <div key={p.user_id} className="p-4 rounded-xl border border-emerald-200 bg-[#f0fdf4] flex justify-between items-center shadow-xs">
                        <div>
                          <h4 className="text-sm font-bold text-[#00382D]">{p.playground_name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-semibold mt-1">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {p.located_district || p.location}</span>
                            <span>• Cap: {p.capacity || 'N/A'}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Official Venue
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ROW 2: Playground Requests & Directory */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Map size={18} className="text-amber-600" />
                    <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                      Playground Requests & Directory
                    </h3>
                  </div>

                  {/* District Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">District:</span>
                    <select
                      value={playgroundDistrictFilter}
                      onChange={(e) => setPlaygroundDistrictFilter(e.target.value)}
                      className="h-8 px-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-lg text-xs font-bold outline-none focus:border-[#00382D]"
                    >
                      <option value="All">All Districts</option>
                      {[...new Set(playgroundRequests.map(p => p.located_district).filter(Boolean))].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {playgroundRequests
                    .filter(p => p.status !== 'ACCEPTED')
                    .filter(p => playgroundDistrictFilter === 'All' || p.located_district === playgroundDistrictFilter)
                    .map(p => (
                    <div key={p.user_id} className="p-4 rounded-xl border bg-white border-[#e5e5e5] shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-[#111111]">{p.playground_name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold mt-1">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {p.located_district || p.location}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><Users size={10} /> Cap: {p.capacity || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex items-center gap-2">
                          {p.status === 'PENDING' && p.initiated_by === 'ORGANIZER' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                              Requested (Pending Reply)
                            </span>
                          )}

                          {p.status === 'PENDING' && p.initiated_by === 'PLAYGROUND' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleRespondToPlayground(p.user_id, 'ACCEPTED')}
                                disabled={isFinalized}
                                className="bg-[#08733e] hover:bg-[#065b31] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-xs"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRespondToPlayground(p.user_id, 'REJECTED')}
                                disabled={isFinalized}
                                className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {!p.status && (
                            <button 
                              onClick={() => handleSendPlaygroundRequest(p.user_id)}
                              disabled={isFinalized}
                              className="bg-[#08733e] hover:bg-[#065b31] text-white text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sponsor Tab */}
          {activeTab === 'sponsor' && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full space-y-6">
              
              {/* ROW 1: Selected Sponsors */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <BadgeDollarSign size={18} className="text-[#08733e]" />
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                    Selected Sponsors
                  </h3>
                </div>

                {sponsors.filter(s => s.status === 'ACCEPTED').length === 0 ? (
                  <div className="text-xs font-semibold text-gray-400 p-6 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                    No official sponsor assigned yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sponsors.filter(s => s.status === 'ACCEPTED').map(s => (
                      <div key={s.user_id} className="p-4 rounded-xl border border-emerald-200 bg-[#f0fdf4] flex justify-between items-center shadow-xs">
                        <div>
                          <h4 className="text-sm font-bold text-[#00382D]">{s.display_name}</h4>
                          <span className="text-[10px] text-gray-600 font-medium">District: {s.district || 'Location N/A'}</span>
                        </div>
                        <span className="bg-[#08733e]/10 text-[#08733e] px-3 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1 uppercase">
                          <CheckCircle2 size={12} /> Assigned Sponsor
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ROW 2: Sponsor Requests */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <BadgeDollarSign size={18} className="text-amber-600" />
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                    Sponsor Requests & System Directory
                  </h3>
                </div>

                {/* Incoming Requests */}
                {sponsors.filter(s => s.status === 'PENDING' && s.initiated_by === 'SPONSOR').length > 0 && (
                  <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 mb-4">
                    <h5 className="font-bold text-[11px] text-amber-900 uppercase tracking-wider mb-2">Incoming Requests</h5>
                    <div className="space-y-2">
                      {sponsors.filter(s => s.status === 'PENDING' && s.initiated_by === 'SPONSOR').map(s => (
                        <div key={s.user_id} className="bg-white rounded-lg border border-amber-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{s.display_name}</h4>
                            <span className="text-[10px] text-gray-500 font-medium">District: {s.district || 'Location N/A'}</span>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto shrink-0">
                            <button 
                              onClick={() => handleRespondToSponsor(s.user_id, 'ACCEPTED')}
                              disabled={isFinalized}
                              className="bg-[#08733e] hover:bg-[#065b31] text-white text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRespondToSponsor(s.user_id, 'REJECTED')}
                              disabled={isFinalized}
                              className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Directory */}
                <h5 className="font-bold text-[11px] text-gray-400 uppercase tracking-wider mb-3">System Directory</h5>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {sponsors.filter(s => s.status !== 'ACCEPTED' && !(s.status === 'PENDING' && s.initiated_by === 'SPONSOR')).map(s => (
                    <div key={s.user_id} className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-xs">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{s.display_name}</h4>
                          <span className="text-xs text-gray-500 font-semibold">District: {s.district || 'Location N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                          {s.status === 'REJECTED' && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                              Declined
                            </span>
                          )}
                          
                          {s.status === 'PENDING' && s.initiated_by === 'ORGANIZER' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                              Requested (Pending Reply)
                            </span>
                          )}

                          {!s.status && (
                            <button 
                              onClick={() => handleSendSponsorRequest(s.user_id)}
                              disabled={isFinalized}
                              className="bg-[#f8f7f4] hover:bg-gray-200 text-gray-700 border border-[#e5e5e5] text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Referees Tab */}
          {activeTab === 'referees' && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full space-y-6">
              
              {/* ROW 1: Selected Referees */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-[#08733e]" />
                    <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                      Selected Referees
                    </h3>
                  </div>
                  {(() => {
                    const maxRefLimit = parseInt(tournament?.maximum_referee_limit || tournament?.maximumRefereeLimit || 2, 10);
                    const approvedReqUserIds = refereeRequests.filter(r => (r.status || '').toUpperCase() === 'ACCEPTED' || (r.status || '').toUpperCase() === 'APPROVED').map(r => parseInt(r.referee_user_id));
                    const currentCount = [...new Set([...selectedReferees.map(id => parseInt(id)), ...approvedReqUserIds])].length;
                    const isFull = maxRefLimit > 0 && currentCount >= maxRefLimit;

                    return (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isFull ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-[#08733e] bg-[#eaf1ec]'
                      }`}>
                        {currentCount} / {maxRefLimit} Referees Selected {isFull ? '(Limit Reached)' : ''}
                      </span>
                    );
                  })()}
                </div>

                {(() => {
                  const approvedReqs = refereeRequests.filter(r => (r.status || '').toUpperCase() === 'ACCEPTED' || (r.status || '').toUpperCase() === 'APPROVED');
                  const approvedUserIds = approvedReqs.map(r => parseInt(r.referee_user_id));
                  const allSelectedUserIds = [...new Set([...selectedReferees.map(id => parseInt(id)), ...approvedUserIds])];

                  if (allSelectedUserIds.length === 0) {
                    return (
                      <div className="text-xs font-semibold text-gray-400 p-6 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                        No referees currently selected. Approve requests below or select from directory.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {allSelectedUserIds.map(refId => {
                        const refFromDir = referees.find(r => parseInt(r.user_id) === refId);
                        const reqFromList = approvedReqs.find(r => parseInt(r.referee_user_id) === refId);
                        const refName = reqFromList?.display_name || refFromDir?.display_name || `Referee #${refId}`;

                        return (
                          <div key={refId} className="p-4 rounded-xl border border-emerald-200 bg-[#f0fdf4] flex justify-between items-center shadow-xs">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled={isFinalized}
                                checked={true}
                                onChange={() => handleRefereeToggle(refId)}
                                className="w-4 h-4 accent-[#08733e] cursor-pointer disabled:cursor-not-allowed"
                              />
                              <div className="w-8 h-8 rounded-lg bg-[#08733e] text-white flex items-center justify-center font-bold text-xs">
                                {refName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#00382D]">{refName}</h4>
                                <span className="text-[10px] text-gray-500 font-medium">Certified Referee</span>
                              </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} /> Assigned Referee
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ROW 2: Referee Requests & Directory */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <Shield size={18} className="text-amber-600" />
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                    Referee Requests
                  </h3>
                </div>

                {/* Incoming Pending Referee Requests */}
                {(() => {
                  const pendingRequests = refereeRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING');

                  if (pendingRequests.length > 0) {
                    return (
                      <div className="mb-6">
                        <h5 className="font-bold text-[11px] text-amber-900 uppercase tracking-wider mb-3">Incoming Referee Applications</h5>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {pendingRequests.map(req => (
                            <div key={req.referee_user_id} className="bg-white rounded-xl border border-amber-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                  {(req.display_name || 'RF').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs text-gray-900">{req.display_name || 'Referee #' + req.referee_user_id}</h4>
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Pending Approval</span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                    Contact: <span className="font-semibold text-gray-700">{req.phone || 'N/A'}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                <button
                                  onClick={() => handleRespondToRefereeRequest(req.referee_user_id, 'ACCEPTED')}
                                  disabled={isFinalized}
                                  className="flex-1 sm:flex-initial bg-[#08733e] hover:bg-[#065b31] text-white text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRespondToRefereeRequest(req.referee_user_id, 'REJECTED')}
                                  disabled={isFinalized}
                                  className="flex-1 sm:flex-initial bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="text-xs font-semibold text-gray-400 p-4 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center mb-6">
                      No pending referee requests for this tournament.
                    </div>
                  );
                })()}

                {/* Referees Directory */}
                <h5 className="font-bold text-[11px] text-gray-400 uppercase tracking-wider mb-3">Referees Directory</h5>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {referees.filter(r => !selectedReferees.includes(r.user_id)).map(ref => {
                    const existingReq = refereeRequests.find(req => parseInt(req.referee_user_id) === parseInt(ref.user_id));
                    const isRequested = existingReq && (existingReq.status || '').toUpperCase() === 'PENDING' && (existingReq.initiated_by || '').toUpperCase() === 'ORGANIZER';

                    return (
                      <div 
                        key={ref.user_id} 
                        className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border bg-white border-[#e5e5e5] text-gray-700 shadow-xs gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                            {(ref.display_name || 'RF').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{ref.display_name}</h4>
                              {ref.rating && (
                                <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold shrink-0">
                                  <Star size={10} className="fill-amber-600 text-amber-600" />
                                  {parseFloat(ref.rating).toFixed(1)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">Available Referee</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isRequested ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                              Requested (Pending Reply)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendRefereeRequest(ref.user_id)}
                              disabled={isFinalized}
                              className="bg-[#08733e] hover:bg-[#065b31] text-white text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full space-y-6">
              
              {/* ROW 1: Selected Teams */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#08733e]" />
                    <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                      Selected Teams
                    </h3>
                  </div>
                  {(() => {
                    const maxTeamLimit = parseInt(tournament?.maximum_team_limit || tournament?.maximumTeamLimit || 16, 10);
                    const approvedReqUserIds = teamRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED').map(r => parseInt(r.team_user_id));
                    const currentCount = [...new Set([...selectedTeams.map(id => parseInt(id)), ...approvedReqUserIds])].length;
                    const isFull = maxTeamLimit > 0 && currentCount >= maxTeamLimit;

                    return (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isFull ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-[#08733e] bg-[#eaf1ec]'
                      }`}>
                        {currentCount} / {maxTeamLimit} Teams Participating {isFull ? '(Limit Reached)' : ''}
                      </span>
                    );
                  })()}
                </div>

                {(() => {
                  const approvedReqs = teamRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED');
                  const approvedUserIds = approvedReqs.map(r => parseInt(r.team_user_id));
                  const allSelectedUserIds = [...new Set([...selectedTeams.map(id => parseInt(id)), ...approvedUserIds])];

                  if (allSelectedUserIds.length === 0) {
                    return (
                      <div className="text-xs font-semibold text-gray-400 p-6 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                        No selected or approved teams yet. Approve requests below or select from directory.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {allSelectedUserIds.map(teamId => {
                        const teamFromDir = teams.find(t => parseInt(t.user_id) === teamId);
                        const reqFromList = approvedReqs.find(r => parseInt(r.team_user_id) === teamId);
                        const teamName = reqFromList?.team_name || teamFromDir?.display_name || `Team #${teamId}`;
                        const district = reqFromList?.district || teamFromDir?.district || 'Location N/A';

                        return (
                          <div key={teamId} className="p-4 rounded-xl border border-emerald-200 bg-[#f0fdf4] flex justify-between items-center shadow-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#08733e] text-white flex items-center justify-center font-bold text-xs">
                                {teamName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#00382D]">{teamName}</h4>
                                <span className="text-[10px] text-gray-500 font-medium">District: {district}</span>
                              </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} /> Approved & Playing
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ROW 2: Team Requests */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <Users size={18} className="text-amber-600" />
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
                    Team Requests
                  </h3>
                </div>

                {(() => {
                  const pendingRequests = teamRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING');

                  if (pendingRequests.length === 0) {
                    return (
                      <div className="text-xs font-semibold text-gray-400 p-6 bg-gray-50 rounded-xl border border-[#e5e5e5] text-center">
                        No pending team requests for this tournament.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {pendingRequests.map(req => (
                        <div key={req.team_user_id} className="bg-white rounded-xl border border-amber-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-gray-900">{req.team_name || 'Team #' + req.team_user_id}</h4>
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Pending Approval</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium mt-1">
                              District: <span className="font-semibold text-gray-700">{req.district || 'N/A'}</span> • Contact: <span className="font-semibold text-gray-700">{req.contact_number || 'N/A'}</span>
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                            <button
                              onClick={() => handleRespondToTeamRequest(req.team_user_id, 'APPROVED')}
                              disabled={isFinalized}
                              className="flex-1 sm:flex-initial bg-[#08733e] hover:bg-[#065b31] text-white text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRespondToTeamRequest(req.team_user_id, 'REJECTED')}
                              disabled={isFinalized}
                              className="flex-1 sm:flex-initial bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Additional Manual Directory Selection */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Manual Selection from Team Directory</h4>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {teams.map(team => {
                      const isChecked = selectedTeams.includes(team.user_id);
                      return (
                        <label 
                          key={team.user_id} 
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-50 border-emerald-200 text-[#00382D]' 
                              : 'bg-white border-[#e5e5e5] text-gray-700 hover:bg-gray-50'
                          } ${isFinalized ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              disabled={isFinalized}
                              checked={isChecked}
                              onChange={() => handleTeamToggle(team.user_id)}
                              className="w-4 h-4 accent-[#00382D] cursor-pointer disabled:cursor-not-allowed"
                            />
                            <span className="text-xs font-bold">{team.display_name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold">{team.district || 'Location N/A'}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footers */}
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
              <Info size={14} className="text-gray-400 shrink-0" />
              <span>Save updates progressively. Click Finalize only when all details are correct.</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isFinalized && (
                <>
                  <button
                    type="button"
                    disabled={saving || finalizing}
                    onClick={handleSaveAssignments}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 border border-[#e5e5e5] hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Selection'}
                  </button>
                  <button
                    type="button"
                    disabled={saving || finalizing}
                    onClick={handleFinalizeTournament}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CheckSquare size={14} />
                    {finalizing ? 'Finalising...' : 'Finalise'}
                  </button>
                </>
              )}
              {isFinalized && (
                <button
                  disabled
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                >
                  <Lock size={14} />
                  Setup Finalized
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
