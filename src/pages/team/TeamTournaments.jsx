import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, Calendar, Users, Search, ArrowRight, Loader2, Award, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function TeamTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING', 'ONGOING', 'COMPLETED', 'ALL'

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tournaments');
        if (response.data.success) {
          setTournaments(response.data.data || []);
        } else {
          setError(response.data.message || "Failed to load tournaments");
        }
      } catch (err) {
        console.error("Fetch tournaments error:", err);
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

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
    UPCOMING: tournaments.filter(t => (t.status || '').toUpperCase() === 'UPCOMING').length,
    ONGOING: tournaments.filter(t => (t.status || '').toUpperCase() === 'ONGOING').length,
    COMPLETED: tournaments.filter(t => (t.status || '').toUpperCase() === 'COMPLETED').length,
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ONGOING') return 'bg-[#eaf1ec] text-[#08733e] border-[#08733e]/20';
    if (s === 'COMPLETED') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-[#e0f2fe] text-[#0369a1] border-[#0369a1]/20'; // Upcoming
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
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {[
            { key: 'UPCOMING', label: 'Upcoming' },
            { key: 'ONGOING', label: 'Ongoing' },
            { key: 'COMPLETED', label: 'Completed' },
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredTournaments.map((t, idx) => {
            const statusUpper = (t.status || 'Upcoming').toUpperCase();
            
            return (
              <div 
                key={t.tournament_id || idx}
                className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
              >
                {/* Cover Image & Status Tag */}
                <div className="relative h-44 w-full bg-[#002c21] overflow-hidden">
                  <img 
                    src={t.image_url || getFallbackImage(idx)} 
                    alt={t.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  <span className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${getStatusBadgeStyle(t.status)}`}>
                    {t.status || 'Upcoming'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111111] leading-snug line-clamp-1 group-hover:text-[#08733e] transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description || "The pinnacle of seasonal competition. Compete with top-tier athletes for the ultimate glory."}
                    </p>
                    
                    {/* Meta Fields */}
                    <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{t.location || "Central Arena"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span>Tournament Date: <span className="font-bold text-[#111111]">{formatDate(t.tournament_held_date)}</span></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span>Registration Deadline: <span className="font-bold text-[#c2410c]">{formatDate(t.end_date)}</span></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Trophy size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">Prize Pool: <span className="font-bold text-[#08733e]">{t.prize_details || "TBD"}</span></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Users size={14} className="text-gray-400 shrink-0" />
                        <span>Max Teams Capacity: <span className="font-bold text-[#111111]">{t.maximum_team_limit || "TBD"}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {statusUpper === 'UPCOMING' ? (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const regDeadline = t.end_date ? new Date(t.end_date) : null;
                        if (regDeadline) {
                          regDeadline.setHours(23, 59, 59, 999);
                        }
                        const isRegistrationClosed = regDeadline && today > regDeadline;

                        if (isRegistrationClosed) {
                          return (
                            <button
                              disabled
                              className="w-full flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 text-gray-400 py-2.5 rounded-xl text-xs font-bold transition-all cursor-not-allowed"
                            >
                              Registration Closed
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => navigate(`/team/join-tournament/${t.tournament_id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-[#08733e] hover:bg-[#065b31] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Request to Join <ArrowRight size={14} />
                          </button>
                        );
                      })()
                    ) : (
                      <button
                        onClick={() => navigate(`/tournaments/${t.tournament_id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-[#e5e5e5] text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        View Brackets & Details <ArrowRight size={14} />
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
