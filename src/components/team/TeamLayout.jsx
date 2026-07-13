import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  Calendar,
  Trophy,
  BarChart2,
  Users,
  Shield
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/team" },
  { id: "matches", label: "Matches", icon: Calendar, path: "/team/matches" },
  { id: "results", label: "Results", icon: Trophy, path: "/team/results" },
  { id: "statistics", label: "Statistics", icon: BarChart2, path: "/team/statistics" },
  { id: "settings", label: "Settings", icon: Settings, path: "/team/settings" },
];

export default function TeamLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userName = user.teamName || user.team_name || user.fullName || user.full_name || user.name || user.email?.split('@')[0] || 'Team Member';
  const userRole = user.role || 'TEAM';
  const avatarSeed = userName.replace(/\s+/g, '');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get('/tournaments');
        if (response.data.success) {
          // Getting first 3 tournaments to show as new notifications
          setRecentTournaments(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch tournaments for notifications", error);
      }
    };
    fetchTournaments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f7f4] font-['Poppins'] text-[#111111]">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-[#f8f7f4] border-r border-[#e5e5e5]
          flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-8 pb-10">
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Elle Hub</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Elite Performance</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || 
                             (link.id !== "dashboard" && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-l-lg rounded-r-none text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-[#eaeaeb] text-[#111111] border-r-[4px] border-[#111111]" 
                    : "text-[#666666] border-transparent border-r-[4px] hover:bg-[#eaeaeb]/50 hover:text-[#111111]"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-[#111111]" : "text-[#888888]"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#e5e5e5] space-y-1 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-[#00382D] text-white hover:bg-[#002a22] rounded-lg transition-colors mb-2">
            <Users size={18} />
            Manage Team
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-[#00382D] text-white hover:bg-[#002a22] rounded-lg transition-colors mb-4">
            <Settings size={18} />
            Management Tools
          </button>
          
          <div className="pt-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#111111] hover:bg-[#eaeaeb]/50 rounded-lg transition-colors">
              <HelpCircle size={18} className="text-[#888888]" />
              Help Center
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} className="text-[#888888]" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          
          <div className="flex items-center gap-3 flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 text-[#666666] hover:text-[#111111] rounded-lg hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Global Search */}
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search tournaments, teams..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5 relative">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-gray-500 hover:text-[#002c21] rounded-full hover:bg-gray-100 transition-colors ${showNotifications ? 'bg-gray-100' : ''}`}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#08733e] rounded-full border-2 border-white"></span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e5e5e5] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
                      <h3 className="font-bold text-[#111111]">Notifications</h3>
                      <button className="text-xs text-[#08733e] font-medium hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {recentTournaments.length > 0 ? (
                        recentTournaments.map((t, idx) => (
                          <div 
                             key={t.tournament_id || idx}
                             onClick={() => { setShowNotifications(false); setSelectedNotification(t); }}
                             className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3"
                          >
                             <div className="w-8 h-8 rounded-full bg-[#eaf1ec] text-[#08733e] flex items-center justify-center shrink-0">
                               <Trophy size={14} />
                             </div>
                             <div>
                               <p className="text-sm text-[#333333] font-medium leading-tight">New tournament <span className="font-bold">{t.title}</span> was added to the portal.</p>
                               <p className="text-xs text-[#888888] mt-1">Recently Added</p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-[#666666]">No new notifications</div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 text-center border-t border-[#e5e5e5]">
                      <button 
                         onClick={() => { setShowNotifications(false); navigate('/team/notifications'); }}
                         className="text-sm font-medium text-[#666666] hover:text-[#111111]"
                      >
                         View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <button 
              onClick={() => { navigate('/team/settings'); setShowNotifications(false); }}
              className="relative p-2 text-gray-500 hover:text-[#002c21] rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} />
            </button>

            {/* User Profile */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none pl-3 lg:pl-5 border-l border-gray-200"
              onClick={() => navigate('/team/settings?tab=profile')}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111]">{userName}</span>
                <span className="text-xs text-[#666666] capitalize">{userRole.toLowerCase()}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#08733e] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8f7f4]">
          <div className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">Logout Confirmation</h3>
            <p className="text-[#666666] text-sm mb-6 leading-relaxed">
              Are you sure you want to log out from the Team Portal? You will need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-bold text-[#333333] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-[#e60000] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] p-6 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#eaf1ec] rounded-full flex items-center justify-center text-[#08733e] shrink-0 border border-[#c4e3d7]">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111111] leading-tight">Tournament Alert</h3>
                  <p className="text-xs font-semibold text-[#08733e] mt-1 bg-[#eaf1ec] inline-block px-2 py-0.5 rounded-md">Recently Added</p>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-[#f8f7f4] rounded-xl p-5 mb-8 border border-[#e5e5e5]">
              <p className="text-[#333333] leading-relaxed text-[15px]">
                New tournament <span className="font-black text-[#111111]">{selectedNotification.title}</span> was added to the portal. 
                Registration is now open. Assemble your team and don't miss the chance to participate and win amazing prizes!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-3 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-bold text-[#333333] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = selectedNotification.tournament_id;
                  setSelectedNotification(null);
                  navigate(`/tournaments/${id}`);
                }}
                className="flex-1 py-3 px-4 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Trophy size={16} /> View Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
