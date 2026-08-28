import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Calendar, MapPin, ArrowRight, Loader2, ShieldCheck, 
  AlertCircle, Users, Swords, CheckCircle2, Search, Clock, 
  XCircle, Info, Filter, ArrowLeft, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import KnockoutBracketDisplay from '../../components/organizer/KnockoutBracketDisplay';

export default function TeamMatches() {
  const navigate = useNavigate();
  const [appliedTournaments, setAppliedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Filtering & Search states
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'APPROVED', 'PENDING', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');

  // Match Draw state for selected tournament
  const [drawDetails, setDrawDetails] = useState(null);
  const [loadingDraw, setLoadingDraw] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const teamUserId = currentUser.userId || currentUser.user_id;

  useEffect(() => {
    if (teamUserId) {
      fetchAllAppliedMatches();
    } else {
      setError("Team session not found. Please log in again.");
      setLoading(false);
    }
  }, [teamUserId]);

  const fetchAllAppliedMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsRes, tournamentsRes] = await Promise.all([
        api.get(`/team/${teamUserId}/requests`),
        api.get('/tournaments').catch(() => ({ data: { data: [] } }))
      ]);

      if (requestsRes.data && requestsRes.data.success !== false) {
        const allRequests = requestsRes.data.data || [];
        const allTournamentsList = tournamentsRes.data?.data || [];
        
        // Merge request details with full tournament object if available
        const merged = allRequests.map(req => {
          const fullDetail = allTournamentsList.find(t => t.tournament_id === req.tournament_id);
          return {
            ...req,
            ...(fullDetail || {}),
            tournament_id: req.tournament_id,
            request_status: (req.status || 'PENDING').toUpperCase(),
            tournament_title: req.tournament_title || fullDetail?.title || 'Tournament',
            location: req.location || fullDetail?.location || 'Central Field',
            tournament_held_date: req.tournament_held_date || fullDetail?.tournament_held_date || fullDetail?.start_date,
            image_url: req.image_url || fullDetail?.image_url,
            rules: req.rules || fullDetail?.rules,
            description: req.description || fullDetail?.description
          };
        });

        setAppliedTournaments(merged);
      } else {
        throw new Error(requestsRes.data.message || "Failed to load matches");
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message || "An error occurred while fetching your matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTournament = async (tournament) => {
    setSelectedMatch(tournament);
    setDrawDetails(null);
    const status = (tournament.request_status || '').toUpperCase();
    
    // Only load draw fixtures if the tournament application is APPROVED or ACCEPTED
    if (status === 'APPROVED' || status === 'ACCEPTED') {
      try {
        setLoadingDraw(true);
        const res = await api.get(`/tournament/${tournament.tournament_id}/draw`);
        if (res.data && res.data.success !== false) {
          setDrawDetails(res.data.data);
        }
      } catch (err) {
        console.error("Error loading draw details:", err);
      } finally {
        setLoadingDraw(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFallbackImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop"
    ];
    return images[index % images.length];
  };

  // Filter tournaments by active tab and search query
  const filteredTournaments = appliedTournaments.filter(t => {
    const s = t.request_status;
    const statusMatch = 
      activeTab === 'ALL' ||
      (activeTab === 'APPROVED' && (s === 'APPROVED' || s === 'ACCEPTED')) ||
      (activeTab === 'PENDING' && s === 'PENDING') ||
      (activeTab === 'REJECTED' && s === 'REJECTED');

    const searchLower = searchTerm.toLowerCase();
    const titleMatch = (t.tournament_title || '').toLowerCase().includes(searchLower);
    const locationMatch = (t.location || '').toLowerCase().includes(searchLower);

    return statusMatch && (titleMatch || locationMatch);
  });

  const counts = {
    ALL: appliedTournaments.length,
    APPROVED: appliedTournaments.filter(t => t.request_status === 'APPROVED' || t.request_status === 'ACCEPTED').length,
    PENDING: appliedTournaments.filter(t => t.request_status === 'PENDING').length,
    REJECTED: appliedTournaments.filter(t => t.request_status === 'REJECTED').length
  };

    const renderStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACCEPTED') {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600/90 text-white border border-white/20 shadow-md backdrop-blur-md flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-white" /> APPROVED MATCH
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/90 text-white border border-white/20 shadow-md backdrop-blur-md flex items-center gap-1.5">
          <Clock size={13} className="text-white" /> PENDING APPROVAL
        </span>
      );
    }
    return (
      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-600/90 text-white border border-white/20 shadow-md backdrop-blur-md flex items-center gap-1.5">
        <XCircle size={13} className="text-white" /> DECLINED
      </span>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Team Matches & Tournament Draw</h1>
          <p className="text-gray-500 text-sm mt-1">
            View official match pairings, team brackets, and fixture schedules for tournaments your team has applied to.
          </p>
        </div>
        <button
          onClick={fetchAllAppliedMatches}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border border-[#e5e5e5] px-3.5 py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-2xs self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#08733e]" : "text-gray-500"} /> Refresh Matches
        </button>
      </div>

      {!selectedMatch && (
        <>
          {/* Controls: Search and Status Filter Tabs */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Horizontal Filter Tabs */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
              {[
                { key: 'ALL', label: 'All Applied' },
                { key: 'APPROVED', label: 'Approved Matches' },
                { key: 'PENDING', label: 'Pending Approval' },
                { key: 'REJECTED', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-[#00382D] text-white border-[#00382D] shadow-sm'
                      : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tournament or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-[#f8f7f4]/60 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#08733e] focus:bg-white transition-all"
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e5e5e5]">
          <Loader2 className="w-10 h-10 animate-spin text-[#08733e]" />
          <p className="text-gray-500 text-sm mt-3 font-semibold">Loading applied matches & tournaments...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-red-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-red-800 text-sm font-semibold">{error}</p>
        </div>
      ) : appliedTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-[#e5e5e5] text-center">
          <div className="w-16 h-16 bg-[#eaf1ec] rounded-full flex items-center justify-center mb-4 text-[#08733e] border border-[#bbf7d0]">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Tournament Applications Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            Your team has not applied to join any tournaments yet. Browse available tournaments to apply!
          </p>
          <button
            onClick={() => navigate('/team/tournaments')}
            className="mt-6 inline-flex items-center gap-2 bg-[#08733e] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#065b31] transition-all shadow-sm cursor-pointer"
          >
            Browse Tournaments <ArrowRight size={14} />
          </button>
        </div>
      ) : selectedMatch ? (
        /* Single Tournament Match Detail View (Renders Fixtures or Status Info) */
        <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden shadow-sm space-y-6 p-6">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 flex-wrap gap-3">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 border border-gray-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Matches List
            </button>
            {renderStatusBadge(selectedMatch.request_status)}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#111111] uppercase tracking-wide flex items-center gap-2">
              <Trophy className="text-[#08733e]" size={24} />
              {selectedMatch.tournament_title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} className="text-[#08733e]" /> {selectedMatch.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar size={14} className="text-[#08733e]" /> Held Date: {formatDate(selectedMatch.tournament_held_date)}</span>
            </div>
          </div>

          {/* Conditional View Based on Status */}
          {(selectedMatch.request_status === 'APPROVED' || selectedMatch.request_status === 'ACCEPTED') ? (
            /* Approved Match Draw Section */
            loadingDraw ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#08733e] mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">Loading match bracket draw...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Fixture Schedule Summary Card */}
                {drawDetails && (
                  <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Swords size={16} /> Scheduled Participating Teams ({drawDetails.teams?.length || 0} Teams):
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {(drawDetails.teams || []).map((tm, i) => {
                        const tName = tm.team_name || tm.name || tm.email || 'Team';
                        return (
                          <span key={i} className="bg-white text-gray-800 border border-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1">
                            <span className="text-emerald-700 font-black">#{i + 1}</span> {tName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RENDER MATCH BRACKET DRAW */}
                <KnockoutBracketDisplay 
                  tournamentTitle={selectedMatch.tournament_title?.toUpperCase() || 'MATCH BRACKET DRAW'} 
                  teams={drawDetails?.teams || []} 
                  drawData={drawDetails?.drawData}
                  readOnly={true}
                />
              </div>
            )
          ) : selectedMatch.request_status === 'PENDING' ? (
            /* Pending Status Info Box */
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-base font-bold text-amber-900">Application Under Review</h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed font-medium">
                    Your team's application for <span className="font-bold">{selectedMatch.tournament_title}</span> has been received and is currently under review by the tournament organizer. Match brackets and fixtures will become accessible once your application is approved.
                  </p>
                </div>
              </div>
              
              {selectedMatch.description && (
                <div className="pt-4 border-t border-amber-200/60 text-xs text-amber-900/80">
                  <span className="font-bold block mb-1">Tournament Description:</span>
                  <p className="leading-relaxed">{selectedMatch.description}</p>
                </div>
              )}
            </div>
          ) : (
            /* Rejected Status Info Box */
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-base font-bold text-rose-900">Application Declined</h3>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">
                    The organizer has declined your team's application for <span className="font-bold">{selectedMatch.tournament_title}</span>. Please contact the tournament organizer for further details or browse other active tournaments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : filteredTournaments.length === 0 ? (
        /* Empty Filter State */
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center text-gray-500">
          <p className="text-sm font-semibold">No tournaments match the selected filter or search query.</p>
          <button 
            onClick={() => { setActiveTab('ALL'); setSearchTerm(''); }}
            className="mt-3 text-xs font-bold text-[#08733e] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Grid of Applied Tournament Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredTournaments.map((t, idx) => {
            const isApproved = t.request_status === 'APPROVED' || t.request_status === 'ACCEPTED';
            const isPending = t.request_status === 'PENDING';

            return (
              <div 
                key={t.tournament_id || idx}
                onClick={() => handleSelectTournament(t)}
                className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 hover:-translate-y-1.5 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Image Banner Header with Glassmorphism Badge */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src={t.image_url || getFallbackImage(idx)} 
                    alt={t.tournament_title} 
                    className="w-full h-full object-cover opacity-85 group-hover:scale-110 group-hover:opacity-95 transition-all duration-700 ease-out pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                  
                  {/* Floating Glassmorphic Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {renderStatusBadge(t.request_status)}
                  </div>

                  {/* Location Pill Overlay on Image */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 backdrop-blur-md text-white rounded-full text-[11px] font-bold border border-white/20 shadow-xs">
                    <MapPin size={12} className="text-emerald-400" />
                    <span className="truncate max-w-[140px]">{t.location || 'Sri Lanka'}</span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#08733e] transition-colors">
                      {t.tournament_title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>{formatDate(t.tournament_held_date)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 truncate max-w-[110px]">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      {t.location}
                    </span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      isApproved 
                        ? 'text-[#08733e]' 
                        : isPending 
                        ? 'text-amber-700' 
                        : 'text-rose-700'
                    }`}>
                      {isApproved ? (
                        <>View Fixtures <ArrowRight size={14} /></>
                      ) : isPending ? (
                        <>Under Review <Info size={14} /></>
                      ) : (
                        <>Declined <Info size={14} /></>
                      )}
                    </div>
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

