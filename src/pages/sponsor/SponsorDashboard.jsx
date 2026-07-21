import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Calendar,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import api from "../../services/api";

function SponsorDashboard() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.user_id) {
      loadRequests();
    }
  }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get(`/sponsor/${user.user_id}/requests`);
      if (res.data && res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const handleRespond = async (tournamentId, status) => {
    try {
      const res = await api.post(`/tournament/${tournamentId}/sponsor-requests/respond`, {
        sponsorUserId: user.user_id,
        status
      });
      if (res.data && res.data.success) {
        loadRequests();
      }
    } catch (err) {
      console.error("Failed to respond", err);
    }
  };

  // Dummy data for presentation
  const analytics = {
    investment: "$245.8k",
    reach: "1.2M",
    impressions: "8.4M"
  };



  const sponsoredTournaments = [
    { id: 1, title: "Global Cup 2024", date: "June 15 - July 10", location: "International Arena", engagement: "450k Interactions", status: "92% Live", tag: "PRIME EVENT", bg: "bg-blue-900" },
    { id: 2, title: "Eastern Pro Series", date: "May 28 - June 04", location: "Madison Complex", reach: "220k Est.", status: "Starts in 3d", tag: "REGIONAL", bg: "bg-teal-900" }
  ];

  const history = [
    { id: 1, name: "Spring Masters Open", date: "Mar 01 - Mar 15, 2024", type: "MAIN SPONSOR", investment: "$45,000", status: "Completed" },
    { id: 2, name: "City Turf Festival", date: "Jan 12 - Jan 20, 2024", type: "BOOTH SPACE", investment: "$12,000", status: "Completed" },
    { id: 3, name: "Winter Gala Cup", date: "Dec 05 - Dec 15, 2023", type: "UNIFORM SPONSOR", investment: "$22,500", status: "Completed" }
  ];

  return (
    <div className="max-w-7xl mx-auto font-['Inter',sans-serif]">
      
      {/* Analytics & Impact Section */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <h2 className="text-xl font-bold text-[#111111]">Analytics & Impact</h2>
        <button className="text-sm font-semibold text-[#014731] hover:text-[#023827] flex items-center gap-1">
          View detailed report <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Investment Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[13px] font-semibold text-gray-400 mb-2">Total Investment</p>
          <h3 className="text-4xl font-extrabold text-[#014731]">{analytics.investment}</h3>
          <div className="flex items-center gap-1 mt-4 text-[#059669] text-xs font-semibold">
            <TrendingUp size={14} />
            <span>+12% vs last quarter</span>
          </div>
        </div>

        {/* Reach Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[13px] font-semibold text-gray-400 mb-2">Total Reach</p>
          <h3 className="text-4xl font-extrabold text-[#111111]">{analytics.reach}</h3>
          <div className="flex items-center gap-1 mt-4 text-[#059669] text-xs font-semibold">
            <Users size={14} />
            <span>Across 14 Tournaments</span>
          </div>
        </div>

        {/* Impressions Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[13px] font-semibold text-gray-400 mb-2">Brand Impressions</p>
          <h3 className="text-4xl font-extrabold text-[#059669]">{analytics.impressions}</h3>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-[#4ade80]/20 text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded-full">Social: 4.2M</span>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">In-Arena: 4.2M</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Requests and Tournaments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Requests Column */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#111111]">Requests</h2>
            <span className="bg-[#ef4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3 New</span>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 space-y-4">
              {requests.length === 0 ? (
                <div className="text-center text-xs text-gray-500 py-8">
                  No incoming requests.
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.tournament_id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#eaf1ec] flex items-center justify-center text-[#014731] shrink-0">
                        <Trophy size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-[#111111] leading-tight">{req.title}</h4>
                          {req.status === 'PENDING' && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{req.location} · <span className="font-semibold">{req.tournament_held_date}</span></p>
                        
                        {req.status === 'PENDING' ? (
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => handleRespond(req.tournament_id, 'ACCEPTED')}
                              className="flex-1 bg-[#014731] text-white text-xs font-bold py-2 rounded hover:bg-[#023827] transition-colors"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRespond(req.tournament_id, 'REJECTED')}
                              className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded hover:bg-gray-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Status: <span className={req.status === 'ACCEPTED' ? 'text-[#014731]' : 'text-red-500'}>{req.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full py-3 text-xs font-bold text-[#014731] border-t border-gray-100 hover:bg-gray-50 transition-colors mt-auto">
              View All Requests
            </button>
          </div>
        </div>

        {/* Sponsored Tournaments Column */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#111111]">Sponsored Tournaments</h2>
            <div className="flex gap-1">
              <button className="p-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {sponsoredTournaments.map(tournament => (
              <div key={tournament.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Mock Image Header */}
                <div className={`h-32 ${tournament.bg} relative p-3 flex flex-col justify-between`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                      {tournament.tag}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[15px] font-bold text-[#111111] truncate">{tournament.title}</h4>
                    <span className="text-xs font-bold text-[#059669]">{tournament.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-4">{tournament.date} · {tournament.location}</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-gray-400">{tournament.engagement ? 'Engagement' : 'Predicted Reach'}</span>
                      <span className="text-[#111111]">{tournament.engagement || tournament.reach}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4ade80] h-full rounded-full" style={{ width: tournament.engagement ? '75%' : '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* History Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#111111] mb-4">Sponsorship History</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-100">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tournament Name</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Range</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Investment</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={row.id} className={idx !== history.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                        <Trophy size={12} />
                      </div>
                      <span className="text-sm font-bold text-[#111111]">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-500 font-medium">{row.date}</td>
                  <td className="py-4 px-4">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-[#111111] text-right">{row.investment}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[#059669] text-xs font-bold">
                      <CheckCircle2 size={12} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default SponsorDashboard;
