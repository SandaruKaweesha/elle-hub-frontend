import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Moon,
  Save,
  Sun,
} from "lucide-react";

import AvailabilityCalendar from "../../components/referee/AvailabilityCalendar";

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [currentMonth, setCurrentMonth] = useState(
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    )
  );

  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [savedMessage, setSavedMessage] = useState("");

  const selectedDateKey = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const selectedDateAvailability =
    availabilityByDate[selectedDateKey] || EMPTY_SLOTS;

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
    updateSelectedDateSlots({
      ...selectedDateAvailability,
      [slotId]: !selectedDateAvailability[slotId],
    });
  }

  function selectPreset(preset) {
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
    setCurrentMonth((previousMonth) => {
      return new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() - 1,
        1
      );
    });
  }

  function handleNextMonth() {
    setCurrentMonth((previousMonth) => {
      return new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() + 1,
        1
      );
    });
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setSavedMessage("");

    setCurrentMonth(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  }

  function handleSave() {
    const selectedSlots = TIME_SLOTS.filter(
      (slot) => selectedDateAvailability[slot.id]
    ).map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "AVAILABLE",
      
    }));
    setSavedMessage("Availability saved for this date.");

    const availabilityData = {
      date: selectedDateKey,
      slots: selectedSlots,
    };

    console.log("Availability data:", availabilityData);
  }

  const availableDateKeys = Object.entries(availabilityByDate)
    .filter(([, slots]) => Object.values(slots).some(Boolean))
    .map(([dateKey]) => dateKey);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Set Availability
        </h1>

        <p className="mt-1 text-sm text-[#777777]">
          Select a date from the calendar and choose the hours you are available.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Calendar */}
        <section className="rounded-xl border border-[#dfe4e1] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#102019]">
              Availability Calendar
            </h2>

            <p className="mt-1 text-sm text-[#777777]">
              Green dates already contain at least one available time slot.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-4 rounded-lg border border-[#dde2df] bg-[#fafbf9] px-4 py-3 text-xs text-[#444444]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#66f49a]" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#00884a] bg-[#d9f8e5]" />
              Selected date
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#c7ceca] bg-[#e8ece9]" />
              No availability
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

          <div className="mt-5 rounded-xl bg-[#eef8f2] p-5">
  <p className="text-xs font-semibold uppercase tracking-wide text-[#00783f]">
    Selected date
  </p>

  <h3 className="mt-2 text-xl font-bold text-[#102019]">
    {formattedDate}
  </h3>

  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
    {/* Available slots */}
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#00783f]">
        Available slots
      </p>

      {selectedSlots.length > 0 ? (
        <div className="space-y-2">
          {selectedSlots.map((slot) => (
            <p
              key={slot.id}
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#234b39]"
            >
              ✓ {slot.label}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#6b746f]">
          No time slots selected.
        </p>
      )}
    </div>

    {/* Unavailable slots */}
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#777777]">
        Not available
      </p>

      <div className="space-y-2">
        {unavailableSlots.map((slot) => (
          <p
            key={slot.id}
            className="rounded-lg bg-white/70 px-3 py-2 text-xs text-[#777777]"
          >
            {slot.label}
          </p>
        ))}
      </div>
    </div>
  </div>
</div>
        </section>

        {/* Time slot panel */}
        <aside className="self-start overflow-hidden rounded-xl border border-[#dfe4e1] bg-white shadow-sm xl:sticky xl:top-6">
          <div className="border-b border-[#e5e5e5] p-5">
            <h2 className="text-2xl font-bold text-[#102019]">
              {format(selectedDate, "EEEE")}
            </h2>

            <p className="mt-1 text-sm text-[#555555]">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>

          <div className="space-y-6 p-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#666666]">
                Quick presets
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectPreset("morning")}
                  className="rounded-lg border border-[#cfd6d2] px-3 py-3 text-sm font-semibold hover:border-[#00884a] hover:bg-[#eef9f3]"
                >
                  Morning
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset("evening")}
                  className="rounded-lg border border-[#cfd6d2] px-3 py-3 text-sm font-semibold hover:border-[#00884a] hover:bg-[#eef9f3]"
                >
                  Evening
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset("fullDay")}
                  className="rounded-lg border border-[#cfd6d2] px-3 py-3 text-sm font-semibold hover:border-[#00884a] hover:bg-[#eef9f3]"
                >
                  Full Day
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset("clear")}
                  className="rounded-lg border border-[#cfd6d2] px-3 py-3 text-sm font-semibold hover:border-red-300 hover:bg-red-50"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#666666]">
                Specific hourly slots
              </p>

              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => {
                  const Icon = slot.icon;
                  const isAvailable =
                    selectedDateAvailability[slot.id];

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => toggleSlot(slot.id)}
                     className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
  isAvailable
    ? "border-[#66f49a] bg-[#66f49a] text-[#063b2b]"
    : "border-[#d5dbd7] bg-white text-[#333333] hover:bg-[#f7f9f8]"
}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon size={20} className="shrink-0" />

                        <span className="text-sm font-medium">
                          {slot.label}
                        </span>
                      </span>

                      <span
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          isAvailable ? "bg-[#00783f]" : "bg-[#c8d0cc]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                            isAvailable
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] bg-[#f8f9f8] p-5">
            <button
              type="button"
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d9b52e] px-5 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#c7a31d] active:scale-[0.98]"
            >
              <Save size={19} />
              Save Availability
            </button>

            {savedMessage && (
              <p className="mt-3 text-center text-xs font-semibold text-[#00783f]">
                {savedMessage}
              </p>
            )}

            <p className="mt-3 text-center text-[10px] text-[#777777]">
              Organizers will see these slots when assigning matches.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RefereeAvailability;