import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, Calendar, Users, Search, ArrowRight, Loader2, Award, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export default function TeamTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ALL'
  const [selectedTournament, setSelectedTournament] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const teamUserId = currentUser.userId || currentUser.user_id;

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const [tournamentsRes, requestsRes] = await Promise.all([
          api.get('/tournaments'),
          teamUserId ? api.get(`/team/${teamUserId}/requests`).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
        ]);
        
        if (tournamentsRes.data.success) {
          setTournaments(tournamentsRes.data.data || []);
        } else {
          setError(tournamentsRes.data.message || "Failed to load tournaments");
        }

        if (requestsRes.data && requestsRes.data.success !== false) {
          setTeamRequests(requestsRes.data.data || []);
        }
      } catch (err) {
        console.error("Fetch tournaments error:", err);
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [teamUserId]);

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Helper to filter and search
  const filteredTournaments = tournaments.filter((t) => {
    const statusMatches = activeTab === 'ALL' || (t.status || '').toUpperCase() === activeTab;
    const titleMatches = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatches = (t.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatches && (titleMatches || locationMatches);
  });

  // Calculate status counts
  const counts = {
    ALL: tournaments.length,
    ACTIVE: tournaments.filter(t => (t.status || '').toUpperCase() === 'ACTIVE').length,
    ONGOING: tournaments.filter(t => (t.status || '').toUpperCase() === 'ONGOING').length,
    COMPLETED: tournaments.filter(t => (t.status || '').toUpperCase() === 'COMPLETED').length,
    CANCELLED: tournaments.filter(t => (t.status || '').toUpperCase() === 'CANCELLED').length,
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ONGOING') return 'bg-[#eaf1ec] text-[#08733e] border-[#08733e]/20';
    if (s === 'COMPLETED') return 'bg-gray-100 text-gray-700 border-gray-200';
    if (s === 'CANCELLED') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-[#e0f2fe] text-[#0369a1] border-[#0369a1]/20'; // ACTIVE
  };

  const getFallbackImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop"
    ];
    return images[index % images.length];
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Tournaments Directory</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and request to join upcoming tournaments, or track ongoing and past championships.</p>
      </div>


      {/* Filter and Search Bar */}
      {!selectedTournament && (
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {[
            { key: 'ACTIVE', label: 'Active' },
            { key: 'ONGOING', label: 'Ongoing' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
            { key: 'ALL', label: 'All Events' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-xl text-sm font-medium outline-none focus:border-[#08733e] focus:ring-1 focus:ring-[#08733e] bg-[#f8f7f4] focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
      )}

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e5e5e5]">
          <Loader2 className="w-10 h-10 animate-spin text-[#08733e]" />
          <p className="text-gray-500 text-sm mt-3 font-semibold">Fetching tournaments directory...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-red-200 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-red-800 text-sm font-semibold">{error}</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-[#e5e5e5] text-center">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-4 text-gray-400 border border-[#e5e5e5]">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Tournaments Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">There are no tournaments matching the selected filters or search terms.</p>
        </div>
      ) : selectedTournament ? (
        <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#f8f7f4]">
            <button 
              onClick={() => setSelectedTournament(null)}
              className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#111111] bg-white border border-[#e5e5e5] px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border shadow-sm ${getStatusBadgeStyle(selectedTournament.status)}`}>
              {selectedTournament.status || 'Upcoming'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5 relative h-64 lg:h-auto bg-[#002c21]">
              <img 
                src={selectedTournament.image_url || getFallbackImage(filteredTournaments.indexOf(selectedTournament))} 
                alt={selectedTournament.title} 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 pr-6">
                <h2 className="text-2xl font-black text-white leading-snug">{selectedTournament.title}</h2>
              </div>
            </div>

            <div className="lg:w-3/5 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Tournament</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                  {selectedTournament.description || "The pinnacle of seasonal competition. Compete with top-tier athletes for the ultimate glory and secure your spot in the hall of fame."}
                </p>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Event Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                      <Users size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Organizer</p>
                      <p className="text-sm font-semibold text-[#111111]">{selectedTournament.organizer_name || "Sports Organizer"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                      <MapPin size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-semibold text-[#111111]">{selectedTournament.location || "Central Arena"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                      <Calendar size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Held Date</p>
                      <p className="text-sm font-semibold text-[#111111]">{formatDate(selectedTournament.tournament_held_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                      <Calendar size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Deadline</p>
                      <p className="text-sm font-semibold text-[#c2410c]">{formatDate(selectedTournament.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Trophy size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Prize Pool</p>
                      <p className="text-sm font-bold text-[#08733e]">{selectedTournament.prize_details || "TBD"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">Team Capacity</p>
                      <p className="text-sm font-bold text-[#111111]">{selectedTournament.maximum_team_limit || "TBD"} Teams</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                      <Award size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-purple-600/70 uppercase tracking-wider">Registered Teams</p>
                      <p className="text-sm font-bold text-[#08733e]">{selectedTournament.registered_teams_count || 0} Teams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[#e5e5e5]">
                {(() => {
                  const statusUpper = (selectedTournament.status || 'ACTIVE').toUpperCase();
                  const requestStatus = teamRequests.find(r => r.tournament_id === selectedTournament.tournament_id);
                  
                  if (requestStatus) {
                    return (
                      <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold border transition-all ${
                        requestStatus.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        requestStatus.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        Request {requestStatus.status}
                      </div>
                    );
                  }

                  if (statusUpper === 'ACTIVE') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const regDeadline = selectedTournament.end_date ? new Date(selectedTournament.end_date) : null;
                    if (regDeadline) {
                      regDeadline.setHours(23, 59, 59, 999);
                    }
                    const isRegistrationClosed = regDeadline && today > regDeadline;

                    if (isRegistrationClosed) {
                      return (
                        <button disabled className="w-full bg-gray-100 border border-gray-200 text-gray-400 py-3.5 rounded-xl text-sm font-bold cursor-not-allowed">
                          Registration Closed
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={() => navigate(`/team/join-tournament/${selectedTournament.tournament_id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-[#08733e] hover:bg-[#065b31] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-md"
                      >
                        Request to Join Tournament <ArrowRight size={16} />
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => navigate(`/tournaments/${selectedTournament.tournament_id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-[#e5e5e5] text-gray-700 py-3.5 rounded-xl text-sm font-bold transition-all"
                    >
                      View Brackets & Live Details <ArrowRight size={16} />
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredTournaments.map((t, idx) => {
            const requestStatus = teamRequests.find(r => r.tournament_id === t.tournament_id);
            const statusUpper = (t.status || 'ACTIVE').toUpperCase();
            
            return (
              <div 
                key={t.tournament_id || idx}
                className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all duration-300 relative"
              >
                {/* Simplified Cover Image */}
                <div className="relative h-36 w-full bg-[#002c21] overflow-hidden">
                  <img 
                    src={t.image_url || getFallbackImage(idx)} 
                    alt={t.title} 
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm ${getStatusBadgeStyle(t.status)}`}>
                    {t.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Card Content with 2 Buttons */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white space-y-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#111111] leading-snug line-clamp-2 group-hover:text-[#08733e] transition-colors mb-1.5">
                      {t.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>{formatDate(t.tournament_held_date)}</span>
                    </div>
                  </div>

                  {/* 2 Buttons Row */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 border border-[#e5e5e5] text-gray-700 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      View Details
                    </button>

                    {requestStatus ? (
                      <button
                        disabled
                        className={`flex items-center justify-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl border ${
                          requestStatus.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          requestStatus.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        {requestStatus.status}
                      </button>
                    ) : statusUpper === 'ACTIVE' ? (
                      <button
                        onClick={() => navigate(`/team/join-tournament/${t.tournament_id}`)}
                        className="flex items-center justify-center gap-1 bg-[#08733e] hover:bg-[#065b31] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Request <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/tournaments/${t.tournament_id}`)}
                        className="flex items-center justify-center gap-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Brackets
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
