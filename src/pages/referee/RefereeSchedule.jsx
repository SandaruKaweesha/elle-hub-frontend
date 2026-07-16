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

const STATUS_STYLES = {
  Confirmed: "bg-[#d9f8e5] text-[#006b38]",
  Pending: "bg-[#fff3cd] text-[#876700]",
  Completed: "bg-[#e9eceb] text-[#59625e]",
};

