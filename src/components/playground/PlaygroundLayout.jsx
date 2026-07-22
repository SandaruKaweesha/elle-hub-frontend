import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard,
  Trophy,
  CalendarDays,
  ClipboardList,
  History,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Search,
  MapPin,
  Building2,
  CalendarCheck
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/playground" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/playground/tournaments" },
  { id: "requests", label: "Requests", icon: ClipboardList, path: "/playground/requests" },
  { id: "schedule", label: "Ground Schedule", icon: CalendarDays, path: "/playground/schedule" },
  { id: "availability", label: "Set Availability", icon: CalendarCheck, path: "/playground/availability" },
  { id: "history", label: "Hosting History", icon: History, path: "/playground/history" },
];

export default function PlaygroundLayout() {
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

    if (role && role !== 'PLAYGROUND') {
      if (role === 'ORGANIZER') navigate('/organizer');
      else if (role === 'TEAM') navigate('/team');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'REFEREE') navigate('/referee');
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

  const playgroundName = displayUser.playground_name || displayUser.playgroundName || displayUser.display_name || 'Badulla Ground';
  const district = displayUser.located_district || displayUser.locatedDistrict || 'Badulla';

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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Playground Venue</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || 
                             (link.path !== "/playground" && location.pathname.startsWith(link.path));
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
            onClick={() => navigate('/playground/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-2 cursor-pointer bg-[#00382D] text-white hover:bg-[#002a22]`}
          >
            <User size={18} />
            Playground Profile
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
                placeholder="Search ground schedules, tournaments..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5 relative">
            
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#e5e5e5] z-50 overflow-hidden animate-in fade-in">
                    <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#111111]">Playground Notifications</h3>
                      <button className="text-[11px] text-[#00382D] font-bold hover:underline">Mark all read</button>
                    </div>
                    <div className="p-4 text-center text-xs text-[#666666]">
                      No new venue requests.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-[1px] h-8 bg-[#e5e5e5] hidden sm:block"></div>
            
            {/* User Profile Pill -> Navigates to Settings */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => navigate('/playground/settings')}
            >
              <div className="w-10 h-10 rounded-full bg-[#00382D] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                <User size={20} />
              </div>
              <div className="hidden sm:block text-left">
                <h4 className="text-sm font-semibold text-[#111111] leading-tight">
                  {playgroundName}
                </h4>
                <p className="text-xs text-[#666666] flex items-center gap-1">
                  <MapPin size={11} className="text-[#00382D]" /> {district} District
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">Logout Confirmation</h3>
            <p className="text-[#666666] text-sm mb-6 leading-relaxed">
              Are you sure you want to log out from the Playground Portal? You will need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-bold text-[#333333] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-[#e60000] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
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
