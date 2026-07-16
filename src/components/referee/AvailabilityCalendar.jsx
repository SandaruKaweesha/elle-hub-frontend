import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AvailabilityCalendar({
  currentMonth,
  selectedDate,
  availableDateKeys,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}) {
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay();
    const numberOfDays = lastDayOfMonth.getDate();

    const previousMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let index = startDayIndex - 1; index >= 0; index -= 1) {
      days.push({
        date: new Date(year, month - 1, previousMonthLastDay - index),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= numberOfDays; day += 1) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Fill remaining calendar cells to 42
    let nextMonthDay = 1;

    while (days.length < 42) {
      days.push({
        date: new Date(year, month + 1, nextMonthDay),
        isCurrentMonth: false,
      });

      nextMonthDay += 1;
    }

    return days;
  }, [currentMonth]);

  function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function isSameDay(firstDate, secondDate) {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  const today = new Date();

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#dfe4e1] bg-white">
      {/* Calendar heading */}
      <div className="flex items-center justify-between border-b border-[#e5e9e6] px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dedb] bg-white text-[#333333] shadow-sm transition hover:bg-[#eef8f2] active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-xl font-bold text-[#102019] sm:text-2xl">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dedb] bg-white text-[#333333] shadow-sm transition hover:bg-[#eef8f2] active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week headings */}
      <div className="grid grid-cols-7 border-b border-[#e5e9e6] bg-[#f8f9f8]">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[11px] font-bold uppercase tracking-wide text-[#777777] sm:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }) => {
          const dateKey = getDateKey(date);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isAvailable = availableDateKeys.includes(dateKey);

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onSelectDate(date)}
              className={`
                relative
                min-h-[70px]
                border-b
                border-r
                border-[#e5e9e6]
                p-2
                text-left
                transition-all
                sm:min-h-[92px]
                sm:p-3

                ${
                  isCurrentMonth
                    ? "bg-white text-[#222222] hover:bg-[#eef8f2]"
                    : "bg-[#fafbfa] text-[#bdc4c0] hover:bg-[#f4f6f5]"
                }

                ${
                  isSelected
                    ? "z-10 bg-[#fff7d8] ring-2 ring-inset ring-[#c9a227]"
                    : ""
                }
              `}
            >
              <span
                className={`
                  inline-flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-full
                  px-2
                  text-sm
                  font-semibold

                  ${
                    isToday
                      ? "bg-[#00783f] text-white"
                      : isSelected
                        ? "text-[#8a6900]"
                        : ""
                  }
                `}
              >
                {date.getDate()}
              </span>

              {isAvailable && (
                <span className="absolute bottom-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#00a85a]" />
              )}

              {isSelected && (
                <span className="absolute bottom-2 right-2 rounded-full bg-[#c9a227] px-2 py-0.5 text-[8px] font-bold uppercase text-white sm:text-[9px]">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AvailabilityCalendar;