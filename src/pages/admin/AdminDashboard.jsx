import { useState, useEffect } from "react";
import api from "../../services/api";
import { 
  Calendar,
  Download,
  Users,
  Activity,
  ClipboardList,
  Shield,
  BadgeDollarSign,
  AlertCircle,
  UserPlus,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
  Maximize2,
  FileBarChart,
  Settings
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    TOTAL: 0,
    TEAM: 0,
    REFEREE: 0,
    SPONSOR: 0,
    PLAYGROUND: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats');
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-['Inter',sans-serif]">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111111] tracking-tight">Management Console</h1>
          <p className="text-gray-500 text-sm mt-1">Precision oversight for the elite sports circuit.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={16} className="text-gray-500" />
            Sept 15 - Oct 15
          </button>
          <button className="flex items-center gap-2 bg-[#014731] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#023827] transition-colors shadow-sm">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        
        {/* Total Users */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.TOTAL}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-2">
            <Activity size={14} />
            <span>Updated just now</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <Users size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Teams</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.TEAM}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[#014731] font-medium text-xs mt-2">
            <Shield size={14} />
            <span>Active records</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <Activity size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Referees */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Referees</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.REFEREE}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[#014731] font-medium text-xs mt-2">
            <Users size={14} />
            <span>Up to date</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <Shield size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Sponsors */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sponsors</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.SPONSOR}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-2">
            <BadgeDollarSign size={14} />
            <span>Stable growth</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <BadgeDollarSign size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Playgrounds */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Playgrounds</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.PLAYGROUND}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-2">
            <ClipboardList size={14} />
            <span>Verified venues</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <ClipboardList size={110} strokeWidth={1.5} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Tournament Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">Tournament Growth</h2>
                <p className="text-sm text-gray-500 mt-1">Participation trends over the last 6 months</p>
              </div>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors">
                This Year
              </button>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-[240px] w-full flex items-end justify-between gap-2 px-2">
              {[40, 50, 45, 75, 48, 65, 55, 58, 45, 80, 75, 85].map((height, i) => (
                <div key={i} className="w-full relative flex justify-center group">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${i === 3 ? 'bg-[#059669]' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-gray-400 px-2">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Pending Approvals Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#111111]">Pending Approvals</h2>
              <button className="text-sm font-medium text-[#059669] hover:text-[#047857]">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Name / Event</th>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">Tournament</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111111]">Emerald Elite Open</div>
                      <div className="text-xs text-gray-500 mt-0.5">Regional Soccer - Tier 1</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Oct 12, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        Needs Review
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[#059669] font-semibold text-sm hover:underline">View</button>
                        <button className="bg-[#111111] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-black/80 transition-colors">Approve</button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded uppercase tracking-wider">User</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111111]">Marcus Sterling</div>
                      <div className="text-xs text-gray-500 mt-0.5">Certified Referee Application</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Oct 11, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        In Queue
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[#059669] font-semibold text-sm hover:underline">View</button>
                        <button className="bg-[#111111] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-black/80 transition-colors">Approve</button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">Tournament</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111111]">Coastal Masters '23</div>
                      <div className="text-xs text-gray-500 mt-0.5">Basketball Charity Event</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Oct 10, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-orange-500 font-medium text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Urgent
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[#059669] font-semibold text-sm hover:underline">View</button>
                        <button className="bg-[#111111] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-black/80 transition-colors">Approve</button>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* System Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111111]">System Alerts</h2>
              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
            </div>

            <div className="space-y-6">
              {/* Alert 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 mt-1">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Server Latency Detected</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Primary database in Region East is experiencing high response times.</p>
                  <span className="text-[10px] font-semibold text-gray-400 mt-2 block">2 mins ago</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 mt-1">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">New Referee Application</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">David Miller has submitted a Tier 2 referee certification for review.</p>
                  <span className="text-[10px] font-semibold text-gray-400 mt-2 block">15 mins ago</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 mt-1">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Sponsorship Payout</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Payout of $2,500 processed for 'Coastal Masters' tournament sponsors.</p>
                  <span className="text-[10px] font-semibold text-gray-400 mt-2 block">1 hour ago</span>
                </div>
              </div>

              {/* Alert 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-1">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Maintenance Scheduled</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">System update v2.4.1 scheduled for Oct 18 at 02:00 AM UTC.</p>
                  <span className="text-[10px] font-semibold text-gray-400 mt-2 block">4 hours ago</span>
                </div>
              </div>

            </div>

            <button className="w-full mt-6 text-sm font-semibold text-gray-500 hover:text-[#111111] flex items-center justify-center gap-2 transition-colors">
              View All Notifications
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Management Tools */}
          <div className="bg-[#014731] rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-white mb-6">Management<br/>Tools</h3>
            
            <div className="space-y-3">
              {/* Tool 1 */}
              <button className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <FileBarChart size={20} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">Generate Reports</h4>
                    <p className="text-green-100/60 text-xs mt-0.5">Automated system analytics</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-green-100/60 group-hover:text-white transition-colors" />
              </button>

              {/* Tool 2 */}
              <button className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">Review Approvals</h4>
                    <p className="text-green-100/60 text-xs mt-0.5">Pending user requests</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-green-100/60 group-hover:text-white transition-colors" />
              </button>

              {/* Tool 3 */}
              <button className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">System Settings</h4>
                    <p className="text-green-100/60 text-xs mt-0.5">Manage platform config</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-green-100/60 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Global Presence Map Placeholder */}
      <div className="bg-gray-400 rounded-xl overflow-hidden relative min-h-[260px] flex items-center">
        {/* Mock Map Image Background - using a placeholder pattern */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/80 to-transparent"></div>
        
        <div className="relative z-10 p-8 max-w-md text-white">
          <h2 className="text-xl font-bold mb-3">Global Presence</h2>
          <p className="text-sm text-gray-100 mb-8 leading-relaxed">The Elle Hub is currently active in 14 countries, managing over 200+ local sports facilities and organizations.</p>
          
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-extrabold mb-1">14</div>
              <div className="text-xs uppercase tracking-wider text-gray-200 font-semibold">Regions</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold mb-1">2.1k</div>
              <div className="text-xs uppercase tracking-wider text-gray-200 font-semibold">Teams</div>
            </div>
          </div>
        </div>

        <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-lg text-white transition-colors">
          <Maximize2 size={20} />
        </button>
      </div>

    </div>
  );
}

export default AdminDashboard;
