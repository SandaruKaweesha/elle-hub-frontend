import React, { useState, useEffect } from "react";
import { 
  History, 
  Trophy, 
  MapPin, 
  CalendarDays, 
  ShieldCheck, 
  AlertCircle, 
  X 
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundHistory() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/tournaments/approved");
      if (res.data && res.data.success !== false) {
        setTournaments(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch playground history error:", err);
      setError("Could not load playground hosting history.");
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
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">Ground Hosting History</h1>
        <p className="mt-1 text-xs text-[#666666]">Verified record log of all completed tournaments hosted at your venue.</p>
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

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading hosting history...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <History size={36} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-[#111111] mb-1">No Past Hosting Records</h3>
          <p className="text-xs text-[#666666]">Completed tournaments hosted at this ground will be logged here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.slice(0, 3).map((t) => (
            <div key={t.tournament_id} className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#00382D] text-white rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#666666] font-medium mt-1">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-[#00382D]" /> Location: {t.location || 'Sri Lanka'}</span>
                    <span className="flex items-center gap-1"><CalendarDays size={13} className="text-[#00382D]" /> Held Date: {t.tournament_held_date || t.start_date || '2026-08-28'}</span>
                  </div>
                </div>
              </div>

              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" /> Verified Venue Host Log
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
