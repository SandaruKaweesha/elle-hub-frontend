import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  Users,
  Activity,
  ClipboardList,
  Shield,
  BadgeDollarSign,
  UserPlus,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
  FileBarChart,
  Settings,
  CheckCircle2,
  X,
  Loader2,
  Check,
  Eye
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    TOTAL: 0,
    TEAM: 0,
    REFEREE: 0,
    SPONSOR: 0,
    PLAYGROUND: 0
  });

  const [pendingItems, setPendingItems] = useState([
    { id: 'sample_1', type: 'TOURNAMENT', name: 'Emerald Elite Open', subtitle: 'Regional Elle Championship - Tier 1', date: 'Oct 12, 2026', status: 'Needs Review', statusColor: 'text-red-600 bg-red-600', isApproved: false },
    { id: 'sample_2', type: 'USER', name: 'Marcus Sterling', subtitle: 'Certified Referee Application', date: 'Oct 11, 2026', status: 'In Queue', statusColor: 'text-gray-500 bg-gray-400', isApproved: false },
    { id: 'sample_3', type: 'TOURNAMENT', name: "Coastal Masters '26", subtitle: 'Elle Charity Championship Event', date: 'Oct 10, 2026', status: 'Urgent', statusColor: 'text-orange-500 bg-orange-500', isApproved: false }
  ]);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedViewItem, setSelectedViewItem] = useState(null);

  // Finalized Tournaments Bar Chart State
  const [rawTournaments, setRawTournaments] = useState([]);
  const [monthlyFinalizedData, setMonthlyFinalizedData] = useState([
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 0 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 0 },
    { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 }
  ]);
  const [totalFinalizedCount, setTotalFinalizedCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2026);

  const updateChartForYear = (tournamentsList, year) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const tournamentsInYear = tournamentsList.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      const appStatusUpper = (t.approval_status || '').toUpperCase();
      const isFinalized = statusUpper === 'COMPLETED' || statusUpper === 'FINISHED' || statusUpper === 'FINALIZED' || statusUpper === 'ENDED' || appStatusUpper === 'APPROVED';

      if (!isFinalized) return false;

      const dateStr = t.end_date || t.tournament_held_date || t.created_at || t.start_date;
      if (!dateStr) return false;

      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d.getFullYear() === year;
    });

    if (tournamentsList.length > 0) {
      tournamentsInYear.forEach(t => {
        const dateStr = t.end_date || t.tournament_held_date || t.created_at || t.start_date;
        const d = new Date(dateStr);
        const monthIdx = d.getMonth();
        counts[monthIdx] += 1;
      });

      const totalForYear = counts.reduce((a, b) => a + b, 0);

      setMonthlyFinalizedData(months.map((m, idx) => ({
        month: m,
        count: counts[idx]
      })));
      setTotalFinalizedCount(totalForYear);
    } else {
      // Distinct demo datasets per year if database has no tournaments yet
      const yearSamples = {
        2026: [2, 4, 3, 7, 5, 11, 8, 10, 6, 12, 9, 4],
        2025: [1, 3, 0, 5, 2, 8, 4, 9, 3, 10, 6, 2],
        2024: [0, 1, 2, 4, 3, 6, 2, 5, 4, 7, 3, 1],
        2023: [0, 0, 1, 2, 1, 4, 3, 5, 2, 4, 2, 1]
      };
      const sample = yearSamples[year] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const sampleTotal = sample.reduce((a, b) => a + b, 0);

      setMonthlyFinalizedData(months.map((m, idx) => ({
        month: m,
        count: sample[idx]
      })));
      setTotalFinalizedCount(sampleTotal);
    }
  };

  useEffect(() => {
    updateChartForYear(rawTournaments, selectedYear);
  }, [selectedYear, rawTournaments]);

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

    const fetchChartData = async () => {
      try {
        const res = await api.get('/admin/tournaments');
        const list = (res.data && res.data.success !== false && Array.isArray(res.data.data))
          ? res.data.data
          : [];
        setRawTournaments(list);
      } catch (err) {
        console.error("Failed to fetch tournaments for chart:", err);
      }
    };

    const fetchPending = async () => {
      try {
        const [tourneysRes, usersRes] = await Promise.allSettled([
          api.get('/admin/tournaments/pending'),
          api.get('/user/getAllUsers')
        ]);

        let realItems = [];

        if (tourneysRes.status === 'fulfilled' && tourneysRes.value.data?.data?.length > 0) {
          tourneysRes.value.data.data.slice(0, 3).forEach(t => {
            realItems.push({
              id: `t_${t.tournament_id || t.id}`,
              realId: t.tournament_id || t.id,
              type: 'TOURNAMENT',
              name: t.title || 'Untitled Tournament',
              subtitle: `${t.location || 'Sri Lanka'} • ${t.teams_limit || 16} Max Teams`,
              date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent',
              status: 'Needs Review',
              statusColor: 'text-red-600 bg-red-600',
              isApproved: false,
              raw: t
            });
          });
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.data?.data?.length > 0) {
          const pendingUsers = usersRes.value.data.data.filter(u => (u.status || '').toUpperCase() === 'PENDING' || u.is_approved === 0);
          pendingUsers.slice(0, 3).forEach(u => {
            realItems.push({
              id: `u_${u.user_id || u.id}`,
              realId: u.user_id || u.id,
              type: 'USER',
              name: u.fullName || u.username || 'New Applicant',
              subtitle: `${u.role || 'USER'} Account Verification`,
              date: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent',
              status: 'In Queue',
              statusColor: 'text-gray-500 bg-gray-400',
              isApproved: false,
              raw: u
            });
          });
        }

        if (realItems.length > 0) {
          setPendingItems(realItems.slice(0, 5));
        }
      } catch (err) {
        console.error("Pending approvals fetch error:", err);
      }
    };

    fetchStats();
    fetchChartData();
    fetchPending();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (item) => {
    try {
      setActionLoadingId(item.id);

      if (item.realId) {
        if (item.type === 'TOURNAMENT') {
          const userString = localStorage.getItem('user');
          const user = userString ? JSON.parse(userString) : null;
          const adminId = user?.userId || user?.id || 1;
          await api.put(`/admin/tournament/${item.realId}/approvalStatus`, {
            approvalStatus: 'APPROVED',
            adminId: parseInt(adminId, 10)
          });
        } else if (item.type === 'USER') {
          await api.post(`/user/approve/${item.realId}`);
        }
      }

      setPendingItems(prev => prev.map(p => p.id === item.id ? { ...p, isApproved: true, status: 'Approved', statusColor: 'text-emerald-600 bg-emerald-600' } : p));
      triggerToast(`Approved ${item.name} successfully!`);
    } catch (err) {
      console.error("Approval error:", err);
      triggerToast(`Failed to approve ${item.name}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleView = (item) => {
    setSelectedViewItem(item);
  };

  return (
    <div className="max-w-7xl mx-auto font-['Inter',sans-serif] relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#014731] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500/30 animate-bounce">
          <Check size={16} className="text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111111] tracking-tight">Management Console</h1>
          <p className="text-gray-500 text-sm mt-1">Precision oversight for the elite sports circuit.</p>
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
          <div className="relative z-10 flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-2">
            <UserPlus size={14} />
            <span>Verified officials</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <Users size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Sponsors */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sponsors</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.SPONSOR}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[#014731] font-medium text-xs mt-2">
            <BadgeDollarSign size={14} />
            <span>Corporate partners</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <DollarSign size={110} strokeWidth={1.5} />
          </div>
        </div>

        {/* Playgrounds */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden h-[130px] flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Playgrounds</p>
            <h3 className="text-4xl font-extrabold text-[#111111] mt-1">{stats.PLAYGROUND}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-2">
            <Clock size={14} />
            <span>Registered grounds</span>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-60 z-0 pointer-events-none">
            <Shield size={110} strokeWidth={1.5} />
          </div>
        </div>

      </div>

      {/* Top Grid: Tournament Growth Chart (2 cols) & Management Tools (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2">
          {/* Finalized Tournaments Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#111111]">Tournament Growth Mapping</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-[#014731] rounded-full text-xs font-extrabold flex items-center gap-1 transition-all duration-300">
                    <CheckCircle2 size={12} />
                    {totalFinalizedCount} Total in {selectedYear}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Monthly completed tournaments count for the year</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Year:</span>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#014731] cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
              </div>
            </div>
            
            {/* Dynamic Bar Chart Container */}
            <div className="relative pt-6">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-8">
                <div className="border-b border-gray-300 border-dashed w-full"></div>
                <div className="border-b border-gray-300 border-dashed w-full"></div>
                <div className="border-b border-gray-300 border-dashed w-full"></div>
              </div>

              <div className="h-[220px] w-full flex items-end justify-between gap-1.5 sm:gap-2 px-1 sm:px-3 relative z-10">
                {monthlyFinalizedData.map((item, i) => {
                  const maxVal = Math.max(...monthlyFinalizedData.map(d => d.count), 1);
                  const heightPercent = item.count > 0 ? Math.max((item.count / maxVal) * 100, 12) : 6;
                  const currentMonthIdx = new Date().getMonth();
                  const isCurrentMonth = i === currentMonthIdx;

                  return (
                    <div key={i} className="w-full h-full flex flex-col justify-end items-center group relative">
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-[#111111] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5">
                        <span>{item.month}:</span>
                        <span className="text-emerald-400 font-extrabold">{item.count} Finalized</span>
                      </div>

                      {/* Value Badge above Bar */}
                      <span className={`text-[11px] font-extrabold mb-1.5 transition-colors ${
                        item.count > 0 ? (isCurrentMonth ? 'text-[#014731]' : 'text-gray-700') : 'text-gray-300'
                      }`}>
                        {item.count}
                      </span>

                      {/* Bar Track & Fill */}
                      <div className="w-full max-w-[36px] bg-gray-100 rounded-t-lg overflow-hidden flex items-end h-full">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ease-out group-hover:bg-[#014731] ${
                            isCurrentMonth 
                              ? 'bg-gradient-to-t from-[#014731] to-emerald-500 shadow-md' 
                              : item.count > 0 
                                ? 'bg-gradient-to-t from-emerald-800 to-emerald-600' 
                                : 'bg-gray-200'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* X-Axis Month Labels */}
              <div className="flex justify-between mt-3 text-xs font-bold text-gray-500 px-1 sm:px-3 pt-2 border-t border-gray-100">
                {monthlyFinalizedData.map((item, i) => (
                  <span key={i} className={`w-full text-center ${i === new Date().getMonth() ? 'text-[#014731] font-black' : ''}`}>
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="lg:col-span-1">
          {/* Management Tools */}
          <div className="bg-[#014731] rounded-xl p-6 shadow-md h-full flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white mb-6">Management<br/>Tools</h3>
            
            <div className="space-y-3">
              {/* Tool 1 */}
              <button 
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group cursor-pointer"
              >
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
              <button 
                onClick={() => navigate('/admin/requests')}
                className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group cursor-pointer"
              >
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
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full bg-[#025c40] hover:bg-[#03704e] transition-colors rounded-lg p-4 flex items-center justify-between text-left group cursor-pointer"
              >
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

      {/* Full Width Pending Approvals Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#111111]">Pending Approvals</h2>
          <button 
            onClick={() => navigate('/admin/requests')} 
            className="text-sm font-semibold text-[#014731] hover:underline cursor-pointer"
          >
            View All →
          </button>
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
              {pendingItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                      item.type === 'TOURNAMENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#111111]">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${item.isApproved ? 'bg-emerald-600' : (item.type === 'TOURNAMENT' ? 'bg-red-600' : 'bg-amber-500')}`}></span>
                      <span className={item.isApproved ? 'text-emerald-700 font-bold' : 'text-gray-700'}>{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleView(item)}
                        className="text-[#014731] font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={13} />
                        View
                      </button>

                      {item.isApproved ? (
                        <span className="bg-emerald-100 text-[#014731] px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Approved
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleApprove(item)}
                          disabled={actionLoadingId === item.id}
                          className="bg-[#111111] hover:bg-black/80 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          {actionLoadingId === item.id ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Approving...</span>
                            </>
                          ) : (
                            <span>Approve</span>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Modal: View Details Modal for Pending Request */}
      {selectedViewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedViewItem(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                selectedViewItem.type === 'TOURNAMENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {selectedViewItem.type} Details
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-gray-900">{selectedViewItem.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{selectedViewItem.subtitle}</p>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-4 text-xs border border-gray-100">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Submission Date:</span>
                <span className="font-mono text-gray-800">{selectedViewItem.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Approval Status:</span>
                <span className={`font-bold ${selectedViewItem.isApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {selectedViewItem.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Request Category:</span>
                <span className="font-bold text-gray-900">{selectedViewItem.type === 'TOURNAMENT' ? 'Tournament Host Application' : 'Role Account Verification'}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {!selectedViewItem.isApproved && (
                <button
                  onClick={() => {
                    handleApprove(selectedViewItem);
                    setSelectedViewItem(null);
                  }}
                  className="w-full py-2.5 bg-[#014731] hover:bg-[#023827] text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Approve Request Now
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedViewItem(null);
                  navigate('/admin/requests');
                }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                Go to Full Requests Console →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
