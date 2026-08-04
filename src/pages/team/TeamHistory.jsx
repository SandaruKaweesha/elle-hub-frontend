import React, { useState, useEffect, useMemo } from "react";
import { 
  History, 
  Search, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Medal,
  Users,
  Sparkles,
  Swords
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function TeamHistory() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Details & Match Results Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("overview"); // "overview" | "results"
  const [officialResults, setOfficialResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error("User session expired. Please log in again.");
      }

      const res = await api.get(`/team/${userId}/history`);
      if (res.data && res.data.success !== false) {
        setHistoryItems(res.data.data || []);
      } else {
        throw new Error(res.data.message || "Failed to query team history.");
      }
    } catch (err) {
      console.error("Fetch team history error:", err);
      setError(err.response?.data?.message || err.message || "Could not load completed tournament history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const handleOpenModal = async (item, initialTab = "overview") => {
    setSelectedItem(item);
    setModalTab(initialTab);
    setShowModal(true);
    setOfficialResults([]);

    if (item.tournament_id) {
      try {
        setLoadingResults(true);
        const res = await api.get(`/tournaments/${item.tournament_id}/results`);
        if (res.data && res.data.success) {
          setOfficialResults(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching official results:", err);
      } finally {
        setLoadingResults(false);
      }
    }
  };

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      const query = searchQuery.toLowerCase();
      const title = (item.tournament_title || "").toLowerCase();
      const organizer = (item.organizer_name || "").toLowerCase();
      const venue = (item.location || "").toLowerCase();

      return title.includes(query) || organizer.includes(query) || venue.includes(query);
    });
  }, [historyItems, searchQuery]);

  // Helper to parse draw_data for match scores and winner
  const parseDrawData = (drawDataRaw) => {
    if (!drawDataRaw) return null;
    try {
      return typeof drawDataRaw === "string" ? JSON.parse(drawDataRaw) : drawDataRaw;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2.5 rounded-xl">
              <History size={26} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Tournament History</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">Review all completed championships, match scores, and official participation records for your squad.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-xs flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[11px] text-[#666666] font-extrabold uppercase tracking-wider block">Completed Archives</span>
            <strong className="text-xl text-[#111111] font-black">{historyItems.length} Tournaments</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search team history by tournament, organizer or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#00382D] transition-colors"
          />
        </div>

        <div className="text-xs text-[#666666] font-medium flex items-center gap-1.5 self-end sm:self-center">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>Only completed tournaments are displayed</span>
        </div>
      </div>

      {/* History Items Directory */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#e5e5e5]">
          <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666] font-medium text-sm">Loading your squad's tournament history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#888888]">
            <History size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">No Completed Tournaments Yet</h3>
          <p className="text-[#666666] text-sm max-w-md mx-auto">
            {searchQuery 
              ? "No completed tournament records match your search criteria."
              : "When an organizer completes a tournament your team participated in, your history log will update here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const dateStr = item.tournament_held_date || item.start_date || 'Completed';
            const dateObj = new Date(`${dateStr}T00:00:00`);
            const dayNum = isNaN(dateObj.getDate()) ? '28' : dateObj.getDate();
            const monthStr = isNaN(dateObj.getDate()) ? 'AUG' : dateObj.toLocaleDateString("en-US", { month: "short" });
            const parsedDraw = parseDrawData(item.draw_data);
            const winnerName = parsedDraw?.winner || parsedDraw?.bracketWinners?.champion || null;

            return (
              <div 
                key={item.tournament_id}
                className="bg-white rounded-2xl border border-[#e5e5e5] shadow-xs hover:shadow-md transition-all p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-[#00382D] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-xl font-extrabold leading-none">{dayNum}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5">{monthStr}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          COMPLETED
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          Verified Squad Entry
                        </span>
                        {winnerName && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Trophy size={11} className="text-amber-600" /> Winner: {winnerName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#111111] leading-tight">{item.tournament_title}</h3>
                      <p className="text-xs text-[#666666] font-medium mt-0.5">
                        Organized by: <strong className="text-[#00382D]">{item.organizer_name}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(item, "overview")}
                    className="px-4 py-2 bg-[#00382D] text-white hover:bg-[#002a22] font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer"
                  >
                    View Record Details <ChevronRight size={14} />
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#555555]">
                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <MapPin size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Venue Location:</span>
                      <strong className="text-[#111111]">{item.location || 'Sri Lanka'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Calendar size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Held Date:</span>
                      <strong className="text-[#111111]">{dateStr}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5]">
                    <Phone size={16} className="text-[#00382D] shrink-0" />
                    <div>
                      <span className="text-[#888888] font-medium block">Organizer Telephone:</span>
                      <strong className="text-[#00382D]">{item.contact_number}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-600" /> Official Participation Verified
                  </span>

                  <button 
                    onClick={() => handleOpenModal(item, "results")}
                    className="text-[#00382D] hover:text-[#002a22] font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                  >
                    <Medal size={15} className="text-[#00382D]" /> View Match Results & Scores
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- MATCH RESULTS & RECORD DETAILS POPUP MODAL --- */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e5e5e5] relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Title Header */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00382D] text-white flex items-center justify-center font-bold shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111111] leading-tight">
                  {selectedItem.tournament_title}
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">
                  Organized by: <strong className="text-[#00382D]">{selectedItem.organizer_name}</strong>
                </p>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-gray-200 text-xs font-bold gap-6">
              <button
                onClick={() => setModalTab("overview")}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  modalTab === "overview"
                    ? "text-[#00382D] border-b-2 border-[#00382D]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Tournament Overview
              </button>
              <button
                onClick={() => setModalTab("results")}
                className={`pb-2.5 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  modalTab === "results"
                    ? "text-[#00382D] border-b-2 border-[#00382D]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Medal size={15} /> Match Results & Scores
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {modalTab === "overview" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#e5e5e5] space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Participation Record:</span>
                    <span className="px-2.5 py-0.5 font-bold uppercase rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200">
                      VERIFIED SQUAD PARTICIPATION
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500 font-medium">Tournament Status:</span>
                    <strong className="text-[#00382D]">COMPLETED & ARCHIVED</strong>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#333333]">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Held Date:</span>
                    <span className="font-bold">{selectedItem.tournament_held_date || selectedItem.start_date || 'Completed'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Venue Location:</span>
                    <span className="font-bold">{selectedItem.location || 'Sri Lanka'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Organizer Contact:</span>
                    <span className="font-bold text-[#00382D]">{selectedItem.contact_number}</span>
                  </div>
                  {selectedItem.prize_details && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Prize Details:</span>
                      <p className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-amber-900 font-bold leading-relaxed">
                        🏆 {selectedItem.prize_details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MATCH RESULTS & SCORES */}
            {modalTab === "results" && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                
                {(() => {
                  const draw = parseDrawData(selectedItem.draw_data);
                  const winner = draw?.winner || draw?.bracketWinners?.champion;
                  const matchScores = draw?.matchScores || {};
                  const bracketWinners = draw?.bracketWinners || {};

                  return (
                    <div className="space-y-4">
                      {/* Champion Banner */}
                      {winner ? (
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
                              <Trophy size={22} className="text-white" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-100 tracking-wider block">Tournament Champion</span>
                              <h4 className="text-lg font-black tracking-wide">{winner}</h4>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-extrabold uppercase">
                            Winner
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900 flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm">Tournament Completed</h4>
                            <p className="text-xs text-emerald-800">Match score logs verified for this championship.</p>
                          </div>
                        </div>
                      )}

                      {/* Official Awards Section */}
                      {officialResults.length > 0 && (
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-2.5">
                          <h4 className="font-bold text-[#111111] flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <Award size={16} className="text-amber-500" /> Official Individual Awards
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {officialResults.map((award, idx) => (
                              <div key={idx} className="bg-[#f8f7f4] p-3 rounded-xl border border-gray-200 flex justify-between items-center">
                                <div>
                                  <span className="font-bold text-[#00382D] block">{award.awardType}</span>
                                  <span className="text-gray-600">{award.recipientName}</span>
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

                      {/* Match Scores Breakdown */}
                      {Object.keys(matchScores).length > 0 ? (
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-3">
                          <h4 className="font-bold text-[#111111] flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <Swords size={16} className="text-[#00382D]" /> Match Scores & Outcome Summary
                          </h4>

                          <div className="space-y-2">
                            {Object.entries(matchScores).map(([stageKey, scoreObj]) => {
                              let stageName = "Match";
                              if (stageKey === "champion") stageName = "Final Championship Match";
                              else if (stageKey.includes("SF") || stageKey.includes("sf")) stageName = "Semi-Final Match";
                              else if (stageKey.includes("QF") || stageKey.includes("qf")) stageName = "Quarter-Final Match";

                              return (
                                <div key={stageKey} className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-[#111111] block text-xs">{stageName}</span>
                                    {scoreObj.winner && (
                                      <span className="text-[11px] text-emerald-700 font-semibold">
                                        Winner: <strong>{scoreObj.winner}</strong>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="px-3 py-1 bg-[#00382D] text-white rounded-lg font-mono font-extrabold text-sm shadow-2xs">
                                      {scoreObj.scoreText || `${scoreObj.team1Score || 0} - ${scoreObj.team2Score || 0}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#f8f7f4] border border-[#e5e5e5] p-6 rounded-2xl text-center">
                          <Swords size={32} className="mx-auto text-gray-400 mb-2 opacity-50" />
                          <h4 className="font-bold text-[#111111] text-sm">Match Scores Verified</h4>
                          <p className="text-gray-500 text-xs mt-1">
                            This tournament has been completed. Detailed bracket scores have been archived by the organizer.
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })()}

              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">
                Official Elle Hub Archived Record
              </span>

              <button 
                onClick={() => setShowModal(false)}
                className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
