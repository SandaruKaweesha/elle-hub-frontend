import {
  CalendarDays,
  UsersRound,
  RefreshCw,
  BarChart3,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

import EcosystemCard from "./EcosystemCard";

function EcosystemSection() {
  const ecosystemSteps = [
    {
      step: "01",
      image: "/images/create-tournament.png",
      Icon: CalendarDays,
      title: "Create Tournament",
      description:
        "Organizers can create tournaments, define categories, set rules, and publish schedules.",
    },
    {
      step: "02",
      image: "/images/manage-fixtures.png",
      Icon: UsersRound,
      title: "Manage Fixtures",
      description:
        "Generate draws, assign teams, arrange matches, referees, and playgrounds.",
    },
    {
      step: "03",
      image: "/images/update-results.png",
      Icon: RefreshCw,
      title: "Update Results",
      description:
        "Referees and organizers can update match results and tournament progress.",
    },
    {
      step: "04",
      image: "/images/track-rankings.png",
      Icon: BarChart3,
      title: "Track Rankings",
      description:
        "Team rankings, match history, ratings, and tournament statistics stay updated.",
    },
    {
      step: "05",
      image: "/images/generate-certificates.png",
      Icon: BadgeCheck,
      title: "Generate Certificates",
      description:
        "Verified winners receive digital certificates with secure QR verification.",
    },
  ];

  return (
    <section className="bg-[#f8f7f4] px-[60px] py-[85px] font-['Poppins']">
      <div className="mx-auto max-w-[1500px]">
        
        <div className="text-center">
          <p className="text-[14px] font-semibold uppercase tracking-[2px] text-[#b18800]">
            Our Ecosystem
          </p>

          <h2 className="mt-3 text-[46px] font-extrabold tracking-[-1px] text-[#002c21]">
            How The Elle Hub Works
          </h2>

          <div className="mx-auto mt-4 h-[3px] w-[55px] bg-[#c9a227]" />

          <p className="mx-auto mt-6 max-w-[720px] text-[16px] leading-7 text-[#626965]">
            Our platform connects tournament organizers, teams, referees,
            sponsors, and playground managers through one simple workflow.
          </p>
        </div>

        {/* Thos Cards */}
        <div className="mt-[55px] grid grid-cols-5 gap-5">
          {ecosystemSteps.map((item, index) => (
            <div key={item.step} className="relative">
              <EcosystemCard {...item} />

              {index < ecosystemSteps.length - 1 && (
                <ArrowRight
                  size={24}
                  strokeWidth={1.8}
                  className="
                    absolute
                    right-[-22px]
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-[#26342f]
                  "
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EcosystemSection;