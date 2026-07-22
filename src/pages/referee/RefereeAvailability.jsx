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
  Check
} from "lucide-react";

import AvailabilityCalendar from "../../components/referee/AvailabilityCalendar";
import api from "../../services/api";

function RefereeAvailability() {
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

      const res = await api.get(`/referee/${userId}/availability-calendar`);
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
      console.error("Fetch availability calendar error:", err);
      setErrorMessage("Could not query referee availability calendar.");
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

  const handleUpdateAvailabilityStatus = async (newStatus) => {
    if (!userId || assignedForSelectedDate) return;

    try {
      setSaveLoading(true);
      setSavedMessage("");
      setErrorMessage("");

      const res = await api.post("/referee/availability/save", {
        refereeUserId: userId,
        availableDate: selectedDateKey,
        status: newStatus
      });

      if (res.data && res.data.success !== false) {
        setSavedMessage(`Availability updated to ${newStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}!`);
        setAvailabilityByDate(prev => ({
          ...prev,
          [selectedDateKey]: newStatus
        }));
      } else {
        throw new Error(res.data.message || "Failed to update availability.");
      }
    } catch (err) {
      console.error("Save availability error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Could not update availability.");
    } finally {
      setSaveLoading(false);
    }
  };

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

  const availableDateKeys = Object.entries(availabilityByDate)
    .filter(([, status]) => status === 'AVAILABLE')
    .map(([dateKey]) => dateKey);

  return (
    <div className="space-y-6 pb-10 font-['Poppins']">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Set Availability
        </h1>
        <p className="mt-1 text-sm text-[#777777]">
          Select dates on the calendar to mark your availability status in the database.
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
              Availability Calendar
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              Confirmed tournament assignments automatically reserve dates in the database as Unavailable.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-[#dde2df] bg-[#fafbf9] px-4 py-3 text-xs text-[#444444]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#c9a227] bg-[#fff7d8]" />
              Selected Date
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Unavailable
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Tournament Duty
            </span>
          </div>

          {/* Custom calendar */}
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

          {/* Selected Date Summary & Database Status Toggle */}
          <div className="mt-5 rounded-2xl bg-[#eef8f2] p-5 border border-[#d2ebe0]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00783f]">
              Selected Date Availability Control
            </p>

            <h3 className="mt-1 text-lg font-bold text-[#102019]">
              {formattedDate}
            </h3>

            {assignedForSelectedDate ? (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                  <Trophy size={18} className="text-amber-600" />
                  <span>Assigned to Tournament</span>
                </div>
                <p className="font-semibold text-[#111111]">{assignedForSelectedDate.tournament_title}</p>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin size={13} /> {assignedForSelectedDate.location || 'Sri Lanka'}
                </p>
                <p className="text-[11px] font-medium text-amber-700 pt-1 border-t border-amber-200/60">
                  ⚠️ Status set to <strong>UNAVAILABLE</strong> in database for officiating duty.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-gray-500 font-medium">Database Status for {selectedDateKey}:</span>
                  <span className={`px-3 py-1 font-bold text-[11px] uppercase rounded-lg border ${
                    selectedDateStatus === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedDateStatus === 'UNAVAILABLE'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {selectedDateStatus === 'AVAILABLE' ? 'Available' : selectedDateStatus === 'UNAVAILABLE' ? 'Unavailable' : 'Unset (Default)'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateAvailabilityStatus('AVAILABLE')}
                    disabled={saveLoading || selectedDateStatus === 'AVAILABLE'}
                    className="flex-1 py-3 px-4 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserCheck size={16} />
                    )}
                    Mark as Available
                  </button>

                  <button
                    onClick={() => handleUpdateAvailabilityStatus('UNAVAILABLE')}
                    disabled={saveLoading || selectedDateStatus === 'UNAVAILABLE'}
                    className="flex-1 py-3 px-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserX size={16} />
                    )}
                    Mark as Unavailable
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Side Panel: Confirmed Officiating Duties */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-[#dfe4e1] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#102019] mb-1 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#00382D]" />
              Confirmed Tournament Duties
            </h2>
            <p className="text-xs text-[#777777] mb-4">
              Tournaments where your officiating role is confirmed.
            </p>

            {assignedTournaments.length === 0 ? (
              <div className="p-6 text-center bg-[#fafbf9] rounded-xl border border-[#e8ece9]">
                <Trophy size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-bold text-gray-700">No Confirmed Officiating Duties</p>
                <p className="text-[11px] text-gray-500 mt-0.5">When you accept an organizer invitation or your request is approved, tournament dates will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTournaments.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#111111]">{t.tournament_title}</h4>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        Unavailable
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555555] flex items-center gap-1">
                      <MapPin size={12} className="text-[#00382D]" /> {t.location || 'Sri Lanka'}
                    </p>
                    <p className="text-[11px] text-[#00382D] font-bold flex items-center gap-1">
                      <CalendarIcon size={12} /> {t.assigned_date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RefereeAvailability;