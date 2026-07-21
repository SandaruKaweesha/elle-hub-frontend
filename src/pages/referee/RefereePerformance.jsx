import {
  Award,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";

const PERFORMANCE_AREAS = [
  { label: "Rule Accuracy", value: 96 },
  { label: "Decision Making", value: 93 },
  { label: "Match Control", value: 95 },
  { label: "Communication", value: 91 },
  { label: "Punctuality", value: 98 },
];

const RECENT_RESULTS = [
  {
    tournament: "National Elle Championship",
    role: "Main Referee",
    date: "18 Jun 2026",
    matches: 5,
    rating: 4.9,
  },
  {
    tournament: "Western Province Open",
    role: "Assistant Referee",
    date: "24 May 2026",
    matches: 3,
    rating: 4.7,
  },
  {
    tournament: "Inter-School Elle Cup",
    role: "Main Referee",
    date: "12 Apr 2026",
    matches: 4,
    rating: 4.8,
  },
];

const FEEDBACK = [
  {
    id: 1,
    author: "Sri Lanka Elle Federation",
    tournament: "National Elle Championship",
    comment:
      "Excellent match control and clear communication throughout the final round.",
    rating: 5,
  },
  {
    id: 2,
    author: "Western Province Sports Council",
    tournament: "Western Province Open",
    comment:
      "Consistent decisions and professional coordination with the officiating team.",
    rating: 4,
  },
];

function RefereePerformance() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
            Performance
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            Track your officiating ratings, strengths, and organizer feedback.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#d9f8e5] px-4 py-2 text-xs font-bold text-[#006b38]">
          <TrendingUp size={15} /> Top 5% of referees
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Overall Rating" value="4.9" detail="Out of 5.0" icon={Star} />
        <MetricCard label="Matches Officiated" value="18" detail="This season" icon={ShieldCheck} />
        <MetricCard label="Tournaments" value="4" detail="This season" icon={Trophy} />
        <MetricCard label="Completion Rate" value="100%" detail="No missed assignments" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-[#e2e6e3] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Performance Breakdown</h2>
              <p className="mt-1 text-xs text-[#777777]">
                Based on organizer and assessor evaluations
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#071b14] text-[#6af8a6]">
              <Award size={20} />
            </div>
          </div>

          <div className="space-y-5">
            {PERFORMANCE_AREAS.map((area) => (
              <div key={area.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-[#333333]">{area.label}</span>
                  <span className="font-bold text-[#00783f]">{area.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf1ef]">
                  <div
                    className="h-full rounded-full bg-[#00783f]"
                    style={{ width: `${area.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[#071b14] p-6 text-white shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#88a398]">
            Season Summary
          </p>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-6xl font-black">4.9</span>
            <span className="mb-2 text-sm text-[#aabbb4]">/ 5.0</span>
          </div>
          <div className="mt-3 flex gap-1 text-[#f2bd4d]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={19} fill="currentColor" />
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#b8c7c1]">
            Your rating increased by 0.2 points compared with last season. Your
            strongest area is punctuality.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl font-extrabold">36</p>
              <p className="mt-1 text-xs text-[#88a398]">Total evaluations</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">34</p>
              <p className="mt-1 text-xs text-[#88a398]">Positive reviews</p>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e2e6e3] bg-white shadow-sm">
        <div className="border-b border-[#e2e6e3] px-6 py-5">
          <h2 className="text-lg font-bold text-[#111111]">Recent Results</h2>
          <p className="mt-1 text-xs text-[#777777]">Performance by tournament</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#f8faf9] text-xs uppercase tracking-wide text-[#777777]">
              <tr>
                <th className="px-6 py-4 font-semibold">Tournament</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 text-center font-semibold">Matches</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ee]">
              {RECENT_RESULTS.map((result) => (
                <tr key={result.tournament} className="hover:bg-[#fbfcfb]">
                  <td className="px-6 py-4 text-sm font-bold text-[#111111]">{result.tournament}</td>
                  <td className="px-6 py-4 text-sm text-[#666666]">{result.date}</td>
                  <td className="px-6 py-4 text-sm text-[#444444]">{result.role}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-[#111111]">{result.matches}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#8b6914]">
                      <Star size={14} fill="currentColor" /> {result.rating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText size={20} className="text-[#00783f]" />
          <h2 className="text-lg font-bold text-[#111111]">Recent Feedback</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FEEDBACK.map((feedback) => (
            <article key={feedback.id} className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">{feedback.author}</h3>
                  <p className="mt-1 text-xs text-[#777777]">{feedback.tournament}</p>
                </div>
                <div className="flex text-[#d59b28]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      fill={star <= feedback.rating ? "currentColor" : "none"}
                      className={star <= feedback.rating ? "" : "text-[#d8ddda]"}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#555f5a]">“{feedback.comment}”</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#e2e6e3] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#777777]">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#111111]">{value}</p>
          <p className="mt-1 text-xs text-[#8a928e]">{detail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9f8e5] text-[#00783f]">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default RefereePerformance;
