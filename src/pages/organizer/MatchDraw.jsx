import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import KnockoutBracketDisplay from '../../components/organizer/KnockoutBracketDisplay';

export default function MatchDraw() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tournamentIdParam = searchParams.get('tournamentId') || searchParams.get('id') || '';

  const [selectedTournamentId, setSelectedTournamentId] = useState(tournamentIdParam);
  const [tournamentData, setTournamentData] = useState(null);
  const [participatingTeams, setParticipatingTeams] = useState([]);
  const [shuffledTeams, setShuffledTeams] = useState([]);
  const [drawData, setDrawData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [isDrawFinalized, setIsDrawFinalized] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (selectedTournamentId) {
      loadTournamentDrawData(selectedTournamentId);
    }
  }, [selectedTournamentId]);

  const loadTournamentDrawData = async (tId) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/tournament/${tId}/draw`);
      if (res.data && res.data.success) {
        const data = res.data.data;
        const tournament = data.tournament || {};
        setTournamentData(tournament);
        
        const teamsList = data.teams || [];
        setParticipatingTeams(teamsList);
        
        if (data.drawData) {
          setDrawData(data.drawData);
          if (data.drawData.teams) {
            setShuffledTeams(data.drawData.teams);
          }
        } else {
          setShuffledTeams(teamsList);
        }

        setIsDrawFinalized(data.isDrawFinalized);
        setIsCompleted((tournament.status || '').toUpperCase() === 'COMPLETED');
      } else {
        throw new Error(res.data.message || "Failed to load tournament draw details.");
      }
    } catch (err) {
      console.error("Error loading draw data:", err);
      setErrorMsg(err.message || "Could not fetch tournament details.");
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Aug 28, 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const handleWinnersUpdate = async (updatedWinners, updatedScores) => {
    try {
      const newDrawData = {
        ...drawData,
        bracketWinners: updatedWinners,
        matchScores: updatedScores || drawData?.matchScores || {},
        winner: updatedWinners.champion || drawData?.winner || 'TBD'
      };
      setDrawData(newDrawData);

      const payload = {
        drawData: newDrawData
      };
      await api.post(`/tournament/${selectedTournamentId}/draw`, payload);
    } catch (err) {
      console.error("Error auto-saving bracket winners and scores:", err);
    }
  };

  // Complete Tournament Handler
  const handleCompleteTournament = async () => {
    if (!selectedTournamentId) return;
    try {
      setErrorMsg(null);
      const res = await api.post(`/tournament/${selectedTournamentId}/complete`);
      if (res.data && res.data.success) {
        setIsCompleted(true);
        setTournamentData(prev => ({ ...prev, status: 'COMPLETED' }));
        setSuccessMsg(res.data.message || "Tournament has been successfully marked as COMPLETED! 🎉");
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        throw new Error(res.data.message || "Failed to mark tournament as completed.");
      }
    } catch (err) {
      console.error("Error completing tournament:", err);
      setErrorMsg(err.message || "Error completing tournament.");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-['Poppins'] space-y-6">
      
      {/* Clean Simple Tournament Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-xs space-y-3">
        <button 
          onClick={() => navigate(`/organizer/tournaments/manage/${selectedTournamentId || ''}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#08733e] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Manage Console
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                {tournamentData?.title || 'Tournament Name'}
              </h1>
              
              {isCompleted ? (
                <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 size={14} /> Tournament Completed
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                  isDrawFinalized ? 'bg-emerald-100 text-[#08733e]' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isDrawFinalized ? 'Official Match Schedule Finalized' : 'Match Schedule Drawn'}
                </span>
              )}
            </div>

            {/* Simple Details: Venue & Date */}
            <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#08733e]" />
                <span>{tournamentData?.location || 'Venue: Badulla'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#08733e]" />
                <span>Event Date: {formatDate(tournamentData?.tournament_held_date || tournamentData?.start_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#08733e] px-5 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Tournament Match Draw Tree */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
          <div className="w-10 h-10 border-4 border-[#08733e] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Loading tournament match draw details...</p>
        </div>
      ) : (
        <KnockoutBracketDisplay 
          tournamentTitle={tournamentData?.title || "TOURNAMENT CUP"} 
          teams={shuffledTeams.length > 0 ? shuffledTeams : participatingTeams} 
          drawData={drawData}
          onWinnersUpdate={handleWinnersUpdate}
          onCompleteTournament={handleCompleteTournament}
          isTournamentCompleted={isCompleted}
        />
      )}
    </div>
  );
}
