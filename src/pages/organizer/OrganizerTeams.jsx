import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, ShieldCheck, Star, ChevronRight, Phone, Clock, AlertCircle, CheckCircle2, Trophy, Inbox, Send, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function OrganizerTeams() {
  const [allTeams, setAllTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [organizerTournaments, setOrganizerTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [rosterPlayers, setRosterPlayers] = useState([]);
  const [selectedTeamProfile, setSelectedTeamProfile] = useState(null);

  // Invite Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeamToInvite, setSelectedTeamToInvite] = useState(null); // { teamUserId, teamName }
  const [selectedTournamentId, setSelectedTournamentId] = useState('');

  // Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'APPROVE' | 'REJECT', tournamentId, teamUserId, teamName }
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadTeamsData = async () => {
      setLoading(true);
      setError(null);

      let targetId = null;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          targetId = userObj?.userId || userObj?.user_id || userObj?.id || userObj?.organizer_id;
        }
      } catch (e) {
        console.error("Session parse error:", e);
      }

      if (!targetId) {
        try {
          const profileRes = await api.get('/user/profile');
          if (profileRes.data && profileRes.data.data) {
            const p = profileRes.data.data;
            targetId = p.userId || p.user_id || p.id;
          }
        } catch (e) {
          console.warn("Could not resolve profile:", e);
        }
      }

      await loadAllData(targetId || 0);
    };

    loadTeamsData();
  }, []);

  const loadAllData = async (targetOrganizerId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all three resources in parallel with fallback error catchers
      const [requestsRes, tournamentsRes, usersRes] = await Promise.all([
        api.get(`/organizer/${targetOrganizerId}/team-requests`).catch(err => {
          console.warn("Failed fetching team requests:", err);
          return { data: { success: false, data: [] } };
        }),
        api.get(`/organizer/${targetOrganizerId}/tournaments`).catch(err => {
          console.warn("Failed fetching organizer tournaments:", err);
          return { data: { success: false, data: [] } };
        }),
        api.get('/user/getAllUsers').catch(err => {
          console.warn("Failed fetching users:", err);
          return { data: { success: false, data: [] } };
        })
      ]);

      if (requestsRes.data && requestsRes.data.success !== false) {
        setRequests(requestsRes.data.data || []);
      }
      
      if (tournamentsRes.data && tournamentsRes.data.success !== false) {
        const list = tournamentsRes.data.data || [];
        const activeOnly = list.filter(t => 
          t && 
          (t.approval_status || '').toString().toUpperCase() === 'APPROVED' && 
          (t.status || 'ACTIVE').toString().toUpperCase() !== 'COMPLETED' && 
          (t.status || 'ACTIVE').toString().toUpperCase() !== 'CANCELLED'
        );
        setOrganizerTournaments(activeOnly);
      }

      if (usersRes.data && usersRes.data.success !== false) {
        const allUsers = usersRes.data.data || [];
        const teams = allUsers.filter(u => (u.role || '').toUpperCase() === 'TEAM');
        setAllTeams(teams);
      }

    } catch (err) {
      console.error("Error loading organizer teams data:", err);
      setError("Failed to query team lists and entry request records.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoster = async (teamUserId, teamName, teamObj = null) => {
    try {
      setSelectedTeamName(teamName);
      setSelectedTeamProfile(teamObj);
      setRosterLoading(true);
      setShowRosterModal(true);
      setRosterPlayers(teamObj?.players || []);
      
      const response = await api.get(`/user/${teamUserId}`);
      if (response.data && response.data.success) {
        const fullData = response.data.data;
        setSelectedTeamProfile(fullData);
        setRosterPlayers(fullData.players || []);
      }
    } catch (err) {
      console.error("Error loading team profile:", err);
    } finally {
      setRosterLoading(false);
    }
  };

  const triggerApprove = (tournamentId, teamUserId, teamName) => {
    setConfirmAction({ type: 'APPROVE', tournamentId, teamUserId, teamName });
    setShowConfirmModal(true);
  };

  const triggerReject = (tournamentId, teamUserId, teamName) => {
    setConfirmAction({ type: 'REJECT', tournamentId, teamUserId, teamName });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, tournamentId, teamUserId } = confirmAction;
    setShowConfirmModal(false);
    setConfirmAction(null);

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);

      const endpoint = type === 'APPROVE' ? '/tournament/request/approve' : '/tournament/request/reject';
      const response = await api.post(endpoint, {
        tournamentId: parseInt(tournamentId, 10),
        teamUserId: parseInt(teamUserId, 10)
      });

      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || `Request ${type.toLowerCase()}d successfully.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        loadAllData();
      } else {
        throw new Error(response.data.message || "Failed to update request status.");
      }
    } catch (err) {
      console.error("Action error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedTournamentId || !selectedTeamToInvite) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);

      const response = await api.post('/tournament/request/invite', {
        tournamentId: parseInt(selectedTournamentId, 10),
        teamUserId: parseInt(selectedTeamToInvite.teamUserId, 10)
      });

      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || `Invitation sent to ${selectedTeamToInvite.teamName} successfully!`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setShowInviteModal(false);
        setSelectedTeamToInvite(null);
        setSelectedTournamentId('');
        loadAllData();
      } else {
        throw new Error(response.data.message || "Failed to send invitation.");
      }
    } catch (err) {
      console.error("Invitation error:", err);
      setError(err.response?.data?.message || err.message || "Failed to send invitation.");
      setShowInviteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter teams directory
  const filteredTeams = allTeams.filter(t => {
    return (t.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (t.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto font-['Poppins'] animate-in fade-in duration-300 font-medium">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#111111] tracking-tight">Teams Directory & requests</h1>
        <p className="text-[#666666] text-sm mt-1">View all active teams in the system, inspect squad rosters, send tournament invitations, and approve entry requests.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold font-medium animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search teams by name, district, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
          />
        </div>
        
        <div className="text-sm font-medium text-[#666666] font-semibold">
          Total Teams Registered: <span className="text-[#111111] font-bold">{filteredTeams.length}</span>
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center bg-white rounded-2xl border border-[#e5e5e5]">
          <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
          Loading system teams and requests...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e5e5]">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Teams Registered</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
            There are currently no active teams registered in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => {
            // Find all request/invite interactions between this team and this organizer's tournaments
            const teamInteractions = requests.filter(r => r.team_user_id === team.user_id);
            
            // Check if there are tournaments of this organizer that this team is NOT associated with yet
            const associatedTournamentIds = teamInteractions.map(r => r.tournament_id);
            const nonAssociatedTournaments = organizerTournaments.filter(t => !associatedTournamentIds.includes(t.tournament_id));

            return (
              <div key={team.user_id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
                {/* Modern Cover Header */}
                <div className="h-24 bg-gradient-to-br from-[#00382D] via-[#08733e] to-[#04422e] relative overflow-hidden">
                  <Trophy className="text-white/10 -right-4 -bottom-4 absolute w-24 h-24 rotate-12 pointer-events-none" />
                </div>
                
                <div className="p-6 relative pt-0 flex-grow flex flex-col">
                  {/* Avatar with Ring */}
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-md border-2 border-white flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={
                        (team.profile_picture && team.profile_picture.trim() !== '') 
                          ? team.profile_picture 
                          : (team.profilePicture && team.profilePicture.trim() !== '')
                          ? team.profilePicture
                          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(team.display_name || 'Team')}`
                      } 
                      alt={team.display_name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(team.display_name || 'Team')}`;
                      }}
                      className="w-full h-full object-cover rounded-xl bg-emerald-50"
                    />
                  </div>

                  {/* Active Status Badge */}
                  <div className="flex justify-end pt-3 mb-2">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 border bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs">
                      <ShieldCheck size={13} className="text-emerald-600" /> Active Team
                    </span>
                  </div>

                  {/* Team Details */}
                  <div className="mt-2 mb-2">
                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-[#08733e] transition-colors">{team.display_name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/90 text-gray-700 text-[11px] font-semibold border border-gray-200/60">
                        <MapPin size={12} className="text-[#08733e]" />
                        {team.district || 'Location N/A'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/90 text-gray-700 text-[11px] font-semibold border border-gray-200/60 truncate max-w-[180px]" title={team.email}>
                        <Inbox size={12} className="text-[#08733e]" />
                        {team.email}
                      </span>
                    </div>
                  </div>

                  {/* Key Stats Box */}
                  <div className="bg-[#f9faf9] border border-[#e8efe9] rounded-xl p-3.5 grid grid-cols-2 gap-3 my-4 shadow-2xs">
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Contact Number</p>
                      <p className="font-bold text-gray-800 flex items-center gap-1.5 text-xs truncate leading-none">
                        <Phone size={13} className="text-[#08733e] shrink-0" /> {team.contact_number || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Rating</p>
                      <p className="font-black text-gray-900 flex items-center gap-1.5 text-xs leading-none">
                        <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" /> {team.rating ? parseFloat(team.rating).toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-auto space-y-2.5 pt-1">
                    <button 
                      onClick={() => handleViewRoster(team.user_id, team.display_name, team)}
                      className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#e2e8e4] shadow-2xs cursor-pointer group/btn"
                    >
                      <Users size={14} className="text-[#08733e]" /> View Profile
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedTeamToInvite({ teamUserId: team.user_id, teamName: team.display_name });
                        setShowInviteModal(true);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#00382D] to-[#08733e] hover:from-[#002a22] hover:to-[#065c32] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer tracking-wide"
                    >
                      <Send size={13} /> Send Request for Tournament
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Team Modal */}
      {showInviteModal && selectedTeamToInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#002c21] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowInviteModal(false); setSelectedTeamToInvite(null); setSelectedTournamentId(''); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold">Invite {selectedTeamToInvite.teamName}</h3>
              <p className="text-xs text-[#8eb7a7] mt-1 font-semibold uppercase tracking-wider">Select Tournament</p>
            </div>
            
            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wider">Select one of your Active Tournaments</label>
                {organizerTournaments.filter(t => {
                  // Filter out tournaments where the team is already associated
                  const teamInteractions = requests.filter(r => r.team_user_id === selectedTeamToInvite.teamUserId);
                  const associatedTournamentIds = teamInteractions.map(r => r.tournament_id);
                  return !associatedTournamentIds.includes(t.tournament_id);
                }).length === 0 ? (
                  <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">
                    You do not have any active/approved tournaments to invite this team to.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#00382D] transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Tournament --</option>
                    {organizerTournaments.filter(t => {
                      const teamInteractions = requests.filter(r => r.team_user_id === selectedTeamToInvite.teamUserId);
                      const associatedTournamentIds = teamInteractions.map(r => r.tournament_id);
                      return !associatedTournamentIds.includes(t.tournament_id);
                    }).map(t => (
                      <option key={t.tournament_id} value={t.tournament_id}>{t.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowInviteModal(false); setSelectedTeamToInvite(null); setSelectedTournamentId(''); }}
                  className="flex-1 py-3 border border-[#e5e5e5] text-gray-600 hover:bg-gray-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || organizerTournaments.filter(t => {
                    const teamInteractions = requests.filter(r => r.team_user_id === selectedTeamToInvite.teamUserId);
                    const associatedTournamentIds = teamInteractions.map(r => r.tournament_id);
                    return !associatedTournamentIds.includes(t.tournament_id);
                  }).length === 0}
                  className="flex-1 py-3 bg-[#00382D] hover:bg-[#002a22] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* View Full Team Profile Popup Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto relative space-y-0">
            
            {/* Cover Image Header with Dark Emerald Gradient & Avatar */}
            <div className="relative h-36 w-full bg-gradient-to-r from-[#002c21] via-[#08733e] to-slate-900 p-6 flex items-start justify-between">
              
              {/* Floating Active Badge */}
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/30 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={12} className="text-emerald-300" /> Active Team
              </span>

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => { setShowRosterModal(false); setSelectedTeamName(''); setSelectedTeamProfile(null); }}
                className="w-9 h-9 bg-slate-900/60 hover:bg-slate-900 text-white/90 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20"
              >
                <XCircle size={18} />
              </button>

              {/* Team Avatar Floating Badge */}
              <div className="absolute -bottom-7 left-6 w-20 h-20 bg-white rounded-2xl p-1 shadow-xl border-2 border-emerald-500 overflow-hidden">
                <img 
                  src={
                    (selectedTeamProfile?.profile_picture && selectedTeamProfile.profile_picture.trim() !== '') 
                      ? selectedTeamProfile.profile_picture 
                      : (selectedTeamProfile?.profilePicture && selectedTeamProfile.profilePicture.trim() !== '')
                      ? selectedTeamProfile.profilePicture
                      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedTeamName || 'Team')}`
                  } 
                  alt="Team Profile Picture" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedTeamName || 'Team')}`;
                  }}
                  className="w-full h-full object-cover rounded-xl bg-emerald-50"
                />
              </div>

            </div>

            {/* Team Header Info Section */}
            <div className="pt-9 px-6 md:px-8 pb-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedTeamName || selectedTeamProfile?.team_name || selectedTeamProfile?.teamName || 'Team Profile'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold">
                      <MapPin size={12} className="text-[#08733e]" />
                      {selectedTeamProfile?.district || 'District N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      <Inbox size={12} className="text-slate-400" />
                      {selectedTeamProfile?.email || 'email@ellehub.lk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address & Phone */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-[#08733e]" />
                  <span>{selectedTeamProfile?.contact_number || selectedTeamProfile?.contactNumber || 'N/A'}</span>
                </div>
                {selectedTeamProfile?.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-600" />
                    <span>{selectedTeamProfile.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats & Rating Cards Grid */}
            <div className="px-6 md:px-8 py-2">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                
                {/* Contributed / Participated */}
                <div className="text-center space-y-0.5 border-r border-slate-200 pr-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Trophy size={12} className="text-emerald-600" /> Joined
                  </span>
                  <p className="text-base font-black text-slate-900">
                    {selectedTeamProfile?.tournaments_played ?? selectedTeamProfile?.tournamentsPlayed ?? 1}
                  </p>
                  <span className="text-[9px] font-bold text-slate-500 block">Tournaments</span>
                </div>

                {/* Tournaments Won */}
                <div className="text-center space-y-0.5 border-r border-slate-200 px-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Trophy size={12} className="text-amber-500" /> Titles
                  </span>
                  <p className="text-base font-black text-slate-900">
                    {selectedTeamProfile?.tournaments_won ?? selectedTeamProfile?.tournamentsWon ?? 1}
                  </p>
                  <span className="text-[9px] font-bold text-slate-500 block">Champions</span>
                </div>

                {/* Rating Points */}
                <div className="text-center space-y-0.5 pl-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> Rating
                  </span>
                  <p className="text-base font-black text-slate-900">
                    {selectedTeamProfile?.rating ? parseFloat(selectedTeamProfile.rating).toFixed(1) : '4.5'}
                  </p>
                  <span className="text-[9px] font-bold text-slate-500 block">Points</span>
                </div>

              </div>
            </div>

            {/* Squad Players Section */}
            <div className="px-6 md:px-8 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Users size={14} className="text-[#08733e]" /> Registered Squad Roster
                </h4>
                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {rosterPlayers.length} Players
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
                {rosterLoading ? (
                  <div className="py-8 text-center text-slate-400 font-semibold flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-3 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-2"></div>
                    Loading squad roster...
                  </div>
                ) : rosterPlayers.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs font-semibold text-slate-500 border border-slate-200/60">
                    No registered players found in this squad.
                  </div>
                ) : (
                  rosterPlayers.map((player) => (
                    <div 
                      key={player.player_id || player.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#08733e] font-extrabold text-xs flex items-center justify-center shrink-0">
                          {(player.player_name || 'P')[0].toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{player.player_name}</h5>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-0.5">
                            <span>Age: {player.age || 'N/A'}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className={player.position === 'Captain' ? 'text-amber-700 font-extrabold' : ''}>
                              {player.position || 'Player'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {player.contact_number && (
                        <span className="text-[11px] font-extrabold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1 shrink-0">
                          <Phone size={11} className="text-[#08733e]" />
                          {player.contact_number}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:px-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setShowRosterModal(false); setSelectedTeamName(''); setSelectedTeamProfile(null); }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button 
                type="button"
                onClick={() => {
                  const tId = selectedTeamProfile?.user_id || selectedTeamProfile?.id;
                  const tName = selectedTeamName || selectedTeamProfile?.team_name || selectedTeamProfile?.teamName;
                  setShowRosterModal(false);
                  setSelectedTeamToInvite({ teamUserId: tId, teamName: tName });
                  setShowInviteModal(true);
                }}
                className="px-5 py-2.5 bg-[#00382D] hover:bg-[#002a22] text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={13} /> Send Request for Tournament
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg border border-[#e5e5e5] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#111111] mb-2 font-['Poppins']">
              {confirmAction?.type === 'APPROVE' ? 'Accept Join Request' : 'Reject Join Request'}
            </h3>
            <p className="text-[#666666] text-sm leading-relaxed mb-6 font-semibold">
              {confirmAction?.type === 'APPROVE' 
                ? `Are you sure you want to approve the registration request for team "${confirmAction?.teamName}"? This will officially register them into the tournament.`
                : `Are you sure you want to reject the registration request for team "${confirmAction?.teamName}"?`
              }
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-3 border border-[#e5e5e5] text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-xs transition-all cursor-pointer font-['Poppins']"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs font-['Poppins'] ${
                  confirmAction?.type === 'APPROVE' ? 'bg-[#00382D] hover:bg-[#002a22]' : 'bg-[#991b1b] hover:bg-[#7f1d1d]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
