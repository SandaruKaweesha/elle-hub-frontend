import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, MapPin, BadgeDollarSign, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Phone, Award, Trophy } from 'lucide-react';
import api from '../../services/api';

export default function OrganizerRequests() {
  const [activeFilter, setActiveFilter] = useState('TEAMS'); // 'TEAMS', 'REFEREES', 'SPONSORS', 'PLAYGROUNDS'
  const [teamRequests, setTeamRequests] = useState([]);
  const [refereeRequests, setRefereeRequests] = useState([]);
  const [sponsorRequests, setSponsorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal details state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [tournamentsList, setTournamentsList] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('ALL');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userString = localStorage.getItem('user');
      const localUser = userString ? JSON.parse(userString) : {};
      let organizerId = localUser?.userId || localUser?.user_id || localUser?.id || localUser?.organizer_id;

      if (!organizerId) {
        try {
          const profileRes = await api.get('/user/profile');
          if (profileRes.data && profileRes.data.data) {
            const p = profileRes.data.data;
            organizerId = p.userId || p.user_id || p.id;
            localStorage.setItem('user', JSON.stringify({ ...localUser, ...p }));
          }
        } catch (e) {
          console.warn("Could not resolve user profile:", e);
        }
      }

      const targetId = organizerId || 0;

      // Fetch team requests, referee requests, sponsor requests, and tournaments list in parallel
      const [teamRes, refereeRes, sponsorRes, tournamentsRes] = await Promise.all([
        api.get(`/organizer/${targetId}/team-requests`).catch(() => null),
        api.get(`/organizer/${targetId}/referee-requests`).catch(() => null),
        api.get(`/organizer/${targetId}/sponsor-requests`).catch(() => null),
        api.get(`/organizer/${targetId}/tournaments`).catch(() => null)
      ]);

      if (teamRes && teamRes.data && teamRes.data.success !== false) {
        setTeamRequests(teamRes.data.data || []);
      }

      if (refereeRes && refereeRes.data && refereeRes.data.success !== false) {
        setRefereeRequests(refereeRes.data.data || []);
      }

      if (sponsorRes && sponsorRes.data && sponsorRes.data.success !== false) {
        setSponsorRequests(sponsorRes.data.data || []);
      }

      if (tournamentsRes && tournamentsRes.data && tournamentsRes.data.success !== false) {
        setTournamentsList(tournamentsRes.data.data || []);
      }

    } catch (err) {
      console.error("Error loading organizer requests:", err);
      setError(err.message || "An error occurred while fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Team Request Responses
  const handleApproveTeamRequest = async (tournamentId, teamUserId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post('/tournament/request/approve', { tournamentId, teamUserId });
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || "Team request approved successfully.");
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to approve team request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTeamRequest = async (tournamentId, teamUserId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post('/tournament/request/reject', { tournamentId, teamUserId });
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || "Team request rejected successfully.");
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to reject team request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Referee Request Responses (Approve / Reject)
  const handleRespondToRefereeRequest = async (tournamentId, refereeUserId, status) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post(`/tournament/${tournamentId}/referee-requests/respond`, {
        tournamentId,
        refereeUserId,
        status
      });
      if (response.data && response.data.success !== false) {
        const text = status === 'APPROVED' || status === 'ACCEPTED' ? 'approved' : 'rejected';
        setSuccessMsg(`Referee officiating request ${text} successfully!`);
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to update referee request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondToSponsorRequest = async (tournamentId, sponsorUserId, status) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post(`/tournament/${tournamentId}/sponsor-requests/respond`, {
        sponsorUserId,
        status
      });
      if (response.data && response.data.success !== false) {
        const text = status === 'APPROVED' || status === 'ACCEPTED' ? 'approved' : 'rejected';
        setSuccessMsg(`Sponsorship request ${text} successfully!`);
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to update sponsor request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter active setup tournaments for selection
  const activeTournamentsList = tournamentsList.filter(t => 
    (t.status || '').toUpperCase() !== 'COMPLETED'
  );

  const filteredTeamRequests = teamRequests.filter(r => {
    // Exclude completed or finalized tournament requests
    const tourney = tournamentsList.find(t => String(t.tournament_id) === String(r.tournament_id));
    if (tourney && ((tourney.status || '').toUpperCase() === 'COMPLETED' || tourney.is_finalized === 1 || tourney.is_finalized === '1')) {
      return false;
    }
    if (selectedTournamentId === 'ALL') return true;
    return String(r.tournament_id) === String(selectedTournamentId);
  });

  const filteredRefereeRequests = refereeRequests.filter(r => {
    // Exclude completed or finalized tournament requests
    const tourney = tournamentsList.find(t => String(t.tournament_id) === String(r.tournament_id));
    if (tourney && ((tourney.status || '').toUpperCase() === 'COMPLETED' || tourney.is_finalized === 1 || tourney.is_finalized === '1')) {
      return false;
    }
    if (selectedTournamentId === 'ALL') return true;
    return String(r.tournament_id) === String(selectedTournamentId);
  });

  const filteredSponsorRequests = sponsorRequests.filter(r => {
    // Exclude completed or finalized tournament requests
    const tourney = tournamentsList.find(t => String(t.tournament_id) === String(r.tournament_id));
    if (tourney && ((tourney.status || '').toUpperCase() === 'COMPLETED' || tourney.is_finalized === 1 || tourney.is_finalized === '1')) {
      return false;
    }
    if (selectedTournamentId === 'ALL') return true;
    return String(r.tournament_id) === String(selectedTournamentId);
  });

  const filters = [
    { key: 'TEAMS', label: `Team Requests (${filteredTeamRequests.length})`, icon: Users },
    { key: 'REFEREES', label: `Referee Requests (${filteredRefereeRequests.length})`, icon: Shield },
    { key: 'SPONSORS', label: `Sponsor Requests (${filteredSponsorRequests.length})`, icon: BadgeDollarSign },
    { key: 'PLAYGROUNDS', label: 'Playground Requests', icon: MapPin },
  ];

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'APPROVED':
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
      case 'DECLINED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'APPROVED':
      case 'ACCEPTED':
        return <CheckCircle2 size={12} className="text-green-600" />;
      case 'REJECTED':
      case 'DECLINED':
        return <XCircle size={12} className="text-red-600" />;
      case 'PENDING':
      default:
        return <Clock size={12} className="text-amber-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">Tournament Requests & Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Manage team participation and referee officiating applications across active setup tournaments.</p>
        </div>

        {/* Tournament Selector Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-[#e5e5e5] px-4 py-2.5 rounded-2xl shadow-xs shrink-0">
          <Trophy size={16} className="text-[#08733e]" />
          <span className="text-xs font-bold text-gray-500">Filter Tournament:</span>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-transparent text-xs font-black text-gray-900 outline-none cursor-pointer"
          >
            <option value="ALL">All Active Tournaments ({activeTournamentsList.length})</option>
            {activeTournamentsList.map(t => (
              <option key={t.tournament_id} value={t.tournament_id}>
                {t.title} ({t.status || 'SETUP'})
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-3 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading incoming requests...
          </div>
        ) : activeFilter === 'TEAMS' && filteredTeamRequests.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredTeamRequests.map((r) => (
              <div 
                key={`${r.tournament_id}-${r.team_user_id}`}
                onClick={() => {
                  setSelectedRequest({ ...r, type: 'TEAM' });
                  setShowDetailsModal(true);
                }}
                className="p-6 hover:bg-[#f8f7f4]/40 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shadow-sm shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.team_name)}`} 
                      alt={r.team_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] group-hover:text-[#08733e] transition-colors">{r.team_name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                      Applied for: <span className="font-bold text-[#08733e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{r.tournament_title}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(r.status)}`}>
                    {getStatusIcon(r.status)}
                    {r.status}
                  </span>
                  <span className="text-gray-300 group-hover:text-gray-500 transition-colors font-bold text-sm">➔</span>
                </div>
              </div>
            ))}
          </div>
        ) : activeFilter === 'REFEREES' && filteredRefereeRequests.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredRefereeRequests.map((r) => {
              const statusUpper = (r.status || '').toUpperCase();
              return (
                <div 
                  key={`${r.tournament_id}-${r.referee_user_id}`}
                  onClick={() => {
                    setSelectedRequest({ ...r, type: 'REFEREE' });
                    setShowDetailsModal(true);
                  }}
                  className="p-6 hover:bg-[#f8f7f4]/40 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#00382D] font-bold flex items-center justify-center shadow-sm shrink-0 text-sm">
                      RF
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111111] group-hover:text-[#00382D] transition-colors">{r.display_name}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                        Officiating Request for: <span className="font-bold text-[#08733e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{r.tournament_title}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(r.status)}`}>
                      {getStatusIcon(r.status)}
                      {statusUpper === 'ACCEPTED' ? 'APPROVED' : statusUpper}
                    </span>
                    <span className="text-gray-300 group-hover:text-gray-500 transition-colors font-bold text-sm">➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeFilter === 'SPONSORS' && filteredSponsorRequests.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredSponsorRequests.map((r) => {
              const statusUpper = (r.status || '').toUpperCase();
              return (
                <div 
                  key={`${r.tournament_id}-${r.sponsor_user_id}`}
                  onClick={() => {
                    setSelectedRequest({ ...r, type: 'SPONSOR' });
                    setShowDetailsModal(true);
                  }}
                  className="p-6 hover:bg-[#f8f7f4]/40 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center shadow-sm shrink-0 text-sm">
                      <BadgeDollarSign size={20} className="text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111111] group-hover:text-[#08733e] transition-colors">{r.company_name || r.email || 'Official Sponsor'}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                        Sponsorship Offer for: <span className="font-bold text-[#08733e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{r.tournament_title}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(r.status)}`}>
                      {getStatusIcon(r.status)}
                      {statusUpper}
                    </span>
                    <span className="text-gray-300 group-hover:text-gray-500 transition-colors font-bold text-sm">➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 md:p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6 text-gray-400 border border-[#e5e5e5] shadow-inner">
              {activeFilter === 'REFEREES' ? <Shield size={32} /> : activeFilter === 'TEAMS' ? <Users size={32} /> : activeFilter === 'SPONSORS' ? <BadgeDollarSign size={32} /> : <MapPin size={32} />}
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">
              {activeFilter === 'REFEREES' ? "No Referee Officiating Requests Found" : activeFilter === 'TEAMS' ? "No Team Requests Found" : activeFilter === 'SPONSORS' ? "No Sponsor Requests Found" : "No Playground Requests Found"}
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              {activeFilter === 'REFEREES' 
                ? "Applications from certified match officials wishing to judge your tournaments will appear here for review." 
                : activeFilter === 'SPONSORS'
                ? "Sponsorship proposals and partner applications will appear here for review."
                : "Incoming requests will appear here for organizer review and approval."}
            </p>
          </div>
        )}
      </div>

      {/* Details Card Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#00382D] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedRequest(null); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              
              <div className="w-16 h-16 rounded-2xl border-2 border-white bg-white/10 text-white font-bold mx-auto mb-3 shadow-md flex items-center justify-center text-xl">
                {selectedRequest.type === 'REFEREE' ? 'RF' : selectedRequest.type === 'SPONSOR' ? '$' : 'TM'}
              </div>
              <h3 className="text-xl font-bold">{selectedRequest.display_name || selectedRequest.company_name || selectedRequest.team_name}</h3>
              <p className="text-xs text-emerald-200 mt-1">
                {selectedRequest.type === 'REFEREE' ? 'Official Referee Application' : selectedRequest.type === 'SPONSOR' ? 'Corporate Sponsorship Offer' : 'Team Participation Request'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-gray-600">
              <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tournament Title:</span>
                  <strong className="text-gray-900 font-bold">{selectedRequest.tournament_title}</strong>
                </div>
                
                {selectedRequest.type === 'REFEREE' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Experience:</span>
                      <strong className="text-gray-900 font-bold">{selectedRequest.experience_years || 5} Years</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Contact Number:</span>
                      <strong className="text-[#00382D] font-bold">{selectedRequest.contact_number}</strong>
                    </div>
                  </>
                ) : selectedRequest.type === 'SPONSOR' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Sponsor Email:</span>
                      <strong className="text-gray-900 font-bold">{selectedRequest.email}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Proposal Date:</span>
                      <strong className="text-gray-900 font-bold">{selectedRequest.request_date ? new Date(selectedRequest.request_date).toLocaleDateString() : 'Recent'}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Contact Number:</span>
                      <strong className="text-gray-900 font-bold">{selectedRequest.contact_number || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">District:</span>
                      <strong className="text-gray-900 font-bold">{selectedRequest.district || 'N/A'}</strong>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-medium">Current Status:</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${getStatusStyle(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-0 flex gap-3">
              {selectedRequest.type === 'REFEREE' ? (
                <>
                  <button
                    disabled={actionLoading || (selectedRequest.status || '').toUpperCase() === 'APPROVED' || (selectedRequest.status || '').toUpperCase() === 'ACCEPTED'}
                    onClick={() => handleRespondToRefereeRequest(selectedRequest.tournament_id, selectedRequest.referee_user_id, 'APPROVED')}
                    className="flex-1 py-3 bg-[#00382D] hover:bg-[#002a22] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Approve Referee
                  </button>
                  <button
                    disabled={actionLoading || (selectedRequest.status || '').toUpperCase() === 'REJECTED'}
                    onClick={() => handleRespondToRefereeRequest(selectedRequest.tournament_id, selectedRequest.referee_user_id, 'REJECTED')}
                    className="flex-1 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject Request
                  </button>
                </>
              ) : selectedRequest.type === 'SPONSOR' ? (
                <>
                  <button
                    disabled={actionLoading || (selectedRequest.status || '').toUpperCase() === 'APPROVED' || (selectedRequest.status || '').toUpperCase() === 'ACCEPTED'}
                    onClick={() => handleRespondToSponsorRequest(selectedRequest.tournament_id, selectedRequest.sponsor_user_id, 'APPROVED')}
                    className="flex-1 py-3 bg-[#08733e] hover:bg-[#065b31] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Accept Sponsorship
                  </button>
                  <button
                    disabled={actionLoading || (selectedRequest.status || '').toUpperCase() === 'REJECTED'}
                    onClick={() => handleRespondToSponsorRequest(selectedRequest.tournament_id, selectedRequest.sponsor_user_id, 'REJECTED')}
                    className="flex-1 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject Proposal
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={actionLoading || selectedRequest.status === 'APPROVED'}
                    onClick={() => handleApproveTeamRequest(selectedRequest.tournament_id, selectedRequest.team_user_id)}
                    className="flex-1 py-3 bg-[#08733e] hover:bg-[#065b31] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Approve Team
                  </button>
                  <button
                    disabled={actionLoading || selectedRequest.status === 'REJECTED'}
                    onClick={() => handleRejectTeamRequest(selectedRequest.tournament_id, selectedRequest.team_user_id)}
                    className="flex-1 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject Team
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
