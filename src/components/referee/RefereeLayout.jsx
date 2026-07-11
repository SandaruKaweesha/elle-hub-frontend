import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbUser, setDbUser] = useState(null);

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
    <div className="flex h-screen w-full bg-[#f4f7f5] font-['Poppins'] overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static top-0 left-0 h-full w-[260px] bg-[#f8f9f8] border-r border-[#e5e5e5] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Area */}
        <div className="h-[80px] flex flex-col justify-center px-8 border-b border-[#e5e5e5]">
          <h1 className="text-xl font-extrabold text-[#111111] leading-tight">The Elle Hub</h1>
          <p className="text-[11px] text-[#888888] font-medium tracking-wide">Official Management</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || 
                             (link.path !== "/referee" && location.pathname.startsWith(link.path));
            const Icon = link.icon;

            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-[#6af8a6] text-[#004a25] shadow-sm shadow-[#6af8a6]/30" 
                    : "text-[#555555] hover:bg-[#eaf1ec] hover:text-[#111111]"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#004a25]" : "text-[#888888]"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Button */}
        <div className="p-6">
          <button className="w-full flex items-center justify-center gap-2 bg-[#05140e] text-white px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-[#003326] transition-colors shadow-md">
            <CalendarPlus size={18} />
            Set Availability
          </button>
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
    </div>
  );
}

export default RefereeLayout;
