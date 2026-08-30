import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ImageCropperModal from "../ImageCropperModal";
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
  Shield,
  Medal,
  FileText,
  History
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/team" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/team/tournaments" },
  { id: "requests", label: "Requests", icon: FileText, path: "/team/requests" },
  { id: "matches", label: "Matches", icon: Calendar, path: "/team/matches" },
  { id: "results", label: "Results", icon: Medal, path: "/team/results" },
  { id: "history", label: "History", icon: History, path: "/team/history" },
];


export default function TeamLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dbUser, setDbUser] = useState(null);
  const userString = localStorage.getItem('user');
  let localUser = {};
  try {
    localUser = userString && userString !== 'undefined' ? JSON.parse(userString) : {};
  } catch (e) {
    localUser = {};
  }
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.teamName || displayUser.team_name || displayUser.fullName || displayUser.full_name || displayUser.name || displayUser.email?.split('@')[0] || 'Team Member';
  const userRole = displayUser.role || 'TEAM';
  const avatarSeed = userName.replace(/\s+/g, '');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') {
      navigate('/login');
      return;
    }

    let curUser = {};
    try {
      curUser = JSON.parse(userStr);
    } catch (e) {
      navigate('/login');
      return;
    }
    const role = (curUser?.role || '').toString().trim().toUpperCase();

    if (role && role !== 'TEAM') {
      if (role === 'ORGANIZER') navigate('/organizer');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'REFEREE') navigate('/referee');
      else if (role === 'SPONSOR') navigate('/sponsor');
      else if (role === 'PLAYGROUND') navigate('/playground');
      else navigate('/login');
      return;
    }

    const targetId = curUser.userId || curUser.user_id || curUser.id;
    if (targetId) {
      api.get(`/user/${targetId}`)
        .then(res => {
          const userData = res.data.data || res.data;
          if (userData && res.data.success !== false) {
            setDbUser(userData);
          }
        })
        .catch(err => console.error("Error fetching user profile data from DB:", err));
    }

    if (targetId) {
      fetchUserNotifications(targetId);
    }
  }, [navigate]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUserNotifications = async (userId) => {
    try {
      const response = await api.get(`/user/${userId}/notifications`);
      if (response.data && response.data.success !== false) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (targetId) {
      try {
        await api.put(`/user/${targetId}/notifications/read-all`);
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      } catch (err) {
        console.error("Failed to mark all notifications as read", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveProfilePhoto = (base64Image) => {
    const updatedUser = { ...user, profilePicture: base64Image };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.location.reload();
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
          <button 
            onClick={() => navigate('/team/settings?tab=profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-4 cursor-pointer ${
              location.pathname.startsWith('/team/settings') 
                ? 'bg-[#00382D] text-white hover:bg-[#002a22]' 
                : 'text-[#666666] hover:bg-[#eaeaeb]/50 hover:text-[#111111]'
            }`}
          >
            <Users size={18} />
            Manage Team
          </button>
          
          <div className="pt-2 space-y-1">
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
          </div>

          <div className="flex items-center gap-3 lg:gap-5 relative">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && targetId) fetchUserNotifications(targetId);
                }}
                className={`relative p-2 text-gray-500 hover:text-[#002c21] rounded-full hover:bg-gray-100 transition-colors ${showNotifications ? 'bg-gray-100' : ''}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-[#08733e] text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e5e5e5] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3.5 px-4 border-b border-[#e5e5e5] flex items-center justify-between bg-white">
                      <h3 className="font-bold text-sm text-[#111111]">Notifications</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={handleMarkAllAsRead} className="text-xs text-[#08733e] font-semibold hover:underline">
                          Mark all read
                        </button>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 8).map((notif, idx) => (
                          <div 
                             key={notif.notification_id || idx}
                             onClick={() => { setShowNotifications(false); navigate('/team/notifications'); }}
                             className={`p-3.5 border-b border-gray-100 transition-colors cursor-pointer flex gap-3 ${Number(notif.is_read) === 0 ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-gray-50'}`}
                          >
                             <div className="w-8 h-8 rounded-full bg-[#eaf1ec] text-[#08733e] flex items-center justify-center shrink-0 mt-0.5">
                               <Trophy size={14} />
                             </div>
                             <div className="min-w-0 flex-1">
                               <p className="text-xs font-bold text-[#111111] leading-tight truncate">{notif.title}</p>
                               <p className="text-xs text-[#555555] mt-1 leading-snug line-clamp-2">{notif.message}</p>
                               <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                                 {notif.created_at || notif.received_at || 'Recently'}
                               </span>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-[#666666] font-medium">No notifications yet</div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 text-center border-t border-[#e5e5e5]">
                      <button 
                         onClick={() => { setShowNotifications(false); navigate('/team/notifications'); }}
                         className="text-xs font-bold text-[#00382D] hover:underline"
                      >
                         View all notifications →
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

            <div 
              className="flex items-center gap-3 cursor-pointer select-none pl-3 lg:pl-5 border-l border-gray-200 group"
              onClick={() => setIsCropperOpen(true)}
              title="Change Profile Photo"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111]">{userName}</span>
                <span className="text-xs text-[#666666] capitalize">{userRole.toLowerCase()}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-[#111111] group-hover:border-[#333333] shadow-sm flex items-center justify-center shrink-0 transition-colors relative">
                 <img src={displayUser.profilePicture || displayUser.profile_picture || displayUser.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=eaf1ec`} alt="Avatar" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <User size={16} className="text-white" />
                 </div>
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

      {/* Profile Photo Cropper */}
      <ImageCropperModal 
        isOpen={isCropperOpen} 
        onClose={() => setIsCropperOpen(false)} 
        onSave={handleSaveProfilePhoto} 
      />
    </div>
  );
}
