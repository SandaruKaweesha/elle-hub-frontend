import StatCard from "./StatCard";

function StatisticsSection() {
  const statistics = [
    {
      value: "150+",
      label: "Tournaments",
    },
    {
      value: "12k+",
      label: "Total Players",
      goldText: true,
    },
    {
      value: "8.5k",
      label: "Certificates",
      active: true,
    },
    {
      value: "45",
      label: "Partner Clubs",
      goldText: true,
    },
  ];

  return (
    <section className="bg-[#F7F6F3] px-4 md:px-[60px] py-10 md:py-[82px] font-['Poppins']">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {statistics.map((statistic) => (
            <StatCard
              key={statistic.label}
              value={statistic.value}
              label={statistic.label}
              goldText={statistic.goldText}
              active={statistic.active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatisticsSection;