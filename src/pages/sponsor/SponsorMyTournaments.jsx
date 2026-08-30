import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  MapPin, 
  CalendarDays, 
  Search, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Clock, 
  BadgeCheck, 
  Eye, 
  X, 
  Loader2,
  Users,
  Award, LogOut, Lock
} from "lucide-react";
import api from "../../services/api";

export default function SponsorMyTournaments() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("ALL"); // "ALL", "ACTIVE", "COMPLETED"

  // Leave / Withdraw State
  const [leaveLoadingId, setLeaveLoadingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleWithdrawSponsorship = async (tId) => {
    try {
      setLeaveLoadingId(tId);
      setError(null);
      const res = await api.post('/tournament/sponsor-request/leave', { tournamentId: tId });
      if (res.data && res.data.success !== false) {
        setSuccessMsg(res.data.message || "You have withdrawn your sponsorship request successfully.");
        setShowModal(false);
        setSelectedTournament(null);
        fetchMySponsoredTournaments();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(res.data.message || "Failed to withdraw sponsorship request.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Operation failed.");
    } finally {
      setLeaveLoadingId(null);
    }
  };

  // Details Modal State
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMySponsoredTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) return;

      const [reqsRes, historyRes] = await Promise.all([
        api.get(`/sponsor/${userId}/requests`).catch(() => null),
        api.get(`/sponsor/${userId}/history`).catch(() => null)
      ]);

      let combined = [];

      // Active / Approved Sponsorship Requests
      if (reqsRes?.data?.data && Array.isArray(reqsRes.data.data)) {
        const activeAccepted = reqsRes.data.data.filter(r => {
          const rStatus = (r.status || '').toUpperCase();
          const tStatus = (r.tournament_status || '').toUpperCase();
          return (rStatus === 'ACCEPTED' || rStatus === 'APPROVED') && tStatus !== 'COMPLETED' && tStatus !== 'FINISHED';
        });

        activeAccepted.forEach(item => {
          combined.push({
            id: item.tournament_id || item.request_id,
            title: item.tournament_title || 'Sponsored Tournament',
            organizer: item.organizer_name || 'Elle Sports Association',
            contact: item.contact_number || 'Available on Request',
            location: item.location || 'Colombo',
            date: item.tournament_held_date || item.start_date || 'Upcoming',
            requestDate: item.request_date,
            status: 'ACTIVE',
            raw: item
          });
        });
      }

      // Completed Sponsorship History
      if (historyRes?.data?.data && Array.isArray(historyRes.data.data)) {
        historyRes.data.data.forEach(item => {
          if (!combined.some(c => c.id === (item.tournament_id || item.request_id))) {
            combined.push({
              id: item.tournament_id || item.request_id,
              title: item.tournament_title || 'Completed Tournament',
              organizer: item.organizer_name || 'Elle Sports Association',
              contact: item.contact_number || 'Available on Request',
              location: item.location || 'Colombo',
              date: item.tournament_held_date || item.start_date || 'Concluded',
              requestDate: item.request_date,
              status: 'COMPLETED',
              raw: item
            });
          }
        });
      }

      setTournaments(combined);
    } catch (err) {
      console.error("Error fetching my sponsored tournaments:", err);
      setError("Could not load your sponsored tournaments list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMySponsoredTournaments();
    }
  }, [userId]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = t.title.toLowerCase().includes(q) || 
                            t.organizer.toLowerCase().includes(q) || 
                            t.location.toLowerCase().includes(q);

      let matchesTab = true;
      if (filterTab === "ACTIVE") {
        matchesTab = t.status === "ACTIVE";
      } else if (filterTab === "COMPLETED") {
        matchesTab = t.status === "COMPLETED";
      }

      return matchesSearch && matchesTab;
    });
  }, [tournaments, searchQuery, filterTab]);

  const activeCount = tournaments.filter(t => t.status === "ACTIVE").length;
  const completedCount = tournaments.filter(t => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <Trophy size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">My Tournaments</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Manage and view all tournaments officially sponsored by your company.</p>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#08733e]/10 text-[#08733e] flex items-center justify-center font-extrabold">
            <BadgeCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] text-[#666666] font-extrabold uppercase tracking-wider block">Total Sponsored</span>
            <strong className="text-xl font-black text-[#111111]">{tournaments.length} Events</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[#00382D] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Sponsored ({tournaments.length})
          </button>
          <button
            onClick={() => setFilterTab("ACTIVE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === "ACTIVE"
                ? "bg-[#00382D] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active / Upcoming ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab("COMPLETED")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === "COMPLETED"
                ? "bg-[#00382D] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search my sponsored events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold outline-none focus:border-[#00382D] transition-all"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium">
          <Loader2 size={32} className="animate-spin text-[#08733e] mx-auto mb-3" />
          Loading your sponsored tournaments...
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-16 text-center text-gray-400 space-y-3">
          <Trophy size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-lg font-bold text-gray-800">No Sponsored Tournaments Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When you send a sponsorship proposal or accept an organizer invitation, your sponsored tournaments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTournaments.map((t) => (
            <div 
              key={t.id}
              className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border inline-block mb-2 ${
                    t.status === 'ACTIVE'
                      ? 'bg-[#eaf1ec] text-[#08733e] border-[#08733e]/20'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {t.status === 'ACTIVE' ? '● ACTIVE EVENT' : '✓ COMPLETED'}
                  </span>
                  <h3 className="text-lg font-black text-[#111111] leading-tight">{t.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center shrink-0">
                  <Trophy size={20} />
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 font-medium bg-[#f8f7f4] p-4 rounded-xl border border-gray-100">
                <p className="flex items-center gap-2">
                  <Building2 size={15} className="text-[#08733e]" />
                  <span>Organizer: <strong className="text-gray-900">{t.organizer}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#08733e]" />
                  <span>Location: <strong className="text-gray-900">{t.location}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-[#08733e]" />
                  <span>Event Date: <strong className="text-gray-900">{t.date}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-[#08733e]" />
                  <span>Contact: <strong className="text-gray-900">{t.contact}</strong></span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-[#08733e] flex items-center gap-1">
                  <BadgeCheck size={16} /> Official Sponsor
                </span>

                <div className="flex items-center gap-2">
                  {(() => {
                    const isFinalized = Boolean(
                      Number(t.raw?.is_draw_finalized) === 1 || 
                      Number(t.raw?.is_finalized) === 1 || 
                      t.raw?.isDrawFinalized || 
                      t.raw?.isFinalized || 
                      ['FINALIZED', 'COMPLETED', 'FINISHED', 'ACTIVE', 'ONGOING'].includes((t.raw?.tournament_status || t.raw?.status || '').toUpperCase())
                    );

                    if (isFinalized) {
                      return (
                        <span 
                          title="The tournament setup has been finalized by organizer. Sponsorship is locked."
                          className="px-3 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-1 cursor-not-allowed"
                        >
                          <Lock size={13} /> Finalized
                        </span>
                      );
                    } else {
                      return (
                        <button
                          type="button"
                          disabled={leaveLoadingId === t.id}
                          onClick={() => handleWithdrawSponsorship(t.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200/80 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                          title="Withdraw Sponsorship"
                        >
                          <LogOut size={13} /> Withdraw
                        </button>
                      );
                    }
                  })()}

                  <button
                    onClick={() => {
                      setSelectedTournament(t);
                      setShowModal(true);
                    }}
                    className="bg-[#00382D] hover:bg-[#002b22] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tournament Details Modal */}
      {showModal && selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Trophy size={22} className="text-[#08733e]" />
                <h3 className="text-lg font-black text-gray-900">{selectedTournament.title}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 font-medium">
              <div className="bg-[#eaf1ec] p-3.5 rounded-2xl border border-[#08733e]/20 text-[#08733e] flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px]">Sponsorship Status</span>
                <span className="font-black text-xs">OFFICIAL SPONSOR</span>
              </div>

              <div className="space-y-2 p-4 bg-[#f8f7f4] rounded-2xl border border-gray-200">
                <p><strong>Organizer Name:</strong> {selectedTournament.organizer}</p>
                <p><strong>Contact Phone:</strong> {selectedTournament.contact}</p>
                <p><strong>Tournament Location:</strong> {selectedTournament.location}</p>
                <p><strong>Tournament Held Date:</strong> {selectedTournament.date}</p>
                <p><strong>Tournament Status:</strong> {selectedTournament.status}</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-[#00382D] hover:bg-[#002b22] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}