import NotificationDropdown from '../common/NotificationDropdown';
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
  Trophy,
  UserCheck,
  Settings
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/referee" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/referee/tournaments" },
  { id: "requests", label: "Match Requests", icon: ClipboardList, path: "/referee/requests" },
  { id: "schedule", label: "My Schedule", icon: CalendarDays, path: "/referee/schedule" },
  { id: "availability", label: "Set Availability", icon: UserCheck, path: "/referee/availability" },
  { id: "history", label: "History", icon: History, path: "/referee/history" },
];

export default function RefereeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const userString = localStorage.getItem('user');
  let localUser = null;
  try {
    localUser = userString && userString !== 'undefined' ? JSON.parse(userString) : null;
  } catch (e) {
    localUser = null;
  }
  const targetId = localUser?.userId || localUser?.user_id || localUser?.id;

  const fetchNotifications = async () => {
    if (!targetId) return;
    try {
      const res = await api.get(`/user/${targetId}/notifications`);
      if (res.data && res.data.success !== false) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("Referee notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [targetId]);

  const unreadNotifCount = notifications.filter(n => Number(n.is_read) === 0).length;

  const markAllRead = async () => {
    if (!targetId) return;
    try {
      await api.put(`/user/${targetId}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (notifId) => {
    if (!targetId) return;
    try {
      await api.put(`/user/${targetId}/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };


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
      else if (role === 'PLAYGROUND') navigate('/playground');
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


          </div>

          <div className="flex items-center gap-4">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-[#666666] hover:bg-gray-100 rounded-full transition-colors cursor-pointer ${showNotifications ? 'bg-gray-100' : ''}`}
                title="Referee Notifications"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 border border-white animate-pulse">
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationDropdown rolePath="referee" isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            </div>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">Logout Confirmation</h3>
            <p className="text-[#666666] text-sm mb-6 leading-relaxed">
              Are you sure you want to log out from the Referee Portal? You will need to log in again to access your dashboard.
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
