import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Trophy,
  UserRoundCheck,
} from "lucide-react";

const SCHEDULE_ITEMS = [
  {
    id: 1,
    tournament: "Western Province Open",
    match: "Colombo Lions vs Kandy Kings",
    date: "2026-07-18",
    time: "09:00 AM",
    venue: "Municipal Grounds, Colombo",
    role: "Main Referee",
    status: "Confirmed",
  },
  {
    id: 2,
    tournament: "Inter-School Championship",
    match: "Royal College vs Ananda College",
    date: "2026-07-20",
    time: "02:30 PM",
    venue: "Sugathadasa Stadium",
    role: "Assistant Referee",
    status: "Confirmed",
  },
  {
    id: 3,
    tournament: "National Elle Finals",
    match: "Galle Warriors vs Jaffna Stars",
    date: "2026-07-24",
    time: "04:00 PM",
    venue: "Galle International Ground",
    role: "Main Referee",
    status: "Pending",
  },
  {
    id: 4,
    tournament: "District League 2026",
    match: "Badulla Eagles vs Monaragala Kings",
    date: "2026-07-10",
    time: "10:00 AM",
    venue: "Badulla Sports Complex",
    role: "Assistant Referee",
    status: "Completed",
  },
];

const STATUS_STYLES = {
  Confirmed: "bg-[#d9f8e5] text-[#006b38]",
  Pending: "bg-[#fff3cd] text-[#876700]",
  Completed: "bg-[#e9eceb] text-[#59625e]",
};

function RefereeSchedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredSchedule = useMemo(() => {
    return SCHEDULE_ITEMS.filter((item) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        item.tournament.toLowerCase().includes(searchValue) ||
        item.match.toLowerCase().includes(searchValue) ||
        item.venue.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const upcomingCount = SCHEDULE_ITEMS.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pendingCount = SCHEDULE_ITEMS.filter(
    (item) => item.status === "Pending"
  ).length;

  const completedCount = SCHEDULE_ITEMS.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          My Schedule
        </h1>

        <p className="mt-1 text-sm text-[#777777]">
          View your confirmed, pending, and completed match assignments.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Confirmed Matches
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {upcomingCount}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d9f8e5] text-[#00783f]">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Pending Requests
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {pendingCount}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fff3cd] text-[#9a7600]">
              <Clock3 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Completed Matches
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {completedCount}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf1ef] text-[#53615a]">
              <Trophy size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#e2e6e3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[420px]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tournament, match, or venue"
            className="h-11 w-full rounded-lg border border-[#d6dcd8] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#00783f] focus:ring-2 focus:ring-[#00783f]/15"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#666666]" />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-[#d6dcd8] bg-white px-4 text-sm font-medium text-[#333333] outline-none focus:border-[#00783f]"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-4">
        {filteredSchedule.length > 0 ? (
          filteredSchedule.map((item) => {
            const dateObject = new Date(`${item.date}T00:00:00`);

            return (
              <article
                key={item.id}
                className="rounded-xl border border-[#e2e6e3] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  {/* Date box */}
                  <div className="flex shrink-0 items-center gap-4 lg:block">
                    <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-xl bg-[#071b14] text-white">
                      <span className="text-2xl font-extrabold leading-none">
                        {dateObject.getDate()}
                      </span>

                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#b9c5bf]">
                        {dateObject.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div className="lg:hidden">
                      <p className="text-sm font-bold text-[#111111]">
                        {item.tournament}
                      </p>

                      <p className="mt-1 text-xs text-[#777777]">
                        {item.match}
                      </p>
                    </div>
                  </div>

                  {/* Main details */}
                  <div className="min-w-0 flex-1">
                    <div className="hidden lg:block">
                      <h2 className="text-lg font-bold text-[#111111]">
                        {item.tournament}
                      </h2>

                      <p className="mt-1 text-sm text-[#666666]">
                        {item.match}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#5f6763] sm:grid-cols-2 xl:grid-cols-3">
                      <p className="flex items-center gap-2">
                        <Clock3 size={16} className="text-[#00783f]" />
                        {item.time}
                      </p>

                      <p className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#00783f]"
                        />
                        <span>{item.venue}</span>
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRoundCheck
                          size={16}
                          className="text-[#00783f]"
                        />
                        {item.role}
                      </p>
                    </div>
                  </div>

                  {/* Status and action */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                        STATUS_STYLES[item.status]
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      className="min-w-[120px] rounded-lg border border-[#00783f] px-5 py-2.5 text-xs font-bold text-[#00783f] transition hover:bg-[#eaf6ef] active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[#cfd6d2] bg-white px-6 py-14 text-center">
            <CalendarDays
              size={36}
              className="mx-auto text-[#9aa49f]"
            />

            <h2 className="mt-4 text-lg font-bold text-[#222222]">
              No matches found
            </h2>

            <p className="mt-1 text-sm text-[#777777]">
              Try changing your search text or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RefereeSchedule;