import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Calendar, MapPin, AlertCircle, Lock } from 'lucide-react';
import api from '../../services/api';

export default function TeamRequests() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Custom modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'CANCEL' | 'LEAVE', tournamentId, tournamentTitle }

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const teamUserId = user?.userId || user?.id;

      if (!teamUserId) {
        throw new Error("Team User ID not found. Please log in again.");
      }

      const response = await api.get(`/team/${teamUserId}/requests`);
      if (response.data && response.data.success !== false) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to load requests.");
      }
    } catch (err) {
      console.error("Error loading requests:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const triggerCancelRequest = (tournamentId, tournamentTitle) => {
    setConfirmAction({ type: 'CANCEL', tournamentId, tournamentTitle });
    setShowConfirmModal(true);
  };

  const triggerLeaveTournament = (tournamentId, tournamentTitle) => {
    setConfirmAction({ type: 'LEAVE', tournamentId, tournamentTitle });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, tournamentId } = confirmAction;
    setShowConfirmModal(false);
    setConfirmAction(null);
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      
      const endpoint = type === 'CANCEL' ? '/tournament/request/cancel' : '/tournament/request/leave';
      const response = await api.post(endpoint, { tournamentId });
      
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || (type === 'CANCEL' ? "Join request cancelled successfully." : "You have left the tournament."));
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Operation failed.");
      }
    } catch (err) {
      console.error("Action error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const getStatusStyle = (status) => {
    if (status === 'APPROVED') return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (status === 'REJECTED') return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; // Pending
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={13} className="text-[#166534]" />;
    if (status === 'REJECTED') return <XCircle size={13} className="text-[#991b1b]" />;
    return <Clock size={13} className="text-[#d97706]" />;
  };

  const filteredRequests = requests.filter(r => {
    return activeTab === 'ALL' || r.status === activeTab;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Sent Join Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Track the review status of your team's applications for upcoming tournaments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests Listing */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading your requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-4 text-gray-400 border border-[#e5e5e5]">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#111111]">No Requests Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mt-1">There are no submission records matching the selected parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((r) => {
              const status = r.status.toUpperCase();
              const tournamentStatus = (r.tournament_status || 'UPCOMING').toUpperCase();
              const isFinalized = tournamentStatus !== 'UPCOMING';

              return (
                <div key={r.tournament_id} className="p-6 hover:bg-[#f8f7f4]/40 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Info Column */}
                    <div className="space-y-2 flex-grow max-w-3xl">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-[17px] font-bold text-[#111111] leading-snug group-hover:text-[#08733e] transition-colors">
                          {r.tournament_title}
                        </h3>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(status)}`}>
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-gray-400" />
                          {r.location}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          Event Date: {formatDate(r.tournament_held_date)}
                        </span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:text-right shrink-0">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Submitted On</p>
                        <p className="text-sm font-black text-gray-700 mt-0.5">
                          {formatDate(r.request_date)}
                        </p>
                      </div>

                      <div className="pt-2 sm:pt-0">
                        {status === 'PENDING' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => triggerCancelRequest(r.tournament_id, r.tournament_title)}
                            className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            Cancel Request
                          </button>
                        )}
                        {status === 'APPROVED' && (
                          isFinalized ? (
                            <button
                              disabled
                              title="The tournament setup has been finalized by the organizer. You can no longer leave."
                              className="px-4 py-2 border border-gray-200 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed bg-gray-50 shadow-sm"
                            >
                              Leave Locked
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading}
                              onClick={() => triggerLeaveTournament(r.tournament_id, r.tournament_title)}
                              className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              Leave Tournament
                            </button>
                          )
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg border border-[#e5e5e5] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#111111] mb-2">
              {confirmAction?.type === 'CANCEL' ? 'Cancel Request' : 'Leave Tournament'}
            </h3>
            <p className="text-[#666666] text-sm leading-relaxed mb-6">
              {confirmAction?.type === 'CANCEL' 
                ? `Are you sure you want to cancel your request to join "${confirmAction?.tournamentTitle}"?`
                : `Are you sure you want to leave "${confirmAction?.tournamentTitle}"? This action cannot be undone.`}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-3 border border-[#e5e5e5] text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button 
                onClick={executeConfirmedAction}
                className="flex-1 px-4 py-3 bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
