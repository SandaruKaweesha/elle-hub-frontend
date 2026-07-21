import React, { useState, useEffect, useMemo } from "react";
import { 
  History, 
  Search, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  FileText
} from "lucide-react";
import api from "../../services/api";

export default function RefereeHistory() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const res = await api.get(`/referee/${userId}/history`);
      if (res.data && res.data.success !== false) {
        setHistoryItems(res.data.data || []);
      } else {
        throw new Error(res.data.message || "Failed to query referee officiating history.");
      }
    } catch (err) {
      console.error("Fetch referee history error:", err);
      setError(err.response?.data?.message || err.message || "Could not load officiating history.");
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
      const title = (item.tournament_title || "").toLowerCase();
      const organizer = (item.organizer_name || "").toLowerCase();
      const venue = (item.location || "").toLowerCase();

      return title.includes(query) || organizer.includes(query) || venue.includes(query);
    });
  }, [historyItems, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <History size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Officiating History</h1>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-semibold uppercase block">Total Completed</span>
            <strong className="text-xl text-[#111111] font-extrabold">{historyItems.length} Tournaments</strong>
          </div>
        </div>
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

      {/* History Items Directory */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading your completed officiating history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <History size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Completed Tournaments Yet</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {searchQuery 
              ? "No completed officiating duties match your search query."
              : "When an organizer completes a tournament you officiated, your history log will update here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const dateStr = item.tournament_held_date || item.start_date || 'Past Event';
            const dateObj = new Date(`${dateStr}T00:00:00`);
            const dayNum = isNaN(dateObj.getDate()) ? '28' : dateObj.getDate();
            const monthStr = isNaN(dateObj.getDate()) ? 'AUG' : dateObj.toLocaleDateString("en-US", { month: "short" });

            return (
              <div 
                key={item.request_id || item.tournament_id}
                className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-[#00382D] text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xl font-extrabold leading-none">{dayNum}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5">{monthStr}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">{item.tournament_title}</h3>
                      <p className="text-xs text-[#666666] font-medium mt-0.5">
                        Organized by: <strong className="text-[#00382D]">{item.organizer_name}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 text-xs font-bold rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5 self-start sm:self-center shadow-2xs">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Verified Officiating Duty
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#555555]">
                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <MapPin size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Venue Location:</span>
                      <strong className="text-[#111111]">{item.location || 'Sri Lanka'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Calendar size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Held Date:</span>
                      <strong className="text-[#111111]">{dateStr}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Phone size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Organizer Contact:</span>
                      <strong className="text-[#00382D]">{item.contact_number}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Official Officiating Log Entry
                  </span>

                  <button 
                    onClick={() => { setSelectedItem(item); setShowModal(true); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    View Duty Details <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- DUTY DETAILS MODAL --- */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedItem.tournament_title}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D]">{selectedItem.organizer_name}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Record Verification:</span>
                <span className="px-2.5 py-0.5 font-bold uppercase rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200">
                  Verified Referee Log
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 font-medium">Appointed Role:</span>
                <strong className="text-[#00382D]">Official Match Referee</strong>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#333333] mb-6">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Held Date:</span>
                <span className="font-bold">{selectedItem.tournament_held_date || selectedItem.start_date || 'Past Event'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Venue Location:</span>
                <span className="font-bold">{selectedItem.location || 'Sri Lanka'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Organizer Contact:</span>
                <span className="font-bold text-[#00382D]">{selectedItem.contact_number}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
