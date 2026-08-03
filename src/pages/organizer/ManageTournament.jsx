import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Trophy, MapPin, Calendar, Users, Star, Shield, 
  BadgeDollarSign, Map, Save, CheckSquare, AlertCircle, 
  CheckCircle2, ArrowLeft, Lock, Info,
  Zap, Edit, Radio, ChevronRight, FileText, Settings, QrCode, X, Award
} from 'lucide-react';
import api from '../../services/api';
import KnockoutBracketDisplay from '../../components/organizer/KnockoutBracketDisplay';

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
  const [activeTab, setActiveTab] = useState('sponsor');
  const [drawDetails, setDrawDetails] = useState(null);
  const [showFinalizeSummaryModal, setShowFinalizeSummaryModal] = useState(false);

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

      // Fetch tournament details and existing assignments
      const [detailsRes, assignmentsRes, directoryRes, playgroundReqsRes, sponsorReqsRes, teamReqsRes, refereeReqsRes, drawRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournament/${id}/assignments`),
        api.get('/user/getAllUsers'),
        api.get(`/tournament/${id}/playground-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/sponsor-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/team-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/referee-requests`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/tournament/${id}/draw`).catch(() => ({ data: { success: false, data: null } }))
      ]);

      if (detailsRes.data && detailsRes.data.success) {
        setTournament(detailsRes.data.data);
      } else {
        throw new Error(detailsRes.data.message || "Failed to load tournament details.");
      }

      // Parse current assignments
      if (assignmentsRes.data && assignmentsRes.data.success) {
        const assigns = assignmentsRes.data.data;
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

      if (drawRes && drawRes.data && drawRes.data.success) {
        setDrawDetails(drawRes.data.data);
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

  const handleSendTeamRequest = async (teamUserId) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/team-requests/send`, {
        teamUserId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send invitation to team.");
    }
  };

  const handleRespondToTeamRequest = async (teamUserId, status) => {
    try {
      const res = await api.post(`/tournament/${id}/team-requests/respond`, {
        teamUserId,
        status
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to respond to team request.");
    }
  };

  const handleSendRefereeRequest = async (refereeUserId) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/referee-requests/send`, {
        refereeUserId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send invitation to referee.");
    }
  };

  const handleRespondToRefereeRequest = async (refereeUserId, status) => {
    try {
      const res = await api.post(`/tournament/${id}/referee-requests/respond`, {
        refereeUserId,
        status
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to respond to referee request.");
    }
  };

  const handleSendPlaygroundRequest = async (playgroundOwnerId) => {
    if (isFinalized) return;
    try {
      const res = await api.post(`/tournament/${id}/playground-requests/send`, {
        playgroundOwnerId,
        initiatedBy: 'ORGANIZER'
      });
      if (res.data.success) {
        loadTournamentData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send playground booking request.");
    }
  };

  const handleRespondToPlaygroundRequest = async (playgroundOwnerId, status) => {
    try {
      const res = await api.post(`/tournament/${id}/playground-requests/respond`, {
        playgroundOwnerId,
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
    if (!window.confirm("Are you sure you want to finalize this tournament? Once finalized, resources are locked and tournament status becomes ONGOING.")) {
      return;
    }

    try {
      setFinalizing(true);
      setError(null);
      setSuccessMsg(null);

      // Save assignments
      const payload = {
        refereeUserIds: selectedReferees.map(uid => parseInt(uid, 10)),
        teamUserIds: selectedTeams.map(uid => parseInt(uid, 10))
      };
      await api.post(`/tournament/${id}/assignments`, payload);

      // Finalize
      const response = await api.post(`/tournament/${id}/finalize`);
      if (response.data && response.data.success) {
        setSuccessMsg("Tournament setup finalized successfully! Tournament is now ONGOING.");
        setShowFinalizeSummaryModal(true);
        await loadTournamentData();
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

  const handleBracketWinnersUpdate = async (updatedWinners, updatedScores) => {
    try {
      const newDrawData = {
        ...drawDetails?.drawData,
        bracketWinners: updatedWinners,
        matchScores: updatedScores || drawDetails?.drawData?.matchScores || {},
        winner: updatedWinners.champion || drawDetails?.drawData?.winner || 'TBD'
      };
      await api.post(`/tournament/${id}/draw`, { drawData: newDrawData });
      loadTournamentData();
    } catch (err) {
      console.error("Error auto-saving bracket winners:", err);
    }
  };

  const handleCompleteTournament = async () => {
    try {
      setError(null);
      const res = await api.post(`/tournament/${id}/complete`);
      if (res.data && res.data.success) {
        setSuccessMsg("Tournament has been successfully marked as COMPLETED! 🎉");
        loadTournamentData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        throw new Error(res.data.message || "Failed to mark tournament as completed.");
      }
    } catch (err) {
      console.error("Error completing tournament:", err);
      setError(err.message || "Error completing tournament.");
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

  const isFinalized = (tournament.is_finalized === 1 || tournament.is_finalized === '1' || tournament.is_finalized === true || (tournament.status || '').toUpperCase() === 'ONGOING' || (tournament.status || '').toUpperCase() === 'COMPLETED');
  const isCompleted = (tournament.status || '').toUpperCase() === 'COMPLETED';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-['Poppins']">
      {/* Top Header Card */}
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Link 
            to="/organizer" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#666666] hover:text-[#00382D] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">
              {tournament.title}
            </h1>

            {isCompleted ? (
              <span className="bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs uppercase tracking-wider">
                <CheckCircle2 size={14} /> Tournament Completed
              </span>
            ) : isFinalized ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                ONGOING
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                SETUP IN PROGRESS
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#666666] pt-1">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#08733e]" /> {tournament.location || 'Badulla Ground'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-[#08733e]" /> {tournament.start_date || 'Date TBD'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users size={14} className="text-[#08733e]" /> Max {tournament.maximum_team_limit || 6} Teams
            </span>
          </div>
        </div>

        {/* Action Header Button */}
        {!isFinalized ? (
          <button
            onClick={handleFinalizeTournament}
            disabled={finalizing}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#08733e] hover:bg-[#065b31] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            {finalizing ? "Finalizing..." : "Finalise Setup"}
          </button>
        ) : (
          <button
            onClick={() => setShowFinalizeSummaryModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border border-gray-200"
          >
            <FileText size={14} className="text-[#08733e]" /> View Resource Summary
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold animate-in fade-in">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* RENDER MATCH DRAW DIRECTLY WHEN FINALIZED / ONGOING */}
      {!isRoot ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm min-h-[400px]">
          <Outlet context={{ tournament }} />
        </div>
      ) : isFinalized ? (
        /* --- ONGOING TOURNAMENT: MATCH DRAW VIEW ONLY --- */
        <div className="space-y-6 animate-in fade-in duration-300">
          <KnockoutBracketDisplay 
            tournamentTitle={tournament.title?.toUpperCase() || 'TOURNAMENT MATCH DRAW'} 
            teams={drawDetails?.teams || []} 
            drawData={drawDetails?.drawData}
            onWinnersUpdate={handleBracketWinnersUpdate}
            onCompleteTournament={handleCompleteTournament}
            isTournamentCompleted={isCompleted}
          />
        </div>
      ) : (
        <>
          {/* Tab Navigation for Setup */}
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
              Playgrounds
            </button>
          </div>

          {/* SETUP TABS CONTENT BEFORE FINALIZATION */}
          {activeTab === 'sponsor' && (
            <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Sponsor Directory</h3>
                <p className="text-xs text-gray-500">Send sponsorship invitations to partners</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sponsors.map(s => (
                  <div key={s.sponsor_user_id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{s.display_name || s.company_name || 'Official Sponsor'}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {s.status || 'APPROVED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'referees' && (
            <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Referees Directory</h3>
                <p className="text-xs text-gray-500">Assign certified official referees to this tournament</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {refereeRequests.map(r => (
                  <div key={r.referee_user_id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{r.display_name || r.name || 'Official Referee'}</p>
                      <p className="text-xs text-gray-500">{r.email}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {r.status || 'APPROVED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Participating Teams</h3>
                <p className="text-xs text-gray-500">Approved teams roster for tournament match draw</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamRequests.map(t => (
                  <div key={t.team_user_id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.team_name || 'Team #' + t.team_user_id}</p>
                      <p className="text-xs text-gray-500">District: {t.district || 'Colombo'}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {t.status || 'APPROVED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'playgrounds' && (
            <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Playground Venues</h3>
                <p className="text-xs text-gray-500">Venue booking requests for this tournament</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {playgroundRequests.map(p => (
                  <div key={p.playground_user_id || p.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{p.ground_name || p.display_name || 'Official Ground Venue'}</p>
                      <p className="text-xs text-gray-500">Location: {p.district || p.location || 'Badulla'} • Cap: {p.capacity || 500}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {p.status || 'APPROVED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* FINALIZED SUMMARY POP-UP MODAL CARD */}
      {showFinalizeSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#08733e] flex items-center justify-center font-bold">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Tournament Setup Finalized</h3>
                  <p className="text-xs text-gray-500 font-medium">All required resources collected. Tournament status is now ONGOING.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFinalizeSummaryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Summary Grid */}
            <div className="space-y-4">
              {/* Venue */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Official Playground Venue</h4>
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Official Ground Venue</p>
                    <p className="text-xs text-gray-600 mt-0.5">Location: Badulla • Capacity: 500</p>
                  </div>
                  <span className="bg-[#08733e] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">Official Venue</span>
                </div>
              </div>

              {/* Participating Teams */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Selected Teams Roster</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {teamRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ACCEPTED').length} Teams Participating
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {teamRequests
                    .filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ACCEPTED')
                    .map(t => (
                      <div key={t.team_user_id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#08733e] text-white flex items-center justify-center font-bold text-xs">
                            {(t.team_name || 'T')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-gray-900">{t.team_name || 'Team #' + t.team_user_id}</p>
                            <p className="text-[10px] text-gray-500 font-medium">District: {t.district || 'Colombo'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Referees & Sponsors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Official Referees</h4>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 text-xs font-bold text-gray-800">
                    {refereeRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ACCEPTED').map(r => (
                      <p key={r.referee_user_id}>• {r.display_name || r.name || 'Official Referee'}</p>
                    ))}
                    {refereeRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ACCEPTED').length === 0 && (
                      <p className="text-xs text-gray-400 font-medium">No assigned referees.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Assigned Sponsors</h4>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 text-xs font-bold text-gray-800">
                    {sponsors.filter(s => (s.status || '').toUpperCase() === 'APPROVED' || (s.status || '').toUpperCase() === 'ACCEPTED').map(s => (
                      <p key={s.sponsor_user_id}>• {s.display_name || s.company_name || 'Official Sponsor'}</p>
                    ))}
                    {sponsors.filter(s => (s.status || '').toUpperCase() === 'APPROVED' || (s.status || '').toUpperCase() === 'ACCEPTED').length === 0 && (
                      <p className="text-xs text-gray-400 font-medium">No assigned sponsors.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowFinalizeSummaryModal(false)}
                className="px-6 py-3 bg-[#08733e] hover:bg-[#065b31] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Proceed to Match Draw
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}