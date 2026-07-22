import React, { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Trophy,
  Phone,
  AlertCircle,
  XCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Building2,
  UserCheck
} from "lucide-react";
import api from "../../services/api";

const STATUS_STYLES = {
  Active: "bg-[#d9f8e5] text-[#006b38] border border-[#a2ebd0]",
  Confirmed: "bg-[#d9f8e5] text-[#006b38] border border-[#a2ebd0]",
  Pending: "bg-[#fff3cd] text-[#876700] border border-[#ffe69c]",
  Completed: "bg-blue-50 text-blue-700 border border-blue-200",
  Declined: "bg-[#fee2e2] text-[#b42318] border border-[#fecdcd]",
};

export default function PlaygroundSchedule() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

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

      const response = await api.get(`/playground/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        const rawReqs = response.data.data || [];
        
        // Map backend playground requests into clean schedule items
        const mapped = rawReqs.map(r => {
          const s = (r.status || '').toUpperCase();
          const tStatus = (r.tournament_status || '').toUpperCase();

          let displayStatus = 'Pending';
          if (tStatus === 'COMPLETED') {
            displayStatus = 'Completed';
          } else if (s === 'APPROVED' || s === 'ACCEPTED') {
            displayStatus = 'Active';
          } else if (s === 'REJECTED' || s === 'DECLINED' || s === 'CANCELLED') {
            displayStatus = 'Declined';
          }

          return {
            id: r.request_id || r.tournament_id,
            tournament: r.tournament_title || 'National Elle Championship',
            venue: r.location || 'Official Playground Venue',
            date: r.tournament_held_date || r.start_date || '2026-08-28',
            time: 'Full Day Match Schedule',
            role: 'Official Ground Venue',
            organizer: r.organizer_name || 'Elle Sports Association',
            contact: r.contact_number || '0778975961',
            status: displayStatus,
            initiatedBy: r.initiated_by
          };
        });

        setScheduleItems(mapped);
      } else {
        throw new Error(response.data.message || "Failed to query ground schedule.");
      }
    } catch (err) {
      console.error("Error fetching ground schedule:", err);
      setError(err.response?.data?.message || err.message || "Could not load ground schedule.");
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

  const activeCount = scheduleItems.filter(
    (item) => item.status === "Active" || item.status === "Confirmed"
  ).length;

  const pendingCount = scheduleItems.filter(
    (item) => item.status === "Pending"
  ).length;

  const completedCount = scheduleItems.filter(
    (item) => item.status === "Completed"
  ).length;

  const declinedCount = scheduleItems.filter(
    (item) => item.status === "Declined"
  ).length;

  // Helper to parse Date Box (e.g., "28 AUG")
  const getParsedDateBadge = (dateStr) => {
    if (!dateStr || dateStr === 'TBD') return { day: 'TBD', month: 'TBD' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '28', month: 'AUG' };
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
      return { day, month };
    } catch (e) {
      return { day: '28', month: 'AUG' };
    }
  };

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Ground Hosting Schedule
        </h1>
        <p className="mt-1 text-xs text-[#666666]">
          View your active, pending, and completed tournament venue bookings.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => setStatusFilter(statusFilter === "Active" ? "All" : "Active")}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
            statusFilter === "Active"
              ? "border-[#00382D] bg-emerald-50/40 ring-2 ring-[#00382D]/20"
              : "border-[#e5e5e5] bg-white hover:border-[#00382D]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#777777]">
                Active Tournaments
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-[#111111]">
                {activeCount}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "Pending" ? "All" : "Pending")}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
            statusFilter === "Pending"
              ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
              : "border-[#e5e5e5] bg-white hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#777777]">
                Pending Requests
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-[#111111]">
                {pendingCount}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 size={22} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "Completed" ? "All" : "Completed")}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
            statusFilter === "Completed"
              ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
              : "border-[#e5e5e5] bg-white hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#777777]">
                Completed
              </p>
              <h3 className="mt-1 text-3xl font-extrabold text-[#111111]">
                {completedCount}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Dropdown */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#666666]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#e5e5e5] bg-white py-2 px-3 text-xs font-bold text-[#111111] focus:border-[#00382D] focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="All">All Statuses ({scheduleItems.length})</option>
            <option value="Active">Active ({activeCount})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Completed">Completed ({completedCount})</option>
            <option value="Declined">Declined ({declinedCount})</option>
          </select>
        </div>
      </div>

      {/* Schedule Items List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading ground schedule...</p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <CalendarDays size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-[#111111]">
            No Ground Bookings Scheduled
          </h3>
          <p className="mt-1 text-xs text-[#666666]">
            There are no active match fixtures scheduled for this venue filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedule.map((item) => {
            const { day, month } = getParsedDateBadge(item.date);

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#00382D]/30 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  
                  {/* Left Column: Date Badge + Tournament Info */}
                  <div className="flex items-start gap-4">
                    
                    {/* Date Badge */}
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#00382D] text-white shadow-xs">
                      <span className="text-lg font-extrabold leading-none">
                        {day}
                      </span>
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-90">
                        {month}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#111111] group-hover:text-[#00382D] transition-colors">
                          {item.tournament}
                        </h3>
                      </div>

                      <p className="text-xs text-[#666666] font-medium">
                        Organized by: <span className="text-[#111111] font-bold">{item.organizer}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#666666]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CalendarDays size={14} className="text-[#00382D]" />
                          Held Date: {item.date}
                        </span>

                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-[#00382D]" />
                          Venue: {item.venue}
                        </span>

                        <span className="flex items-center gap-1.5 font-medium">
                          <Phone size={14} className="text-[#00382D]" />
                          Contact: {item.contact}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status + View Details */}
                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 md:border-t-0 md:pt-0 md:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {(item.status || 'PENDING').toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1 rounded-full border border-[#00382D] px-4 py-1.5 text-xs font-bold text-[#00382D] transition-all hover:bg-[#00382D] hover:text-white cursor-pointer"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Popup Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#00382D]">
                <Trophy size={20} />
                <h3 className="font-bold text-base text-[#111111]">Venue Booking Details</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#e5e5e5] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Tournament Title</span>
                <h4 className="text-sm font-bold text-[#111111]">{selectedItem.tournament}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase text-[#888888] block">Organized By</span>
                  <span className="font-bold text-[#111111] block mt-0.5">{selectedItem.organizer}</span>
                </div>
                <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase text-[#888888] block">Contact Number</span>
                  <span className="font-bold text-[#111111] block mt-0.5">{selectedItem.contact}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase text-[#888888] block">Ground Venue</span>
                  <span className="font-bold text-[#111111] block mt-0.5">{selectedItem.venue}</span>
                </div>
                <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase text-[#888888] block">Held Date</span>
                  <span className="font-bold text-[#111111] block mt-0.5">{selectedItem.date}</span>
                </div>
              </div>

              <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#888888]">Booking Status</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${STATUS_STYLES[selectedItem.status]}`}>
                  {selectedItem.status.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors cursor-pointer shadow-sm"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
