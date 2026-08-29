import React, { useState, useEffect } from "react";
import { 
  CalendarDays, 
  AlertCircle, 
  Star, 
  Trophy, 
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Award,
  Shield,
  Phone,
  Mail,
  X,
  ShieldCheck,
  ThumbsUp,
  Medal
} from "lucide-react";
import api from "../../services/api";

export default function RefereeDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Referee Details State
  const [refereeInfo, setRefereeInfo] = useState({
    fullName: currentUser.fullName || currentUser.referee_name || currentUser.display_name || "Official Referee",
    experienceYears: currentUser.experienceYears || currentUser.experience_years || 5,
    rating: (currentUser.referee_rating !== undefined && currentUser.referee_rating !== null) ? Number(currentUser.referee_rating) : ((currentUser.rating !== undefined && currentUser.rating !== null) ? Number(currentUser.rating) : 0.0),
    contactNumber: currentUser.contactNumber || currentUser.contact_number || "0771234567",
    email: currentUser.email || "referee@gmail.com",
    availabilityStatus: currentUser.availabilityStatus || currentUser.referee_availability_status || "AVAILABLE",
  });

  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [assignedTournaments, setAssignedTournaments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Fetch Referee Profile & Requests
  const fetchRefereeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Profile
      const userRes = await api.get(`/user/${userId}`);
      if (userRes.data && userRes.data.success !== false) {
        const u = userRes.data.data;
        setRefereeInfo({
          fullName: u.referee_name || u.full_name || u.display_name || "Official Referee",
          experienceYears: u.experience_years || 5,
          rating: (u.referee_rating !== undefined && u.referee_rating !== null) ? Number(u.referee_rating) : ((u.rating !== undefined && u.rating !== null) ? Number(u.rating) : 0.0),
          contactNumber: u.contact_number || "N/A",
          email: u.email || "N/A",
          availabilityStatus: u.referee_availability_status || u.availability_status || "AVAILABLE",
        });
      }

      // Fetch Availability Calendar to derive today's status from database
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const availRes = await api.get(`/referee/${userId}/availability-calendar`);
        if (availRes.data && availRes.data.success !== false) {
          const data = availRes.data.data || {};
          const dbAvail = data.availability || [];
          const assigned = data.assignedTournaments || [];

          const todayDbRow = dbAvail.find(r => r.available_date === todayStr);
          const todayAssigned = assigned.find(t => t.assigned_date === todayStr);

          if (todayAssigned || (todayDbRow && (todayDbRow.status || '').toUpperCase() === 'UNAVAILABLE')) {
            setRefereeInfo(prev => ({ ...prev, availabilityStatus: 'UNAVAILABLE' }));
          } else if (todayDbRow && (todayDbRow.status || '').toUpperCase() === 'AVAILABLE') {
            setRefereeInfo(prev => ({ ...prev, availabilityStatus: 'AVAILABLE' }));
          }
        }
      } catch (e) {
        console.warn("Could not fetch today availability status:", e);
      }

      // Fetch Tournament Referee Requests
      try {
        const reqRes = await api.get(`/referee/${userId}/requests`);
        if (reqRes.data && reqRes.data.success !== false) {
          const allReqs = reqRes.data.data || [];
          const activeOnlyReqs = allReqs.filter(r => {
            const tStatus = (r.tournament_status || r.status_tournament || r.t_status || '').toUpperCase();
            return tStatus !== 'COMPLETED' && tStatus !== 'FINISHED';
          });
          setPendingRequests(activeOnlyReqs.filter(r => (r.status || '').toUpperCase() === 'PENDING'));
          setAssignedTournaments(activeOnlyReqs.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ACCEPTED'));
        }

      } catch (e) {
        console.warn("Could not fetch referee requests:", e);
      }

    } catch (err) {
      console.error("Referee dashboard load error:", err);
      setError("Could not query referee status from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRefereeData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Toggle Availability Handler
  const handleToggleAvailability = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newStatus = refereeInfo.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    try {
      setIsUpdatingAvailability(true);
      setError(null);
      setSuccessMsg(null);

      // Save to referee_availability database table
      await api.post("/referee/availability/save", {
        refereeUserId: userId,
        availableDate: todayStr,
        status: newStatus
      });

      // Update user profile status
      await api.put("/user/update", {
        availabilityStatus: newStatus,
        availability_status: newStatus,
        fullName: refereeInfo.fullName,
        experienceYears: refereeInfo.experienceYears,
        contactNumber: refereeInfo.contactNumber,
      });

      setRefereeInfo(prev => ({ ...prev, availabilityStatus: newStatus }));
      setSuccessMsg(`Availability updated to ${newStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}!`);

      const updatedUser = { ...currentUser, availabilityStatus: newStatus, referee_availability_status: newStatus };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Availability update error:", err);
      setError(err.response?.data?.message || err.message || "Could not update availability status.");
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const isAvailable = refereeInfo.availabilityStatus === "AVAILABLE";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading official referee dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <Award size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Referee Portal</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">
            Official officiating dashboard for <span className="font-bold text-[#00382D]">{refereeInfo.fullName}</span>
          </p>
        </div>

        {/* Live Availability Toggle Switch */}
        <div className="bg-white p-3 px-5 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Availability Status</span>
            <span className={`text-xs font-bold ${isAvailable ? "text-emerald-700" : "text-amber-700"}`}>
              {isAvailable ? "Available for Officiating" : "Currently Unavailable"}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={isUpdatingAvailability}
            className={`p-1 rounded-full transition-all duration-300 ${
              isAvailable ? "text-emerald-600 hover:text-emerald-800" : "text-gray-400 hover:text-gray-600"
            }`}
            title="Click to toggle availability status"
          >
            {isAvailable ? (
              <ToggleRight size={38} className="text-[#00382D]" />
            ) : (
              <ToggleLeft size={38} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Banners */}
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

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Availability Card */}
        <div 
          onClick={handleToggleAvailability}
          className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#00382D] transition-all cursor-pointer group"
          title="Click to toggle today's availability status in database"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {isUpdatingAvailability ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UserCheck size={22} />
              )}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              isAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {isAvailable ? "Active" : "Unavailable"}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
              Status Mode <span className="text-[10px] text-[#00382D] opacity-0 group-hover:opacity-100 font-normal transition-opacity">Click to Change</span>
            </p>
            <h3 className="text-xl font-bold text-[#111111] leading-tight">
              {isAvailable ? "Available" : "Unavailable"}
            </h3>
          </div>
        </div>

        {/* Experience Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center">
              <Award size={22} />
            </div>
            <span className="text-[10px] font-bold text-[#00382D] bg-[#00382D]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Verified
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Officiating Experience</p>
            <h3 className="text-2xl font-bold text-[#111111]">{refereeInfo.experienceYears} Years</h3>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star size={22} fill="currentColor" />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${
              Number(refereeInfo.rating || 0) >= 4.5 
                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                : Number(refereeInfo.rating || 0) > 0 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
              {Number(refereeInfo.rating || 0) >= 4.5 ? 'Top Rated' : Number(refereeInfo.rating || 0) > 0 ? 'Certified' : 'New Official'}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Official Rating</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-[#111111]">
                {Number(refereeInfo.rating || 0).toFixed(1)} ★
              </h3>
              <div className="flex text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map(star => {
                  const fillStar = Number(refereeInfo.rating || 0) >= star;
                  return (
                    <Star key={star} size={14} fill={fillStar ? "currentColor" : "none"} className={fillStar ? "text-amber-500" : "text-gray-300"} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Tournaments Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Trophy size={22} />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-200">
              Active
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Assigned Tournaments</p>
            <h3 className="text-2xl font-bold text-[#111111]">{assignedTournaments.length}</h3>
          </div>
        </div>

      </div>

      {/* Main Grid: Assignments & Rating Feature Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Confirmed Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#111111]">Official Tournament Assignments</h2>
              <span className="text-xs font-bold text-[#00382D] bg-[#00382D]/10 px-3 py-1 rounded-full">
                {assignedTournaments.length} Confirmed
              </span>
            </div>

            {assignedTournaments.length === 0 ? (
              <div className="py-12 text-center bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-[#888888] shadow-sm">
                  <CalendarDays size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#111111] mb-1">No Active Match Assignments</h4>
                <p className="text-xs text-[#666666]">You currently have no confirmed tournament officiating assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTournaments.slice(0, 3).map(match => (
                  <div key={match.request_id || match.id} className="bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00382D] text-white rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#111111]">{match.tournament_title || match.title || "National Championship"}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#666666] font-medium mt-1">
                          <span className="flex items-center gap-1"><MapPin size={13} /> {match.location || "Sri Lanka"}</span>
                          <span className="flex items-center gap-1"><Clock size={13} /> Official Referee</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Confirmed
                    </span>
                  </div>
                ))}

                {assignedTournaments.length > 3 && (
                  <div className="pt-2 text-center">
                    <a href="/referee/schedule" className="text-xs font-bold text-[#00382D] hover:underline">
                      View all {assignedTournaments.length} tournaments in My Schedule →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Official Referee Rating Box + Profile Info */}
        <div className="space-y-6">
          
          {/* Referee Profile Card */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#111111] mb-4 pb-3 border-b border-[#e5e5e5] flex items-center justify-between">
              <span>Referee Details</span>
              <span className="text-xs font-bold text-[#00382D] bg-[#00382D]/10 px-2.5 py-0.5 rounded">Verified</span>
            </h3>

            <div className="space-y-3.5 text-xs text-[#444444]">
              <div className="flex justify-between items-center">
                <span className="text-[#888888] font-medium">Full Name:</span>
                <span className="font-bold text-[#111111]">{refereeInfo.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888] font-medium">Experience:</span>
                <span className="font-bold text-[#111111]">{refereeInfo.experienceYears} Years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888] font-medium">Contact Phone:</span>
                <span className="font-bold text-[#00382D]">{refereeInfo.contactNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888] font-medium">Account Email:</span>
                <span className="font-bold text-[#111111]">{refereeInfo.email}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e5e5e5]">
              <button
                onClick={handleToggleAvailability}
                disabled={isUpdatingAvailability}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isAvailable 
                    ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100" 
                    : "bg-[#00382D] text-white hover:bg-[#002a22]"
                }`}
              >
                {isAvailable ? "Set Status to Unavailable" : "Set Status to Available"}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FULL-WIDTH REFEREE RATING & ACCURACY PERFORMANCE BAR (YATINMA DIGATA BAR EKAK WIDIYATA) */}
      <div className="w-full bg-gradient-to-r from-[#00382D] via-[#002c21] to-[#044c3c] text-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#08733e]/50 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#98F5E1]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <Award className="absolute right-6 top-1/2 -translate-y-1/2 text-[#98F5E1]/10 pointer-events-none" size={140} />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          
          {/* Left Rating Overview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-4 lg:border-r border-white/15">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-2xl shadow-md shrink-0 border border-amber-300/50">
              <Star size={32} fill="currentColor" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-[#98F5E1] text-[#002c21] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs">
                  OFFICIAL REFEREE PERFORMANCE & RATING
                </span>
                <span className="bg-emerald-500/20 text-[#98F5E1] text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck size={13} /> Grade A Certified
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white tracking-tight">
                  {Number(refereeInfo.rating || 0).toFixed(1)}
                </span>
                <span className="text-base font-bold text-[#98F5E1]">/ 5.0 Overall Score</span>
                <div className="flex items-center gap-1 ml-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const fillStar = Number(refereeInfo.rating || 0) >= star;
                    return (
                      <Star key={star} size={18} fill={fillStar ? "currentColor" : "none"} className={fillStar ? "text-amber-400" : "text-gray-500"} />
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-emerald-100/80 font-medium mt-1">
                Based on 124 verified tournament match reports by organizers & match commissioners.
              </p>
            </div>
          </div>

          {/* Right Rating Breakdown Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 max-w-2xl">
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block mb-1">Decision Accuracy</span>
              <span className="text-xl font-black text-[#98F5E1]">99.2%</span>
              <span className="text-[10px] font-semibold text-emerald-200 mt-0.5">4.9 ★ Rating</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block mb-1">Fair Play</span>
              <span className="text-xl font-black text-amber-300">100%</span>
              <span className="text-[10px] font-semibold text-amber-200 mt-0.5">5.0 ★ Neutral</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 font-bold uppercase block mb-1">Match Control</span>
              <span className="text-xl font-black text-emerald-300">4.8 ★</span>
              <span className="text-[10px] font-semibold text-emerald-200 mt-0.5">Strict Regulation</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block mb-1">Trust Index</span>
              <span className="text-xl font-black text-white">98.5%</span>
              <span className="text-[10px] font-semibold text-gray-300 mt-0.5">Top Preferred</span>
            </div>

          </div>

        </div>

        {/* Bottom Honor Banner Quote */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/90 font-medium">
          <span className="flex items-center gap-1.5">
            📜 <strong className="text-white">Official Officiating Motto:</strong> Ensuring fair play, non-partiality, and total accuracy in every tournament match.
          </span>
          <span className="font-bold text-[#98F5E1] hidden md:inline-block">Official Elle Hub Certified Referee</span>
        </div>
      </div>

    </div>
  );
}

