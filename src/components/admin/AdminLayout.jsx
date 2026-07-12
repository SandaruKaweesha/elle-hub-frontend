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
  X
} from "lucide-react";

const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, path: "/admin/tournaments" },
  { id: "reports", label: "Reports", icon: FileBarChart, path: "/admin/reports" },
  { id: "certificates", label: "Certificates", icon: Award, path: "/admin/certificates" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/admin/notifications" },
];

function AdminLayout() {
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

  const userName = displayUser.fullName || 'Admin User';
  const userRole = 'Head Administrator';
  const avatarSeed = userName.replace(/\s+/g, '');

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] font-['Inter',sans-serif] text-[#111111]">
      
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
          w-[260px] bg-[#f8f9fa] border-r border-[#e5e7eb]
          flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="flex flex-col pt-8 pb-10 px-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Elle Hub</h1>
          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/admin' && location.pathname === '/admin/dashboard');
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-l-md rounded-r-none text-sm font-medium transition-all border-r-[4px]
                  ${isActive 
                    ? "bg-[#e5e7eb] border-[#111111] text-[#111111]" 
                    : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-[#111111]"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-[#111111]" : "text-gray-500"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#e5e7eb] space-y-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#014731] text-white rounded-md text-sm font-medium hover:bg-[#023827] transition-colors shadow-sm">
            <Plus size={16} />
            Create Tournament
          </button>
          
          <div className="space-y-1">
            <Link to="/admin/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#111111] rounded-md transition-colors">
              <Settings size={18} className="text-gray-500" />
              Settings
            </Link>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
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
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <HelpCircle size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <Moon size={20} />
              </button>
            </div>
            
            <div className="w-[1px] h-8 bg-gray-200 hidden sm:block"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#111111]">{userName}</span>
                <span className="text-[11px] text-gray-500">{userRole}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#111111] overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=0f172a`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
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
