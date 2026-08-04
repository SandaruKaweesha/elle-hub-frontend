import React, { useState, useEffect } from "react";
import { Medal, Trophy, Swords, Search, Calendar, MapPin, CheckCircle2, Award, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function TeamResults() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [officialResults, setOfficialResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/team/${userId}/history`);
        if (res.data && res.data.success) {
          const list = res.data.data || [];
          setTournaments(list);
          if (list.length > 0) {
            setSelectedTournament(list[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching team tournament results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchResults();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedTournament?.tournament_id) {
      api.get(`/tournaments/${selectedTournament.tournament_id}/results`)
        .then((res) => {
          if (res.data && res.data.success) {
            setOfficialResults(res.data.data || []);
          }
        })
        .catch((err) => console.error("Error fetching official results:", err));
    }
  }, [selectedTournament]);

  const parseDraw = (drawDataRaw) => {
    if (!drawDataRaw) return null;
    try {
      return typeof drawDataRaw === "string" ? JSON.parse(drawDataRaw) : drawDataRaw;
    } catch {
      return null;
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    (t.tournament_title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const draw = selectedTournament ? parseDraw(selectedTournament.draw_data) : null;
  const winner = draw?.winner || draw?.bracketWinners?.champion;
  const matchScores = draw?.matchScores || {};

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2.5 rounded-xl">
              <Medal size={26} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Tournament Match Results</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">View official match scores, bracket outcomes, and championship standings.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#e5e5e5]">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading tournament results...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-xs">
          <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Tournament Results Yet</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            Once your squad completes a tournament, final match scores and standings will be updated here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Completed Tournaments Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
              <Trophy size={16} className="text-[#00382D]" /> Select Tournament
            </h3>

            <div className="space-y-2">
              {filteredTournaments.map((item) => {
                const isSelected = selectedTournament?.tournament_id === item.tournament_id;
                return (
                  <div
                    key={item.tournament_id}
                    onClick={() => setSelectedTournament(item)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-[#00382D] text-white border-[#00382D] shadow-md" 
                        : "bg-white text-[#111111] border-[#e5e5e5] hover:border-gray-300 shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-emerald-200" : "text-emerald-800"}`}>
                          COMPLETED
                        </span>
                        <h4 className="font-bold text-base leading-tight mt-0.5">{item.tournament_title}</h4>
                      </div>
                      <ChevronRight size={18} className={isSelected ? "text-white" : "text-gray-400"} />
                    </div>
                    <p className={`text-xs mt-2 ${isSelected ? "text-emerald-100" : "text-gray-500"}`}>
                      {item.location || 'Sri Lanka'} • {item.tournament_held_date || item.start_date}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Match Scores Breakdown */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTournament && (
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-xs space-y-6">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      COMPLETED CHAMPIONSHIP
                    </span>
                    <h2 className="text-2xl font-bold text-[#111111] mt-1">{selectedTournament.tournament_title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Organized by {selectedTournament.organizer_name}</p>
                  </div>

                  <div className="text-xs text-gray-500 bg-[#f8f7f4] p-3 rounded-xl border border-gray-200">
                    <div>Venue: <strong className="text-[#111111]">{selectedTournament.location}</strong></div>
                    <div>Date: <strong className="text-[#111111]">{selectedTournament.tournament_held_date || selectedTournament.start_date}</strong></div>
                  </div>
                </div>

                {/* Champion Banner */}
                {winner ? (
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0">
                        <Trophy size={26} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-amber-100 tracking-wider block">Tournament Winner</span>
                        <h3 className="text-xl font-black">{winner}</h3>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">
                      CHAMPION
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Official Match Results</h4>
                      <p className="text-xs text-emerald-800">Match score records verified for this tournament.</p>
                    </div>
                  </div>
                )}

                {/* Match Scores breakdown */}
                {Object.keys(matchScores).length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Swords size={16} className="text-[#00382D]" /> Bracket Match Scores
                    </h3>

                    <div className="space-y-2.5">
                      {Object.entries(matchScores).map(([stageKey, scoreObj]) => {
                        let stageName = "Match";
                        if (stageKey === "champion") stageName = "Final Championship Match";
                        else if (stageKey.includes("SF") || stageKey.includes("sf")) stageName = "Semi-Final Match";
                        else if (stageKey.includes("QF") || stageKey.includes("qf")) stageName = "Quarter-Final Match";

                        return (
                          <div key={stageKey} className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-[#111111] text-xs block">{stageName}</span>
                              {scoreObj.winner && (
                                <span className="text-xs text-emerald-700 font-bold mt-0.5 block">
                                  Winner: 🏆 {scoreObj.winner}
                                </span>
                              )}
                            </div>

                            <span className="px-4 py-1.5 bg-[#00382D] text-white rounded-xl font-mono font-extrabold text-sm shadow-2xs self-start sm:self-center">
                              {scoreObj.scoreText || `${scoreObj.team1Score || 0} - ${scoreObj.team2Score || 0}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f8f7f4] border border-[#e5e5e5] p-8 rounded-2xl text-center">
                    <Swords size={36} className="mx-auto text-gray-400 mb-2 opacity-50" />
                    <h4 className="font-bold text-[#111111] text-sm">Match Results Archived</h4>
                    <p className="text-gray-500 text-xs mt-1">
                      Official championship matches completed and verified.
                    </p>
                  </div>
                )}

                {/* Individual Awards */}
                {officialResults.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Award size={16} className="text-amber-500" /> Individual Awards & Honors
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {officialResults.map((award, idx) => (
                        <div key={idx} className="bg-[#f8f7f4] p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#00382D] block">{award.awardType}</span>
                            <span className="text-gray-700 font-semibold">{award.recipientName}</span>
                          </div>
                          {award.recipientTeam && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              {award.recipientTeam}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
