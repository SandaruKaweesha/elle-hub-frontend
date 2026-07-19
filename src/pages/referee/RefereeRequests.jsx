import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  UserRoundCheck,
  X,
} from "lucide-react";

const INITIAL_REQUESTS = [
  {
    id: 1,
    tournament: "National Elle Championship",
    match: "Colombo Lions vs Kandy Kings",
    date: "2026-07-28",
    time: "09:00 AM - 11:00 AM",
    venue: "Sugathadasa Stadium, Colombo",
    role: "Main Referee",
    organizer: "Sri Lanka Elle Federation",
    status: "Pending",
    priority: "Urgent",
  },
  {
    id: 2,
    tournament: "Inter-School Elle Cup",
    match: "Royal College vs Ananda College",
    date: "2026-08-02",
    time: "02:30 PM - 04:30 PM",
    venue: "Municipal Grounds, Colombo",
    role: "Assistant Referee",
    organizer: "Western Schools Sports Association",
    status: "Pending",
    priority: "Normal",
  },
  {
    id: 3,
    tournament: "Southern Province Open",
    match: "Galle Warriors vs Matara Eagles",
    date: "2026-08-06",
    time: "04:00 PM - 06:00 PM",
    venue: "Galle Sports Complex",
    role: "Main Referee",
    organizer: "Southern Province Elle Council",
    status: "Accepted",
    priority: "Normal",
  },
];

const STATUS_STYLES = {
  Pending: "bg-[#fff3cd] text-[#876700]",
  Accepted: "bg-[#d9f8e5] text-[#006b38]",
  Declined: "bg-[#fee2e2] text-[#b42318]",
};

function RefereeRequests() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        request.tournament.toLowerCase().includes(searchValue) ||
        request.match.toLowerCase().includes(searchValue) ||
        request.organizer.toLowerCase().includes(searchValue) ||
        request.venue.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  function updateRequestStatus(requestId, newStatus) {
    setRequests((previousRequests) =>
      previousRequests.map((request) =>
        request.id === requestId
          ? { ...request, status: newStatus }
          : request
      )
    );

    console.log("Request updated:", {
      requestId,
      status: newStatus,
    });
  }

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "Accepted"
  ).length;

  const declinedCount = requests.filter(
    (request) => request.status === "Declined"
  ).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Match Requests
        </h1>

        <p className="mt-1 text-sm text-[#777777]">
          Review tournament invitations and accept or decline referee assignments.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                Accepted
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {acceptedCount}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d9f8e5] text-[#00783f]">
              <Check size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777]">
                Declined
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">
                {declinedCount}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fee2e2] text-[#c0392b]">
              <X size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#e2e6e3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[430px]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tournament, match, organizer, or venue"
            className="h-11 w-full rounded-lg border border-[#d6dcd8] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#00783f] focus:ring-2 focus:ring-[#00783f]/15"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-lg border border-[#d6dcd8] bg-white px-4 text-sm font-medium text-[#333333] outline-none focus:border-[#00783f]"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      {/* Request cards */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => {
            const dateObject = new Date(`${request.date}T00:00:00`);

            return (
              <article
                key={request.id}
                className="rounded-xl border border-[#e2e6e3] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  {/* Date */}
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
                      <h2 className="text-sm font-bold text-[#111111]">
                        {request.tournament}
                      </h2>

                      <p className="mt-1 text-xs text-[#777777]">
                        {request.match}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="hidden lg:block">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-[#111111]">
                          {request.tournament}
                        </h2>

                        {request.priority === "Urgent" && (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-red-600">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[#666666]">
                        {request.match}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#5f6763] sm:grid-cols-2 xl:grid-cols-3">
                      <p className="flex items-center gap-2">
                        <Clock3 size={16} className="text-[#00783f]" />
                        {request.time}
                      </p>

                      <p className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#00783f]"
                        />
                        <span>{request.venue}</span>
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRoundCheck
                          size={16}
                          className="text-[#00783f]"
                        />
                        {request.role}
                      </p>

                      <p className="flex items-start gap-2 sm:col-span-2 xl:col-span-3">
                        <ShieldCheck
                          size={16}
                          className="mt-0.5 shrink-0 text-[#00783f]"
                        />
                        <span>Requested by {request.organizer}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:min-w-[210px] lg:flex-col lg:items-stretch">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                        STATUS_STYLES[request.status]
                      }`}
                    >
                      {request.status}
                    </span>

                    {request.status === "Pending" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(request.id, "Accepted")
                          }
                          className="flex items-center justify-center gap-2 rounded-lg bg-[#00783f] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#005f32] active:scale-95"
                        >
                          <Check size={15} />
                          Accept
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(request.id, "Declined")
                          }
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 active:scale-95"
                        >
                          <X size={15} />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-[#00783f] px-5 py-2.5 text-xs font-bold text-[#00783f] transition hover:bg-[#eaf6ef]"
                      >
                        View Details
                      </button>
                    )}
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
              No requests found
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

export default RefereeRequests;