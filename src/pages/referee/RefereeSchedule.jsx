import React, { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Trophy,
  UserRoundCheck,
  Phone,
  AlertCircle,
  XCircle,
  CheckCircle2,
  X,
  ChevronRight
} from "lucide-react";
import api from "../../services/api";

const STATUS_STYLES = {
  Confirmed: "bg-[#d9f8e5] text-[#006b38] border border-[#a2ebd0]",
  Pending: "bg-[#fff3cd] text-[#876700] border border-[#ffe69c]",
  Declined: "bg-[#fee2e2] text-[#b42318] border border-[#fecdcd]",
  Completed: "bg-[#e9eceb] text-[#59625e] border border-[#d6dcd8]",
};

function RefereeSchedule() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const response = await api.get(`/referee/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        const rawReqs = response.data.data || [];
        
        // Map backend referee requests into clean schedule items
        const mapped = rawReqs.map(r => {
          const s = (r.status || '').toUpperCase();
          let displayStatus = 'Pending';
          if (s === 'APPROVED' || s === 'ACCEPTED') {
            displayStatus = 'Confirmed';
          } else if (s === 'REJECTED' || s === 'DECLINED' || s === 'CANCELLED') {
            displayStatus = 'Declined';
          }

          return {
            id: r.request_id || r.tournament_id,
            tournament: r.tournament_title || 'Elle Tournament',
            venue: r.location || 'Sugathadasa Stadium, Colombo',
            date: r.tournament_held_date || r.start_date || '2026-08-28',
            time: '09:00 AM - 04:00 PM',
            role: 'Official Match Referee',
            organizer: r.organizer_name || 'Elle Sports Association',
            contact: r.contact_number || 'Available on Request',
            status: displayStatus,
            initiatedBy: r.initiated_by
          };
        });

        setScheduleItems(mapped);
      } else {
        throw new Error(response.data.message || "Failed to query referee schedule.");
      }
    } catch (err) {
      console.error("Error fetching referee schedule:", err);
      setError(err.response?.data?.message || err.message || "Could not load referee schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [userId]);

  const filteredSchedule = useMemo(() => {
    return scheduleItems.filter((item) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        item.tournament.toLowerCase().includes(searchValue) ||
        item.organizer.toLowerCase().includes(searchValue) ||
        item.venue.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [scheduleItems, searchTerm, statusFilter]);

  const confirmedCount = scheduleItems.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pendingCount = scheduleItems.filter(
    (item) => item.status === "Pending"
  ).length;

  const declinedCount = scheduleItems.filter(
    (item) => item.status === "Declined"
  ).length;

  return (
    <div className="space-y-6 pb-10 font-['Poppins']">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          My Officiating Schedule
        </h1>
        <p className="mt-1 text-sm text-[#777777]">
          View your confirmed, pending, and completed tournament officiating assignments.
        </p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Confirmed Officiating Duties
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {confirmedCount}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9f8e5] text-[#00783f]">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Pending Requests
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {pendingCount}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3cd] text-[#9a7600]">
              <Clock3 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Declined / Inactive
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {declinedCount}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fee2e2] text-[#b42318]">
              <XCircle size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e2e6e3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[420px]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tournament, venue, or organizer"
            className="h-11 w-full rounded-xl border border-[#d6dcd8] bg-[#f8f7f4] pl-10 pr-4 text-xs outline-none focus:border-[#00783f] focus:ring-2 focus:ring-[#00783f]/15"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#666666]" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-[#d6dcd8] bg-white px-4 text-xs font-bold text-[#333333] outline-none focus:border-[#00783f]"
          >
            <option value="All">All Statuses ({scheduleItems.length})</option>
            <option value="Confirmed">Confirmed ({confirmedCount})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Declined">Declined ({declinedCount})</option>
          </select>
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#666666] font-medium text-sm">Loading schedule duties...</p>
          </div>
        ) : filteredSchedule.length > 0 ? (
          filteredSchedule.map((item) => {
            const dateObject = new Date(`${item.date}T00:00:00`);
            const dayNum = isNaN(dateObject.getDate()) ? '28' : dateObject.getDate();
            const monthStr = isNaN(dateObject.getDate()) ? 'AUG' : dateObject.toLocaleDateString("en-US", { month: "short" });

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#e2e6e3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  {/* Date box */}
                  <div className="flex shrink-0 items-center gap-4 lg:block">
                    <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-2xl bg-[#00382D] text-white shadow-sm">
                      <span className="text-2xl font-extrabold leading-none">
                        {dayNum}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#b9c5bf]">
                        {monthStr}
                      </span>
                    </div>

                    <div className="lg:hidden">
                      <p className="text-sm font-bold text-[#111111]">
                        {item.tournament}
                      </p>
                      <p className="mt-1 text-xs text-[#777777]">
                        Organizer: {item.organizer}
                      </p>
                    </div>
                  </div>

                  {/* Main details */}
                  <div className="min-w-0 flex-1">
                    <div className="hidden lg:block">
                      <h2 className="text-lg font-bold text-[#111111]">
                        {item.tournament}
                      </h2>
                      <p className="mt-1 text-xs text-[#666666] font-medium">
                        Organized by: <strong className="text-[#00382D]">{item.organizer}</strong>
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-[#5f6763] sm:grid-cols-2 xl:grid-cols-3">
                      <p className="flex items-center gap-2">
                        <Clock3 size={15} className="text-[#00783f] shrink-0" />
                        <span>Time: <strong>{item.time}</strong></span>
                      </p>

                      <p className="flex items-start gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-[#00783f]"
                        />
                        <span>Venue: <strong>{item.venue}</strong></span>
                      </p>

                      <p className="flex items-center gap-2">
                        <Phone
                          size={15}
                          className="text-[#00783f] shrink-0"
                        />
                        <span>Contact: <strong>{item.contact}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Status and action */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    <span
                      className={`inline-flex w-fit rounded-xl px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                        STATUS_STYLES[item.status]
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => { setSelectedItem(item); setShowModal(true); }}
                      className="min-w-[120px] rounded-xl border border-[#00783f] px-4 py-2 text-xs font-bold text-[#00783f] transition hover:bg-[#eaf6ef] cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cfd6d2] bg-white px-6 py-14 text-center">
            <CalendarDays
              size={36}
              className="mx-auto text-[#9aa49f]"
            />
            <h2 className="mt-4 text-lg font-bold text-[#222222]">
              No Scheduled Officiating Duties
            </h2>
            <p className="mt-1 text-xs text-[#777777] max-w-sm mx-auto">
              You currently have no match assignments under this filter. Apply for active tournaments or wait for organizer invitations.
            </p>
          </div>
        )}
      </div>

      {/* --- SCHEDULE DETAIL MODAL --- */}
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
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedItem.tournament}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D]">{selectedItem.organizer}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Duty Status:</span>
                <span className={`px-2.5 py-0.5 font-bold uppercase rounded-lg border ${STATUS_STYLES[selectedItem.status]}`}>
                  {selectedItem.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 font-medium">Appointed Role:</span>
                <strong className="text-[#00382D]">{selectedItem.role}</strong>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#333333] mb-6">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Scheduled Date:</span>
                <span className="font-bold">{selectedItem.date}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Venue Location:</span>
                <span className="font-bold">{selectedItem.venue}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Organizer Contact:</span>
                <span className="font-bold text-[#00382D]">{selectedItem.contact}</span>
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

export default RefereeSchedule;