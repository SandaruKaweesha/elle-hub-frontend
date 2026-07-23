import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Eye, 
  Building2, 
  Clock, 
  Users,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  UserCheck
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundTournaments() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [venueRequestsMap, setVenueRequestsMap] = useState({}); // { tournamentId: status }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal State & Deep Info
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
  const [participatingTeams, setParticipatingTeams] = useState([]);

  // Apply Loading State
  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const fetchTournamentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tournamentsRes, myRequestsRes] = await Promise.all([
        api.get("/tournaments"),
        userId ? api.get(`/playground/${userId}/requests`).catch(() => null) : Promise.resolve(null)
      ]);

      if (tournamentsRes.data && tournamentsRes.data.success !== false) {
        const list = tournamentsRes.data.data || [];
        const activeOnly = list.filter(t => {
          const s = (t.status || '').toUpperCase();
          const appS = (t.approval_status || '').toUpperCase();
          return appS === 'APPROVED' || s === 'ACTIVE' || s === 'ONGOING';
        });
        setTournaments(activeOnly);
      }

      if (myRequestsRes && myRequestsRes.data && myRequestsRes.data.success !== false) {
        const reqs = myRequestsRes.data.data || [];
        const map = {};
        reqs.forEach(r => {
          map[r.tournament_id] = (r.status || 'PENDING').toUpperCase();
        });
        setVenueRequestsMap(map);
      }
    } catch (err) {
      console.error("Error fetching tournaments for playground:", err);
      setError("Failed to query active tournaments from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentsData();
  }, [userId]);

  const handleOpenDetails = async (t) => {
    setSelectedTournament(t);
    setShowDetailsModal(true);
    setModalDetailsLoading(true);
    setParticipatingTeams([]);

    const tId = t.tournament_id || t.id;

    try {
      const teamsRes = await api.get(`/tournament/${tId}/team-requests`).catch(() => null);

      if (teamsRes && teamsRes.data && teamsRes.data.success !== false) {
        const allTeams = teamsRes.data.data || [];
        const approvedOnly = allTeams.filter(item => (item.status || '').toUpperCase() === 'APPROVED');
        setParticipatingTeams(approvedOnly);
      }
    } catch (err) {
      console.error("Error fetching deep tournament details:", err);
    } finally {
      setModalDetailsLoading(false);
    }
  };

  const handleApplyAsVenue = async (tournamentId, tournamentTitle) => {
    if (!userId) {
      setError("Please log in as an official playground venue to submit hosting request.");
      return;
    }

    try {
      setApplyLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        playgroundUserId: userId,
        initiatedBy: 'PLAYGROUND'
      };

      const res = await api.post(`/tournament/${tournamentId}/playground-requests/send`, payload);

      if (res.data && res.data.success !== false) {
        setSuccessMsg(`Venue hosting application successfully submitted to organizer for "${tournamentTitle}"!`);
        setVenueRequestsMap(prev => ({ ...prev, [tournamentId]: 'PENDING' }));
      } else {
        throw new Error(res.data.message || "Failed to submit venue hosting application.");
      }

    } catch (err) {
      console.error("Apply as playground venue error:", err);
      setError(err.response?.data?.message || err.message || "Could not dispatch venue hosting application.");
    } finally {
      setApplyLoadingId(null);
    }
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      const q = searchQuery.toLowerCase();
      const title = (t.title || "").toLowerCase();
      const loc = (t.location || "").toLowerCase();
      const org = (t.organizer_name || t.organization_name || "").toLowerCase();
      return title.includes(q) || loc.includes(q) || org.includes(q);
    });
  }, [tournaments, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">Active & Upcoming Tournaments</h1>
        <p className="mt-1 text-xs text-[#666666]">Explore active tournaments across Sri Lanka and request to host them at your ground venue.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search tournaments by title, location, or organizer..."
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
          {filteredTournaments.map((t) => {
            const tournamentId = t.tournament_id || t.id;
            const title = t.title || 'National Championship';
            const location = t.location || 'Sri Lanka';
            const organizer = t.organizer_name || t.organization_name || 'Elle Sports Association';
            const heldDate = t.tournament_held_date || t.start_date || 'TBD';
            const myStatus = venueRequestsMap[tournamentId];
            const isApplying = applyLoadingId === tournamentId;

            return (
              <div key={tournamentId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                
                <div>
                  {/* Banner Header */}
                  <div className="h-32 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Trophy size={12} /> Active Tournament
                    </span>

                    {myStatus && (
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border backdrop-blur-md ${
                        myStatus === 'APPROVED' 
                          ? 'bg-emerald-500/80 text-white border-emerald-400'
                          : 'bg-amber-500/80 text-white border-amber-400'
                      }`}>
                        {myStatus === 'APPROVED' ? 'Venue Approved' : 'Request Pending'}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#00382D] transition-colors leading-snug line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-xs text-[#666666] font-medium mt-1 flex items-center gap-1.5">
                        <Building size={14} className="text-[#00382D] shrink-0" /> Organized by <span className="font-semibold text-[#333333]">{organizer}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#555555]">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00382D] shrink-0" />
                        <span>Location: <strong className="text-[#111111]">{location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#00382D] shrink-0" />
                        <span>Held Date: <strong className="text-[#111111]">{heldDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-[#f8f7f4] border-t border-[#e5e5e5] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(t)}
                    className="flex-1 py-2.5 bg-white border border-[#e5e5e5] text-[#333333] font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {myStatus === 'PENDING' ? (
                    <span className="flex-1 py-2.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-amber-200">
                      <Clock size={13} /> Requested
                    </span>
                  ) : myStatus === 'APPROVED' ? (
                    <span className="flex-1 py-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 size={13} /> Venue Reserved
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleApplyAsVenue(tournamentId, title)}
                      className="flex-1 py-2.5 bg-[#00382D] hover:bg-[#002a22] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isApplying ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Building2 size={14} /> Apply to Host
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- TOURNAMENT DETAILS MODAL --- */}
      {showDetailsModal && selectedTournament && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111111] leading-tight">{selectedTournament.title}</h2>
                  <p className="text-xs text-[#666666] font-medium mt-0.5 flex items-center gap-1.5">
                    <Building size={14} className="text-[#00382D]" /> Organized by <strong className="text-[#00382D] font-semibold">{selectedTournament.organizer_name || selectedTournament.organization_name || 'Elle Sports Association'}</strong>
                  </p>
                </div>
              </div>

              {/* Structured Information List */}
              <div className="space-y-3 text-xs text-[#333333]">
                
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <Building size={14} className="text-[#00382D]" /> Organizer Name:
                  </span>
                  <span className="font-bold text-[#111111]">{selectedTournament.organizer_name || selectedTournament.organization_name || 'Elle Sports Association'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <Phone size={14} className="text-[#00382D]" /> Contact Number:
                  </span>
                  <span className="font-bold text-[#00382D]">{selectedTournament.contact_number || '0771234567'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <MapPin size={14} className="text-[#00382D]" /> Venue Location:
                  </span>
                  <span className="font-bold text-[#111111]">{selectedTournament.location || 'Sri Lanka'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-[#00382D]" /> Tournament Held Date:
                  </span>
                  <span className="font-bold text-[#111111]">{selectedTournament.tournament_held_date || selectedTournament.start_date || '2026-08-28'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <Clock size={14} className="text-[#00382D]" /> Registration Deadline:
                  </span>
                  <span className="font-bold text-[#111111]">{selectedTournament.end_date || 'TBD'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#888888] font-medium flex items-center gap-2">
                    <Users size={14} className="text-[#00382D]" /> Maximum Team Limit:
                  </span>
                  <span className="font-bold text-[#111111]">{selectedTournament.maximum_team_limit || 16} Teams</span>
                </div>

              </div>

              {/* Participating Approved Teams Section */}
              <div>
                <h3 className="text-xs font-bold text-[#333333] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Users size={15} className="text-[#00382D]" /> Confirmed Registered Teams ({participatingTeams.length})
                </h3>

                {modalDetailsLoading ? (
                  <div className="py-4 text-center text-xs text-[#666666]">
                    <div className="w-4 h-4 border-2 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading confirmed teams...
                  </div>
                ) : participatingTeams.length === 0 ? (
                  <p className="text-xs text-[#888888] italic bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">No teams confirmed yet for this tournament.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {participatingTeams.map((team, idx) => (
                      <div key={team.request_id || idx} className="p-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#111111]">
                        <div className="w-6 h-6 rounded-full bg-[#00382D] text-white flex items-center justify-center text-[10px] font-bold">
                          {(team.team_name || 'T')[0]}
                        </div>
                        <span className="truncate">{team.team_name || 'Registered Team'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button inside modal */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={applyLoadingId === (selectedTournament.tournament_id || selectedTournament.id)}
                  onClick={() => {
                    handleApplyAsVenue(selectedTournament.tournament_id || selectedTournament.id, selectedTournament.title);
                    setShowDetailsModal(false);
                  }}
                  className="px-5 py-2.5 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Building2 size={14} /> Apply to Host Venue
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
