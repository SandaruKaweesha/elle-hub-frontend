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

  // Invite Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeamToInvite, setSelectedTeamToInvite] = useState(null); // { teamUserId, teamName }
  const [selectedTournamentId, setSelectedTournamentId] = useState('');

  // Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'APPROVE' | 'REJECT', tournamentId, teamUserId, teamName }
  const [actionLoading, setActionLoading] = useState(false);

  // Authenticated user session
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const organizerId = currentUser.userId || currentUser.user_id;

  useEffect(() => {
    if (organizerId) {
      loadAllData();
    } else {
      setError("User session not found. Please log in again.");
      setLoading(false);
    }
  }, [organizerId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all three resources in parallel
      const [requestsRes, tournamentsRes, usersRes] = await Promise.all([
        api.get(`/organizer/${organizerId}/team-requests`),
        api.get(`/organizer/${organizerId}/tournaments`),
        api.get('/user/getAllUsers')
      ]);

      if (requestsRes.data && requestsRes.data.success !== false) {
        setRequests(requestsRes.data.data || []);
      }
      
      if (tournamentsRes.data && tournamentsRes.data.success !== false) {
        const list = tournamentsRes.data.data || [];
        const activeOnly = list.filter(t => t.approval_status.toUpperCase() === 'APPROVED');
        setOrganizerTournaments(activeOnly);
      }

      if (usersRes.data && usersRes.data.success !== false) {
        const allUsers = usersRes.data.data || [];
        const teams = allUsers.filter(u => u.role.toUpperCase() === 'TEAM' && u.status.toUpperCase() === 'APPROVED');
        setAllTeams(teams);
      }

    } catch (err) {
      console.error("Error loading organizer teams data:", err);
      setError("Failed to query team lists and entry request records.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoster = async (teamUserId, teamName) => {
    try {
      setSelectedTeamName(teamName);
      setRosterLoading(true);
      setShowRosterModal(true);
      setRosterPlayers([]);
      
      const response = await api.get(`/user/${teamUserId}`);
      if (response.data && response.data.success) {
        setRosterPlayers(response.data.data.players || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch roster details.");
      }
    } catch (err) {
      console.error("Error loading roster:", err);
      setError("Unable to load team roster players.");
      setShowRosterModal(false);
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
              <div key={team.user_id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                {/* Cover header */}
                <div className="h-20 bg-gradient-to-r from-[#00382D] to-[#08733e]"></div>
                
                <div className="p-6 relative pt-0 flex-grow flex flex-col">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(team.display_name)}`} 
                      alt={team.display_name} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end pt-3 mb-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1 border bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]">
                      <ShieldCheck size={12} /> Active Team
                    </span>
                  </div>

                  <div className="mt-2 mb-4">
                    <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{team.display_name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {team.district || 'N/A'}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1" title={team.email}>
                        <Inbox size={13} className="text-gray-400" />
                        {team.email}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-[#f4f4f4]">
                    <div>
                      <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-0.5">Contact Number</p>
                      <p className="font-bold text-[#333333] flex items-center gap-1.5 text-xs truncate">
                        <Phone size={13} className="text-[#00382D] shrink-0" /> {team.contact_number || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-0.5">Rating</p>
                      <p className="font-bold text-[#333333] flex items-center gap-1.5 text-sm">
                        <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" /> {team.rating ? parseFloat(team.rating).toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-4 pt-4 border-t border-[#f4f4f4] space-y-2">
                    <button 
                      onClick={() => handleViewRoster(team.user_id, team.display_name)}
                      className="w-full py-2 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 group/btn border border-[#e5e5e5] shadow-sm cursor-pointer"
                    >
                      View Team Roster
                      <ChevronRight size={14} className="text-[#888888] group-hover/btn:text-[#333333] transition-colors" />
                    </button>

                    {nonAssociatedTournaments.length > 0 && (
                      <button 
                        onClick={() => {
                          setSelectedTeamToInvite({ teamUserId: team.user_id, teamName: team.display_name });
                          setShowInviteModal(true);
                        }}
                        className="w-full py-2 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Send size={12} /> Invite to Tournament
                      </button>
                    )}
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

      {/* View Roster Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#002c21] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowRosterModal(false); setSelectedTeamName(''); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold px-4">{selectedTeamName}</h3>
              <p className="text-xs text-[#8eb7a7] mt-1 font-semibold uppercase tracking-wider">Squad Roster Details</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[350px] overflow-y-auto space-y-3">
              {rosterLoading ? (
                <div className="py-8 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
                  <div className="w-6 h-6 border-3 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-3"></div>
                  Loading squad players...
                </div>
              ) : rosterPlayers.length === 0 ? (
                <p className="text-center text-sm text-gray-500 font-semibold py-8">
                  No players registered in this squad.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {rosterPlayers.map((player) => (
                    <div 
                      key={player.player_id} 
                      className="p-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">{player.player_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-0.5">
                          <span>Age: {player.age}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{player.position}</span>
                        </div>
                      </div>
                      {player.contact_number && (
                        <span className="text-xs font-bold text-gray-600 bg-white border border-[#e5e5e5] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 shrink-0">
                          <Phone size={11} className="text-[#08733e]" />
                          {player.contact_number}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setShowRosterModal(false); setSelectedTeamName(''); }}
                className="px-5 py-2.5 bg-white border border-[#e5e5e5] hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
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
