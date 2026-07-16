import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Save,
  Sun,
} from "lucide-react";

import "react-day-picker/style.css";

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

  const [availabilityByDate, setAvailabilityByDate] = useState({});

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

  function handleSave() {
    const selectedSlots = TIME_SLOTS.filter(
      (slot) => selectedDateAvailability[slot.id]
    ).map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "AVAILABLE",
    }));

    const availabilityData = {
      date: selectedDateKey,
      slots: selectedSlots,
    };

    console.log("Availability data:", availabilityData);
  }

  const availableDays = Object.entries(availabilityByDate)
    .filter(([, slots]) => Object.values(slots).some(Boolean))
    .map(([date]) => new Date(`${date}T00:00:00`));

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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

          <div className="calendar-wrapper overflow-x-auto rounded-xl border border-[#dfe4e1] p-3 sm:p-5">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              showOutsideDays
              modifiers={{
                available: availableDays,
              }}
              modifiersClassNames={{
                available: "availability-day",
              }}
              classNames={{
  root: "w-full",
  months: "flex w-full justify-center",
  month: "w-full",

  month_caption:
    "relative mb-6 flex items-center justify-center",

  caption_label:
    "text-xl sm:text-2xl font-bold text-[#102019]",

  nav:
    "absolute inset-x-0 top-0 flex justify-between",

  button_previous:
    "flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dedb] bg-white text-[#333333] shadow-sm transition hover:bg-[#eef8f2]",

  button_next:
    "flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dedb] bg-white text-[#333333] shadow-sm transition hover:bg-[#eef8f2]",

  month_grid:
    "w-full border-collapse",

  weekdays:
    "grid grid-cols-7 border-b border-[#dfe4e1] bg-[#f8f9f8]",

  weekday:
    "py-3 text-center text-xs font-bold uppercase tracking-wide text-[#777777]",

  weeks: "block",

  week:
    "grid grid-cols-7",

  day:
    "relative min-h-[70px] border-b border-r border-[#e5e9e6] sm:min-h-[88px]",

  day_button:
    "h-full min-h-[70px] w-full rounded-none text-base font-medium text-[#333333] transition hover:bg-[#eef8f2] sm:min-h-[88px]",

  selected:
    "bg-[#d9f8e5] text-[#005c31] ring-2 ring-inset ring-[#00884a]",

  today:
    "font-extrabold text-[#00884a] underline decoration-2 underline-offset-4",

  outside:
    "text-[#c2c8c4]",

  disabled:
    "cursor-not-allowed text-[#d1d5d3]",
}}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  ),
              }}
            />
          </div>

          <div className="mt-5 rounded-xl bg-[#eef8f2] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00783f]">
              Selected date
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#102019]">
              {formattedDate}
            </h3>

            <p className="mt-2 text-sm text-[#66706b]">
              Turn on the time slots you are available for this date.
            </p>
          </div>
        </section>

        {/* Time slot panel */}
        <aside className="overflow-hidden rounded-xl border border-[#dfe4e1] bg-white shadow-sm">
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
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
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
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RefereeAvailability;