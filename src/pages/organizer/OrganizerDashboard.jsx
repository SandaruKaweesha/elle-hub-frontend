import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { 
  PlusCircle, 
  Award, 
  Hourglass, 
  Activity,
  Zap,
  Edit,
  Radio,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const organizerId = user?.userId || user?.id;

        if (organizerId) {
          const response = await api.get(`/organizer/${organizerId}/tournaments`);
          if (response.data && response.data.success !== false) {
            setTournaments(response.data.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const upcomingTournaments = tournaments.filter(t => t.approval_status !== 'PENDING' && t.approval_status !== 'REJECTED');
  const pendingRequests = tournaments.filter(t => t.approval_status === 'PENDING' || t.approval_status === 'REJECTED');

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Management Console</h1>
          <p className="text-[#666666] text-sm mt-1">Precision oversight for the elite sports circuit.</p>
        </div>
        <Link 
          to="/organizer/tournaments/create"
          className="flex items-center gap-2 bg-[#00382D] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#002a22] transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          New Tournament
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Stat 1 */}
        <div className="bg-white rounded-[16px] p-6 border border-[#e5e5e5] shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-gray-50 opacity-50">
            <Award size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Total Tournaments</h3>
            <div className="text-[40px] font-extrabold text-[#111111] leading-none mb-4">{loading ? '...' : tournaments.length}</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#888888]">
              <TrendingUp size={16} />
              <span>{loading ? 'Loading...' : 'Total created'}</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-[16px] p-6 border border-[#e5e5e5] shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-gray-50 opacity-50">
            <Hourglass size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Pending Requests</h3>
            <div className="text-[40px] font-extrabold text-[#111111] leading-none mb-4">{loading ? '...' : pendingRequests.length}</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#08733e]">
              <AlertCircle size={16} />
              <span>{pendingRequests.length === 0 ? 'Up to date' : 'Needs attention'}</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-[16px] p-6 border border-[#e5e5e5] shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-gray-50 opacity-50">
            <Activity size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Active Matches</h3>
            <div className="text-[40px] font-extrabold text-[#111111] leading-none mb-4">0</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#888888]">
              <Zap size={16} />
              <span>No active matches</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6">
        
        {/* Upcoming Tournaments */}
          <div className="bg-white rounded-[16px] border border-[#e5e5e5] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#111111]">Upcoming Tournaments</h2>
              <button className="text-sm font-medium text-[#666666] hover:text-[#111111]">View All</button>
            </div>
            
            <div className="divide-y divide-[#e5e5e5]">
              {loading ? (
                <div className="p-8 text-center text-[#888888]">Loading...</div>
              ) : upcomingTournaments.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-[#888888]">
                  <p className="text-sm font-medium">No upcoming tournaments</p>
                  <p className="text-xs mt-1">Create a new tournament to get started.</p>
                </div>
              ) : (
                upcomingTournaments.map(t => (
                  <div key={t.tournament_id || t.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-[#111111]">{t.title}</h4>
                      <p className="text-sm text-[#666666] mt-1">{t.start_date} to {t.end_date} • {t.location}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Approved
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests Table */}
          <div className="bg-white rounded-[16px] border border-[#e5e5e5] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#111111]">Pending Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f7f4] text-xs font-semibold text-[#888888] uppercase border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Target Event</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm font-medium text-[#888888]">Loading...</td>
                    </tr>
                  ) : pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm font-medium text-[#888888]">
                        No pending requests at the moment.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map(t => (
                      <tr key={t.tournament_id || t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[#111111]">{t.title}</td>
                        <td className="px-6 py-4">Tournament</td>
                        <td className="px-6 py-4 text-[#666666]">{t.start_date}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            t.approval_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t.approval_status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* System Integrity - Landscape */}
        <div className="bg-white rounded-[16px] p-6 lg:p-8 border border-[#e5e5e5] shadow-sm">
          <h2 className="text-[15px] font-bold text-[#111111] mb-6">System Integrity</h2>
          
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                <span>Server Load</span>
                <span>Normal</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00382D] w-[35%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                <span>Payment Processing</span>
                <span>Active</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#4ade80] w-[95%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Landscape */}
        <div className="bg-white rounded-[16px] p-6 lg:p-8 border border-[#e5e5e5] shadow-sm">
          <h2 className="text-[15px] font-bold text-[#111111] mb-6">Recent Activity</h2>
          
          <div className="flex flex-col gap-4 text-sm">
            {/* Empty State */}
            <div className="text-center text-[#888888] py-12 bg-[#f8f7f4] rounded-xl border border-dashed border-[#d6d8d4]">
              <p className="text-sm font-medium">No recent activity</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrganizerDashboard;
