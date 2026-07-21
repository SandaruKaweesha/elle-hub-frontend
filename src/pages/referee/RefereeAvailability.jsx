import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Moon,
  Save,
  Sun,
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trophy,
  MapPin,
  Clock,
  X
} from "lucide-react";

import AvailabilityCalendar from "../../components/referee/AvailabilityCalendar";
import api from "../../services/api";

const TIME_SLOTS = [
  {
    id: "08-10",
    startTime: "08:00",
    endTime: "10:00",
    label: "08:00 AM - 10:00 AM",
    icon: Sun,
  },
  {
    id: "10-12",
    startTime: "10:00",
    endTime: "12:00",
    label: "10:00 AM - 12:00 PM",
    icon: Sun,
  },
  {
    id: "12-14",
    startTime: "12:00",
    endTime: "14:00",
    label: "12:00 PM - 02:00 PM",
    icon: Sun,
  },
  {
    id: "14-16",
    startTime: "14:00",
    endTime: "16:00",
    label: "02:00 PM - 04:00 PM",
    icon: Moon,
  },
  {
    id: "16-18",
    startTime: "16:00",
    endTime: "18:00",
    label: "04:00 PM - 06:00 PM",
    icon: Moon,
  },
];

const EMPTY_SLOTS = {
  "08-10": false,
  "10-12": false,
  "12-14": false,
  "14-16": false,
  "16-18": false,
};

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
          const dateKey = row.available_date;
          const isAvailable = row.status === 'AVAILABLE';
          availMap[dateKey] = {
            "08-10": isAvailable,
            "10-12": isAvailable,
            "12-14": isAvailable,
            "14-16": isAvailable,
            "16-18": isAvailable,
          };
        });

        // Also mark assigned tournament dates as unavailable in map
        assigned.forEach(t => {
          if (t.assigned_date) {
            availMap[t.assigned_date] = {
              "08-10": false,
              "10-12": false,
              "12-14": false,
              "14-16": false,
              "16-18": false,
            };
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

  const selectedDateAvailability = availabilityByDate[selectedDateKey] || EMPTY_SLOTS;

  const selectedSlots = TIME_SLOTS.filter(
    (slot) => selectedDateAvailability[slot.id]
  );

  const unavailableSlots = TIME_SLOTS.filter(
    (slot) => !selectedDateAvailability[slot.id]
  );

  const formattedDate = useMemo(() => {
    return format(selectedDate, "EEEE, MMMM d, yyyy");
  }, [selectedDate]);

  function updateSelectedDateSlots(updatedSlots) {
    setSavedMessage("");
    setAvailabilityByDate((previous) => ({
      ...previous,
      [selectedDateKey]: updatedSlots,
    }));
  }

  function toggleSlot(slotId) {
    if (assignedForSelectedDate) return; // Prevent toggling if assigned to tournament
    updateSelectedDateSlots({
      ...selectedDateAvailability,
      [slotId]: !selectedDateAvailability[slotId],
    });
  }

  function selectPreset(preset) {
    if (assignedForSelectedDate) return;

    if (preset === "morning") {
      updateSelectedDateSlots({
        "08-10": true,
        "10-12": true,
        "12-14": false,
        "14-16": false,
        "16-18": false,
      });
    }

    if (preset === "evening") {
      updateSelectedDateSlots({
        "08-10": false,
        "10-12": false,
        "12-14": false,
        "14-16": true,
        "16-18": true,
      });
    }

    if (preset === "fullDay") {
      updateSelectedDateSlots({
        "08-10": true,
        "10-12": true,
        "12-14": true,
        "14-16": true,
        "16-18": true,
      });
    }

    if (preset === "clear") {
      updateSelectedDateSlots({ ...EMPTY_SLOTS });
    }
  }

  function handlePreviousMonth() {
    setCurrentMonth((previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1));
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setSavedMessage("");
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  const availableDateKeys = Object.entries(availabilityByDate)
    .filter(([, slots]) => Object.values(slots).some(Boolean))
    .map(([dateKey]) => dateKey);

  return (
    <div className="space-y-6 pb-10 font-['Poppins']">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Referee Officiating Availability
        </h1>
        <p className="mt-1 text-sm text-[#777777]">
          Manage your availability schedule. Assigned tournament dates automatically mark you as unavailable for officiating.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center justify-between">
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
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Calendar */}
        <section className="rounded-2xl border border-[#dfe4e1] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#102019]">
              Availability Calendar
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              Dates with confirmed tournament assignments are automatically marked as Officiating Duty.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-[#dde2df] bg-[#fafbf9] px-4 py-3 text-xs text-[#444444]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#66f49a]" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#00884a] bg-[#d9f8e5]" />
              Selected date
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Tournament Officiating Duty
            </span>
          </div>

          {/* Custom calendar */}
          <AvailabilityCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            availableDateKeys={availableDateKeys}
            onSelectDate={handleSelectDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Selected Date Summary & Tournament Status */}
          <div className="mt-5 rounded-2xl bg-[#eef8f2] p-5 border border-[#d2ebe0]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00783f]">
              Selected Date Summary
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
                  ⚠️ Status automatically set to <strong>UNAVAILABLE</strong> in database for officiating duty.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#00783f]">
                    Available slots
                  </p>

                  {selectedSlots.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSlots.map((slot) => (
                        <p
                          key={slot.id}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#234b39] border border-emerald-100 shadow-2xs"
                        >
                          ✓ {slot.label}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6b746f]">
                      No available slots selected.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#777777]">
                    Not available
                  </p>

                  <div className="space-y-2">
                    {unavailableSlots.map((slot) => (
                      <p
                        key={slot.id}
                        className="rounded-lg bg-white/70 px-3 py-2 text-xs text-[#777777] border border-gray-100"
                      >
                        {slot.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Side Panel: Confirmed Officiating Tournaments List */}
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
                {assignedTournaments.map((t, idx) => (
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