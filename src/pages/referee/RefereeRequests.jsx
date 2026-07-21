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
  Info,
  Award,
  Send
} from "lucide-react";
import api from "../../services/api";

export default function RefereeRequests() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
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
  }, [requests, searchQuery, statusFilter]);

  const pendingCount = requests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;
  const approvedCount = requests.filter(r => {
    const s = (r.status || '').toUpperCase();
    return s === 'APPROVED' || s === 'ACCEPTED';
  }).length;
  const rejectedCount = requests.filter(r => {
    const s = (r.status || '').toUpperCase();
    return s === 'REJECTED' || s === 'DECLINED';
  }).length;

  const getStageInfo = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACCEPTED') {
      return {
        stageNumber: 3,
        stageTotal: 3,
        stageTitle: 'Officially Confirmed as Referee',
        description: 'The organizer has accepted your request. You are officially appointed as a referee for this tournament.',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        progressBg: 'bg-emerald-600',
        icon: <CheckCircle2 size={16} className="text-emerald-600" />
      };
    } else if (s === 'REJECTED' || s === 'DECLINED') {
      return {
        stageNumber: 2,
        stageTotal: 3,
        stageTitle: 'Application Declined',
        description: 'The organizer has declined this officiating request.',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        progressBg: 'bg-red-500',
        icon: <XCircle size={16} className="text-red-600" />
      };
    } else {
      return {
        stageNumber: 2,
        stageTotal: 3,
        stageTitle: 'Pending Organizer Review',
        description: 'Your request has been submitted successfully and is currently under review by the tournament organizer.',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        progressBg: 'bg-amber-500',
        icon: <Clock size={16} className="text-amber-600" />
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <ClipboardList size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Match Requests & Status</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Track the current review stage and approval status of your tournament officiating applications.</p>
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

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#00382D] text-white border-[#00382D] shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Requests ({requests.length})
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pending Review ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Confirmed ({approvedCount})
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === "REJECTED"
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Declined ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search request or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D]"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading your match officiating requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Match Requests Found</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {statusFilter === "ALL" 
              ? "You have not submitted any tournament officiating requests yet. Go to the Tournaments page to apply!" 
              : "No requests found under the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const stage = getStageInfo(req.status);
            const reqDate = req.request_date ? new Date(req.request_date).toLocaleDateString() : 'Recently';

            return (
              <div key={req.request_id || req.tournament_id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all p-6 space-y-4">
                
                {/* Top Row: Tournament Title & Current Stage Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#00382D] text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">{req.tournament_title || 'Elle Tournament'}</h3>
                      <p className="text-xs text-[#666666] font-medium mt-0.5">
                        Organized by: <strong className="text-[#00382D]">{req.organizer_name || 'Elle Sports Association'}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-2 self-start sm:self-center shrink-0 ${stage.badgeBg}`}>
                    {stage.icon}
                    <span>{stage.stageTitle}</span>
                  </span>
                </div>

                {/* Middle Row: Detailed Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#555555]">
                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <MapPin size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Venue:</span>
                      <strong className="text-[#111111]">{req.location || 'Sri Lanka'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Calendar size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Held Date:</span>
                      <strong className="text-[#111111]">{req.tournament_held_date || req.start_date || 'TBD'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Phone size={15} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Organizer Contact:</span>
                      <strong className="text-[#00382D]">{req.contact_number || 'Available on Request'}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stage Stepper Progress Indicator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#333333]">Application Stage Timeline</span>
                    <span className="text-[#666666]">Step {stage.stageNumber} of {stage.stageTotal}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full transition-all duration-500 ${stage.progressBg}`} 
                      style={{ width: `${(stage.stageNumber / stage.stageTotal) * 100}%` }}
                    ></div>
                  </div>

                  {/* Stage Stepper Labels */}
                  <div className="grid grid-cols-3 text-[11px] font-semibold text-center text-gray-500">
                    <div className="text-emerald-700 flex items-center justify-start gap-1 font-bold">
                      <CheckCircle2 size={12} /> 1. Request Sent
                    </div>
                    <div className={`flex items-center justify-center gap-1 ${stage.stageNumber >= 2 ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                      {stage.stageNumber >= 2 ? <CheckCircle2 size={12} /> : <Clock size={12} />} 2. Organizer Review
                    </div>
                    <div className={`flex items-center justify-end gap-1 ${stage.stageNumber === 3 ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                      {stage.stageNumber === 3 ? <CheckCircle2 size={12} /> : <Award size={12} />} 3. Final Decision
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Submitted on: {reqDate}</span>
                  <button 
                    onClick={() => { setSelectedReq(req); setShowModal(true); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    View Stage Details <ChevronRight size={14} />
                  </button>
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

            {/* Current Stage Detailed Info Box */}
            <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Application Status:</span>
                <span className={`px-2.5 py-0.5 font-bold uppercase rounded-lg border ${getStageInfo(selectedReq.status).badgeBg}`}>
                  {selectedReq.status}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-[#888888] font-semibold block mb-1">Stage Status Note:</span>
                <p className="text-gray-800 font-medium leading-relaxed">
                  {getStageInfo(selectedReq.status).description}
                </p>
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