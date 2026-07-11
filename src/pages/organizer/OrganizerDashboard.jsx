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
  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Management Console</h1>
          <p className="text-[#666666] text-sm mt-1">Precision oversight for the elite sports circuit.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00382D] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#002a22] transition-colors shadow-sm">
          <PlusCircle size={18} />
          New Tournament
        </button>
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
            <div className="text-[40px] font-extrabold text-[#111111] leading-none mb-4">0</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#888888]">
              <TrendingUp size={16} />
              <span>No data available</span>
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
            <div className="text-[40px] font-extrabold text-[#111111] leading-none mb-4">0</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#08733e]">
              <AlertCircle size={16} />
              <span>Up to date</span>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Upcoming Tournaments */}
          <div className="bg-white rounded-[16px] border border-[#e5e5e5] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#111111]">Upcoming Tournaments</h2>
              <button className="text-sm font-medium text-[#666666] hover:text-[#111111]">View All</button>
            </div>
            
            <div className="divide-y divide-[#e5e5e5]">
              
              {/* Empty State */}
              <div className="p-8 text-center flex flex-col items-center justify-center text-[#888888]">
                <p className="text-sm font-medium">No upcoming tournaments</p>
                <p className="text-xs mt-1">Create a new tournament to get started.</p>
              </div>

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
                  
                  {/* Empty State */}
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm font-medium text-[#888888]">
                      No pending requests at the moment.
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column - Side Panels */}
        <div className="flex flex-col gap-6">
          
          {/* Management Tools */}
          <div className="bg-[#00382D] rounded-[16px] p-6 text-white shadow-md relative overflow-hidden">
             <div className="absolute -right-8 -bottom-8 opacity-10">
               <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
             </div>
            <h2 className="text-xl font-bold mb-6 relative z-10">Management<br/>Tools</h2>
            
            <div className="flex flex-col gap-3 relative z-10">
              
              <button className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center justify-between group border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <Zap size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm">Generate Match Draw</h4>
                    <p className="text-xs text-white/60 mt-0.5">Automated bracket creation</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </button>

              <button className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center justify-between group border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <Edit size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm">Update Results</h4>
                    <p className="text-xs text-white/60 mt-0.5">Real-time scoring input</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </button>

              <button className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center justify-between group border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="text-[#4ade80]">
                    <Radio size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm">Live Broadcast Hub</h4>
                    <p className="text-xs text-white/60 mt-0.5">Manage stream overlays</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </button>

            </div>
          </div>

          {/* System Integrity */}
          <div className="bg-white rounded-[16px] p-6 border border-[#e5e5e5] shadow-sm">
            <h2 className="text-[15px] font-bold text-[#111111] mb-6">System Integrity</h2>
            
            <div className="space-y-5">
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

          {/* Recent Activity */}
          <div className="bg-white rounded-[16px] p-6 border border-[#e5e5e5] shadow-sm">
            <h2 className="text-[15px] font-bold text-[#111111] mb-6">Recent Activity</h2>
            
            <div className="flex flex-col gap-4 text-sm">
              
              {/* Empty State */}
              <div className="text-center py-4 text-[#888888]">
                <p className="text-sm font-medium">No recent activity</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default OrganizerDashboard;
