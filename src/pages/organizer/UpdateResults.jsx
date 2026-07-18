import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Edit, Save, CheckCircle2, RotateCcw, Medal } from 'lucide-react';
import api, { tournamentResultsAPI } from '../../services/api';

export default function UpdateResults() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'final'
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);
  
  // Live Match State
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isUpdatingLive, setIsUpdatingLive] = useState(false);

  // Final Awards State
  const [finalAwards, setFinalAwards] = useState([
    { id: 1, type: 'WINNER', label: 'Winner', name: '', team: '' },
    { id: 2, type: 'RUNNER_UP', label: 'Runner Up', name: '', team: '' },
    { id: 3, type: 'BEST_BATSMAN', label: 'Best Batsman', name: '', team: '' },
    { id: 4, type: 'BEST_BOWLER', label: 'Best Bowler', name: '', team: '' },
    { id: 5, type: 'MAN_OF_THE_MATCH', label: 'Man of the Match', name: '', team: '' },
  ]);
  const [isSavingAwards, setIsSavingAwards] = useState(false);
  const [awardMessage, setAwardMessage] = useState(null);

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && (user.userId || user.id)) {
          const res = await api.get(`/organizer/${user.userId || user.id}/tournaments`);
          if (res.data.success !== false) {
            setTournaments(res.data.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  // Fetch awards when tournament selected
  useEffect(() => {
    if (activeTab === 'final' && selectedTournament) {
      const fetchAwards = async () => {
        try {
          const res = await tournamentResultsAPI.getResults(selectedTournament);
          if (res.data.success !== false && res.data.data) {
            const savedData = res.data.data;
            const updatedAwards = finalAwards.map(award => {
              const saved = savedData.find(s => s.awardType === award.type);
              return saved ? { ...award, name: saved.recipientName, team: saved.recipientTeam || '' } : { ...award, name: '', team: '' };
            });
            setFinalAwards(updatedAwards);
          }
        } catch (err) {
          console.error("Error fetching awards:", err);
        }
      };
      fetchAwards();
    }
  }, [activeTab, selectedTournament]);

  const handleUpdateLive = () => {
    setIsUpdatingLive(true);
    setTimeout(() => {
      setIsUpdatingLive(false);
    }, 800);
  };

  const handleSaveAwards = async () => {
    if (!selectedTournament) return;
    setIsSavingAwards(true);
    setAwardMessage(null);
    try {
      const resultsToSave = finalAwards
        .filter(a => a.name.trim() !== '')
        .map(a => ({ awardType: a.type, recipientName: a.name, recipientTeam: a.team }));
        
      await tournamentResultsAPI.saveResults(selectedTournament, resultsToSave);
      setAwardMessage({ type: 'success', text: 'Final awards saved successfully!' });
    } catch (err) {
      console.error("Error saving awards:", err);
      setAwardMessage({ type: 'error', text: 'Failed to save awards. Please try again.' });
    } finally {
      setIsSavingAwards(false);
    }
  };

  const handleAwardChange = (id, field, value) => {
    setFinalAwards(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const dummyMatches = [
    { id: 1, teamA: 'Lions Club', teamB: 'Tigers SC', time: '10:00 AM', status: 'live', scoreA: '45/2', scoreB: '0/0', oversA: '5.2', oversB: '0' },
    { id: 2, teamA: 'Eagles CC', teamB: 'Sharks', time: '1:30 PM', status: 'upcoming', scoreA: '0/0', scoreB: '0/0', oversA: '0', oversB: '0' }
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e5e5e5] p-6 lg:p-8 shadow-sm flex flex-col gap-8 animate-in fade-in duration-300 font-['Poppins']">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
            <Edit className="text-[#4ade80]" size={20} />
            Match Results & Awards
          </h2>
          <p className="text-[#666666] text-sm mt-1">Manage live match scores and set final tournament awards.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-[#f4f4f4] p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'live' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            Live Scoring
          </button>
          <button 
            onClick={() => setActiveTab('final')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'final' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            <Medal size={16} /> Final Awards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Common Selection Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-[#f8f7f4] p-5 rounded-xl border border-[#e5e5e5] h-fit">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-wider">Tournament Select</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Tournament</label>
            <div className="relative">
              <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <select 
                value={selectedTournament}
                onChange={(e) => { setSelectedTournament(e.target.value); setSelectedMatch(null); }}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d6d8d4] rounded-lg text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] appearance-none"
              >
                <option value="">Choose a tournament...</option>
                {tournaments.map(t => (
                  <option key={t.tournament_id || t.id} value={t.tournament_id || t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'live' && (
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-sm font-medium text-[#333333]">Matches</label>
              {!selectedTournament ? (
                 <div className="text-sm text-[#888888] text-center p-4 bg-white rounded-lg border border-dashed border-[#d6d8d4]">Select a tournament first</div>
              ) : (
                 <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                   {dummyMatches.map(match => (
                     <button 
                       key={match.id}
                       onClick={() => setSelectedMatch(match)}
                       className={`text-left p-3 rounded-lg border transition-all ${
                         selectedMatch?.id === match.id 
                           ? 'border-[#00382D] bg-[#00382D]/5' 
                           : 'border-[#d6d8d4] bg-white hover:border-[#00382D]/30'
                       }`}
                     >
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-semibold text-[#888888] flex items-center gap-1"><Calendar size={12}/> {match.time}</span>
                         {match.status === 'live' && <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> LIVE</span>}
                       </div>
                       <div className="flex items-center justify-between font-bold text-[#111111] text-sm">
                         <span>{match.teamA}</span>
                         <span className="text-xs text-[#888888] font-normal">vs</span>
                         <span>{match.teamB}</span>
                       </div>
                     </button>
                   ))}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 min-h-[400px]">
          
          {/* Live Scoring Tab */}
          {activeTab === 'live' && (
            <div className="bg-[#f4f4f4] rounded-xl border border-[#e5e5e5] h-full relative overflow-hidden">
              {!selectedMatch ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d6d8d4] shadow-sm">
                    <Edit size={24} className="text-[#888888]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#333333] mb-2">No Match Selected</h3>
                  <p className="text-[#666666] text-sm max-w-sm">Select a tournament and a match to start updating live scores.</p>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 border-b border-[#e5e5e5] bg-[#f8f7f4]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[#111111] text-lg">Live Scoring Input</h3>
                      {selectedMatch.status === 'live' ? (
                        <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-md uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Match is Live
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-700 rounded-md uppercase tracking-wide flex items-center gap-1.5">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-8">
                    <div className="flex items-center gap-6 p-5 rounded-xl border border-[#00382D]/20 bg-[#00382D]/5">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#111111] mb-1">{selectedMatch.teamA}</h4>
                        <p className="text-sm font-medium text-[#666666]">Batting</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Runs/Wickets</label>
                          <input type="text" defaultValue={selectedMatch.scoreA} className="w-24 text-center font-bold text-2xl text-[#111111] bg-white border border-[#d6d8d4] rounded-lg py-2 focus:outline-none focus:border-[#00382D]" />
                        </div>
                        <div className="text-center">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Overs</label>
                          <input type="text" defaultValue={selectedMatch.oversA} className="w-20 text-center font-bold text-2xl text-[#111111] bg-white border border-[#d6d8d4] rounded-lg py-2 focus:outline-none focus:border-[#00382D]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#f4f4f4] flex items-center justify-center font-bold text-sm text-[#888888] border border-[#e5e5e5]">VS</div>
                    </div>

                    <div className="flex items-center gap-6 p-5 rounded-xl border border-[#e5e5e5] bg-[#f8f7f4] opacity-70">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#111111] mb-1">{selectedMatch.teamB}</h4>
                        <p className="text-sm font-medium text-[#666666]">Yet to Bat</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Runs/Wickets</label>
                          <input type="text" disabled defaultValue={selectedMatch.scoreB} className="w-24 text-center font-bold text-2xl text-[#888888] bg-gray-100 border border-[#d6d8d4] rounded-lg py-2" />
                        </div>
                        <div className="text-center">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Overs</label>
                          <input type="text" disabled defaultValue={selectedMatch.oversB} className="w-20 text-center font-bold text-2xl text-[#888888] bg-gray-100 border border-[#d6d8d4] rounded-lg py-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 border-t border-[#e5e5e5] bg-gray-50 flex flex-wrap items-center justify-end gap-3 rounded-b-xl">
                    <button className="px-4 py-2.5 text-sm font-bold text-[#555555] bg-white border border-[#d6d8d4] hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
                      <RotateCcw size={16} /> Reset
                    </button>
                    <button 
                      onClick={handleUpdateLive}
                      className="px-6 py-2.5 text-sm font-bold text-[#00382D] bg-[#4ade80] hover:bg-[#3bcf71] rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      {isUpdatingLive ? 'Saving...' : <><Save size={16} /> Update Score</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Awards Tab */}
          {activeTab === 'final' && (
             <div className="bg-white rounded-xl border border-[#e5e5e5] h-full flex flex-col animate-in fade-in duration-300 shadow-sm">
                {!selectedTournament ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-[#f4f4f4] rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d6d8d4] shadow-sm">
                      <Medal size={24} className="text-[#888888]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#333333] mb-2">No Tournament Selected</h3>
                    <p className="text-[#666666] text-sm max-w-sm">Select a tournament from the left panel to record its final awards.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[#e5e5e5] bg-[#f8f7f4] rounded-t-xl">
                      <h3 className="font-bold text-[#111111] text-lg">Tournament Awards</h3>
                      <p className="text-sm text-[#666666]">Save final results to auto-populate certificates.</p>
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                      {awardMessage && (
                        <div className={`p-3 rounded-md text-sm text-center border ${awardMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {awardMessage.text}
                        </div>
                      )}

                      {finalAwards.map(award => (
                        <div key={award.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-[#e5e5e5] rounded-xl bg-[#f8f7f4]/50">
                          <div className="sm:w-1/3 flex items-center">
                            <span className="font-bold text-sm text-[#333333]">{award.label}</span>
                          </div>
                          <div className="sm:w-2/3 flex flex-col sm:flex-row gap-3">
                            <input 
                              type="text" 
                              placeholder="Name/Team" 
                              value={award.name}
                              onChange={(e) => handleAwardChange(award.id, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-[#d6d8d4] rounded-lg focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D]"
                            />
                            <input 
                              type="text" 
                              placeholder="Club (Optional)" 
                              value={award.team}
                              onChange={(e) => handleAwardChange(award.id, 'team', e.target.value)}
                              className="w-full sm:w-32 px-3 py-2 text-sm border border-[#d6d8d4] rounded-lg focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 sm:p-6 border-t border-[#e5e5e5] bg-gray-50 flex items-center justify-end rounded-b-xl">
                      <button 
                        onClick={handleSaveAwards}
                        disabled={isSavingAwards}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#00382D] hover:bg-[#002a22] rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                      >
                        {isSavingAwards ? 'Saving...' : <><Save size={16} /> Save Awards</>}
                      </button>
                    </div>
                  </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
