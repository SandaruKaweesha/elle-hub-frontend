import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Star,
  History,
  CalendarPlus,
  Bell,
  Menu,
  X,
  HelpCircle,
  LogOut
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/referee" },
  { id: "schedule", label: "My Schedule", icon: CalendarDays, path: "/referee/schedule" },
  { id: "requests", label: "Match Requests", icon: ClipboardList, path: "/referee/requests" },
  { id: "performance", label: "Performance", icon: Star, path: "/referee/performance" },
  { id: "log", label: "Tournament Log", icon: History, path: "/referee/log" },
];

function RefereeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dbUser, setDbUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.id;
      if (targetId) {
        api.get(`/user/${targetId}`)
          .then(res => {
            const userData = res.data.data || res.data;
            if (userData && res.data.success !== false) {
              setDbUser(userData);
            }
          })
          .catch(err => console.error("Error fetching user data from DB:", err));
      }
    }
  }, []);

  const userString = localStorage.getItem('user');
  const localUser = userString ? JSON.parse(userString) : null;
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.fullName || displayUser.organizationName || 'Referee';
  const userRole = displayUser.role || 'Referee';
  const avatarSeed = userName.replace(/\s+/g, '');

  return (
    <div className="flex h-screen w-full bg-[#f8f7f4] font-['Poppins'] text-[#111111] overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Referee Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || 
                             (link.path !== "/referee" && location.pathname.startsWith(link.path));
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
            <CalendarPlus size={18} />
            Set Availability
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-[#00382D] text-white hover:bg-[#002a22] rounded-lg transition-colors mb-4">
            <ClipboardList size={18} />
            Match Reports
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-[80px] bg-white border-b border-[#e5e5e5] px-6 lg:px-10 flex items-center justify-between z-10 shrink-0">
          
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-[#555555] hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#111111]">Referee Dashboard</h2>
              <p className="text-xs text-[#888888] mt-0.5">Welcome back, {userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-[#555555] hover:text-[#111111] transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-[#e5e5e5]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#111111]">{userName}</p>
                <p className="text-[11px] text-[#00783f] font-semibold capitalize">{userRole.toLowerCase()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e5e5e5] border-2 border-[#6af8a6] overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1100px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-8 text-center transform transition-all">
            <div className="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-5 text-[#ef4444]">
              <LogOut size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-[#111111] mb-3">Logout Confirmation</h2>
            <p className="text-[#555555] text-[13px] leading-relaxed mb-8 px-2">
              Are you sure you want to log out from the Referee Portal? You will need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 text-[#555555] font-semibold text-sm border border-[#e5e5e5] rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-[#e60000] text-white font-semibold text-sm rounded-xl hover:bg-[#cc0000] transition-colors shadow-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefereeLayout;
