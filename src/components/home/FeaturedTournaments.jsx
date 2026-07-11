import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import TournamentCard from "./TournamentCard";

function FeaturedTournaments() {
  const tournaments = [
    {
      image: "/images/tournament-1.png",
      imagePosition: "center 42%",
      title: "Grand Premier Cup",
      date: "Started July 12, 2026",
      prize: "Prize: $50,000 USD",
      status: "Live",
      buttonText: "Watch Stream",
    },
    {
      image: "/images/tournament-2.png",
      imagePosition: "center 38%",
      title: "Elite Masters 2026",
      date: "Nov 05, 2026",
      prize: "Prize: $12,500 USD",
      status: "Upcoming",
      buttonText: "Register Team",
    },
    {
      image: "/images/tournament-3.png",
      imagePosition: "center 45%",
      title: "Regional Open III",
      date: "Dec 18, 2026",
      prize: "Prize: $8,000 USD",
      status: "Upcoming",
      buttonText: "Register Team",
    },
  ];

  return (
    <section className="bg-white px-4 md:px-[60px] py-10 md:py-[70px] font-['Poppins']">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[32px] font-bold text-[#111513]">
              Featured Tournaments
            </h2>

            <div className="mt-2 h-[3px] w-[68px] bg-[#c9a227]" />
          </div>

          <Link
            to="/tournaments"
            className="flex items-center gap-2 text-[14px] font-medium text-[#111513] hover:text-[#08733e]"
          >
            View All Brackets
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.title}
              {...tournament}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedTournaments;