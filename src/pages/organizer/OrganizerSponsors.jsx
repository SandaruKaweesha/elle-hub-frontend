import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, AlertCircle, X, Send, Briefcase, DollarSign, Phone, Mail, User, ChevronRight, ExternalLink } from 'lucide-react';
import api from '../../services/api';

export default function OrganizerSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [organizerTournaments, setOrganizerTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedSponsorProfile, setSelectedSponsorProfile] = useState(null);

  // Request Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const loadSponsorData = async () => {
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

    loadSponsorData();
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
        const sponsorUsers = allUsers.filter(u => (u.role || '').toUpperCase() === 'SPONSOR');
        setSponsors(sponsorUsers);
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
      console.error("Error loading sponsor directory data:", err);
      setError("Failed to query sponsor records from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = (sponsor) => {
    setSelectedSponsorProfile(sponsor);
    setShowProfileModal(true);
  };

  const handleOpenInviteModal = (sponsor) => {
    setSelectedSponsor(sponsor);
    setSelectedTournamentId(organizerTournaments.length > 0 ? organizerTournaments[0].tournament_id : '');
    setShowInviteModal(true);
  };

  const handleSendSponsorRequest = async () => {
    if (!selectedTournamentId || !selectedSponsor) {
      setError("Please select a valid tournament to send sponsorship proposal.");
      return;
    }

    try {
      setRequestLoading(true);
      setError(null);
      setSuccessMsg(null);

      const sponsorUserId = selectedSponsor.userId || selectedSponsor.user_id || selectedSponsor.id;
      const payload = {
        sponsorUserId,
        initiatedBy: 'ORGANIZER'
      };

      const res = await api.post(`/tournament/${selectedTournamentId}/sponsor-requests/send`, payload);

      if (res.data && res.data.success !== false) {
        const companyName = selectedSponsor.company_name || selectedSponsor.display_name || selectedSponsor.email || 'Sponsor';
        setSuccessMsg(`Sponsorship invitation successfully sent to ${companyName}!`);
        setShowInviteModal(false);
        setSelectedSponsor(null);
      } else {
        throw new Error(res.data.message || "Failed to send sponsorship request.");
      }
    } catch (err) {
      console.error("Sponsor request error:", err);
      setError(err.response?.data?.message || err.message || "Could not dispatch sponsorship request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(s => {
    const query = searchQuery.toLowerCase();
    const name = (s.company_name || s.display_name || s.email || '').toLowerCase();
    const contact = (s.sponsor_contact_person || s.contact_person || '').toLowerCase();
    const location = (s.sponsor_address || s.address || '').toLowerCase();
    return name.includes(query) || contact.includes(query) || location.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <Briefcase size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Sponsors & Partners</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Review registered corporate partners, view contact details, and send tournament sponsorship invitations.</p>
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

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search corporate sponsors by name, contact, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
          />
        </div>
        
        <div className="text-sm font-medium text-[#666666]">
          Total Partners: <span className="text-[#111111] font-bold">{filteredSponsors.length}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading corporate sponsors directory...</p>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <Briefcase size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Corporate Sponsors Found</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            No registered sponsors match your search query or are registered in the platform database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map(sponsor => {
            const userId = sponsor.userId || sponsor.user_id || sponsor.id;
            const name = sponsor.company_name || sponsor.display_name || sponsor.email || 'Corporate Partner';
            const contactPerson = sponsor.sponsor_contact_person || sponsor.contact_person || 'Representative';
            const phone = sponsor.contact_number || sponsor.phone || 'N/A';
            const address = sponsor.sponsor_address || sponsor.address || 'Sri Lanka';
            const email = sponsor.email || 'N/A';
            const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SP';

            return (
              <div key={userId} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between">
                
                <div>
                  {/* Card Header Cover */}
                  <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative p-4 flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <DollarSign size={12} /> Official Sponsor
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
                        <CheckCircle2 size={12} /> Verified Partner
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <h3 className="text-lg font-bold text-[#111111] leading-tight mb-2 group-hover:text-[#00382D] transition-colors">{name}</h3>
                      
                      <div className="space-y-1.5 text-xs text-[#555555] font-medium bg-[#f9faf9] p-3 rounded-xl border border-[#f0f0f0]">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-[#00382D] shrink-0" />
                          <span>Contact: <strong className="text-[#111111]">{contactPerson}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-[#00382D] shrink-0" />
                          <span>Phone: <a href={`tel:${phone}`} className="text-[#00382D] font-bold hover:underline">{phone}</a></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#00382D] shrink-0" />
                          <span>Location: <strong className="text-[#111111]">{address}</strong></span>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button 
                    onClick={() => handleOpenProfile(sponsor)}
                    className="w-full py-2.5 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#e5e5e5] shadow-sm"
                  >
                    View Details
                    <ChevronRight size={14} className="text-[#888888]" />
                  </button>

                  <button 
                    onClick={() => handleOpenInviteModal(sponsor)}
                    className="w-full py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send size={13} />
                    Invite for Tournament
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- SPONSOR PROFILE MODAL --- */}
      {showProfileModal && selectedSponsorProfile && (
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
                {(selectedSponsorProfile.company_name || selectedSponsorProfile.display_name || selectedSponsorProfile.email || 'S')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">
                  {selectedSponsorProfile.company_name || selectedSponsorProfile.display_name || selectedSponsorProfile.email}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                  <CheckCircle2 size={12} /> Corporate Sponsor
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-b border-gray-100 py-4 text-sm text-[#333333]">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><User size={15} /> Representative:</span>
                <span className="font-bold">{selectedSponsorProfile.sponsor_contact_person || selectedSponsorProfile.contact_person || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Phone size={15} /> Contact Number:</span>
                <a href={`tel:${selectedSponsorProfile.contact_number || selectedSponsorProfile.phone}`} className="font-bold text-[#00382D] hover:underline">
                  {selectedSponsorProfile.contact_number || selectedSponsorProfile.phone || 'N/A'}
                </a>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Mail size={15} /> Account Email:</span>
                <a href={`mailto:${selectedSponsorProfile.email}`} className="font-bold text-[#00382D] hover:underline">
                  {selectedSponsorProfile.email || 'N/A'}
                </a>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium flex items-center gap-2"><MapPin size={15} /> Address / Location:</span>
                <span className="font-bold">{selectedSponsorProfile.sponsor_address || selectedSponsorProfile.address || 'Sri Lanka'}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>

              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  handleOpenInviteModal(selectedSponsorProfile);
                }}
                className="w-1/2 py-2.5 bg-[#00382D] hover:bg-[#002b22] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send size={13} /> Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVITATION / REQUEST SPONSOR MODAL --- */}
      {showInviteModal && selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00382D]/10 rounded-xl text-[#00382D]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Send Sponsorship Request</h3>
                  <p className="text-xs text-[#666666]">Dispatch official sponsorship proposal to corporate partner.</p>
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
              <p className="text-xs text-[#666666] font-medium">Selected Sponsor:</p>
              <p className="text-sm font-bold text-[#00382D] mt-0.5 flex items-center gap-1.5">
                <Briefcase size={16} /> {selectedSponsor.company_name || selectedSponsor.display_name || selectedSponsor.email}
              </p>
            </div>

            {organizerTournaments.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>You do not have any active approved tournaments to request sponsorships for. Please create a tournament first.</span>
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
                onClick={handleSendSponsorRequest}
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
                    <Send size={14} /> Send Sponsorship Proposal
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
