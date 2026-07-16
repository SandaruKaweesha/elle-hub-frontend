import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, MapPin, BadgeDollarSign, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

function OrganizerRequests() {
  const [activeFilter, setActiveFilter] = useState('TEAMS'); // 'TEAMS', 'SPONSORS', 'REFEREES', 'PLAYGROUNDS'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal details state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const organizerId = user?.userId || user?.id;

      if (!organizerId) {
        throw new Error("Organizer ID not found. Please log in again.");
      }

      const response = await api.get(`/organizer/${organizerId}/team-requests`);
      if (response.data && response.data.success !== false) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to load requests.");
      }
    } catch (err) {
      console.error("Error loading organizer requests:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (tournamentId, teamUserId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post('/tournament/request/approve', { tournamentId, teamUserId });
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || "Team request approved successfully.");
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to approve request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (tournamentId, teamUserId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post('/tournament/request/reject', { tournamentId, teamUserId });
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || "Team request rejected successfully.");
        setShowDetailsModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to reject request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const filters = [
    { key: 'TEAMS', label: 'Team Requests', icon: Users },
    { key: 'SPONSORS', label: 'Sponsor Requests', icon: BadgeDollarSign },
    { key: 'REFEREES', label: 'Referee Requests', icon: Shield },
    { key: 'PLAYGROUNDS', label: 'Playground Requests', icon: MapPin },
  ];

  const getPlaceholderContent = () => {
    switch (activeFilter) {
      case 'SPONSORS':
        return {
          title: "No Sponsor Requests Found",
          description: "Incoming sponsorship proposals and branding applications from tournament partners will appear here.",
          icon: BadgeDollarSign
        };
      case 'REFEREES':
        return {
          title: "No Referee Requests Found",
          description: "Applications from certified match officials and referees wishing to judge your tournaments will appear here.",
          icon: Shield
        };
      case 'PLAYGROUNDS':
        return {
          title: "No Playground Requests Found",
          description: "Requests for ground allocations, venue bookings, and host playground confirmations will appear here.",
          icon: MapPin
        };
      default:
        return {
          title: "No Team Requests Found",
          description: "Once teams submit applications to participate in your tournaments, their join requests will appear here for your review.",
          icon: Users
        };
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (s === 'REJECTED') return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; // Pending
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return <CheckCircle2 size={13} className="text-[#166534]" />;
    if (s === 'REJECTED') return <XCircle size={13} className="text-[#991b1b]" />;
    return <Clock size={13} className="text-[#d97706]" />;
  };

  const placeholder = getPlaceholderContent();
  const IconComponent = placeholder.icon;

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#111111] tracking-tight">Tournament Requests</h1>
        <p className="text-[#666666] text-sm mt-1">Manage incoming participation, referee, playground, and sponsor requests for your tournaments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-3 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading requests...
          </div>
        ) : activeFilter === 'TEAMS' && requests.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {requests.map((r) => (
              <div 
                key={`${r.tournament_id}-${r.team_user_id}`}
                onClick={() => {
                  setSelectedRequest(r);
                  setShowDetailsModal(true);
                }}
                className="p-6 hover:bg-[#f8f7f4]/40 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shadow-sm shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.team_name)}`} 
                      alt={r.team_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] group-hover:text-[#08733e] transition-colors">{r.team_name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Applied for: <span className="font-semibold text-gray-700">{r.tournament_title}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(r.status)}`}>
                    {getStatusIcon(r.status)}
                    {r.status}
                  </span>
                  <span className="text-gray-300 group-hover:text-gray-500 transition-colors font-bold text-sm">➔</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 md:p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6 text-gray-400 border border-[#e5e5e5] shadow-inner">
              <IconComponent size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">{placeholder.title}</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">{placeholder.description}</p>
          </div>
        )}
      </div>

      {/* Details Card Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#002c21] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedRequest(null); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden bg-white mx-auto mb-3 shadow-md">
                <img 
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(selectedRequest.team_name)}`} 
                  alt={selectedRequest.team_name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-bold">{selectedRequest.team_name}</h3>
              <p className="text-xs text-[#8eb7a7] mt-1 font-semibold uppercase tracking-wider">Tournament Entry Request</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Tournament</span>
                <span className="text-sm font-bold text-[#111111]">{selectedRequest.tournament_title}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Contact Number</span>
                  <span className="text-sm font-bold text-[#111111]">{selectedRequest.contact_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Rating</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sm font-black text-[#111111]">
                      {selectedRequest.rating ? parseFloat(selectedRequest.rating).toFixed(1) : 'N/A'}
                    </span>
                    {selectedRequest.rating && (
                      <span className="text-yellow-400 text-xs">★</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">District</span>
                <span className="text-sm font-semibold text-gray-600">{selectedRequest.district || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Applied On</span>
                <span className="text-xs font-semibold text-gray-600">
                  {new Date(selectedRequest.request_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              {selectedRequest.status.toUpperCase() === 'PENDING' ? (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRejectRequest(selectedRequest.tournament_id, selectedRequest.team_user_id)}
                    className="flex-1 py-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApproveRequest(selectedRequest.tournament_id, selectedRequest.team_user_id)}
                    className="flex-1 py-3 bg-[#08733e] hover:bg-[#065b31] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Accept
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-2 text-xs font-black uppercase tracking-wider text-gray-400">
                  Request {selectedRequest.status.toLowerCase()}ed
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrganizerRequests;
