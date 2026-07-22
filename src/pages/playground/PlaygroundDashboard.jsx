import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Users, 
  Trophy, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  X,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [playgroundData, setPlaygroundData] = useState({
    playgroundName: "Badulla Ground",
    locatedDistrict: "Badulla",
    location: "Badulla",
    address: "Lower Street, Badulla",
    contactNumber: "0771234567",
    area: "500 Sq. Ft",
    capacity: "500 Sq. Ft",
    availabilityStatus: "AVAILABLE"
  });

  const [hostedTournaments, setHostedTournaments] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchPlaygroundDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch User & Playground Profile
      const res = await api.get(`/user/${userId}`);
      if (res.data && res.data.success !== false) {
        const u = res.data.data;
        const areaVal = u.area || u.playground_area || u.capacity || "500 Sq. Ft";
        setPlaygroundData({
          playgroundName: u.playground_name || u.playgroundName || u.display_name || "Badulla Ground",
          locatedDistrict: u.located_district || u.locatedDistrict || "Badulla",
          location: u.location || "Badulla",
          address: u.address || "Lower Street, Badulla",
          contactNumber: u.contact_number || "0771234567",
          area: areaVal,
          capacity: areaVal,
          availabilityStatus: u.availability_status || u.availabilityStatus || "AVAILABLE"
        });
      }

      // Fetch tournaments assigned to this venue/location
      try {
        const tourRes = await api.get("/tournaments/approved");
        if (tourRes.data && tourRes.data.success !== false) {
          const allTournaments = tourRes.data.data || [];
          const matchVenue = (t) => {
            const loc = (t.location || '').toLowerCase();
            const pgLoc = (playgroundData.location || '').toLowerCase();
            const pgDist = (playgroundData.locatedDistrict || '').toLowerCase();
            return loc.includes(pgLoc) || loc.includes(pgDist) || loc.includes('badulla');
          };
          setHostedTournaments(allTournaments.filter(matchVenue));
        }
      } catch (e) {
        console.warn("Could not fetch tournaments for playground venue:", e);
      }

    } catch (err) {
      console.error("Playground dashboard error:", err);
      setError("Could not load playground details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPlaygroundDetails();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleToggleStatus = async () => {
    const newStatus = playgroundData.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    try {
      setIsUpdatingStatus(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.put("/user/update", {
        availabilityStatus: newStatus,
        availability_status: newStatus,
        playgroundName: playgroundData.playgroundName,
        locatedDistrict: playgroundData.locatedDistrict,
        location: playgroundData.location,
        address: playgroundData.address,
        contactNumber: playgroundData.contactNumber,
        capacity: playgroundData.capacity
      });

      if (res.data && res.data.success !== false) {
        setPlaygroundData(prev => ({ ...prev, availabilityStatus: newStatus }));
        setSuccessMsg(`Playground venue availability status is now set to ${newStatus}!`);

        const updatedUser = { ...currentUser, availabilityStatus: newStatus, availability_status: newStatus };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        throw new Error(res.data.message || "Failed to update venue status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.message || err.message || "Could not update venue status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isAvailable = playgroundData.availabilityStatus === "AVAILABLE";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading official playground dashboard...</p>
      </div>
    );
  }

  const formatAreaDisplay = (val) => {
    if (!val) return "500 Acres";
    const str = String(val).trim();
    if (/^\d+$/.test(str)) {
      return `${str} Acres`;
    }
    return str;
  };

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#00382D] to-[#08733e] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl relative z-10">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold rounded-full tracking-wider uppercase inline-block">
            Official Ground Venue Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {playgroundData.playgroundName}!
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm font-medium flex items-center gap-1">
            <MapPin size={15} /> {playgroundData.address}, {playgroundData.locatedDistrict} District
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white text-[#00382D] flex items-center justify-center font-extrabold text-xl shadow-xs">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Playground Area</span>
            <strong className="text-2xl font-black">{formatAreaDisplay(playgroundData.area || playgroundData.capacity)}</strong>
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
        
        {/* Venue Status Card */}
        <div 
          onClick={handleToggleStatus}
          className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#00382D] transition-all cursor-pointer group"
          title="Click to toggle playground venue availability status"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {isUpdatingStatus ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UserCheck size={22} />
              )}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              isAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {isAvailable ? "Available" : "Booked"}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">
              Venue Status
            </p>
            <h3 className="text-xl font-bold text-[#111111] leading-tight">
              {isAvailable ? "Open for Hosting" : "Occupied / Booked"}
            </h3>
          </div>
        </div>

        {/* Area Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#00382D]/10 text-[#00382D] flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <span className="text-[10px] font-bold text-[#00382D] bg-[#00382D]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Verified
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Playground Area</p>
            <h3 className="text-2xl font-bold text-[#111111]">{formatAreaDisplay(playgroundData.area || playgroundData.capacity)}</h3>
          </div>
        </div>

        {/* District Location Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <MapPin size={22} />
            </div>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-200">
              Location
            </span>
          </div>
          <div>
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Located Town</p>
            <h3 className="text-xl font-bold text-[#111111] capitalize">{playgroundData.location || playgroundData.locatedDistrict}</h3>
          </div>
        </div>

        {/* Hosted Tournaments Card */}
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
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Scheduled Tournaments</p>
            <h3 className="text-2xl font-bold text-[#111111]">{hostedTournaments.length}</h3>
          </div>
        </div>

      </div>

      {/* Main Grid: Scheduled Tournaments at this venue */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Tournaments Hosted at {playgroundData.playgroundName}</h2>
            <p className="text-xs text-[#666666] mt-0.5">Approved tournaments scheduled or conducted at your venue.</p>
          </div>
          <span className="text-xs font-bold text-[#00382D] bg-[#00382D]/10 px-3 py-1 rounded-full">
            {hostedTournaments.length} Scheduled
          </span>
        </div>

        {hostedTournaments.length === 0 ? (
          <div className="py-12 text-center bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-[#888888] shadow-sm">
              <CalendarDays size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#111111] mb-1">No Active Venue Bookings</h4>
            <p className="text-xs text-[#666666]">There are currently no tournaments scheduled at {playgroundData.playgroundName}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hostedTournaments.slice(0, 3).map((match, idx) => (
              <div key={match.tournament_id || idx} className="bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00382D] text-white rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#111111]">{match.title || match.tournament_title || "Elle Championship"}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#666666] font-medium mt-1">
                      <span className="flex items-center gap-1"><MapPin size={13} /> {match.location || playgroundData.address}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> Date: {match.tournament_held_date || match.start_date || '2026-08-28'}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Venue Confirmed
                </span>
              </div>
            ))}

            {hostedTournaments.length > 3 && (
              <div className="pt-2 text-center">
                <a href="/playground/schedule" className="text-xs font-bold text-[#00382D] hover:underline">
                  View all {hostedTournaments.length} tournaments in Ground Schedule →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
