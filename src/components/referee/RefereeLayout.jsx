import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Star,
  History,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  Search,
  Trophy
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/referee" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/referee/tournaments" },
  { id: "requests", label: "Match Requests", icon: ClipboardList, path: "/referee/requests" },
  { id: "schedule", label: "My Schedule", icon: CalendarDays, path: "/referee/schedule" },
  { id: "performance", label: "Performance", icon: Star, path: "/referee/performance" },
  { id: "log", label: "Tournament Log", icon: History, path: "/referee/log" },
];

export default function RefereeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbUser, setDbUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const localUser = JSON.parse(userString);
    const role = (localUser?.role || '').toString().trim().toUpperCase();

    if (role && role !== 'REFEREE') {
      if (role === 'ORGANIZER') navigate('/organizer');
      else if (role === 'TEAM') navigate('/team');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'SPONSOR') navigate('/sponsor');
      else navigate('/login');
      return;
    }

    const targetId = localUser.userId || localUser.user_id || localUser.id;
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
  }, [navigate]);

  const userString = localStorage.getItem('user');
  const localUser = userString ? JSON.parse(userString) : null;
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.referee_name || displayUser.full_name || displayUser.organizationName || displayUser.display_name || 'Official Referee';
  const userRole = displayUser.role || 'REFEREE';
  const avatarSeed = userName.replace(/\s+/g, '');

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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Referee Portal</p>
        </div>

        {/* Navigation Links */}
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
                    ? "bg-[#eaeaeb] text-[#111111] border-r-[4px] border-[#00382D]" 
                    : "text-[#666666] border-transparent border-r-[4px] hover:bg-[#eaeaeb]/50 hover:text-[#111111]"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-[#00382D]" : "text-[#888888]"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#e5e5e5] space-y-1 mt-auto">
          <button 
            onClick={() => navigate('/referee/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-2 cursor-pointer ${
              location.pathname.startsWith('/referee/settings') 
                ? 'bg-[#00382D] text-white hover:bg-[#002a22]' 
                : 'bg-[#00382D] text-white hover:bg-[#002a22]'
            }`}
          >
            <User size={18} />
            Referee Profile
          </button>

          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:bg-[#eaeaeb]/50 hover:text-[#111111] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={18} className="text-[#888888]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 lg:px-8 shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="p-2 -ml-2 text-[#666666] lg:hidden hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="relative w-full max-w-md hidden md:block">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input 
                type="text" 
                placeholder="Search matches or tournaments..." 
                className="w-full pl-10 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-[#666666] hover:bg-gray-100 rounded-full transition-colors ${showNotifications ? 'bg-gray-100' : ''}`}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e5e5e5] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
                      <h3 className="font-bold text-[#111111]">Notifications</h3>
                      <button className="text-xs text-[#08733e] font-medium hover:underline">Mark all read</button>
                    </div>
                    <div className="p-4 text-center text-xs text-[#666666]">
                      No new officiating notifications.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-[1px] h-8 bg-[#e5e5e5] hidden sm:block"></div>
            
            {/* User Profile Pill */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => navigate('/referee/settings')}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111]">{userName}</span>
                <span className="text-xs text-[#666666] capitalize">{userRole.toLowerCase()}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-[#00382D] shadow-sm flex items-center justify-center shrink-0">
                <img 
                  src={displayUser.profilePicture || displayUser.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=eaf1ec`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f7f4] p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-[#111111] mb-2">Logout of Referee Portal?</h3>
            <p className="text-sm text-[#666666] mb-6">Are you sure you want to end your officiating session?</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
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
