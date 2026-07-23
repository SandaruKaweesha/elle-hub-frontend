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
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function SponsorDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [sponsorData, setSponsorData] = useState({
    companyName: "ABC Company",
    contactPerson: "Nimal",
    contactNumber: "0771234567",
    address: "Colombo, Sri Lanka",
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch User & Sponsor Profile
      const resU = await api.get(`/user/${userId}`);
      if (resU.data && resU.data.success !== false) {
        const u = resU.data.data;
        setSponsorData({
          companyName: u.company_name || u.companyName || u.display_name || "Sponsor Company",
          contactPerson: u.sponsor_contact_person || u.contact_person || u.contactPerson || "Nimal",
          contactNumber: u.contact_number || "0771234567",
          address: u.sponsor_address || u.address || "Colombo, Sri Lanka",
        });
      }

      // Fetch incoming sponsorship requests
      const resR = await api.get(`/sponsor/${userId}/requests`);
      if (resR.data && resR.data.success !== false) {
        setRequests(resR.data.data || []);
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

  const activeSponsorships = requests.filter(r => ['ACCEPTED', 'APPROVED'].includes((r.status || '').toUpperCase()));
  const pendingRequests = requests.filter(r => (r.status || '').toUpperCase() === 'PENDING');

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
            <h3 className="text-3xl font-extrabold text-[#111111]">{requests.length}</h3>
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
          <div className="py-12 text-center bg-[#f8f7f4] rounded-2xl border border-dashed border-gray-200">
            <BadgeDollarSign size={36} className="mx-auto text-gray-400 mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-[#111111]">No Active Sponsorships Yet</h4>
            <p className="text-xs text-[#666666] mt-1 max-w-xs mx-auto">
              Accept incoming tournament invitations or offer sponsorship to public tournaments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSponsorships.map((req) => (
              <div 
                key={req.request_id || req.tournament_id}
                className="p-4 rounded-xl border border-gray-100 hover:border-[#00382D]/30 bg-[#f8f7f4] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div>
                  <h4 className="text-base font-bold text-[#111111]">{req.tournament_title}</h4>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Organized by: <strong className="text-[#00382D]">{req.organizer_name}</strong> | Location: {req.location} | Date: {req.tournament_held_date || req.start_date || 'TBD'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider shrink-0 self-start md:self-center">
                  ACTIVE SPONSOR
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
