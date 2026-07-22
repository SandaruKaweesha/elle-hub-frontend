import React, { useState, useEffect, useMemo } from "react";
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Trophy, 
  Search, 
  CheckCircle2, 
  Phone,
  Building2
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundSchedule() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const userRes = await api.get(`/user/${userId}`);
      const userData = userRes.data?.data || {};
      const pgLoc = (userData.location || userData.located_district || 'badulla').toLowerCase();

      const tourRes = await api.get("/tournaments/approved");
      if (tourRes.data && tourRes.data.success !== false) {
        const allT = tourRes.data.data || [];
        const venueMatches = allT.filter(t => {
          const loc = (t.location || '').toLowerCase();
          return loc.includes(pgLoc) || loc.includes('badulla');
        });
        setTournaments(venueMatches);
      }
    } catch (err) {
      console.error("Playground schedule error:", err);
      setError("Could not load ground schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSchedule();
    }
  }, [userId]);

  const filteredSchedule = useMemo(() => {
    return tournaments.filter(t => {
      const q = searchQuery.toLowerCase();
      const title = (t.title || "").toLowerCase();
      const loc = (t.location || "").toLowerCase();
      return title.includes(q) || loc.includes(q);
    });
  }, [tournaments, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">Ground Officiating Schedule</h1>
        <p className="mt-1 text-xs text-[#666666]">Confirmed tournaments and match fixtures scheduled at your ground.</p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search tournament title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D]"
          />
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing <strong>{filteredSchedule.length}</strong> scheduled ground bookings
        </span>
      </div>

      {/* Schedule Items List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading ground schedule...</p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <CalendarDays size={36} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-[#111111] mb-1">No Ground Bookings Scheduled</h3>
          <p className="text-xs text-[#666666]">There are no active match fixtures scheduled for this venue filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedule.map((t) => (
            <div key={t.tournament_id} className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#00382D] text-white rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#666666] font-medium mt-1">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-[#00382D]" /> {t.location || 'Sri Lanka'}</span>
                    <span className="flex items-center gap-1"><CalendarDays size={13} className="text-[#00382D]" /> Date: {t.tournament_held_date || t.start_date || '2026-08-28'}</span>
                  </div>
                </div>
              </div>

              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" /> Ground Reserved
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
