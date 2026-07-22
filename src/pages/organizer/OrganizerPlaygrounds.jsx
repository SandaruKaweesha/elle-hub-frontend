import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight, Navigation2, Check, AlertCircle, CheckCircle2, X, Send, Map, Phone, Building, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export default function OrganizerPlaygrounds() {
  const [playgrounds, setPlaygrounds] = useState([]);
  const [organizerTournaments, setOrganizerTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Request Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const loadPlaygroundData = async () => {
      setLoading(true);
      setError(null);

      let targetId = null;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          targetId = userObj?.userId || userObj?.user_id || userObj?.id || userObj?.organizer_id;
        }
      } catch (e) {
        console.error("Session parse error:", e);
      }

      await loadAllData(targetId);
    };

    loadPlaygroundData();
  }, []);

  const loadAllData = async (targetOrganizerId) => {
    try {
      setLoading(true);
      setError(null);

      const requests = [api.get('/user/getAllUsers')];
      if (targetOrganizerId) {
        requests.push(api.get(`/organizer/${targetOrganizerId}/tournaments`));
      }

      const results = await Promise.all(requests);
      const usersRes = results[0];
      const tournamentsRes = results[1];

      if (usersRes.data && usersRes.data.success !== false) {
        const allUsers = usersRes.data.data || [];
        const playgroundUsers = allUsers.filter(u => 
          (u.role || '').toUpperCase() === 'PLAYGROUND' && 
          Boolean(u.playground_name)
        );
        setPlaygrounds(playgroundUsers);
      }

      if (tournamentsRes && tournamentsRes.data && tournamentsRes.data.success !== false) {
        const list = tournamentsRes.data.data || [];
        const activeOnly = list.filter(t => 
          (t.approval_status || '').toUpperCase() === 'APPROVED' && 
          (t.status || '').toUpperCase() === 'ACTIVE'
        );
        setOrganizerTournaments(activeOnly);
      }

    } catch (err) {
      console.error("Error loading playground directory data:", err);
      setError("Failed to query playground records from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInviteModal = (venue) => {
    setSelectedVenue(venue);
    setSelectedTournamentId(organizerTournaments.length > 0 ? organizerTournaments[0].tournament_id : '');
    setShowInviteModal(true);
  };

  const handleSendVenueRequest = async () => {
    if (!selectedTournamentId || !selectedVenue) {
      setError("Please select a valid tournament to request a venue.");
      return;
    }

    try {
      setRequestLoading(true);
      setError(null);
      setSuccessMsg(null);

      const playgroundUserId = selectedVenue.userId || selectedVenue.user_id || selectedVenue.id;
      const payload = {
        playgroundUserId,
        initiatedBy: 'ORGANIZER'
      };

      const res = await api.post(`/tournament/${selectedTournamentId}/playground-requests/send`, payload);

      if (res.data && res.data.success !== false) {
        const venueName = selectedVenue.playground_name || selectedVenue.display_name || selectedVenue.email || 'Venue';
        setSuccessMsg(`Venue booking request successfully submitted to ${venueName}!`);
        setShowInviteModal(false);
        setSelectedVenue(null);
      } else {
        throw new Error(res.data.message || "Failed to submit playground request.");
      }
    } catch (err) {
      console.error("Venue request error:", err);
      setError(err.response?.data?.message || err.message || "Could not dispatch venue request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const filteredPlaygrounds = playgrounds.filter(p => {
    if (!selectedDistrict) return true;
    const distTarget = selectedDistrict.toLowerCase();
    const locatedDistrict = (p.located_district || p.district || p.playground_district || p.playground_location || p.location || '').toLowerCase();
    return locatedDistrict.includes(distTarget);
  });

  return (
    <div className="max-w-7xl mx-auto font-[#Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <MapPin size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Find a Playground</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Select your tournament district to find registered playgrounds across Sri Lanka.</p>
        </div>
      </div>

      {/* Notifications Banners */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
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
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Controls & District Dropdown (Right-Aligned) */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-[#666666]">
          Total Playgrounds: <span className="text-[#111111] font-bold text-base">{filteredPlaygrounds.length}</span>
        </div>

        <div className="relative w-full sm:w-60">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00382D]" />
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all appearance-none cursor-pointer"
          >
            <option value="">District (All)</option>
            {SRI_LANKA_DISTRICTS.map((districtName) => (
              <option key={districtName} value={districtName}>
                {districtName}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading verified playgrounds directory...</p>
        </div>
      ) : filteredPlaygrounds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Playgrounds Found</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            No registered playgrounds match your selected district filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaygrounds.map(venue => {
            const userId = venue.userId || venue.user_id || venue.id;
            const name = venue.playground_name || venue.display_name || venue.email || 'Elle Ground';
            const rawDistrict = venue.located_district || venue.district || venue.playground_district || venue.location || 'Sri Lanka';
            const districtDisplay = rawDistrict.charAt(0).toUpperCase() + rawDistrict.slice(1);
            const phone = venue.contact_number || venue.phone || 'N/A';
            const areaVal = venue.playground_area || venue.area || venue.playground_capacity || venue.capacity;
            const capacityDisplay = areaVal ? (/^\d+$/.test(String(areaVal).trim()) ? `${areaVal} Acres` : `${areaVal}`) : 'N/A';
            const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PG';

            return (
              <div key={userId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between">
                
                <div>
                  {/* Card Header Cover */}
                  <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Building size={12} /> Verified Venue
                    </span>
                  </div>
                  
                  <div className="p-6 relative pt-0">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm">
                      <div className="w-full h-full rounded-xl bg-[#f4f4f4] flex items-center justify-center font-bold text-lg text-[#00382D] border border-[#e5e5e5]">
                        {initials}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex justify-end pt-3 mb-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1 bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                        <CheckCircle2 size={12} /> Available
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{name}</h3>
                      <div className="flex items-center gap-3 text-[#666666] text-xs font-medium mt-1">
                        <span className="flex items-center gap-1 capitalize">
                          <MapPin size={13} className="text-[#888888]" /> {districtDisplay}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-[#888888]" /> {phone}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => handleOpenInviteModal(venue)}
                    className="w-full py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send size={13} />
                    Request Venue Booking
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- INVITATION / REQUEST VENUE MODAL --- */}
      {showInviteModal && selectedVenue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00382D]/10 rounded-xl text-[#00382D]">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Request Venue Booking</h3>
                  <p className="text-xs text-[#666666]">Send official playground booking request for your tournament.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-[#888888] hover:text-[#111111] p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5]">
              <p className="text-xs text-[#666666] font-medium">Selected Playground:</p>
              <p className="text-sm font-bold text-[#00382D] mt-0.5 flex items-center gap-1.5">
                <Building size={16} /> {selectedVenue.playground_name || selectedVenue.display_name || selectedVenue.email}
              </p>
            </div>

            {organizerTournaments.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>You do not have any active approved tournaments to request playgrounds for. Please create a tournament first.</span>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">Select Active Tournament:</label>
                  <select 
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="w-full p-3 bg-white border border-[#e5e5e5] rounded-xl text-sm font-medium text-[#111111] focus:outline-none focus:border-[#00382D]"
                  >
                    {organizerTournaments.map((t) => (
                      <option key={t.tournament_id} value={t.tournament_id}>
                        {t.title} ({t.location || 'Sri Lanka'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
              <button 
                onClick={() => setShowInviteModal(false)}
                disabled={requestLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSendVenueRequest}
                disabled={requestLoading || organizerTournaments.length === 0}
                className="px-5 py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {requestLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Booking Request
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
