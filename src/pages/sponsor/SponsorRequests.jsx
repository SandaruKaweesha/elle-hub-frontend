import React, { useState, useEffect, useMemo } from "react";
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Phone, 
  X, 
  Send, 
  Inbox, 
  Eye, 
  Trophy, 
  Building2,
  BadgeDollarSign,
  XCircle,
  Users,
  UserCheck
} from "lucide-react";
import api from "../../services/api";

export default function SponsorRequests() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [activeTab, setActiveTab] = useState("SENT"); // "SENT" (My Sent Applications) or "RECEIVED" (Organizer Invitations)
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

      const response = await api.get(`/sponsor/${userId}/requests`);
      if (response.data && response.data.success !== false) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to load sponsorship requests.");
      }
    } catch (err) {
      console.error("Error loading sponsor requests:", err);
      setError(err.response?.data?.message || err.message || "Could not fetch sponsorship requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  // Separate requests into SENT (initiated by SPONSOR) and RECEIVED (initiated by ORGANIZER)
  const sentRequests = useMemo(() => {
    return requests.filter(r => (r.initiated_by || '').toUpperCase() === 'SPONSOR' || (r.initiated_by || '').toUpperCase() !== 'ORGANIZER');
  }, [requests]);

  const receivedRequests = useMemo(() => {
    return requests.filter(r => (r.initiated_by || '').toUpperCase() === 'ORGANIZER');
  }, [requests]);

  const currentTabRequests = activeTab === "SENT" ? sentRequests : receivedRequests;

  const filteredRequests = useMemo(() => {
    return currentTabRequests.filter((r) => {
      const query = searchQuery.toLowerCase();
      const title = (r.tournament_title || r.title || "").toLowerCase();
      const organizer = (r.organizer_name || "").toLowerCase();
      const venue = (r.location || "").toLowerCase();

      const matchesSearch = title.includes(query) || organizer.includes(query) || venue.includes(query);
      
      const s = (r.status || "").toUpperCase();
      let matchesStatus = true;

      if (statusFilter === "PENDING") {
        matchesStatus = s === "PENDING";
      } else if (statusFilter === "APPROVED") {
        matchesStatus = s === "APPROVED" || s === "ACCEPTED";
      } else if (statusFilter === "DECLINED") {
        matchesStatus = s === "REJECTED" || s === "DECLINED";
      }

      return matchesSearch && matchesStatus;
    });
  }, [currentTabRequests, searchQuery, statusFilter]);

  const pendingSentCount = sentRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;
  const pendingReceivedCount = receivedRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

  // Handler for Sponsor responding to Organizer's Request
  const handleRespond = async (tournamentId, status) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const response = await api.post(`/tournament/${tournamentId}/sponsor-requests/respond`, {
        sponsorUserId: userId,
        status: status
      });

      if (response.data && response.data.success !== false) {
        setSuccessMsg(`Sponsorship request successfully ${status.toLowerCase()}ed.`);
        if (showModal) setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(response.data.message || `Failed to ${status.toLowerCase()} request.`);
      }
    } catch (err) {
      console.error("Respond error:", err);
      setError(err.response?.data?.message || err.message || "Could not update request status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler for Sponsor cancelling sent proposal
  const handleCancelSponsorRequest = async (tournamentId, tournamentTitle) => {
    try {
      setActionLoadingId(tournamentId);
      setError(null);
      setSuccessMsg(null);

      const response = await api.post(`/tournament/${tournamentId}/sponsor-requests/respond`, {
        sponsorUserId: userId,
        status: 'CANCELLED'
      });

      if (response.data && response.data.success !== false) {
        setSuccessMsg(`Your sponsorship proposal for "${tournamentTitle || 'tournament'}" has been cancelled.`);
        if (showModal) setShowModal(false);
        fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to cancel sponsorship proposal.");
      }
    } catch (err) {
      console.error("Cancel proposal error:", err);
      setError(err.response?.data?.message || err.message || "Could not cancel sponsorship proposal.");
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
              <BadgeDollarSign size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Sponsorship Requests</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Track your sent sponsorship proposals and manage incoming organizer invitations.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
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
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
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
              {pendingReceivedCount > 0 && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingReceivedCount} Pending
                </span>
              )}
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
                : "bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50"
            }`}
          >
            All ({currentTabRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-[#00382D] text-white border-[#00382D]"
                : "bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "APPROVED"
                ? "bg-[#00382D] text-white border-[#00382D]"
                : "bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50"
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setStatusFilter("DECLINED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "DECLINED"
                ? "bg-[#00382D] text-white border-[#00382D]"
                : "bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50"
            }`}
          >
            Declined
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, venue, organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D] transition-all font-semibold"
          />
        </div>

      </div>

      {/* Requests Grid / List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading sponsorship requests...</p>
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
              ? "You haven't submitted any sponsorship proposals to tournament organizers yet." 
              : "There are currently no incoming sponsorship invitations from organizers."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const reqStatus = (req.status || 'PENDING').toUpperCase();
            const isApproved = reqStatus === 'APPROVED' || reqStatus === 'ACCEPTED';
            const isDeclined = reqStatus === 'REJECTED' || reqStatus === 'DECLINED';
            const isPending = reqStatus === 'PENDING';
            const tourneyStatus = (req.tournament_status || req.tournamentStatus || '').toUpperCase();
            const isTournamentFinalized = tourneyStatus === 'FINALIZED' || tourneyStatus === 'COMPLETED';

            return (
              <div 
                key={req.request_id || req.tournament_id}
                className="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                {/* Left Info Section */}
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00382D] to-[#08733e] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Trophy size={26} />
                  </div>
                  
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#00382D] transition-colors leading-snug">
                        {req.tournament_title || req.title || 'Elle Championship'}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isDeclined 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isApproved ? 'ACCEPTED' : isDeclined ? 'DECLINED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#666666] flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 size={14} className="text-[#00382D]" /> Organized by: <strong className="text-[#111111]">{req.organizer_name || 'Elle Association'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#00382D]" /> Location: <strong className="text-[#111111]">{req.location || 'Sri Lanka'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#00382D]" /> Held Date: <strong className="text-[#111111]">{req.tournament_held_date || req.start_date || 'TBD'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-[#00382D]" /> Contact: <strong className="text-[#00382D]">{req.contact_number || '0771234567'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Section */}
                <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReq(req);
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Eye size={15} /> View Details
                  </button>

                  {activeTab === "RECEIVED" && isPending && (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoadingId === req.tournament_id}
                        onClick={() => handleRespond(req.tournament_id, 'DECLINED')}
                        className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        disabled={actionLoadingId === req.tournament_id}
                        onClick={() => handleRespond(req.tournament_id, 'ACCEPTED')}
                        className="px-4 py-2.5 bg-[#00382D] text-white hover:bg-[#002a22] rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  {activeTab === "SENT" && isPending && (
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-2 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                        <Clock size={14} /> Proposal Pending
                      </span>
                      {!isTournamentFinalized && (
                        <button
                          type="button"
                          disabled={actionLoadingId === req.tournament_id}
                          onClick={() => handleCancelSponsorRequest(req.tournament_id, req.tournament_title || req.title)}
                          className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <XCircle size={14} /> Cancel Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Popup Modal */}
      {showModal && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00382D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <BadgeDollarSign size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">{selectedReq.tournament_title || selectedReq.title}</h3>
                <p className="text-xs text-[#00382D] font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building2 size={14} /> Organized by {selectedReq.organizer_name || 'Elle Sports Association'}
                </p>
              </div>
            </div>

            {/* Comprehensive Specifications List */}
            <div className="space-y-2.5 text-xs text-[#333333] max-h-[420px] overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Building2 size={14} className="text-[#00382D]" /> Organizer Name:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.organizer_name || 'Elle Sports Association'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Phone size={14} className="text-[#00382D]" /> Contact Telephone:
                </span>
                <span className="font-bold text-[#00382D]">{selectedReq.contact_number || '0771234567'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-[#00382D]" /> Venue Location:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.location || 'Sri Lanka'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Calendar size={14} className="text-[#00382D]" /> Tournament Held Date:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.tournament_held_date || selectedReq.start_date || '2026-09-17'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <Users size={14} className="text-[#00382D]" /> Maximum Team Limit:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.maximum_team_limit || 16} Registered Teams</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <span className="text-[#666666] font-semibold flex items-center gap-2">
                  <UserCheck size={14} className="text-[#00382D]" /> Maximum Referee Limit:
                </span>
                <span className="font-bold text-[#111111]">{selectedReq.maximum_referee_limit || 4} Certified Referees</span>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>

              {activeTab === "SENT" && (selectedReq.status || '').toUpperCase() === 'PENDING' && !((selectedReq.tournament_status || selectedReq.tournamentStatus || '').toUpperCase() === 'FINALIZED' || (selectedReq.tournament_status || selectedReq.tournamentStatus || '').toUpperCase() === 'COMPLETED') && (
                <button
                  type="button"
                  disabled={actionLoadingId === selectedReq.tournament_id}
                  onClick={() => handleCancelSponsorRequest(selectedReq.tournament_id, selectedReq.tournament_title || selectedReq.title)}
                  className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={14} /> Cancel Proposal
                </button>
              )}

              {activeTab === "RECEIVED" && (selectedReq.status || '').toUpperCase() === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoadingId === selectedReq.tournament_id}
                    onClick={() => handleRespond(selectedReq.tournament_id, 'DECLINED')}
                    className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    disabled={actionLoadingId === selectedReq.tournament_id}
                    onClick={() => handleRespond(selectedReq.tournament_id, 'ACCEPTED')}
                    className="px-5 py-2.5 bg-[#00382D] text-white hover:bg-[#002a22] rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Accept Invitation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
