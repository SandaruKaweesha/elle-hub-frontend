import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trophy,
  MapPin,
  Clock,
  X,
  UserCheck,
  UserX,
  Check,
  Building2
} from "lucide-react";

import AvailabilityCalendar from "../../components/referee/AvailabilityCalendar";
import api from "../../services/api";

export default function PlaygroundAvailability() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [assignedTournaments, setAssignedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedDateKey = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  // Check if selected date has an assigned tournament
  const assignedForSelectedDate = useMemo(() => {
    return assignedTournaments.find(t => t.assigned_date === selectedDateKey);
  }, [assignedTournaments, selectedDateKey]);

  // Fetch real availability & tournament assignments from backend
  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get(`/playground/${userId}/availability-calendar`);
      if (res.data && res.data.success !== false) {
        const data = res.data.data || {};
        const assigned = data.assignedTournaments || [];
        setAssignedTournaments(assigned);

        // Map database availability entries
        const dbAvail = data.availability || [];
        const availMap = {};

        dbAvail.forEach(row => {
          availMap[row.available_date] = row.status || 'AVAILABLE';
        });

        // Also mark assigned tournament dates as UNAVAILABLE
        assigned.forEach(t => {
          if (t.assigned_date) {
            availMap[t.assigned_date] = 'UNAVAILABLE';
          }
        });

        setAvailabilityByDate(availMap);
      }
    } catch (err) {
      console.error("Fetch playground availability calendar error:", err);
      setErrorMessage("Could not query playground availability calendar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAvailabilityData();
    }
  }, [userId]);

  const selectedDateStatus = availabilityByDate[selectedDateKey] || "AVAILABLE";

  const formattedDate = useMemo(() => {
    return format(selectedDate, "EEEE, MMMM d, yyyy");
  }, [selectedDate]);

  function handlePreviousMonth() {
    setCurrentMonth((previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1));
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setSavedMessage("");
    setErrorMessage("");
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  const availableDateKeys = useMemo(() => {
    return Object.entries(availabilityByDate)
      .filter(([, status]) => status === 'AVAILABLE')
      .map(([dateKey]) => dateKey);
  }, [availabilityByDate]);

  const handleUpdateAvailabilityStatus = async (newStatus) => {
    if (!userId || assignedForSelectedDate) return;

    try {
      setSaveLoading(true);
      setSavedMessage("");
      setErrorMessage("");

      const res = await api.post("/playground/availability/save", {
        playgroundUserId: userId,
        availableDate: selectedDateKey,
        status: newStatus
      });

      if (res.data && res.data.success !== false) {
        const text = newStatus === 'AVAILABLE' ? 'Available' : 'Unavailable / Booked';
        setSavedMessage(`Ground status for ${format(selectedDate, "MMM d, yyyy")} updated to ${text}!`);
        setAvailabilityByDate(prev => ({
          ...prev,
          [selectedDateKey]: newStatus
        }));
      } else {
        throw new Error(res.data.message || "Failed to update availability.");
      }
    } catch (err) {
      console.error("Save playground availability error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Could not update ground availability.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Set Ground Availability
        </h1>
        <p className="mt-1 text-sm text-[#777777]">
          Select dates on the calendar to mark ground availability status for upcoming tournaments.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {savedMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-200 flex items-center gap-2 shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        
        {/* Calendar Section */}
        <section className="rounded-2xl border border-[#dfe4e1] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#102019]">
              Ground Availability Calendar
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              Confirmed tournament venue reservations automatically reserve dates in the database as Unavailable.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-[#dde2df] bg-[#fafbf9] px-4 py-3 text-xs text-[#444444]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#c9a227] bg-[#fff7d8]" />
              Selected Date
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Unavailable / Booked
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Tournament Reserved
            </span>
          </div>

          {/* Custom calendar */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500 font-medium">Loading ground availability calendar...</p>
            </div>
          ) : (
            <AvailabilityCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              availableDateKeys={availableDateKeys}
              availabilityByDate={availabilityByDate}
              assignedTournaments={assignedTournaments}
              onSelectDate={handleSelectDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          )}

          {/* Selected Date Summary & Database Status Toggle */}
          <div className="mt-5 rounded-2xl bg-[#eef8f2] p-5 border border-[#d2ebe0]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00783f]">
              Selected Date Availability Control
            </p>

            <h3 className="mt-1 text-lg font-bold text-[#102019]">
              {formattedDate}
            </h3>

            {assignedForSelectedDate ? (
              <div className="mt-3 flex items-[#102019] text-xs font-medium gap-2 bg-amber-100 p-3 rounded-xl border border-amber-300 text-amber-900">
                <Trophy size={16} className="shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <strong>Tournament Venue Reserved:</strong> Reserved for "{assignedForSelectedDate.tournament_title}".
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={saveLoading || selectedDateStatus === "AVAILABLE"}
                  onClick={() => handleUpdateAvailabilityStatus("AVAILABLE")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    selectedDateStatus === "AVAILABLE"
                      ? "bg-[#00382D] text-white"
                      : "border border-[#00382D] bg-white text-[#00382D] hover:bg-[#eef8f2]"
                  }`}
                >
                  <UserCheck size={16} />
                  Mark as Available
                </button>

                <button
                  type="button"
                  disabled={saveLoading || selectedDateStatus === "UNAVAILABLE"}
                  onClick={() => handleUpdateAvailabilityStatus("UNAVAILABLE")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    selectedDateStatus === "UNAVAILABLE"
                      ? "bg-[#d9534f] text-white"
                      : "border border-[#d9534f] bg-white text-[#d9534f] hover:bg-red-50"
                  }`}
                >
                  <UserX size={16} />
                  Mark as Unavailable / Booked
                </button>
              </div>
            )}

            {savedMessage && (
              <div className="mt-4 p-3 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-200" />
                  <span>{savedMessage}</span>
                </div>
                <button onClick={() => setSavedMessage("")} className="text-white/80 hover:text-white cursor-pointer ml-2">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Info Sidebar */}
        <aside className="space-y-6">
          {/* Status Info Card */}
          <div className="rounded-2xl border border-[#dfe4e1] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#102019] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-[#00382D]" /> Date Status Overview
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#00382D]/10 text-[#00382D] flex items-center justify-center shrink-0 font-bold">
                  <Check size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111]">Available Date</h4>
                  <p className="text-gray-500 mt-0.5">Green calendar days indicate ground is open for hosting requests.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  <Trophy size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111]">Tournament Reserved</h4>
                  <p className="text-gray-500 mt-0.5">Amber calendar days indicate venue is reserved for confirmed tournaments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reserved Tournaments List */}
          <div className="rounded-2xl border border-[#dfe4e1] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#102019] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-[#00382D]" /> Confirmed Venue Bookings ({assignedTournaments.length})
            </h3>

            {assignedTournaments.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-[#f8f9f8] p-4 rounded-xl border border-gray-100">
                No confirmed tournament bookings on schedule yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {assignedTournaments.map((t, idx) => (
                  <div key={idx} className="p-3 bg-[#f8f9f8] border border-[#e5e9e6] rounded-xl text-xs space-y-1">
                    <div className="font-bold text-[#111111]">{t.tournament_title}</div>
                    <div className="text-[11px] text-[#666666] flex items-center gap-1">
                      <Clock size={12} className="text-[#00382D]" /> Date: <strong>{t.assigned_date || 'TBD'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>

    </div>
  );
}
