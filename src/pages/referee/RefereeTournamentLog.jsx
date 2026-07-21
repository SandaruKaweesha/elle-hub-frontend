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

  }

export default RefereeTournamentLog;
