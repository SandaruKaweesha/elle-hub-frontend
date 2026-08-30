import React, { useState, useEffect } from "react";
import { 
  BadgeDollarSign, 
  Trophy, 
  CalendarDays, 
  MapPin, 
  Building2, 
  Phone,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  History
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function SponsorDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [sponsorData, setSponsorData] = useState({
    companyName: "Dialog",
    contactPerson: "Kamal",
    contactNumber: "0781254512",
    address: "Colombo, Sri Lanka",
  });

  const [allRequests, setAllRequests] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Profile
      const resU = await api.get(`/user/${userId}`).catch(() => null);
      if (resU?.data?.data && resU.data.success !== false) {
        const u = resU.data.data;
        setSponsorData({
          companyName: u.company_name || u.companyName || u.display_name || "Sponsor Company",
          contactPerson: u.sponsor_contact_person || u.contact_person || u.contactPerson || "Kamal",
          contactNumber: u.contact_number || "0781254512",
          address: u.sponsor_address || u.address || "Colombo, Sri Lanka",
        });
      }

      // 2. Fetch Requests & History in parallel
      const [resR, resH] = await Promise.all([
        api.get(`/sponsor/${userId}/requests`).catch(() => null),
        api.get(`/sponsor/${userId}/history`).catch(() => null)
      ]);

      if (resR?.data?.data && resR.data.success !== false) {
        setAllRequests(resR.data.data || []);
      }

      if (resH?.data?.data && resH.data.success !== false) {
        setHistoryItems(resH.data.data || []);
      }

    } catch (err) {
      console.error("Fetch sponsor dashboard error:", err);
      setError("Could not load sponsor dashboard details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  // Derived Metrics
  const activeSponsorships = allRequests.filter(r => {
    const tStatus = (r.tournament_status || '').toUpperCase();
    const rStatus = (r.status || '').toUpperCase();
    return tStatus !== 'COMPLETED' && tStatus !== 'FINISHED' && (rStatus === 'ACCEPTED' || rStatus === 'APPROVED');
  });

  const pendingRequests = allRequests.filter(r => {
    const tStatus = (r.tournament_status || '').toUpperCase();
    const rStatus = (r.status || '').toUpperCase();
    return tStatus !== 'COMPLETED' && tStatus !== 'FINISHED' && rStatus === 'PENDING';
  });

  const totalSponsoredCount = activeSponsorships.length + historyItems.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading official sponsor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#00382D] to-[#08733e] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl relative z-10">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold rounded-full tracking-wider uppercase inline-block">
            Official Corporate Sponsor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {sponsorData.companyName}!
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm font-medium flex items-center gap-1">
            <MapPin size={15} /> Contact Person: {sponsorData.contactPerson} ({sponsorData.contactNumber})
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white text-[#00382D] flex items-center justify-center font-extrabold text-xl shadow-xs">
            <BadgeDollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Active Sponsorships</span>
            <strong className="text-2xl font-black">{activeSponsorships.length} Events</strong>
          </div>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Sponsorships Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CalendarDays size={22} />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-200">
              Active
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Active Sponsorships</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">{activeSponsorships.length}</h3>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-amber-200">
              Pending
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Pending Invitations</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">{pendingRequests.length}</h3>
          </div>
        </div>

        {/* Total Sponsored Events Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Trophy size={22} />
            </div>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-200">
              Total Events
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Total Sponsored Events</p>
            <h3 className="text-3xl font-extrabold text-[#111111]">{totalSponsoredCount}</h3>
          </div>
        </div>
      </div>

      {/* Active Sponsored Tournaments */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
            <Trophy size={20} className="text-[#00382D]" /> Active Sponsored Tournaments ({activeSponsorships.length})
          </h3>
          <Link to="/sponsor/requests" className="text-xs font-bold text-[#00382D] hover:underline flex items-center gap-1">
            View Requests <ChevronRight size={14} />
          </Link>
        </div>

        {activeSponsorships.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <Trophy size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No Active Sponsored Tournaments</p>
            <p className="text-xs max-w-sm mx-auto text-gray-500">
              When an organizer accepts your proposal or you accept an organizer invitation for an active event, it will show here.
            </p>
            {historyItems.length > 0 && (
              <Link to="/sponsor/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08733e] hover:underline pt-2">
                <History size={14} /> View Completed Sponsorship History ({historyItems.length}) →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSponsorships.map((req, idx) => (
              <div 
                key={req.request_id || idx}
                className="p-5 rounded-2xl border border-[#e5e5e5] hover:border-[#00382D]/40 transition-all flex flex-col justify-between space-y-3 bg-[#f8f7f4]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#08733e] bg-[#eaf1ec] px-2.5 py-0.5 rounded-full border border-[#08733e]/20 inline-block mb-1">
                      ACTIVE EVENT
                    </span>
                    <h4 className="font-extrabold text-base text-[#111111]">{req.tournament_title || 'Tournament'}</h4>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#00382D]/10 text-[#00382D] flex items-center justify-center shrink-0">
                    <Trophy size={16} />
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                  <p className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-gray-400" /> Organized by: <span className="font-bold text-gray-800">{req.organizer_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> Venue: <span className="font-bold text-gray-800">{req.location || 'Colombo'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-gray-400" /> Date: <span className="font-bold text-gray-800">{req.tournament_held_date || req.start_date || 'Upcoming'}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[#08733e] font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Official Sponsor Confirmed
                  </span>
                  <Link to="/sponsor/requests" className="font-bold text-[#00382D] hover:underline">
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}