import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Clock, AlertCircle, CalendarDays, MapPin, Search, CheckCircle2 } from "lucide-react";

function OrganizerRequests() {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const organizerId = user?.userId || user?.id;

      if (!organizerId) {
        throw new Error("Organizer ID not found. Please log in again.");
      }

      const response = await api.get(`/organizer/${organizerId}/tournaments`);
      
      if (response.data && response.data.success !== false) {
        const allTournaments = response.data.data || [];
        setAllRequests(allTournaments);
      } else {
        throw new Error(response.data.message || "Failed to fetch requests.");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') return allRequests;
    return allRequests.filter(r => (r.approval_status || 'PENDING').toUpperCase() === activeTab);
  }, [allRequests, activeTab]);

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Tournament Requests</h1>
        <p className="text-[#666666] text-sm mt-1">Track the approval status of all your submitted tournaments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-3 mb-6 pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('ALL')} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'ALL' ? 'bg-[#00382D] text-white shadow-md' : 'bg-white text-[#666666] hover:bg-gray-50 border border-[#e5e5e5]'}`}
        >
          All Requests
        </button>
        <button 
          onClick={() => setActiveTab('PENDING')} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'PENDING' ? 'bg-[#00382D] text-white shadow-md' : 'bg-white text-[#666666] hover:bg-gray-50 border border-[#e5e5e5]'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'APPROVED' ? 'bg-[#00382D] text-white shadow-md' : 'bg-white text-[#666666] hover:bg-gray-50 border border-[#e5e5e5]'}`}
        >
          Approved
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'REJECTED' ? 'bg-[#00382D] text-white shadow-md' : 'bg-white text-[#666666] hover:bg-gray-50 border border-[#e5e5e5]'}`}
        >
          Rejected
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#888888] font-medium flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#00382D]/20 border-t-[#00382D] rounded-full animate-spin mb-4"></div>
            Loading your requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6 text-[#888888] border border-[#e5e5e5]">
              <Search size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} requests found</h3>
            <p className="text-[#666666] text-sm max-w-md mx-auto leading-relaxed">
              {activeTab === 'ALL' 
                ? "You haven't submitted any tournaments yet. Click the button below to get started." 
                : `You don't have any ${activeTab.toLowerCase()} tournaments at the moment.`}
            </p>
            {activeTab === 'ALL' && (
              <Link 
                to="/organizer/tournaments/create"
                className="mt-8 inline-flex bg-[#00382D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#002a22] hover:-translate-y-0.5 transition-all shadow-sm"
              >
                Create New Tournament
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5e5]">
            {filteredRequests.map((tournament) => {
              const status = (tournament.approval_status || 'PENDING').toUpperCase();
              let StatusIcon = Clock;
              let statusClasses = 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]';
              
              if (status === 'APPROVED') {
                StatusIcon = CheckCircle2;
                statusClasses = 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
              } else if (status === 'REJECTED') {
                StatusIcon = AlertCircle;
                statusClasses = 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
              }

              return (
                <div key={tournament.tournament_id || tournament.id} className="p-6 hover:bg-[#f8f7f4]/80 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left Side: Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[#111111] leading-tight group-hover:text-[#00382D] transition-colors">
                          {tournament.title}
                        </h3>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md border flex items-center gap-1.5 ${statusClasses}`}>
                          <StatusIcon size={12} strokeWidth={2.5} />
                          {status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#666666]">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-[#888888]" />
                          {tournament.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={16} className="text-[#888888]" />
                          {tournament.start_date} to {tournament.end_date}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Action/Status details */}
                    <div className="md:text-right bg-[#f8f7f4] md:bg-transparent p-3 md:p-0 rounded-lg">
                      <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Submitted on</p>
                      <p className="text-sm font-bold text-[#333333]">
                        {new Date(tournament.created_at || new Date()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {status === 'REJECTED' && (
                        <p className="text-xs text-red-600 mt-2 font-semibold">Please contact admin for details.</p>
                      )}
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerRequests;
