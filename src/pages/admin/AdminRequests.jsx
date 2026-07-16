import React, { useState, useEffect } from 'react';
import { Trophy, UserPlus, UserMinus, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Search, Users, Award, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function AdminRequests() {
  const [activeTab, setActiveTab] = useState('TOURNAMENTS'); // 'TOURNAMENTS', 'ACCOUNTS', 'DELETIONS'
  const [pendingTournaments, setPendingTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Custom confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'APPROVE' | 'REJECT', id, name }

  // Details Modal state
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'TOURNAMENTS') {
      fetchPendingTournaments();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchPendingTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/tournaments/pending');
      if (response.data && response.data.success !== false) {
        setPendingTournaments(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to load pending tournaments.");
      }
    } catch (err) {
      console.error("Error loading pending tournaments:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const triggerApprove = (tournamentId, title) => {
    setConfirmAction({ type: 'APPROVE', id: tournamentId, name: title });
    setShowConfirmModal(true);
  };

  const triggerReject = (tournamentId, title) => {
    setConfirmAction({ type: 'REJECT', id: tournamentId, name: title });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setShowConfirmModal(false);
    setConfirmAction(null);

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);

      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const adminId = user?.userId || user?.id || 1; // Default to 1 if not set

      const approvalStatus = type === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const response = await api.put(`/admin/tournament/${id}/approvalStatus`, {
        approvalStatus,
        adminId: parseInt(adminId, 10)
      });

      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || `Tournament request ${approvalStatus.toLowerCase()} successfully.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchPendingTournaments();
      } else {
        throw new Error(response.data.message || "Failed to update tournament status.");
      }
    } catch (err) {
      console.error("Action execution error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const getPlaceholderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return {
          title: "No Account Requests",
          description: "New user registrations requiring administrative validation or identity checks will appear here.",
          icon: UserPlus
        };
      case 'DELETIONS':
        return {
          title: "No Deletion Requests",
          description: "User requests for permanent account removal and privacy scrub logs will appear here.",
          icon: UserMinus
        };
      default:
        return {
          title: "No Tournament Requests",
          description: "Pending organizer submissions waiting for event approval and registration initialization.",
          icon: Trophy
        };
    }
  };

  const placeholder = getPlaceholderContent();
  const IconComponent = placeholder.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#111111] tracking-tight">System Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Review pending tournament submissions, account creation approvals, and deletion requests.</p>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {[
          { key: 'TOURNAMENTS', label: 'Tournament Requests', icon: Trophy },
          { key: 'ACCOUNTS', label: 'Account Requests', icon: UserPlus },
          { key: 'DELETIONS', label: 'Deletion Requests', icon: UserMinus }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading pending requests...
          </div>
        ) : activeTab === 'TOURNAMENTS' && pendingTournaments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingTournaments.map((t) => (
              <div 
                key={t.tournament_id} 
                onClick={() => {
                  setSelectedTournament(t);
                  setShowDetailsModal(true);
                }}
                className="p-6 hover:bg-[#f8f7f4]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
              >
                
                {/* Tournament Info */}
                <div className="space-y-2 flex-grow max-w-3xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[17px] font-bold text-[#111111] leading-snug group-hover:text-[#08733e] transition-colors">
                      {t.title}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                      <Clock size={11} />
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" />
                      {t.location}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      Held Date: {formatDate(t.tournament_held_date)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                    {t.description || "No description provided."}
                  </p>
                </div>

                {/* Actions Panel */}
                <div 
                  className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-none border-gray-100"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering details modal when clicking buttons
                >
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider hidden md:block">Action Controls</span>
                  <div className="flex gap-2.5 w-full">
                    <button
                      disabled={actionLoading}
                      onClick={() => triggerReject(t.tournament_id, t.title)}
                      className="px-4 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => triggerApprove(t.tournament_id, t.title)}
                      className="px-4 py-2.5 bg-[#08733e] text-white font-bold rounded-xl hover:bg-[#065b31] text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
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

      {/* Tournament Details Modal */}
      {showDetailsModal && selectedTournament && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#002c21] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedTournament(null); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white/10 mx-auto mb-3 shadow-md flex items-center justify-center">
                <Trophy size={28} className="text-[#98F5E1]" />
              </div>
              <h3 className="text-xl font-bold px-4">{selectedTournament.title}</h3>
              <p className="text-xs text-[#8eb7a7] mt-1 font-semibold uppercase tracking-wider">Tournament Details</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Location</span>
                <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} className="text-gray-400" />
                  {selectedTournament.location}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Maximum Teams</span>
                  <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                    <Users size={14} className="text-gray-400" />
                    {selectedTournament.maximum_team_limit || 'N/A'} Teams
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Held Date</span>
                  <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(selectedTournament.tournament_held_date)}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Prize Details</span>
                <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                  <Award size={14} className="text-gray-400" />
                  {selectedTournament.prize_details || 'N/A'}
                </span>
              </div>

              {selectedTournament.description && (
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Description</span>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1">{selectedTournament.description}</p>
                </div>
              )}

              {selectedTournament.rules && (
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Rules</span>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1">{selectedTournament.rules}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                disabled={actionLoading}
                onClick={() => {
                  setShowDetailsModal(false);
                  triggerReject(selectedTournament.tournament_id, selectedTournament.title);
                }}
                className="flex-1 py-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reject
              </button>
              <button
                disabled={actionLoading}
                onClick={() => {
                  setShowDetailsModal(false);
                  triggerApprove(selectedTournament.tournament_id, selectedTournament.title);
                }}
                className="flex-1 py-3 bg-[#08733e] hover:bg-[#065b31] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg border border-[#e5e5e5] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#111111] mb-2">
              {confirmAction?.type === 'APPROVE' ? 'Approve Tournament' : 'Reject Tournament'}
            </h3>
            <p className="text-[#666666] text-sm leading-relaxed mb-6">
              {confirmAction?.type === 'APPROVE'
                ? `Are you sure you want to approve the tournament "${confirmAction?.name}"? This will allow organizer setup and open registration.`
                : `Are you sure you want to reject the tournament request for "${confirmAction?.name}"?`}
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
                className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs ${
                  confirmAction?.type === 'APPROVE' ? 'bg-[#08733e] hover:bg-[#065b31]' : 'bg-[#991b1b] hover:bg-[#7f1d1d]'
                }`}
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
