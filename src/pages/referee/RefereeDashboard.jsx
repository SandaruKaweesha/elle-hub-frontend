import { 
  CalendarDays, 
  AlertCircle, 
  Star, 
  Trophy, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin
} from "lucide-react";

function RefereeDashboard() {
  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#6af8a6] flex items-center justify-center text-[#004a25]">
              <CalendarDays size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00783f] bg-[#eaf1ec] px-2 py-1 rounded">+2 This Week</span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-medium mb-1">Upcoming Matches</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">08</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#b6facf] flex items-center justify-center text-[#004a25]">
              <AlertCircle size={20} />
            </div>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">New</span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-medium mb-1">New Requests</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">03</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center text-[#C99C4E]">
              <Star size={20} fill="currentColor" />
            </div>
            <span className="text-[11px] font-bold text-[#00783f]">Top 5%</span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-medium mb-1">Average Rating</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-extrabold text-[#111111]">4.9</h3>
              <div className="flex text-[#C99C4E] pb-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#6af8a6] flex items-center justify-center text-[#004a25]">
              <Trophy size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00783f]">Lifetime</span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-medium mb-1">Tournaments</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">124</h3>
          </div>
        </div>

      </div>

      {/* Main Grid: Assignments and Pending/Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Confirmed Assignments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#111111]">Confirmed Assignments</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e5e5] text-[#555555] hover:bg-gray-50">
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e5e5] text-[#555555] hover:bg-gray-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Match 1 */}
            <div className="bg-[#f8f9f8] rounded-xl p-5 flex items-center gap-6">
              <div className="w-[60px] h-[65px] bg-[#111111] text-white rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-bold leading-none">24</span>
                <span className="text-[10px] tracking-wider mt-1 text-[#aaaaaa]">OCT</span>
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-medium text-[#333333] mb-2">Colombo Lions vs. Kandy Kings</h4>
                <div className="flex items-center gap-4 text-xs text-[#666666] font-medium mb-3">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> 14:30 PM</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> Sugathadasa Stadium</span>
                </div>
                <span className="inline-block px-3 py-1 bg-[#6af8a6] text-[#004a25] text-[10px] font-bold rounded-full">
                  Main Referee
                </span>
              </div>
              <div>
                <button className="px-5 py-2 border border-[#00783f] text-[#00783f] text-xs font-bold rounded-lg hover:bg-[#eaf1ec] transition-colors">
                  Detail
                </button>
              </div>
            </div>

            {/* Match 2 */}
            <div className="bg-[#f8f9f8] rounded-xl p-5 flex items-center gap-6">
              <div className="w-[60px] h-[65px] bg-[#e0e0e0] text-[#333333] rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-bold leading-none">26</span>
                <span className="text-[10px] tracking-wider mt-1 text-[#666666]">OCT</span>
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-medium text-[#333333] mb-2">Galle Gladiators vs. Jaffna Stars</h4>
                <div className="flex items-center gap-4 text-xs text-[#666666] font-medium mb-3">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> 09:00 AM</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> Galle Int. Stadium</span>
                </div>
                <span className="inline-block px-3 py-1 bg-[#b6facf] text-[#004a25] text-[10px] font-bold rounded-full">
                  Assistant Referee
                </span>
              </div>
              <div>
                <button className="px-5 py-2 border border-[#00783f] text-[#00783f] text-xs font-bold rounded-lg hover:bg-[#eaf1ec] transition-colors">
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Pending Requests Dark Card */}
          <div className="bg-[#05140e] rounded-xl p-6 text-white shadow-md">
            <h2 className="text-lg font-bold mb-5">Pending Requests</h2>
            
            <div className="space-y-4">
              <div className="bg-[#0b2118] border border-[#1a3a2a] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm">National Elle Finals</h4>
                  <span className="bg-[#00783f] text-[9px] px-2 py-0.5 rounded font-bold">URGENT</span>
                </div>
                <p className="text-[11px] text-[#aaaaaa] mb-4 leading-relaxed">
                  Nov 02 • Colombo • <br/> Championship Game
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#00783f] hover:bg-[#005a2f] text-white text-xs font-bold py-2 rounded transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 bg-transparent border border-[#335544] hover:bg-[#1a3a2a] text-[#cccccc] text-xs font-bold py-2 rounded transition-colors">
                    Reject
                  </button>
                </div>
              </div>

              <div className="bg-[#0b2118] border border-[#1a3a2a] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm">Inter-School Q1</h4>
                  <span className="bg-[#333333] text-[9px] px-2 py-0.5 rounded font-bold text-[#aaaaaa]">PENDING</span>
                </div>
                <p className="text-[11px] text-[#aaaaaa] mb-4 leading-relaxed">
                  Nov 05 • Negombo • Junior Div
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#00783f] hover:bg-[#005a2f] text-white text-xs font-bold py-2 rounded transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 bg-transparent border border-[#335544] hover:bg-[#1a3a2a] text-[#cccccc] text-xs font-bold py-2 rounded transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Official Performance Card */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#111111] mb-6">Official<br/>Performance</h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#333333] mb-2">
                  <span>Fair Play Score</span>
                  <span className="text-[#00783f]">98%</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00783f] w-[98%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#333333] mb-2">
                  <span>Decision Accuracy</span>
                  <span className="text-[#00783f]">94%</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00783f] w-[94%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#333333] mb-2">
                  <span>Fitness Index</span>
                  <span className="text-[#00783f]">87%</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00783f] w-[87%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Tournament History */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#111111]">Recent Tournament History</h2>
          <button className="text-xs font-bold text-[#00783f] hover:underline">
            View Full Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-3 font-bold text-[#333333] w-[25%]">Tournament</th>
                <th className="pb-3 font-bold text-[#333333] w-[15%]">Date</th>
                <th className="pb-3 font-bold text-[#333333] w-[20%]">Venue</th>
                <th className="pb-3 font-bold text-[#333333] w-[15%]">Final Score</th>
                <th className="pb-3 font-bold text-[#333333] w-[15%]">Rating</th>
                <th className="pb-3 font-bold text-[#333333] w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody>
              
              <tr className="border-b border-[#f0f0f0] hover:bg-[#fafbfa] transition-colors">
                <td className="py-4 pr-4">
                  <p className="font-bold text-[#111111] text-[13px]">Western Province Open</p>
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  Oct 12, 2024
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  Municipal Grounds
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  12 - 08
                </td>
                <td className="py-4 text-[#C99C4E] flex pt-5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                </td>
                <td className="py-4">
                  <span className="inline-block px-3 py-1 bg-[#e5e5e5] text-[#555555] text-[9px] font-bold rounded-full tracking-wider">
                    COMPLETED
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#fafbfa] transition-colors">
                <td className="py-4 pr-4">
                  <p className="font-bold text-[#111111] text-[13px]">Under-19 Regional Finals</p>
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  Oct 05, 2024
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  Police Park
                </td>
                <td className="py-4 text-[#666666] text-[13px]">
                  05 - 06
                </td>
                <td className="py-4 text-[#C99C4E] flex pt-5">
                  {[1,2,3,4].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  <Star size={12} className="text-[#e5e5e5]" />
                </td>
                <td className="py-4">
                  <span className="inline-block px-3 py-1 bg-[#e5e5e5] text-[#555555] text-[9px] font-bold rounded-full tracking-wider">
                    COMPLETED
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default RefereeDashboard;
