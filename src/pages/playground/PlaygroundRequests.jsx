import React, { useState, useEffect, useMemo } from "react";
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building, 
  MapPin, 
  Calendar, 
  Phone, 
  X, 
  Send, 
  Inbox, 
  Check, 
  Eye, 
  Trophy, 
  Building2 
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundRequests() {
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

  // Details Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const response = await api.get(`/playground/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch venue requests.");
      }
    } catch (err) {
      console.error("Fetch playground requests error:", err);
      setError(err.response?.data?.message || err.message || "Could not load venue hosting requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  // Separate requests into SENT (initiated by PLAYGROUND) and RECEIVED (initiated by ORGANIZER)
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

  const pendingSentCount = sentRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;
  const pendingReceivedCount = receivedRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

  // Handler for Playground cancelling sent venue application
  const handleCancelMyRequest = async (tournamentId, tournamentTitle) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post("/tournament/playground-request/cancel", {
        tournamentId,
        playgroundUserId: userId
      });

      if (res.data && res.data.success !== false) {
        setSuccessMsg(`Your venue hosting application for "${tournamentTitle}" has been cancelled.`);
        setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(res.data.message || "Failed to cancel venue application.");
      }
    } catch (err) {
      console.error("Cancel request error:", err);
      setError(err.response?.data?.message || err.message || "Could not cancel venue application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler for Playground Accepting or Declining Organizer's Request
  const handleRespondToInvitation = async (tournamentId, tournamentTitle, newStatus) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post(`/tournament/${tournamentId}/playground-requests/respond`, {
        tournamentId,
        playgroundUserId: userId,
        status: newStatus
      });

      if (res.data && res.data.success !== false) {
        const actionText = (newStatus === 'APPROVED' || newStatus === 'ACCEPTED') ? 'accepted' : 'declined';
        setSuccessMsg(`Organizer's hosting request for "${tournamentTitle}" ${actionText} successfully!`);
        setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(res.data.message || "Failed to respond to organizer request.");
      }
    } catch (err) {
      console.error("Respond request error:", err);
      setError(err.response?.data?.message || err.message || "Could not respond to organizer request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <ClipboardList size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Venue Hosting Requests</h1>
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

      {/* Main Tab Cards Grid */}
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
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search title, venue, organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D] transition-all"
          />
        </div>

      </div>

      {/* Requests Content Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading venue requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            {activeTab === "SENT" ? <Send size={28} /> : <Inbox size={28} />}
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">
            {activeTab === "SENT" ? "No Sent Applications Found" : "No Organizer Invitations Found"}
          </h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {activeTab === "SENT"
              ? "You haven't submitted any officiating or venue applications to tournament organizers yet."
              : "No organizers have dispatched venue hosting invitations matching this criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((r) => {
            const reqStatus = (r.status || 'PENDING').toUpperCase();
            const isPending = reqStatus === 'PENDING';
            const isApproved = reqStatus === 'APPROVED' || reqStatus === 'ACCEPTED';
            const isRejected = reqStatus === 'REJECTED' || reqStatus === 'DECLINED';
            const reqId = r.tournament_id || r.request_id;
            const isActioning = actionLoadingId === reqId;

            return (
              <div key={reqId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                
                <div>
                  {/* Top Status Header */}
                  <div className="p-4 bg-[#f8f7f4] border-b border-[#e5e5e5] flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
                      {activeTab === "SENT" ? <Send size={12} className="text-[#00382D]" /> : <Inbox size={12} className="text-[#00382D]" />}
                      {activeTab === "SENT" ? "My Sent Application" : "Organizer Invitation"}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isRejected 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {isApproved ? 'Approved' : isRejected ? 'Declined' : 'Pending Review'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#00382D] transition-colors leading-snug line-clamp-2">
                        {r.tournament_title}
                      </h3>
                      <p className="text-xs text-[#666666] font-medium mt-1 flex items-center gap-1.5">
                        <Building size={14} className="text-[#00382D] shrink-0" /> Organized by <span className="font-semibold text-[#333333]">{r.organizer_name}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#555555]">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00382D] shrink-0" />
                        <span>Venue Location: <strong className="text-[#111111]">{r.location || 'Badulla Ground'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#00382D] shrink-0" />
                        <span>Held Date: <strong className="text-[#111111]">{r.tournament_held_date || '2026-08-28'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[#00382D] shrink-0" />
                        <span>Contact: <strong className="text-[#00382D]">{r.contact_number || '0771234567'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-[#f8f7f4] border-t border-[#e5e5e5] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedReq(r); setShowModal(true); }}
                      className="flex-1 py-2 bg-white border border-[#e5e5e5] text-[#333333] font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye size={14} /> View Details
                    </button>

                    {activeTab === "SENT" && isPending && (
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleCancelMyRequest(r.tournament_id, r.tournament_title)}
                        className="py-2 px-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {activeTab === "RECEIVED" && isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleRespondToInvitation(r.tournament_id, r.tournament_title, 'APPROVED')}
                        className="flex-1 py-2 bg-[#00382D] hover:bg-[#002a22] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Check size={14} /> Accept Request
                      </button>

                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleRespondToInvitation(r.tournament_id, r.tournament_title, 'REJECTED')}
                        className="py-2 px-3 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- REQUEST DETAILS MODAL --- */}
      {showModal && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedReq.tournament_title}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D] font-semibold">{selectedReq.organizer_name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#333333] mb-6">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <MapPin size={14} className="text-[#00382D]" /> Venue Location:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.location || 'Badulla Ground'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-[#00382D]" /> Held Date:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.tournament_held_date || '2026-08-28'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Phone size={14} className="text-[#00382D]" /> Organizer Contact:
                </span>
                <span className="font-bold text-[#00382D]">{selectedReq.contact_number || '0771234567'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#888888] font-medium flex items-center gap-2">
                  <Clock size={14} className="text-[#00382D]" /> Current Status:
                </span>
                <span className="font-bold text-[#111111] uppercase">{selectedReq.status || 'PENDING'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
