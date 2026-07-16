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
        
    );
}