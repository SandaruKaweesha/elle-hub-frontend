import React, { useState, useEffect, useMemo } from "react";
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building, 
  MapPin, 
  Calendar, 
  Phone, 
  X, 
  ShieldCheck, 
  ChevronRight,
  Send,
  Inbox,
  UserCheck,
  Ban,
  Check,
  RefreshCw,
  Award
} from "lucide-react";
import api from "../../services/api";

export default function RefereeRequests() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [activeTab, setActiveTab] = useState("SENT"); // "SENT" (My Applications) or "RECEIVED" (Organizer Invitations)
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Details Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const response = await api.get(`/referee/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch match requests.");
      }
    } catch (err) {
      console.error("Fetch referee requests error:", err);
      setError(err.response?.data?.message || err.message || "Could not load referee match requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  // Separate requests into SENT (initiated by REFEREE or default) and RECEIVED (initiated by ORGANIZER)
  const sentRequests = useMemo(() => {
    return requests.filter(r => (r.initiated_by || '').toUpperCase() !== 'ORGANIZER');
  }, [requests]);

  const receivedRequests = useMemo(() => {
    return requests.filter(r => (r.initiated_by || '').toUpperCase() === 'ORGANIZER');
  }, [requests]);

  const currentTabRequests = activeTab === "SENT" ? sentRequests : receivedRequests;

  const filteredRequests = useMemo(() => {
    return currentTabRequests.filter((r) => {
      const query = searchQuery.toLowerCase();
      const title = (r.tournament_title || "").toLowerCase();
      const organizer = (r.organizer_name || "").toLowerCase();
      const venue = (r.location || "").toLowerCase();

      const matchesSearch = title.includes(query) || organizer.includes(query) || venue.includes(query);
      
      const s = (r.status || "").toUpperCase();
      let matchesStatus = true;

      if (statusFilter === "PENDING") {
        matchesStatus = s === "PENDING";
      } else if (statusFilter === "APPROVED") {
        matchesStatus = s === "APPROVED" || s === "ACCEPTED";
      } else if (statusFilter === "REJECTED") {
        matchesStatus = s === "REJECTED" || s === "DECLINED";
      }

      return matchesSearch && matchesStatus;
    });
  }, [currentTabRequests, searchQuery, statusFilter]);

  // Handler for Referee cancelling their sent application
  const handleCancelMyRequest = async (tournamentId, tournamentTitle) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post("/tournament/referee-request/cancel", {
        tournamentId,
        refereeUserId: userId
      });

      if (res.data && res.data.success !== false) {
        setSuccessMsg(`Your officiating application for "${tournamentTitle}" has been cancelled.`);
        setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(res.data.message || "Failed to cancel request.");
      }
    } catch (err) {
      console.error("Cancel request error:", err);
      setError(err.response?.data?.message || err.message || "Could not cancel request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler for Referee Accepting or Declining Organizer's Invitation
  const handleRespondToInvitation = async (tournamentId, tournamentTitle, newStatus) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post(`/tournament/${tournamentId}/referee-requests/respond`, {
        tournamentId,
        refereeUserId: userId,
        status: newStatus
      });

      if (res.data && res.data.success !== false) {
        const text = (newStatus === 'APPROVED' || newStatus === 'ACCEPTED') ? 'accepted' : 'declined';
        setSuccessMsg(`Organizer invitation for "${tournamentTitle}" ${text} successfully!`);
        setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(res.data.message || "Failed to respond to invitation.");
      }
    } catch (err) {
      console.error("Respond to invitation error:", err);
      setError(err.response?.data?.message || err.message || "Could not respond to invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status, initiatedBy) => {
    const s = (status || '').toUpperCase();
    const isRefereeSent = (initiatedBy || '').toUpperCase() === 'REFEREE';

    if (s === 'APPROVED' || s === 'ACCEPTED') {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 size={14} className="text-emerald-600" />
          {isRefereeSent ? "Organizer Accepted & Approved" : "Invitation Accepted"}
        </span>
      );
    } else if (s === 'REJECTED' || s === 'DECLINED') {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-xl border bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5 shadow-2xs">
          <XCircle size={14} className="text-red-600" />
          {isRefereeSent ? "Organizer Declined" : "Invitation Declined"}
        </span>
      );
    } else if (s === 'CANCELLED') {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-xl border bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1.5 shadow-2xs">
          <Ban size={14} className="text-gray-500" />
          Cancelled by You
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-xl border bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1.5 shadow-2xs">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          {isRefereeSent ? "Pending Organizer Review" : "Pending Your Response"}
        </span>
      );
    }
  };

  const getStageInfo = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACCEPTED') {
      return {
        step: 3,
        label: 'Stage 3: Confirmed & Accepted by Organizer',
        bg: 'bg-emerald-600',
        text: 'text-emerald-700'
      };
    } else if (s === 'REJECTED' || s === 'DECLINED') {
      return {
        step: 3,
        label: 'Stage 3: Declined by Organizer',
        bg: 'bg-red-500',
        text: 'text-red-700'
      };
    } else if (s === 'CANCELLED') {
      return {
        step: 1,
        label: 'Cancelled by You',
        bg: 'bg-gray-400',
        text: 'text-gray-500'
      };
    } else {
      return {
        step: 2,
        label: 'Stage 2: Pending Organizer Review',
        bg: 'bg-amber-500',
        text: 'text-amber-700'
      };
    }
  };

  const pendingSentCount = sentRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;
  const pendingReceivedCount = receivedRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <ClipboardList size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Officiating Requests Management</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Track your sent tournament applications and manage incoming organizer invitations.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* CLEAN MAIN TABS (NO 'SECTION 1/2' WORDS OR SUBTEXT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tab 1: My Sent Applications */}
        <button
          onClick={() => { setActiveTab("SENT"); setStatusFilter("ALL"); }}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer shadow-sm ${
            activeTab === "SENT"
              ? "bg-[#00382D] text-white border-[#00382D] ring-2 ring-[#00382D]/20"
              : "bg-white text-gray-700 border-[#e5e5e5] hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              activeTab === "SENT" ? "bg-white/10 text-white" : "bg-[#00382D]/10 text-[#00382D]"
            }`}>
              <Send size={20} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">My Sent Applications</h3>
              {pendingSentCount > 0 && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingSentCount} Pending
                </span>
              )}
            </div>
          </div>
          <span className="font-extrabold text-lg">{sentRequests.length}</span>
        </button>

        {/* Tab 2: Organizer Invitations */}
        <button
          onClick={() => { setActiveTab("RECEIVED"); setStatusFilter("ALL"); }}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer shadow-sm ${
            activeTab === "RECEIVED"
              ? "bg-[#00382D] text-white border-[#00382D] ring-2 ring-[#00382D]/20"
              : "bg-white text-gray-700 border-[#e5e5e5] hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              activeTab === "RECEIVED" ? "bg-white/10 text-white" : "bg-[#00382D]/10 text-[#00382D]"
            }`}>
              <Inbox size={20} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Organizer Invitations</h3>
            </div>
          </div>
          <span className="font-extrabold text-lg">{receivedRequests.length}</span>
        </button>

      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Sub-Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#00382D] text-white border-[#00382D]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All ({currentTabRequests.length})
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pending
          </button>

          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Accepted
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "REJECTED"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Declined
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search title, venue, organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D]"
          />
        </div>
      </div>

      {/* Requests List Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading requests directory...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            {activeTab === "SENT" ? <Send size={32} /> : <Inbox size={32} />}
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">
            {activeTab === "SENT" ? "No Sent Applications Found" : "No Incoming Organizer Invitations"}
          </h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {activeTab === "SENT" 
              ? "You haven't submitted any officiating applications to tournament organizers yet."
              : "No organizer invitations received yet matching your search filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const tournamentId = req.tournament_id;
            const title = req.tournament_title || 'Elle Tournament';
            const organizer = req.organizer_name || 'Elle Sports Association';
            const contactPhone = req.contact_number || 'Available on Request';
            const location = req.location || 'Sri Lanka';
            const heldDate = req.tournament_held_date || req.start_date || 'TBD';
            const statusUpper = (req.status || '').toUpperCase();
            const isPending = statusUpper === 'PENDING';
            const isActionLoading = actionLoadingId === tournamentId;
            const stageInfo = getStageInfo(req.status);

            return (
              <div key={`${req.request_id}-${tournamentId}`} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all p-6 space-y-4">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold shrink-0 ${
                      activeTab === "SENT" ? "bg-[#00382D]" : "bg-emerald-800"
                    }`}>
                      {activeTab === "SENT" ? <Send size={20} /> : <Inbox size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">{title}</h3>
                      <p className="text-xs text-[#666666] font-medium mt-0.5">
                        Organizer: <strong className="text-[#00382D]">{organizer}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {getStatusBadge(req.status, req.initiated_by)}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#555555]">
                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <MapPin size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Venue:</span>
                      <strong className="text-[#111111]">{location}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Calendar size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Held Date:</span>
                      <strong className="text-[#111111]">{heldDate}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Phone size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Contact Number:</span>
                      <strong className="text-[#00382D]">{contactPhone}</strong>
                    </div>
                  </div>
                </div>

                {/* VISUAL STAGE STEPPER TIMELINE FOR MY SENT APPLICATIONS */}
                {activeTab === "SENT" && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#333333]">Application Review Timeline</span>
                      <span className={stageInfo.text}>{stageInfo.label}</span>
                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full transition-all duration-500 ${stageInfo.bg}`} 
                        style={{ width: `${(stageInfo.step / 3) * 100}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 text-[11px] font-semibold text-center text-gray-500">
                      <div className="text-emerald-700 flex items-center justify-start gap-1 font-bold">
                        <CheckCircle2 size={12} /> 1. Request Sent
                      </div>
                      <div className={`flex items-center justify-center gap-1 ${stageInfo.step >= 2 ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                        {stageInfo.step >= 2 ? <CheckCircle2 size={12} /> : <Clock size={12} />} 2. Organizer Review
                      </div>
                      <div className={`flex items-center justify-end gap-1 ${stageInfo.step === 3 ? (statusUpper === 'REJECTED' ? "text-red-600 font-bold" : "text-emerald-700 font-bold") : "text-gray-400"}`}>
                        {stageInfo.step === 3 ? (statusUpper === 'REJECTED' ? <XCircle size={12} /> : <CheckCircle2 size={12} />) : <Award size={12} />} 3. Final Decision
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Specific Action Footers */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    Requested on: {req.request_date ? new Date(req.request_date).toLocaleDateString() : 'Recently'}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* MY SENT APPLICATIONS -> CANCEL BUTTON IF PENDING */}
                    {activeTab === "SENT" && isPending && (
                      <button
                        onClick={() => handleCancelMyRequest(tournamentId, title)}
                        disabled={isActionLoading}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <Ban size={14} />
                            Cancel Application
                          </>
                        )}
                      </button>
                    )}

                    {/* INCOMING INVITATIONS -> ACCEPT & DECLINE BUTTONS IF PENDING */}
                    {activeTab === "RECEIVED" && isPending && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleRespondToInvitation(tournamentId, title, 'APPROVED')}
                          disabled={isActionLoading}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#00382D] hover:bg-[#002a22] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {isActionLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check size={14} />
                          )}
                          Accept Invitation
                        </button>

                        <button
                          onClick={() => handleRespondToInvitation(tournamentId, title, 'REJECTED')}
                          disabled={isActionLoading}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <X size={14} />
                          Decline Invitation
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => { setSelectedReq(req); setShowModal(true); }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#333333] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- STAGE DETAILS MODAL --- */}
      {showModal && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shrink-0">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedReq.tournament_title || 'Elle Tournament'}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D]">{selectedReq.organizer_name || 'Elle Sports Association'}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Request Type:</span>
                <span className="font-bold text-[#00382D]">
                  {(selectedReq.initiated_by || '').toUpperCase() === 'REFEREE' ? 'My Sent Application' : 'Incoming Organizer Invitation'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 font-medium">Current Status:</span>
                <div>
                  {getStatusBadge(selectedReq.status, selectedReq.initiated_by)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#333333] mb-6">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Venue Location:</span>
                <span className="font-bold">{selectedReq.location || 'Sri Lanka'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Held Date:</span>
                <span className="font-bold">{selectedReq.tournament_held_date || selectedReq.start_date || 'TBD'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Organizer Contact:</span>
                <span className="font-bold text-[#00382D]">{selectedReq.contact_number || 'Available on Request'}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Close Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
}