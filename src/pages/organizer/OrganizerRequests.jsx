import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Clock, AlertCircle, CalendarDays, MapPin, Search } from "lucide-react";

function OrganizerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Filter for tournaments that are NOT approved (PENDING or REJECTED)
        const unapproved = allTournaments.filter(
          t => t.approval_status === 'PENDING' || t.approval_status === 'REJECTED'
        );
        setRequests(unapproved);
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

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Pending Requests</h1>
        <p className="text-[#666666] text-sm mt-1">Track the approval status of your submitted tournaments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#888888] font-medium">
            <div className="w-8 h-8 border-4 border-[#00382D]/20 border-t-[#00382D] rounded-full animate-spin mx-auto mb-4"></div>
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-4 text-[#888888]">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#111111] mb-2">No pending requests</h3>
            <p className="text-[#666666] text-sm max-w-md mx-auto">
              You don't have any pending or rejected tournaments at the moment. All your submitted tournaments have been approved!
            </p>
            <Link 
              to="/organizer/tournaments/create"
              className="mt-6 inline-flex bg-[#00382D] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#002a22] transition-colors"
            >
              Create New Tournament
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5e5]">
            {requests.map((tournament) => (
              <div key={tournament.tournament_id || tournament.id} className="p-6 hover:bg-[#f8f7f4]/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">
                        {tournament.title}
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md flex items-center gap-1 ${
                        tournament.approval_status === 'REJECTED' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tournament.approval_status === 'REJECTED' ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {tournament.approval_status || 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#666666]">
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
                  <div className="md:text-right">
                    <p className="text-xs text-[#888888] font-medium mb-1">Submitted on</p>
                    <p className="text-sm font-semibold text-[#333333]">
                      {new Date(tournament.created_at || new Date()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {tournament.approval_status === 'REJECTED' && (
                      <p className="text-xs text-red-500 mt-2 font-medium">Please contact admin for details.</p>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerRequests;
