import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  History,
  MapPin,
  Search,
  Star,
  Trophy,
} from "lucide-react";

const TOURNAMENT_LOG = [
  {
    id: 1,
    tournament: "National Elle Championship",
    date: "2026-06-18",
    venue: "Sugathadasa Stadium, Colombo",
    role: "Main Referee",
    matches: 5,
    rating: 4.9,
    status: "Completed",
  },
  {
    id: 2,
    tournament: "Western Province Open",
    date: "2026-05-24",
    venue: "Municipal Grounds, Colombo",
    role: "Assistant Referee",
    matches: 3,
    rating: 4.7,
    status: "Completed",
  },
  {
    id: 3,
    tournament: "Inter-School Elle Cup",
    date: "2026-04-12",
    venue: "Police Park, Colombo",
    role: "Main Referee",
    matches: 4,
    rating: 4.8,
    status: "Completed",
  },
  {
    id: 4,
    tournament: "Southern Province Open",
    date: "2026-03-08",
    venue: "Galle Sports Complex",
    role: "Main Referee",
    matches: 6,
    rating: 5,
    status: "Completed",
  },
];

function RefereeTournamentLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredLog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return TOURNAMENT_LOG.filter((item) => {
      const matchesSearch =
        item.tournament.toLowerCase().includes(query) ||
        item.venue.toLowerCase().includes(query);
      const matchesRole = roleFilter === "All" || item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchTerm]);

  const totalMatches = TOURNAMENT_LOG.reduce(
    (total, item) => total + item.matches,
    0
  );
  const averageRating = (
    TOURNAMENT_LOG.reduce((total, item) => total + item.rating, 0) /
    TOURNAMENT_LOG.length
  ).toFixed(1);

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Tournament Log
        </h1>
        <p className="mt-1 text-sm text-[#777777]">
          Review your completed tournaments and officiating history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Tournaments"
          value={TOURNAMENT_LOG.length}
          icon={Trophy}
        />
        <SummaryCard
          label="Matches Officiated"
          value={totalMatches}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Average Rating"
          value={averageRating}
          icon={Star}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#e2e6e3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[430px]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tournament or venue"
            className="h-11 w-full rounded-lg border border-[#d6dcd8] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#00783f] focus:ring-2 focus:ring-[#00783f]/15"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="h-11 rounded-lg border border-[#d6dcd8] bg-white px-4 text-sm font-medium text-[#333333] outline-none focus:border-[#00783f]"
        >
          <option value="All">All Roles</option>
          <option value="Main Referee">Main Referee</option>
          <option value="Assistant Referee">Assistant Referee</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e2e6e3] bg-white shadow-sm">
        {filteredLog.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-[#e2e6e3] bg-[#f8faf9] text-xs uppercase tracking-wide text-[#777777]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tournament</th>
                  <th className="px-6 py-4 font-semibold">Date & Venue</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 text-center font-semibold">Matches</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {filteredLog.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[#fbfcfb]">
                    <td className="px-6 py-5">
                      <p className="font-bold text-[#111111]">{item.tournament}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#777777]">
                        <History size={13} /> Tournament #{item.id}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#5f6763]">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-[#00783f]" />
                        {formatDate(item.date)}
                      </p>
                      <p className="mt-2 flex items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-[#00783f]" />
                        {item.venue}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-[#333333]">
                      {item.role}
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-[#111111]">
                      {item.matches}
                    </td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-1 text-sm font-bold text-[#8b6914]">
                        <Star size={15} fill="currentColor" /> {item.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-[#d9f8e5] px-3 py-1 text-xs font-bold text-[#006b38]">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <History size={34} className="text-[#a7b0ab]" />
            <h2 className="mt-3 font-bold text-[#111111]">No log entries found</h2>
            <p className="mt-1 text-sm text-[#777777]">
              Try changing your search or role filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium text-[#777777]">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-[#111111]">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d9f8e5] text-[#00783f]">
        <Icon size={21} />
      </div>
    </div>
  );
}

export default RefereeTournamentLog;
