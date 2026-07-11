import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Trophy,
  ClipboardList,
  Users,
  Shield,
  Map,
  BadgeDollarSign,
  Menu,
  X
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/organizer" },
  { id: "requests", label: "Requests", icon: ClipboardList, path: "/organizer/requests" },
  { id: "teams", label: "Teams", icon: Users, path: "/organizer/teams" },
  { id: "referees", label: "Referees", icon: Shield, path: "/organizer/referees" },
  { id: "playgrounds", label: "Playgrounds", icon: Map, path: "/organizer/playgrounds" },
  { id: "sponsors", label: "Sponsors", icon: BadgeDollarSign, path: "/organizer/sponsors" },
];

function OrganizerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userString = localStorage.getItem('user');
  const localUser = userString ? JSON.parse(userString) : null;
  const displayUser = dbUser || localUser || {};

  const userName = displayUser.organizationName || displayUser.fullName || 'Organizer';
  const userRole = displayUser.role || 'Organizer';
  const avatarSeed = userName.replace(/\s+/g, '');

  return (
    <div className="flex h-screen w-full bg-[#f8f7f4] font-['Poppins']">
      
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666] mt-1 font-semibold">Organizer Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/organizer' && location.pathname === '/organizer/dashboard');
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-[#eaeaeb] text-[#111111] border-r-4 border-[#111111]" 
                    : "text-[#666666] hover:bg-[#eaeaeb]/50 hover:text-[#111111]"
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
        <div className="p-4 border-t border-[#e5e5e5] space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:bg-[#eaeaeb]/50 hover:text-[#111111] rounded-lg transition-colors">
            <HelpCircle size={18} className="text-[#888888]" />
            Help Center
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:bg-[#eaeaeb]/50 hover:text-[#111111] rounded-lg transition-colors"
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
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" size={16} />
              <input 
                type="text" 
                placeholder="Search tournament!" 
                className="w-full h-10 pl-10 pr-4 bg-[#f4f4f4] border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00382D]/20 transition-all placeholder:text-[#888888]"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="relative p-2 text-[#666666] hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-[#666666] hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <Settings size={20} />
              </button>
            </div>
            
            <div className="w-[1px] h-8 bg-[#e5e5e5] hidden sm:block"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111]">{userName}</span>
                <span className="text-xs text-[#666666] capitalize">{userRole.toLowerCase()}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#00382D] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover" />
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
            <h2 className="text-xl font-bold text-[#111111] mb-2">Logout Confirmation</h2>
            <p className="text-[#666666] text-sm mb-8">
              Are you sure you want to log out from the Organizer Portal? You will need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 text-[#555555] font-semibold border border-[#d6d8d4] rounded-xl hover:bg-gray-50 transition-colors"
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

export default OrganizerLayout;
