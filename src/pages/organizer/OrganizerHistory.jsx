import React, { useState, useEffect, useMemo } from "react";
import { 
  History, 
  Search, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  Users,
  Shield,
  BadgeDollarSign,
  FileText,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { certificateAPI } from "../../services/api";
import CertificateModal from "../../components/common/CertificateModal";

export default function OrganizerHistory() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const handleOpenCertificate = async (tournamentId) => {
    try {
      setLoading(true);
      let res = await certificateAPI.getTournamentCertificates(tournamentId);
      if (!res.data?.data || res.data.data.length === 0) {
        await certificateAPI.generate(tournamentId);
        res = await certificateAPI.getTournamentCertificates(tournamentId);
      }
      const certs = res.data?.data || [];
      if (certs.length > 0) {
        setSelectedCert(certs[0]);
      } else {
        alert("No certificates available yet.");
      }
    } catch (err) {
      console.error("Certificate error:", err);
      alert("Error opening certificate.");
    } finally {
      setLoading(false);
    }
  };


  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const res = await api.get(`/organizer/${userId}/history`);
      if (res.data && res.data.success !== false) {
        setHistoryItems(res.data.data || []);
      } else {
        throw new Error(res.data.message || "Failed to query organizer history.");
      }
    } catch (err) {
      console.error("Fetch organizer history error:", err);
      setError(err.response?.data?.message || err.message || "Could not load completed tournaments history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      const query = searchQuery.toLowerCase();
      const title = (item.title || "").toLowerCase();
      const venue = (item.location || "").toLowerCase();
      const rules = (item.rules || "").toLowerCase();

      return title.includes(query) || venue.includes(query) || rules.includes(query);
    });
  }, [historyItems, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2.5 rounded-xl">
              <History size={26} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Tournament History</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Review all completed championships and tournament archives hosted by your organization.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[11px] text-[#666666] font-extrabold uppercase tracking-wider block">Completed Archives</span>
            <strong className="text-xl text-[#111111] font-black">{historyItems.length} Tournaments</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search completed tournaments by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#00382D] transition-colors"
          />
        </div>

        <div className="text-xs text-[#666666] font-medium flex items-center gap-1.5 self-end sm:self-center">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>Showing only finalized & completed tournaments</span>
        </div>
      </div>

      {/* History Items Directory */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#e5e5e5]">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading completed tournament archives...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <History size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Completed Tournaments Yet</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {searchQuery 
              ? "No completed tournaments match your search criteria."
              : "When you mark a tournament as COMPLETED from the management panel, it will be archived here in your official history."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const dateStr = item.tournament_held_date || item.end_date || item.start_date || 'Completed';
            const dateObj = new Date(`${dateStr}T00:00:00`);
            const dayNum = isNaN(dateObj.getDate()) ? '28' : dateObj.getDate();
            const monthStr = isNaN(dateObj.getDate()) ? 'AUG' : dateObj.toLocaleDateString("en-US", { month: "short" });

            return (
              <div 
                key={item.tournament_id}
                className="bg-white rounded-2xl border border-[#e5e5e5] shadow-xs hover:shadow-md transition-all p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-[#00382D] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-xl font-extrabold leading-none">{dayNum}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5">{monthStr}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          COMPLETED
                        </span>
                        {item.is_finalized == 1 && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            Finalized
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">{item.title}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedItem(item); setShowModal(true); }}
                    className="px-4 py-2 bg-[#00382D] text-white hover:bg-[#002a22] font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer"
                  >
                    View Archive Details <ChevronRight size={14} />
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-[#555555]">
                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <MapPin size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Venue Location:</span>
                      <strong className="text-[#111111]">{item.location || 'Sri Lanka'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Users size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Participating Teams:</span>
                      <strong className="text-[#111111]">{item.participating_teams_count || 0} Teams</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Shield size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Officiating Referees:</span>
                      <strong className="text-[#111111]">{item.assigned_referees_count || 0} Referees</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <BadgeDollarSign size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Sponsors Joined:</span>
                      <strong className="text-[#111111]">{item.sponsors_count || 0} Sponsors</strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" /> Archived Championship Record
                  </span>

                  <button 
                    onClick={() => navigate(`/organizer/tournaments/manage/${item.tournament_id}/certificate-qr`)}
                    className="text-[#00382D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={14} /> Certificate QR & Results
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- ARCHIVE DETAILS MODAL --- */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999999] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e5e5] relative space-y-5">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00382D] text-white flex items-center justify-center font-bold shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedItem.title}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Official Completed Tournament Log
                </p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#e5e5e5] space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="px-2.5 py-0.5 font-bold uppercase rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200">
                  COMPLETED & ARCHIVED
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 font-medium">Held Date:</span>
                <strong className="text-[#00382D]">{selectedItem.tournament_held_date || selectedItem.end_date || selectedItem.start_date || 'N/A'}</strong>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#333333]">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Venue Location:</span>
                <span className="font-bold">{selectedItem.location || 'Sri Lanka'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Participating Teams:</span>
                <span className="font-bold text-[#00382D]">{selectedItem.participating_teams_count || 0} Teams</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Officiating Referees:</span>
                <span className="font-bold text-[#00382D]">{selectedItem.assigned_referees_count || 0} Referees</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Sponsors Joined:</span>
                <span className="font-bold text-[#00382D]">{selectedItem.sponsors_count || 0} Sponsors</span>
              </div>
              {selectedItem.prize_details && (
                <div className="py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium block mb-1">Prize Details:</span>
                  <p className="bg-gray-50 p-2.5 rounded-xl text-gray-700 font-medium leading-relaxed">{selectedItem.prize_details}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate(`/organizer/tournaments/manage/${selectedItem.tournament_id}/certificate-qr`);
                }}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award size={16} /> Certificate & QR Hub
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCert && (
        <CertificateModal 
          certificate={selectedCert} 
          onClose={() => setSelectedCert(null)} 
        />
      )}

    </div>
  );
}

