import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, Star, ChevronRight, Phone, AlertCircle, CheckCircle2, Trophy, Send, X, User, Award, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function OrganizerReferees() {
  const [referees, setReferees] = useState([]);
  const [organizerTournaments, setOrganizerTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState(null);

  // Invite Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRefereeToInvite, setSelectedRefereeToInvite] = useState(null); // { userId, name }
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const loadRefereesData = async () => {
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

    loadRefereesData();
  }, []);

  const loadAllData = async (targetOrganizerId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users and tournaments
      const requests = [api.get('/user/getAllUsers')];
      if (targetOrganizerId) {
        requests.push(api.get(`/organizer/${targetOrganizerId}/tournaments`));
      }

      const results = await Promise.all(requests);
      const usersRes = results[0];
      const tournamentsRes = results[1];

      if (usersRes.data && usersRes.data.success !== false) {
        const allUsers = usersRes.data.data || [];
        const refereeUsers = allUsers.filter(u => (u.role || '').toUpperCase() === 'REFEREE');
        setReferees(refereeUsers);
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
      console.error("Error loading referee directory data:", err);
      setError("Failed to query referee records from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = (referee) => {
    setSelectedReferee(referee);
    setShowProfileModal(true);
  };

  const handleOpenInviteModal = (referee) => {
    const name = referee.referee_name || referee.full_name || referee.display_name || referee.email || 'Referee';
    setSelectedRefereeToInvite({ userId: referee.userId || referee.user_id || referee.id, name });
    setSelectedTournamentId(organizerTournaments.length > 0 ? organizerTournaments[0].tournament_id : '');
    setShowInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedTournamentId || !selectedRefereeToInvite) {
      setError("Please select a valid tournament to send the referee invitation.");
      return;
    }

    try {
      setInviteLoading(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        refereeUserId: selectedRefereeToInvite.userId,
        initiatedBy: 'ORGANIZER'
      };

      const res = await api.post(`/tournament/${selectedTournamentId}/referee-requests/send`, payload);
      
      if (res.data && res.data.success !== false) {
        setSuccessMsg(`Invitation successfully dispatched to ${selectedRefereeToInvite.name}!`);
        setShowInviteModal(false);
        setSelectedRefereeToInvite(null);
      } else {
        throw new Error(res.data.message || "Failed to send referee request.");
      }
    } catch (err) {
      console.error("Invitation error:", err);
      setError(err.response?.data?.message || err.message || "Could not dispatch referee invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Filter referees by search query
  const filteredReferees = referees.filter(r => {
    const query = searchQuery.toLowerCase();
    const name = (r.referee_name || r.full_name || r.display_name || r.email || '').toLowerCase();
    const district = (r.district || r.location || '').toLowerCase();
    return name.includes(query) || district.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <ShieldCheck size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Referees Directory</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Review verified match officials, view credentials, and send tournament requests.</p>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search referees by name, district, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
          />
        </div>
        
        <div className="text-sm font-medium text-[#666666]">
          Total Referees: <span className="text-[#111111] font-bold">{filteredReferees.length}</span>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading certified referees directory...</p>
        </div>
      ) : filteredReferees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <User size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Referees Found</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            No registered referees match your search query or are currently registered in the platform database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReferees.map(referee => {
            const userId = referee.userId || referee.user_id || referee.id;
            const name = referee.referee_name || referee.full_name || referee.display_name || referee.email || 'Official Referee';
            const location = referee.district || referee.location || 'Sri Lanka';
            const phone = referee.contact_number || referee.phone || referee.mobile || 'N/A';
            const expYears = referee.experience_years ? `${referee.experience_years} Years` : '3 Years';
            const rating = referee.referee_rating || referee.rating ? Number(referee.referee_rating || referee.rating).toFixed(1) : '5.0';
            const availability = (referee.referee_availability_status || referee.availability_status || 'AVAILABLE').toUpperCase();
            const isAvailable = availability === 'AVAILABLE';
            const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RF';

            return (
              <div key={userId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between">
                
                <div>
                  {/* Card Header Cover */}
                  <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <ShieldCheck size={12} /> Certified Referee
                    </span>
                  </div>
                  
                  <div className="p-6 relative pt-0">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm">
                      <div className="w-full h-full rounded-xl bg-[#f4f4f4] flex items-center justify-center font-bold text-lg text-[#00382D] border border-[#e5e5e5]">
                        {initials}
                      </div>
                    </div>
                    
                    {/* Live Status Badge */}
                    <div className="flex justify-end pt-3 mb-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1 border ${
                        isAvailable 
                          ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {isAvailable ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{name}</h3>
                      <div className="flex items-center gap-3 text-[#666666] text-xs font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#888888]" /> {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-[#888888]" /> {phone}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#f4f4f4]">
                      <div>
                        <p className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">Experience</p>
                        <p className="font-bold text-[#333333] text-sm flex items-center gap-1">
                          <Award size={15} className="text-[#00382D]" /> {expYears}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mb-0.5">Rating</p>
                        <p className="font-bold text-[#333333] text-sm flex items-center gap-1">
                          <Star size={15} className="text-[#f59e0b] fill-[#f59e0b]" /> {rating} / 5.0
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button 
                    onClick={() => handleOpenProfile(referee)}
                    className="w-full py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#e5e5e5] shadow-sm"
                  >
                    View Profile
                    <ChevronRight size={14} className="text-[#888888]" />
                  </button>

                  <button 
                    onClick={() => handleOpenInviteModal(referee)}
                    disabled={!isAvailable}
                    className={`w-full py-2.5 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                      isAvailable 
                        ? 'bg-[#00382D] hover:bg-[#002b22] cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send size={13} />
                    {isAvailable ? 'Send Request for Tournament' : 'Currently Unavailable'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- REFEREE PROFILE MODAL --- */}
      {showProfileModal && selectedReferee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e5e5e5] relative">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00382D] text-white flex items-center justify-center font-bold text-xl shadow-md">
                {(selectedReferee.referee_name || selectedReferee.full_name || selectedReferee.email || 'R')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">
                  {selectedReferee.referee_name || selectedReferee.full_name || selectedReferee.display_name || selectedReferee.email}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                  <ShieldCheck size={12} /> Certified Referee
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-b border-gray-100 py-4 text-sm text-[#333333]">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><MapPin size={15} /> District/Location:</span>
                <span className="font-bold">{selectedReferee.district || selectedReferee.location || 'Sri Lanka'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Phone size={15} /> Contact Number:</span>
                <span className="font-bold">{selectedReferee.contact_number || selectedReferee.phone || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><User size={15} /> Account Email:</span>
                <span className="font-bold">{selectedReferee.email || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Award size={15} /> Rating & Status:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star size={14} className="fill-amber-500 text-amber-500" /> {selectedReferee.rating || '4.8'} / 5.0
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVITATION / REQUEST TOURNAMENT MODAL --- */}
      {showInviteModal && selectedRefereeToInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00382D]/10 rounded-xl text-[#00382D]">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Send Referee Request</h3>
                  <p className="text-xs text-[#666666]">Official request to referee for your tournament.</p>
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
              <p className="text-xs text-[#666666] font-medium">Selected Referee:</p>
              <p className="text-sm font-bold text-[#00382D] mt-0.5 flex items-center gap-1.5">
                <ShieldCheck size={16} /> {selectedRefereeToInvite.name}
              </p>
            </div>

            {organizerTournaments.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>You do not have any active approved tournaments to invite referees to. Please create a tournament first.</span>
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
                        {t.title} ({t.location || 'Sri Lanka'}) - Max Referees: {t.maximum_referee_limit || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
              <button 
                onClick={() => setShowInviteModal(false)}
                disabled={inviteLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSendInvitation}
                disabled={inviteLoading || organizerTournaments.length === 0}
                className="px-5 py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {inviteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Official Request
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
