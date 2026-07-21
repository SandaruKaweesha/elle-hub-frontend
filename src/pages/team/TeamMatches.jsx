import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function TeamMatches() {
  const navigate = useNavigate();
  const [approvedTournaments, setApprovedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const teamUserId = currentUser.userId || currentUser.user_id;

  useEffect(() => {
    if (teamUserId) {
      fetchApprovedMatches();
    } else {
      setError("Team session not found. Please log in again.");
      setLoading(false);
    }
  }, [teamUserId]);

  const fetchApprovedMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsRes, tournamentsRes] = await Promise.all([
        api.get(`/team/${teamUserId}/requests`),
        api.get('/tournaments').catch(() => ({ data: { data: [] } }))
      ]);

      if (requestsRes.data && requestsRes.data.success !== false) {
        const allRequests = requestsRes.data.data || [];
        // Filter only APPROVED tournaments
        const approved = allRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED');
        
        const allTournamentsList = tournamentsRes.data?.data || [];
        
        // Merge request details with full tournament object if available
        const merged = approved.map(req => {
          const fullDetail = allTournamentsList.find(t => t.tournament_id === req.tournament_id);
          return {
            ...req,
            ...(fullDetail || {}),
            tournament_title: req.tournament_title || fullDetail?.title || 'Tournament',
            location: req.location || fullDetail?.location || 'Central Field',
            tournament_held_date: req.tournament_held_date || fullDetail?.tournament_held_date
          };
        });

        setApprovedTournaments(merged);
      } else {
        throw new Error(requestsRes.data.message || "Failed to load matches");
      }
    } catch (err) {
      console.error("Error fetching approved matches:", err);
      setError(err.message || "An error occurred while fetching your matches.");
    } fontally: {
      setLoading(false);
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

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Team Matches & Joined Tournaments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tournaments approved by organizers where your team is officially qualified to participate.
        </p>
      </div>

      {/* Main Listing or Details */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e5e5e5]">
          <Loader2 className="w-10 h-10 animate-spin text-[#08733e]" />
          <p className="text-gray-500 text-sm mt-3 font-semibold">Loading approved matches...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-red-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-red-800 text-sm font-semibold">{error}</p>
        </div>
      ) : approvedTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-[#e5e5e5] text-center">
          <div className="w-16 h-16 bg-[#eaf1ec] rounded-full flex items-center justify-center mb-4 text-[#08733e] border border-[#bbf7d0]">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Approved Matches Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            Once an organizer approves your tournament join request, it will appear here as an active match tournament.
          </p>
          <button
            onClick={() => navigate('/team/tournaments')}
            className="mt-6 inline-flex items-center gap-2 bg-[#08733e] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#065b31] transition-all shadow-sm"
          >
            Browse Tournaments <ArrowRight size={14} />
          </button>
        </div>
      ) : selectedMatch ? (
        /* Single Tournament Match Detail View (Placeholder for Draw & Teams) */
        <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#f8f7f4]">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#111111] bg-white border border-[#e5e5e5] px-4 py-2 rounded-xl transition-all"
            >
              ← Back to Joined Matches
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
              OFFICIALLY REGISTERED
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#111111]">{selectedMatch.tournament_title}</h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mt-2">
                <span className="flex items-center gap-1"><MapPin size={14} /> {selectedMatch.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Held Date: {formatDate(selectedMatch.tournament_held_date)}</span>
              </div>
            </div>

            {/* Match Draw / Fixtures Placeholder */}
            <div className="bg-[#f8f7f4] border border-[#e5e5e5] rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center text-[#08733e] shadow-xs border border-gray-200">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Tournament Draw & Fixtures</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto">
                Match pairings, brackets, and opponent information for this tournament will be displayed here once published by the organizer.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of Approved Tournament Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {approvedTournaments.map((t, idx) => (
            <div 
              key={t.tournament_id || idx}
              onClick={() => setSelectedMatch(t)}
              className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-sm flex flex-col group hover:shadow-md hover:border-[#08733e]/50 transition-all duration-300 cursor-pointer relative"
            >
              <div className="relative h-36 w-full bg-[#002c21] overflow-hidden">
                <img 
                  src={t.image_url || getFallbackImage(idx)} 
                  alt={t.tournament_title} 
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                />
                
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm bg-emerald-100 text-emerald-700 border-emerald-200">
                  APPROVED MATCH
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between bg-white space-y-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#111111] leading-snug line-clamp-2 group-hover:text-[#08733e] transition-colors mb-1.5">
                    {t.tournament_title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Calendar size={13} className="text-gray-400 shrink-0" />
                    <span>{formatDate(t.tournament_held_date)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    {t.location}
                  </span>
                  <div className="text-[#08733e] flex items-center gap-1 text-xs font-bold">
                    View Fixtures <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
