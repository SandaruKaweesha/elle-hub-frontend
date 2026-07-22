import React, { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  SlidersHorizontal,
  Trophy,
  Phone,
  AlertCircle,
  CheckCircle2,
  X,
  XCircle,
  Building2,
  BadgeDollarSign
} from "lucide-react";
import api from "../../services/api";

const STATUS_STYLES = {
  Active: "bg-[#d9f8e5] text-[#006b38] border border-[#a2ebd0]",
  Confirmed: "bg-[#d9f8e5] text-[#006b38] border border-[#a2ebd0]",
  Pending: "bg-[#fff3cd] text-[#876700] border border-[#ffe69c]",
  Completed: "bg-blue-50 text-blue-700 border border-blue-200",
  Declined: "bg-[#fee2e2] text-[#b42318] border border-[#fecdcd]",
};

export default function SponsorSchedule() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

      const response = await api.get(`/sponsor/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        const rawReqs = response.data.data || [];
        
        // Map backend sponsor requests into clean schedule items
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
            venue: r.location || 'Sri Lanka Venue',
            date: r.tournament_held_date || r.start_date || '2026-08-28',
            time: 'Official Sponsored Event',
            role: 'Official Tournament Sponsor',
            organizer: r.organizer_name || 'Elle Sports Association',
            contact: r.contact_number || 'Available on Request',
            status: displayStatus,
            initiatedBy: r.initiated_by
          };
        });

        setScheduleItems(mapped);
      } else {
        throw new Error(response.data.message || "Failed to query sponsorship schedule.");
      }
    } catch (err) {
      console.error("Error fetching sponsor schedule:", err);
      setError(err.response?.data?.message || err.message || "Could not load sponsorship schedule.");
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
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      return matchesStatus;
    });
  }, [scheduleItems, statusFilter]);

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
          Sponsorship Schedule
        </h1>
        <p className="mt-1 text-xs text-[#666666]">
          View your active, pending, and completed tournament sponsorships.
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
                Active Sponsorships
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
          <p className="text-[#666666] font-medium text-sm">Loading sponsorship schedule...</p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00382D]/10 text-[#00382D]">
            <Trophy size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#111111]">
            No Sponsorship Items Found
          </h3>
          <p className="mt-1 text-xs text-[#666666]">
            There are no tournament sponsorships found for this filter.
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

                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-[#111111] group-hover:text-[#00382D] transition-colors">
                        {item.tournament}
                      </h2>
                      <p className="text-xs text-[#666666] font-medium">
                        Organized by: <strong className="text-[#00382D]">{item.organizer}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666] pt-1">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} className="text-[#00382D]" />
                          Held Date: {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-[#00382D]" />
                          Venue: {item.venue}
                        </span>
                        <span className="flex items-center gap-1">
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
                <BadgeDollarSign size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">{selectedItem.tournament}</h3>
                <p className="text-xs text-[#666666]">Sponsorship Details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#333333]">
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Organizer:</span>
                <span className="font-bold text-[#111111]">{selectedItem.organizer}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Venue Location:</span>
                <span className="font-bold text-[#111111]">{selectedItem.venue}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Scheduled Date:</span>
                <span className="font-bold text-[#111111]">{selectedItem.date}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Contact Telephone:</span>
                <span className="font-bold text-[#111111]">{selectedItem.contact}</span>
              </div>
              <div className="p-3 bg-[#f8f7f4] rounded-xl flex justify-between">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="font-bold uppercase text-[#00382D]">{selectedItem.status}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#00382D] text-white rounded-xl text-xs font-bold hover:bg-[#002a22]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
