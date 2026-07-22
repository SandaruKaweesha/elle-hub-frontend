import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard,
  BadgeDollarSign,
  Trophy,
  Calendar,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Phone,
  Plus,
  HelpCircle,
  Search,
  Bell,
  User,
  MessageSquare
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, path: "/sponsor/dashboard" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/sponsor/tournaments" },
  { id: "requests", label: "Requests", icon: BadgeDollarSign, path: "/sponsor/requests" },
  { id: "history", label: "History", icon: History, path: "/sponsor/history" },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/sponsor/messages" },
];

function SponsorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const localUser = JSON.parse(userString);
    const role = (localUser?.role || '').toString().trim().toUpperCase();

    if (role && role !== 'SPONSOR') {
      if (role === 'ORGANIZER') navigate('/organizer');
      else if (role === 'TEAM') navigate('/team');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'REFEREE') navigate('/referee');
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userString = localStorage.getItem('user');
  const localUser = userString ? JSON.parse(userString) : null;
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.fullName || displayUser.organizationName || 'Sponsor User';
  const userRole = displayUser.role || 'Sponsor';
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Sponsor Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/sponsor' && location.pathname === '/sponsor/dashboard');
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
        <div className="p-4 border-t border-[#e5e5e5] mt-auto space-y-1">
          <Link 
            to="/sponsor/settings"
            onClick={() => setIsSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-[#00382D] text-white hover:bg-[#002a22] rounded-lg transition-colors mb-2 cursor-pointer"
          >
            <User size={18} />
            Sponsor Profile
          </Link>

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
                placeholder="Search tournaments, teams, or metrics..." 
                className="w-full h-10 pl-10 pr-4 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button className="relative text-gray-500 hover:text-[#111111] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-[1px] h-8 bg-gray-200 hidden sm:block"></div>
            
            {/* User Profile */}
            <Link 
              to="/sponsor/settings"
              className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111] group-hover:text-[#00382D] transition-colors">{userName}</span>
                <span className="text-[11px] text-[#014731] font-semibold">{userRole}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-white overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-gray-200 group-hover:border-[#00382D] transition-colors">
                 <img src={displayUser.profilePicture || displayUser.profile_picture || displayUser.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=eaf1ec`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white p-4 lg:p-8">
          <Outlet />
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
              Are you sure you want to log out from the Sponsor Portal? You will need to log in again to access your dashboard.
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

export default SponsorLayout;
