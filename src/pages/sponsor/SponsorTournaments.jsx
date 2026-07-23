import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Building2, 
  Search, 
  SlidersHorizontal,
  BadgeDollarSign,
  AlertCircle,
  X,
  ChevronRight,
  CheckCircle2,
  Eye,
  Handshake,
  Clock,
  Phone,
  Users,
  FileText,
  UserCheck
} from "lucide-react";
import api from "../../services/api";

export default function SponsorTournaments() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Selected Modal
  const [selectedTourney, setSelectedTourney] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all public tournaments
      const resT = await api.get("/tournaments");
      let allTourneys = [];
      if (resT.data && resT.data.success !== false) {
        allTourneys = resT.data.data || resT.data || [];
      }

      // Fetch my sponsor requests
      let reqs = [];
      if (userId) {
        const resR = await api.get(`/sponsor/${userId}/requests`);
        if (resR.data && resR.data.success !== false) {
          reqs = resR.data.data || [];
        }
      }

      setTournaments(allTourneys);
      setMyRequests(reqs);
    } catch (err) {
      console.error("Fetch tournaments error:", err);
      setError("Could not load public tournaments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [userId]);

  const getSponsorshipStatus = (tId) => {
    const existing = myRequests.find(r => r.tournament_id === tId);
    if (!existing) return null;
    return existing.status || 'PENDING';
  };

  const handleOfferSponsorship = async (tId) => {
    try {
      setActionLoading(tId);
      setError(null);

      const res = await api.post(`/tournament/${tId}/sponsor-requests/send`, {
        sponsorUserId: userId,
        initiatedBy: 'SPONSOR'
      });

      if (res.data && res.data.success !== false) {
        if (showModal) setShowModal(false);
        fetchTournaments();
      } else {
        throw new Error(res.data.message || "Failed to submit sponsorship request.");
      }
    } catch (err) {
      console.error("Offer sponsorship error:", err);
      setError(err.response?.data?.message || err.message || "Could not submit sponsorship offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    const s = searchTerm.toLowerCase();
    const title = (t.title || '').toLowerCase();
    const loc = (t.location || '').toLowerCase();
    const org = (t.organizer_name || '').toLowerCase();
    return title.includes(s) || loc.includes(s) || org.includes(s);
  });

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Active & Upcoming Tournaments
        </h1>
        <p className="mt-1 text-xs text-[#666666]">
          Explore active tournaments across Sri Lanka and offer official corporate sponsorship.
        </p>
      </div>

      {/* Filter / Search Bar Box */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tournaments by title, location, or organizer..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
          />
        </div>

        <span className="text-xs font-bold text-[#666666] shrink-0">
          Active Tournaments: <strong className="text-[#111111]">{filteredTournaments.length}</strong>
        </span>
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

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading tournament opportunities...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center">
          <Trophy size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h4 className="text-base font-bold text-[#111111]">No Tournaments Found</h4>
          <p className="text-xs text-[#666666] mt-1">There are currently no active public tournaments listed for sponsorship.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(t => {
            const tId = t.tournament_id || t.id;
            const title = t.title || 'Elle Championship';
            const location = t.location || 'Sri Lanka';
            const organizer = t.organizer_name || t.organization_name || 'Elle Sports Association';
            const heldDate = t.tournament_held_date || t.start_date || 'TBD';
            const status = getSponsorshipStatus(tId);
            const isPending = (status || '').toUpperCase() === 'PENDING';
            const isApproved = ['APPROVED', 'ACCEPTED'].includes((status || '').toUpperCase());

            return (
              <div 
                key={tId} 
                className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Header */}
                  <div className="h-28 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                      <Trophy size={13} /> Active Tournament
                    </span>

                    {status && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border backdrop-blur-md ${
                        isApproved 
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-amber-600 text-white border-amber-400'
                      }`}>
                        {isApproved ? 'SPONSORED' : 'REQUEST PENDING'}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#111111] group-hover:text-[#00382D] transition-colors leading-snug line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-[#666666] font-medium mt-1.5 flex items-center gap-1.5">
                        <Building2 size={15} className="text-[#00382D] shrink-0" /> Organized by <span className="font-bold text-[#111111]">{organizer}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#e5e5e5] text-xs text-[#666666]">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-[#00382D] shrink-0" />
                        <span>Location: <strong className="text-[#111111] font-bold">{location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-[#00382D] shrink-0" />
                        <span>Held Date: <strong className="text-[#111111] font-bold">{heldDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-[#f8f7f4] border-t border-[#e5e5e5] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTourney(t);
                      setShowModal(true);
                    }}
                    className="flex-1 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Eye size={15} /> View Details
                  </button>

                  {!status ? (
                    <button
                      disabled={actionLoading === tId}
                      onClick={() => handleOfferSponsorship(tId)}
                      className="flex-1 py-2.5 bg-[#00382D] text-white font-bold text-xs rounded-xl hover:bg-[#002a22] transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Handshake size={15} /> Offer Sponsorship
                    </button>
                  ) : isPending ? (
                    <div className="flex-1 py-2.5 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                      <Clock size={15} /> Requested
                    </div>
                  ) : (
                    <div className="flex-1 py-2.5 bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} /> Sponsored
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Popup Modal */}
      {showModal && selectedTourney && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00382D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">{selectedTourney.title}</h3>
                <p className="text-xs text-[#00382D] font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building2 size={14} /> Organized by {selectedTourney.organizer_name || selectedTourney.organization_name || 'Elle Sports Association'}
                </p>
              </div>
            </div>

            {/* Comprehensive Specifications List */}
            <div className="space-y-2.5 text-xs text-[#333333] max-h-[420px] overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Building2 size={14} className="text-[#00382D]" /> Organizer Name:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.organizer_name || selectedTourney.organization_name || 'Elle Sports Association'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Phone size={14} className="text-[#00382D]" /> Contact Telephone:
                </span>
                <span className="font-bold text-[#00382D]">{selectedTourney.contact_number || selectedTourney.organizer_contact || '0771234567'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-[#00382D]" /> Venue Location:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.location || 'Sri Lanka'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Calendar size={14} className="text-[#00382D]" /> Tournament Held Date:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.tournament_held_date || selectedTourney.start_date || '2026-09-17'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Clock size={14} className="text-[#00382D]" /> Registration Deadline:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.end_date || 'TBD'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Users size={14} className="text-[#00382D]" /> Maximum Team Limit:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.maximum_team_limit || selectedTourney.team_limit || 16} Registered Teams</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <UserCheck size={14} className="text-[#00382D]" /> Maximum Referee Limit:
                </span>
                <span className="font-bold text-[#111111]">{selectedTourney.maximum_referee_limit || selectedTourney.referee_limit || selectedTourney.referees_needed || 4} Certified Referees</span>
              </div>



            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>

              {!getSponsorshipStatus(selectedTourney.tournament_id || selectedTourney.id) && (
                <button
                  type="button"
                  onClick={() => {
                    handleOfferSponsorship(selectedTourney.tournament_id || selectedTourney.id);
                    setShowModal(false);
                  }}
                  className="px-5 py-2.5 bg-[#00382D] text-white rounded-xl text-xs font-bold hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Handshake size={14} /> Offer Official Sponsorship
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
