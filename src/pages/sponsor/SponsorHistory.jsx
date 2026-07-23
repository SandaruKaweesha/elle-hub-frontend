import React, { useState, useEffect } from "react";
import {
  Trophy,
  CalendarDays,
  MapPin,
  Building2,
  Phone,
  AlertCircle,
  X,
  History as HistoryIcon,
  ChevronRight,
  BadgeCheck
} from "lucide-react";
import api from "../../services/api";

export default function SponsorHistory() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const response = await api.get(`/sponsor/${userId}/history`);
      if (response.data && response.data.success !== false) {
        setHistoryItems(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to query sponsorship history.");
      }
    } catch (err) {
      console.error("Error fetching sponsorship history:", err);
      setError(err.response?.data?.message || err.message || "Could not load sponsorship history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <HistoryIcon size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Sponsorship History</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Review past tournaments sponsored by your company.</p>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 shadow-xs flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center font-bold">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] text-[#666666] font-extrabold uppercase tracking-wider block">Total Completed</span>
            <strong className="text-xl font-black text-[#111111]">{historyItems.length} Tournaments</strong>
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

      {/* History List */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
            <BadgeCheck size={20} className="text-[#00382D]" /> Past Sponsored Tournaments
          </h3>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#666666] font-medium text-sm">Loading sponsorship history...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-20 text-center bg-[#f8f7f4] rounded-2xl border border-dashed border-gray-200">
            <Trophy size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
            <h4 className="text-base font-bold text-[#111111]">No History Available</h4>
            <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
              You haven't completed any tournament sponsorships yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div 
                key={item.request_id || item.tournament_id}
                className="bg-white border border-[#e5e5e5] hover:border-[#00382D]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      COMPLETED
                    </span>
                    <span className="text-xs text-[#888888]">
                      Date: {item.tournament_held_date || item.start_date || 'Past Event'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#111111]">
                    {item.tournament_title || 'Elle Championship'}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666]">
                    <span className="flex items-center gap-1 font-semibold text-[#00382D]">
                      <Building2 size={14} /> Organizer: {item.organizer_name || 'Elle Sports Association'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> Location: {item.location || 'Sri Lanka'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> Contact: {item.contact_number || 'N/A'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowModal(true);
                  }}
                  className="px-4 py-2 border border-[#00382D] text-[#00382D] hover:bg-[#00382D] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start md:self-center"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Popup Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center font-bold">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">{selectedItem.tournament_title}</h3>
                <p className="text-xs text-[#666666]">Completed Tournament Record</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#333333]">
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Organizer:</span>
                <span className="font-bold text-[#111111]">{selectedItem.organizer_name}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Venue Location:</span>
                <span className="font-bold text-[#111111]">{selectedItem.location}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Tournament Date:</span>
                <span className="font-bold text-[#111111]">{selectedItem.tournament_held_date || selectedItem.start_date || 'Completed'}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Contact Telephone:</span>
                <span className="font-bold text-[#111111]">{selectedItem.contact_number}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#00382D] text-white rounded-xl text-xs font-bold hover:bg-[#002a22]"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
