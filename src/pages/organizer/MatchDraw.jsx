import React, { useState } from 'react';
import { Trophy, Users, Shuffle, Download, Eye, ChevronRight, Zap } from 'lucide-react';

function generateBracketColumns(numTeams, shuffleSeed = 0, matchResults = {}) {
  const teams = parseInt(numTeams) || 2;
  const clampedTeams = Math.min(Math.max(teams, 2), 16); // max 16 teams
  
  let teamNames = [];
  for (let i = 0; i < clampedTeams; i++) {
    teamNames.push(`Team ${i + 1}`);
  }

  // Simple PRNG for stable React renders
  let currentSeed = shuffleSeed + 12345 + clampedTeams;
  function random() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  }

  // Fisher-Yates shuffle
  for (let i = teamNames.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [teamNames[i], teamNames[j]] = [teamNames[j], teamNames[i]];
  }

  let p = 1;
  while (p < clampedTeams) p *= 2;
  
  let order = [0];
  let length = 1;
  while (length < p) {
    let nextOrder = [];
    for (let i = 0; i < length; i++) {
      nextOrder.push(order[i]);
      nextOrder.push(2 * length - 1 - order[i]);
    }
    order = nextOrder;
    length *= 2;
  }
  
  let slots = Array(p).fill(null);
  for (let i = 0; i < p; i++) {
    if (order[i] < clampedTeams) {
      slots[i] = teamNames[order[i]];
    }
  }
  
  let rounds = [];
  let currentRoundNodes = [];
  
  for (let i = 0; i < p; i += 2) {
    let t1 = slots[i];
    let t2 = slots[i+1];
    let id = `r1-${i}`;
    let actualWinner = matchResults[id];
    if (actualWinner !== t1 && actualWinner !== t2) actualWinner = null;
    
    if (t1 && t2) {
      currentRoundNodes.push({ type: 'match', t1, t2, id, actualWinner });
    } else if (t1 || t2) {
      currentRoundNodes.push({ type: 'advance', team: t1 || t2, id, actualWinner: t1 || t2 });
    } else {
      currentRoundNodes.push({ type: 'empty', id });
    }
  }
  rounds.push(currentRoundNodes);
  
  let roundNum = 2;
  while (currentRoundNodes.length > 1) {
    let nextRoundNodes = [];
    for (let i = 0; i < currentRoundNodes.length; i += 2) {
      let n1 = currentRoundNodes[i];
      let n2 = currentRoundNodes[i+1];
      
      let t1 = n1.actualWinner || null;
      let t2 = n2.actualWinner || null;
      
      let id = `r${roundNum}-${i}`;
      let actualWinner = matchResults[id];
      if (actualWinner && actualWinner !== t1 && actualWinner !== t2) actualWinner = null;
      
      if (n1.type !== 'empty' && n2.type === 'empty') {
        nextRoundNodes.push({ type: 'advance', team: t1, id, actualWinner: t1 });
      } else if (n1.type === 'empty' && n2.type !== 'empty') {
        nextRoundNodes.push({ type: 'advance', team: t2, id, actualWinner: t2 });
      } else if (n1.type !== 'empty' && n2.type !== 'empty') {
        nextRoundNodes.push({ type: 'match', t1, t2, id, actualWinner });
      } else {
        nextRoundNodes.push({ type: 'empty', id });
      }
    }
    rounds.push(nextRoundNodes);
    currentRoundNodes = nextRoundNodes;
    roundNum++;
  }
  
  return rounds;
}

export default function MatchDraw() {
  const [selectedTournament, setSelectedTournament] = useState('');
  const [drawFormat, setDrawFormat] = useState('knockout');
  const [teamCount, setTeamCount] = useState(6);
  const [baseSeed, setBaseSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [activeSeed, setActiveSeed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [drawGenerated, setDrawGenerated] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [matchResults, setMatchResults] = useState({});
  const [finalizedDrawsHistory, setFinalizedDrawsHistory] = useState([]);

  const handleFinalize = () => {
    setIsFinalized(true);
    let tName = selectedTournament === 't1' ? 'National Championship 2026' : 
               (selectedTournament === 't2' ? 'Summer Elle League' : 'Custom Tournament');
               
    setFinalizedDrawsHistory(prev => [
      {
        id: Date.now(),
        tournamentId: selectedTournament,
        tournamentName: tName,
        drawFormat,
        teamCount,
        baseSeed,
        shuffleSeed,
        activeSeed,
        matchResults,
        date: new Date().toLocaleDateString()
      },
      ...prev
    ]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setBaseSeed(Math.floor(Math.random() * 1000000));
      setShuffleSeed(0);
      setActiveSeed(0);
      setMatchResults({});
      setIsFinalized(false);
      setDrawGenerated(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full bg-white rounded-2xl border border-[#e5e5e5] p-6 lg:p-8 shadow-sm flex flex-col gap-8 animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
            <Zap className="text-[#4ade80]" size={20} />
            Match Draw Generator
          </h2>
          <p className="text-[#666666] text-sm mt-1">Configure and generate automated brackets for your tournaments.</p>
        </div>
        
        {drawGenerated && (
          <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <button className="px-4 py-2 text-sm font-medium text-[#111111] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
              <Eye size={16} /> Preview
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#00382D] hover:bg-[#002a22] rounded-lg transition-colors flex items-center gap-2">
              <Download size={16} /> Export
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-[#f8f7f4] p-5 rounded-xl border border-[#e5e5e5]">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-wider">Configuration</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Select Tournament</label>
            <div className="relative">
              <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <select 
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d6d8d4] rounded-lg text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] appearance-none"
              >
                <option value="">Choose a tournament...</option>
                <option value="t1">National Championship 2026</option>
                <option value="t2">Summer Elle League</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Draw Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setDrawFormat('knockout')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  drawFormat === 'knockout' 
                    ? 'border-[#00382D] bg-[#00382D]/5 text-[#00382D]' 
                    : 'border-[#d6d8d4] bg-white text-[#666666] hover:bg-gray-50'
                }`}
              >
                Knockout
              </button>
              <button 
                onClick={() => setDrawFormat('league')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  drawFormat === 'league' 
                    ? 'border-[#00382D] bg-[#00382D]/5 text-[#00382D]' 
                    : 'border-[#d6d8d4] bg-white text-[#666666] hover:bg-gray-50'
                }`}
              >
                League
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Participating Teams</label>
            <div className="w-full px-4 py-2 bg-white border border-[#d6d8d4] rounded-lg text-sm flex items-center justify-between focus-within:border-[#00382D] focus-within:ring-1 focus-within:ring-[#00382D] transition-all">
              <span className="text-[#666666]">Approved Teams</span>
              <input 
                type="number"
                min="2"
                max="16"
                value={teamCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val <= 16) {
                    setTeamCount(val);
                    setShuffleSeed(0);
                    setActiveSeed(0);
                    setMatchResults({});
                    setIsFinalized(false);
                    setDrawGenerated(false); // Reset draw if they change the number
                  }
                }}
                className="w-16 font-bold text-[#111111] bg-gray-100 px-2 py-1 rounded text-xs focus:outline-none focus:bg-[#e5e5e5] text-center"
              />
            </div>
          </div>

          <div className="mt-2 pt-5 border-t border-[#d6d8d4] flex flex-col gap-3">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTournament || isFinalized}
              className={`
                w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                ${isGenerating || !selectedTournament || isFinalized
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#4ade80] text-[#00382D] hover:bg-[#3bcf71] hover:-translate-y-0.5 hover:shadow-md'
                }
              `}
            >
              {isFinalized ? (
                <>
                  <Trophy size={18} />
                  Draw Finalized
                </>
              ) : isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00382D] border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate Bracket
                </>
              )}
            </button>
            
            <button 
              onClick={() => {
                setIsGenerating(true);
                setTimeout(() => {
                  setShuffleSeed(prev => {
                    const next = prev + 1;
                    setActiveSeed(next);
                    setMatchResults({});
                    return next;
                  });
                  setIsGenerating(false);
                }, 800);
              }}
              disabled={!drawGenerated || isGenerating || shuffleSeed >= 2 || isFinalized}
              className={`
                w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border
                ${!drawGenerated || isGenerating || shuffleSeed >= 2 || isFinalized
                  ? 'bg-white border-[#e5e5e5] text-gray-400 cursor-not-allowed'
                  : 'bg-white border-[#00382D] text-[#00382D] hover:bg-[#f0fdf4] hover:-translate-y-0.5'
                }
              `}
            >
              <Shuffle size={16} />
              {shuffleSeed >= 2 ? 'Shuffle Limit Reached' : `Shuffle Draw (${2 - shuffleSeed} left)`}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-[#f4f4f4] rounded-xl border border-[#e5e5e5] flex items-center justify-center min-h-[400px] overflow-hidden relative">
          
          {!drawGenerated && !isGenerating && (
            <div className="text-center p-8 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d6d8d4] shadow-sm">
                <Users size={24} className="text-[#888888]" />
              </div>
              <h3 className="text-lg font-bold text-[#333333] mb-2">No Draw Generated</h3>
              <p className="text-[#666666] text-sm leading-relaxed">Select a tournament and configure your settings on the left, then click Generate to create your match brackets automatically.</p>
            </div>
          )}

          {isGenerating && (
            <div className="text-center p-8 flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-[#00382D]/20 border-t-[#00382D] rounded-full animate-spin mb-4"></div>
               <p className="text-[#333333] font-medium animate-pulse">Running draw algorithm...</p>
            </div>
          )}

          {drawGenerated && !isGenerating && (
            <div className="absolute inset-0 p-6 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-[#111111] text-lg">Generated Bracket Preview</h3>
                 <div>
                   <span className="text-xs font-bold px-3 py-1.5 bg-[#4ade80]/20 text-[#08733e] rounded-md uppercase tracking-wide">Format: Knockout</span>
                   {isFinalized && (
                     <span className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md uppercase tracking-wide ml-3">Finalized</span>
                   )}
                 </div>
               </div>
               
               {/* Dynamic Colorful Bracket Visual */}
               <div className="flex items-stretch gap-12 min-w-max px-4 py-8">
                 {generateBracketColumns(teamCount, baseSeed + activeSeed, matchResults).map((column, colIdx, allCols) => (
                   <div key={colIdx} className="flex flex-col justify-around gap-6 relative">
                     {column.map((node, nodeIdx) => {
                       if (node.type === 'empty') {
                         return <div key={node.id} className="w-56 opacity-0 pointer-events-none h-16"></div>;
                       }
                       
                       if (node.type === 'advance') {
                         return (
                           <div key={node.id} className="w-56 relative z-10 flex flex-col justify-center min-h-[5rem]">
                              {/* 
                                No UI box shown for 'bye', just the geometric connectors. 
                                The continuous line makes it look like a long bracket path.
                              */}
                              <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-300"></div>
                              
                              {colIdx < allCols.length - 1 && (
                                <>
                                  <div className="absolute -right-6 top-1/2 w-6 h-[2px] bg-gray-300"></div>
                                  {nodeIdx % 2 === 0 && (
                                    <div className="absolute -right-6 top-1/2 w-[2px] h-[calc(50%+1.5rem)] bg-gray-300"></div>
                                  )}
                                  {nodeIdx % 2 === 1 && (
                                    <div className="absolute -right-6 bottom-1/2 w-[2px] h-[calc(50%+1.5rem)] bg-gray-300"></div>
                                  )}
                                </>
                              )}
                              {colIdx > 0 && (
                                 <div className="absolute -left-6 top-1/2 w-6 h-[2px] bg-gray-300"></div>
                              )}
                           </div>
                         );
                       }
                       
                       // It's a match
                       const isFinal = colIdx === allCols.length - 1;
                       const gradient = isFinal ? 'from-rose-50 to-white' : (colIdx % 2 === 0 ? 'from-blue-50 to-white' : 'from-purple-50 to-white');
                       const borderColor = isFinal ? 'border-rose-200' : (colIdx % 2 === 0 ? 'border-blue-200' : 'border-purple-200');
                       const textColor = isFinal ? 'text-rose-900' : (colIdx % 2 === 0 ? 'text-blue-900' : 'text-purple-900');
                       
                       const handleTeamClick = (teamName) => {
                         if (!teamName || isFinalized) return;
                         setMatchResults(prev => {
                           if (prev[node.id] === teamName) {
                             const newRes = { ...prev };
                             delete newRes[node.id];
                             return newRes;
                           }
                           return { ...prev, [node.id]: teamName };
                         });
                       };
                       
                       return (
                         <div key={node.id} className={`bg-gradient-to-r ${gradient} border ${borderColor} rounded-xl p-2 w-56 shadow-sm relative z-10 flex flex-col justify-center min-h-[5rem]`}>
                            {isFinal && <div className="absolute -top-3 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Final</div>}
                            
                            <div 
                              onClick={() => handleTeamClick(node.t1)}
                              className={`flex justify-between items-center text-sm font-semibold border-b border-gray-100 pb-1 mb-1 p-1.5 rounded-md transition-colors ${!node.t1 || isFinalized ? '' : 'cursor-pointer hover:bg-white/60'} ${node.actualWinner === node.t1 ? 'bg-green-100/50' : ''}`}
                            >
                              <span className={`${node.t1 ? textColor : 'text-gray-400'}`}>
                                {node.t1 || 'TBD'}
                              </span>
                              {node.actualWinner === node.t1 && <Trophy size={14} className="text-green-600" />}
                            </div>
                            
                            <div 
                              onClick={() => handleTeamClick(node.t2)}
                              className={`flex justify-between items-center text-sm font-semibold p-1.5 rounded-md transition-colors ${!node.t2 || isFinalized ? '' : 'cursor-pointer hover:bg-white/60'} ${node.actualWinner === node.t2 ? 'bg-green-100/50' : ''}`}
                            >
                              <span className={`${node.t2 ? textColor : 'text-gray-400'}`}>
                                {node.t2 || 'TBD'}
                              </span>
                              {node.actualWinner === node.t2 && <Trophy size={14} className="text-green-600" />}
                            </div>
                            
                            {/* Connectors */}
                            {!isFinal && (
                              <>
                                <div className={`absolute -right-6 top-1/2 w-6 h-[2px] ${colIdx % 2 === 0 ? 'bg-blue-300' : 'bg-purple-300'}`}></div>
                                {nodeIdx % 2 === 0 && (
                                  <div className={`absolute -right-6 top-1/2 w-[2px] h-[calc(50%+1.5rem)] ${colIdx % 2 === 0 ? 'bg-blue-300' : 'bg-purple-300'}`}></div>
                                )}
                                {nodeIdx % 2 === 1 && (
                                  <div className={`absolute -right-6 bottom-1/2 w-[2px] h-[calc(50%+1.5rem)] ${colIdx % 2 === 0 ? 'bg-blue-300' : 'bg-purple-300'}`}></div>
                                )}
                              </>
                            )}
                            {colIdx > 0 && (
                               <div className={`absolute -left-6 top-1/2 w-6 h-[2px] ${colIdx % 2 === 0 ? 'bg-purple-300' : 'bg-blue-300'}`}></div>
                            )}
                         </div>
                       );
                     })}
                   </div>
                 ))}
               </div>

            </div>
          )}

        </div>
      </div>

      {drawGenerated && !isGenerating && !isFinalized && (
        <div className="mt-4 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h4 className="text-sm font-bold text-[#111111] mb-1">Saved Draws History</h4>
            <p className="text-xs text-[#666666]">Select a generated option to preview</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Array.from({ length: shuffleSeed + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSeed(idx);
                  setMatchResults({});
                }}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all border ${
                  activeSeed === idx
                    ? 'bg-[#00382D] text-white border-[#00382D] shadow-md'
                    : 'bg-white text-[#666666] border-[#e5e5e5] hover:bg-gray-50'
                }`}
              >
                {idx === 0 ? 'Original Draw' : `Shuffle Option ${idx}`}
              </button>
            ))}
            
            <div className="w-px h-8 bg-gray-300 mx-2"></div>
            
            <button
              onClick={handleFinalize}
              className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all bg-[#4ade80] text-[#00382D] hover:bg-[#3bcf71] hover:-translate-y-0.5 hover:shadow-md border border-[#4ade80]"
            >
              Finalize Draw
            </button>
          </div>
        </div>
      )}
      </div>

      {/* History UI below the main container */}
      {finalizedDrawsHistory.length > 0 && (
        <div className="w-full mt-8 bg-white rounded-2xl border border-[#e5e5e5] p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h3 className="text-lg font-bold text-[#111111] mb-6 flex items-center gap-2">
              <Trophy className="text-[#08733e]" size={20}/>
              Finalized Draws History
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {finalizedDrawsHistory.map(draw => (
               <div key={draw.id} className="bg-[#f8f7f4] border border-[#d6d8d4] rounded-xl p-5 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-3">
                   <h4 className="font-bold text-[#333333]">{draw.tournamentName}</h4>
                   <span className="text-[10px] font-bold bg-[#00382D] text-white px-2 py-1 rounded-full">{draw.drawFormat}</span>
                 </div>
                 <div className="text-sm text-[#666666] mb-4 space-y-1">
                   <p>Teams: <span className="font-semibold text-[#111111]">{draw.teamCount}</span></p>
                   <p>Date: <span className="font-semibold text-[#111111]">{draw.date}</span></p>
                 </div>
                 <button 
                   onClick={() => {
                     setSelectedTournament(draw.tournamentId);
                     setDrawFormat(draw.drawFormat);
                     setTeamCount(draw.teamCount);
                     setBaseSeed(draw.baseSeed);
                     setShuffleSeed(draw.shuffleSeed);
                     setActiveSeed(draw.activeSeed);
                     setMatchResults(draw.matchResults || {});
                     setIsFinalized(true);
                     setDrawGenerated(true);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="w-full py-2 bg-white border border-[#d6d8d4] text-[#333333] text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                 >
                    <Eye size={16}/>
                    View Draw
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
