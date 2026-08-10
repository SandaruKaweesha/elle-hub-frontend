import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Search,
  HelpCircle,
  Moon,
  LogOut,
  LayoutDashboard,
  Users,
  Trophy,
  FileBarChart,
  Award,
  Bell,
  Settings,
  Plus,
  Menu,
  X,
  ClipboardList,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Lock,
  CheckCircle2
} from "lucide-react";


const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "requests", label: "Requests", icon: ClipboardList, path: "/admin/requests" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/admin/tournaments" },
  { id: "reports", label: "Reports", icon: FileBarChart, path: "/admin/reports" },
];


function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);


  const fetchNotifications = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (!targetId) return;

      const res = await api.get(`/user/${targetId}/notifications`);
      if (res.data && res.data.success !== false) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("Admin notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  const markAllRead = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (targetId) {
        await api.put(`/user/${targetId}/notifications/read-all`);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (notifId) => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (targetId) {
        await api.put(`/user/${targetId}/notifications/${notifId}/read`);
      }
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const localUser = JSON.parse(userString);
    const role = (localUser?.role || '').toString().trim().toUpperCase();

    if (role && role !== 'ADMIN') {
      if (role === 'ORGANIZER') navigate('/organizer');
      else if (role === 'TEAM') navigate('/team');
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userString = localStorage.getItem('user');
  let localUser = null;
  try {
    localUser = userString && userString !== 'undefined' ? JSON.parse(userString) : null;
  } catch (e) {
    localUser = null;
  }
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.fullName || 'Admin User';
  const userRole = 'Head Administrator';
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/admin' && location.pathname === '/admin/dashboard');
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
        <div className="p-4 border-t border-[#e5e5e5] mt-auto">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={18} className="text-[#888888]" />
            Logout
          </button>
        </div>

      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[72px] bg-white flex items-center justify-between px-4 lg:px-8 shrink-0 border-b border-[#e5e7eb]">
          
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="p-2 -ml-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="relative max-w-lg w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tournaments, players, or reports..." 
                className="w-full h-10 pl-10 pr-4 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer flex items-center justify-center"
                title="Admin Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown Modal */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-[#08733e]" />
                      <h3 className="font-extrabold text-sm text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-[#08733e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[11px] font-bold text-[#08733e] hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 space-y-1">
                        <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-gray-700">No Notifications Yet</p>
                        <p className="text-[11px]">System alerts will appear here in real-time.</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const isUnread = Number(n.is_read) === 0;
                        return (
                          <div 
                            key={n.notification_id}
                            onClick={() => markSingleRead(n.notification_id)}
                            className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left ${isUnread ? 'bg-emerald-50/50' : 'opacity-75'}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`text-xs ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {n.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-gray-400 mt-1.5 block font-mono">
                              {n.created_at || n.received_at}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
                    <button 
                      onClick={() => {
                        setShowNotifDropdown(false);
                        navigate('/admin/notifications');
                      }} 
                      className="text-xs font-extrabold text-[#08733e] hover:underline cursor-pointer"
                    >
                      View All Notifications Feed →
                    </button>
                  </div>
                </div>
              )}
            </div>

            
            <div className="w-[1px] h-8 bg-gray-200 hidden sm:block"></div>
            
            {/* User Profile Card (Read-Only Click) */}
            <div 
              className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-all" 
              onClick={() => setShowProfileModal(true)}
              title="View Admin Profile Details"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-[#111111] leading-tight">{userName}</span>
                <span className="text-[11px] text-[#08733e] font-semibold">{userRole}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-white border border-[#111111] overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                 <img src={displayUser.profilePicture || displayUser.profile_picture || displayUser.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=eaf1ec`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Read-Only Admin Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative space-y-6">
            
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-full border-4 border-[#08733e]/20 p-1 shadow-md overflow-hidden bg-gray-50 relative">
                <img 
                  src={displayUser.profilePicture || displayUser.profile_picture || displayUser.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=eaf1ec`} 
                  alt="Admin Avatar" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{userName}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#08733e] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mt-1">
                  <ShieldCheck size={14} /> Head Administrator
                </span>
              </div>
            </div>

            {/* Read-Only Profile Information Grid */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <User size={14} className="text-[#08733e]" /> Account Name
                </span>
                <strong className="text-gray-900 font-bold">{userName}</strong>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Mail size={14} className="text-[#08733e]" /> Email Address
                </span>
                <strong className="text-gray-900 font-bold font-mono">{displayUser.email || 'admin@ellehub.lk'}</strong>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Lock size={14} className="text-[#08733e]" /> System Role
                </span>
                <strong className="text-gray-900 font-bold">ADMIN (Head Administrator)</strong>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Account Status
                </span>
                <span className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md">
                  Active & Verified
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#08733e]" /> Access Level
                </span>
                <strong className="text-gray-900 font-bold">Full Platform Oversight</strong>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-[11px] text-amber-800 font-semibold">
                🔒 Admin Profile details are read-only and strictly for display.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md"
            >
              Close Window
            </button>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">Logout Confirmation</h2>
            <p className="text-gray-600 text-sm mb-8">
              Are you sure you want to log out from the Admin Portal?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-600 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
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

export default AdminLayout;
