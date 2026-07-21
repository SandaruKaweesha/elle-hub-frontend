import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Send, 
  Eye, 
  Building, 
  Clock, 
  Award,
  Users,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

export default function RefereeTournaments() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const refereeUserId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [refereeRequestsMap, setRefereeRequestsMap] = useState({}); // { tournamentId: status }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal State & Deep Info
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
  const [participatingTeams, setParticipatingTeams] = useState([]);
  const [assignedReferees, setAssignedReferees] = useState([]);

  // Apply Loading State
  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const fetchTournamentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tournamentsRes, myRequestsRes] = await Promise.all([
        api.get("/tournaments"),
        refereeUserId ? api.get(`/referee/${refereeUserId}/requests`).catch(() => null) : Promise.resolve(null)
      ]);

      if (tournamentsRes.data && tournamentsRes.data.success !== false) {
        const list = tournamentsRes.data.data || [];
        const activeOnly = list.filter(t => 
          (t.approval_status || '').toUpperCase() === 'APPROVED' && 
          (t.status || '').toUpperCase() === 'ACTIVE'
        );
        setTournaments(activeOnly);
      }

      if (myRequestsRes && myRequestsRes.data && myRequestsRes.data.success !== false) {
        const myReqs = myRequestsRes.data.data || [];
        const map = {};
        myReqs.forEach(req => {
          map[req.tournament_id] = req.status || 'PENDING';
        });
        setRefereeRequestsMap(map);
      }

    } catch (err) {
      console.error("Error fetching tournaments for referee:", err);
      setError("Failed to query active tournaments from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentsData();
  }, [refereeUserId]);

  const handleOpenDetails = async (t) => {
    setSelectedTournament(t);
    setShowDetailsModal(true);
    setModalDetailsLoading(true);
    setParticipatingTeams([]);
    setAssignedReferees([]);

    const tId = t.tournament_id || t.id;

    try {
      const [teamsRes, refereesRes] = await Promise.all([
        api.get(`/tournament/${tId}/team-requests`).catch(() => null),
        api.get(`/tournament/${tId}/referee-requests`).catch(() => null)
      ]);

      if (teamsRes && teamsRes.data && teamsRes.data.success !== false) {
        const allTeams = teamsRes.data.data || [];
        const approvedOnly = allTeams.filter(item => (item.status || '').toUpperCase() === 'APPROVED');
        setParticipatingTeams(approvedOnly);
      }

      if (refereesRes && refereesRes.data && refereesRes.data.success !== false) {
        const allReferees = refereesRes.data.data || [];
        const confirmedOnly = allReferees.filter(item => {
          const s = (item.status || '').toUpperCase();
          return s === 'APPROVED' || s === 'ACCEPTED';
        });
        setAssignedReferees(confirmedOnly);
      }

    } catch (err) {
      console.error("Error fetching deep tournament details:", err);
    } finally {
      setModalDetailsLoading(false);
    }
  };

  const handleApplyAsReferee = async (tournamentId, tournamentTitle) => {
    if (!refereeUserId) {
      setError("Please log in as an official referee to request officiating.");
      return;
    }

    try {
      setApplyLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        refereeUserId,
        initiatedBy: 'REFEREE'
      };

      const res = await api.post(`/tournament/${tournamentId}/referee-requests/send`, payload);

      if (res.data && res.data.success !== false) {
        setSuccessMsg(`Officiating request successfully submitted to organizer for "${tournamentTitle}"!`);
        setRefereeRequestsMap(prev => ({ ...prev, [tournamentId]: 'PENDING' }));
      } else {
        throw new Error(res.data.message || "Failed to submit officiating request.");
      }
    } catch (err) {
      console.error("Apply as referee error:", err);
      setError(err.response?.data?.message || err.message || "Could not dispatch officiating request.");
    } finally {
      setApplyLoadingId(null);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    const query = searchQuery.toLowerCase();
    const title = (t.title || '').toLowerCase();
    const location = (t.location || '').toLowerCase();
    const org = (t.organization_name || t.organizer_name || '').toLowerCase();
    return title.includes(query) || location.includes(query) || org.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <Trophy size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Active Tournaments Directory</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Browse approved Elle tournaments, view participating teams & assigned referees, and submit officiating requests.</p>
        </div>
      </div>

      {/* Notifications Banners */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search tournaments by title, venue, or organizer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
          />
        </div>
        
        <div className="text-sm font-medium text-[#666666]">
          Active Tournaments: <span className="text-[#111111] font-bold">{filteredTournaments.length}</span>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading active tournaments directory...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Active Tournaments Found</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            There are currently no active approved tournaments matching your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(t => {
            const tournamentId = t.tournament_id || t.id;
            const title = t.title || 'National Championship';
            const location = t.location || 'Sri Lanka';
            const organizer = t.organization_name || t.organizer_name || 'Elle Sports Association';
            const contactNumber = t.contact_number || 'Available on Request';
            const heldDate = t.tournament_held_date || t.start_date || 'TBD';
            const deadline = t.end_date || 'TBD';
            const existingReqStatus = refereeRequestsMap[tournamentId];

            return (
              <div key={tournamentId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                
                <div>
                  {/* Banner Header */}
                  <div className="h-32 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Trophy size={12} /> Active Tournament
                    </span>

                    {existingReqStatus && (
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border backdrop-blur-md ${
                        existingReqStatus === 'APPROVED' 
                          ? 'bg-emerald-500/90 text-white border-emerald-400' 
                          : 'bg-amber-500/90 text-white border-amber-400'
                      }`}>
                        {existingReqStatus === 'APPROVED' ? 'Confirmed Referee' : 'Request Pending'}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-6 relative pt-4">
                    <h3 className="text-lg font-bold text-[#111111] leading-tight mb-2 group-hover:text-[#00382D] transition-colors">{title}</h3>
                    
                    <div className="space-y-2 text-xs text-[#555555] font-medium bg-[#f9faf9] p-3.5 rounded-xl border border-[#f0f0f0]">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-[#00382D] shrink-0" />
                        <span>Organizer: <strong className="text-[#111111]">{organizer}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00382D] shrink-0" />
                        <span>Venue: <strong className="text-[#111111]">{location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#00382D] shrink-0" />
                        <span>Held Date: <strong className="text-[#111111]">{heldDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#00382D] shrink-0" />
                        <span>Deadline: <strong className="text-[#111111]">{deadline}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[#00382D] shrink-0" />
                        <span>Contact: <strong className="text-[#00382D]">{contactNumber}</strong></span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button 
                    onClick={() => handleOpenDetails(t)}
                    className="w-full py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#e5e5e5] shadow-sm cursor-pointer"
                  >
                    <Eye size={14} />
                    View Full Tournament Details
                  </button>

                  <button 
                    onClick={() => handleApplyAsReferee(tournamentId, title)}
                    disabled={applyLoadingId === tournamentId || Boolean(existingReqStatus)}
                    className={`w-full py-2.5 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                      existingReqStatus 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-[#00382D] hover:bg-[#002b22] cursor-pointer'
                    }`}
                  >
                    {applyLoadingId === tournamentId ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : existingReqStatus ? (
                      <>
                        <CheckCircle2 size={14} />
                        {existingReqStatus === 'APPROVED' ? 'Assigned Referee' : 'Request Submitted'}
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Request to Officiate
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- RICH CLEAN COMPACT TOURNAMENT DETAILS MODAL --- */}
      {showDetailsModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedTournament.title || 'National Championship'}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D] font-semibold">{selectedTournament.organization_name || selectedTournament.organizer_name || 'Elle Sports Association'}</strong>
                </p>
              </div>
            </div>

            {/* Structured Information List */}
            <div className="space-y-3 text-xs text-[#333333] mb-6">
              
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <MapPin size={14} className="text-[#00382D]" /> Tournament Venue:
                </span>
                <span className="font-bold text-[#111111]">{selectedTournament.location || 'Sri Lanka'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-[#00382D]" /> Held Date:
                </span>
                <span className="font-bold text-[#111111]">
                  {selectedTournament.tournament_held_date || selectedTournament.start_date || 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Clock size={14} className="text-[#00382D]" /> Registration Deadline:
                </span>
                <span className="font-bold text-[#111111]">
                  {selectedTournament.end_date || 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Phone size={14} className="text-[#00382D]" /> Contact Number:
                </span>
                <span className="font-bold text-[#00382D]">{selectedTournament.contact_number || 'Available on Request'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Users size={14} className="text-[#00382D]" /> No. of Teams:
                </span>
                <span className="font-bold text-[#111111]">
                  {modalDetailsLoading ? "Loading..." : participatingTeams.length > 0 
                    ? `${participatingTeams.length} Teams (${participatingTeams.map(t => t.team_name || t.name || 'Team').join(', ')})`
                    : "0 Teams registered"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <UserCheck size={14} className="text-[#00382D]" /> No. of Referees:
                </span>
                <span className="font-bold text-[#111111]">
                  {modalDetailsLoading ? "Loading..." : assignedReferees.length > 0 
                    ? `${assignedReferees.length} Referees (${assignedReferees.map(r => r.full_name || r.referee_name || 'Referee').join(', ')})`
                    : "0 Referees assigned"}
                </span>
              </div>

              {selectedTournament.description && (
                <div className="pt-2">
                  <span className="text-[#888888] font-medium block mb-1">Tournament Overview:</span>
                  <p className="text-[#555555] bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5] leading-relaxed">
                    {selectedTournament.description}
                  </p>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button 
                onClick={() => {
                  const tId = selectedTournament.tournament_id || selectedTournament.id;
                  setShowDetailsModal(false);
                  handleApplyAsReferee(tId, selectedTournament.title);
                }}
                disabled={Boolean(refereeRequestsMap[selectedTournament.tournament_id || selectedTournament.id])}
                className="w-2/3 py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {refereeRequestsMap[selectedTournament.tournament_id || selectedTournament.id] ? 'Request Already Sent' : 'Request to Officiate'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
