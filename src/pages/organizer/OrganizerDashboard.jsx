import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { 
  PlusCircle, 
  Award, 
  Hourglass, 
  MapPin, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Clock, 
  XCircle,
  Trophy,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";

function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const organizerId = currentUser.userId || currentUser.user_id;

  useEffect(() => {
    if (organizerId) {
      fetchTournaments();
    } else {
      setError("Organizer session not found. Please log in again.");
      setLoading(false);
    }
  }, [organizerId]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/organizer/${organizerId}/tournaments`);
      if (response.data && response.data.success !== false) {
        setTournaments(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch tournaments.");
      }
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError("Failed to retrieve your tournament list.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (approvalStatus) => {
    const status = (approvalStatus || 'PENDING').toUpperCase();
    if (status === 'APPROVED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck size={12} /> Approved
        </span>
      );
    } else if (status === 'REJECTED') {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <Clock size={12} /> Pending Admin
      </span>
    );
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      t.approval_status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCount = tournaments.length;
  const approvedCount = tournaments.filter(t => t.approval_status.toUpperCase() === 'APPROVED').length;
  const pendingCount = tournaments.filter(t => t.approval_status.toUpperCase() === 'PENDING').length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto font-['Poppins'] animate-in fade-in duration-300 font-medium">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#111111] tracking-tight">Organizer Console</h1>
          <p className="text-[#666666] text-sm mt-1">Manage and track approval stages for all tournaments you have created.</p>
        </div>
        <Link 
          to="/organizer/tournaments/create"
          className="flex items-center gap-2 bg-[#00382D] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#002a22] transition-colors shadow-sm cursor-pointer"
        >
          <PlusCircle size={16} />
          Create Tournament
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat 1 */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5] shadow-sm flex items-center justify-between overflow-hidden relative">
          <div>
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Total Created</h3>
            <div className="text-3xl font-black text-[#111111]">{loading ? '...' : totalCount}</div>
          </div>
          <div className="p-3 bg-[#f8f7f4] rounded-xl border border-gray-100 text-[#00382D]">
            <Trophy size={20} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5] shadow-sm flex items-center justify-between overflow-hidden relative">
          <div>
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Approved Tournaments</h3>
            <div className="text-3xl font-black text-[#111111]">{loading ? '...' : approvedCount}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5] shadow-sm flex items-center justify-between overflow-hidden relative">
          <div>
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Pending Approval</h3>
            <div className="text-3xl font-black text-[#111111]">{loading ? '...' : pendingCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search tournaments by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00382D] transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <div className="text-sm font-medium text-[#666666] font-semibold shrink-0">
            Tournaments: <span className="text-[#111111] font-bold">{filteredTournaments.length}</span>
          </div>
        </div>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center bg-white rounded-2xl border border-[#e5e5e5] shadow-sm">
          <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
          Loading your tournaments...
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e5e5]">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Tournaments Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
            You haven't created any tournaments matching the active filters. Click "Create Tournament" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(t => (
            <div key={t.tournament_id || t.id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
              {/* Cover Banner */}
              <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex items-start justify-end">
                {getStatusBadge(t.approval_status)}
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-[#111111] leading-tight mb-3 group-hover:text-[#00382D] transition-colors">
                    {t.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs font-semibold text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span>{t.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      <span>Held Date: {formatDate(t.tournament_held_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f4f4f4] space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Registrations</span>
                    <span className="text-gray-600">{formatDate(t.start_date)} - {formatDate(t.end_date)}</span>
                  </div>
                  
                  {t.approval_status.toUpperCase() === 'APPROVED' ? (
                    <div className="flex gap-2">
                      <Link 
                        to={`/tournaments/${t.tournament_id || t.id}`}
                        className="flex-1 py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-[#e5e5e5] shadow-sm cursor-pointer"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/organizer/tournaments/manage/${t.tournament_id || t.id}`}
                        className="flex-1 py-2.5 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        Manage
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      to={`/tournaments/${t.tournament_id || t.id}`}
                      className="w-full py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 group/btn border border-[#e5e5e5] shadow-sm cursor-pointer"
                    >
                      View Details
                      <ChevronRight size={14} className="text-[#888888] group-hover/btn:text-[#333333] transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default OrganizerDashboard;
