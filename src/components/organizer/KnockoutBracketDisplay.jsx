import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Swords, X, Save, Edit3, Award } from 'lucide-react';

export default function KnockoutBracketDisplay({ 
  tournamentTitle = "TOURNAMENT CUP", 
  teams = [], 
  drawData = null,
  onWinnersUpdate = null,
  onCompleteTournament = null,
  isTournamentCompleted = false,
  readOnly = false
}) {

  // Helper function to safely extract team name string
  const getTeamName = (t) => {
    if (!t) return 'TBD / Bye';
    if (typeof t === 'string') return t;
    return t.team_name || t.name || t.display_name || t.email || 'Team';
  };

  // Helper function to safely extract team district string
  const getTeamDistrict = (t) => {
    if (!t || typeof t !== 'object') return 'Sri Lanka';
    return t.district || 'Sri Lanka';
  };

  // Helper to strip (BYE) tag for score modals
  const stripByeTag = (name) => {
    if (!name) return '';
    return name.replace(/\s*\(BYE\)\s*/i, '').trim();
  };

  // Helper to check placeholder team names
  const isPlaceholder = (t) => {
    if (!t) return true;
    const clean = stripByeTag(t);
    return clean.startsWith('Winner') || clean.startsWith('Group') || clean.startsWith('TBD') || clean === 'BYE';
  };

  // State to track interactive bracket winners
  const [winners, setWinners] = useState({
    groupA_QF1: drawData?.bracketWinners?.groupA_QF1 || '',
    groupA_QF2: drawData?.bracketWinners?.groupA_QF2 || '',
    groupB_QF1: drawData?.bracketWinners?.groupB_QF1 || '',
    groupB_QF2: drawData?.bracketWinners?.groupB_QF2 || '',
    
    groupA_SF: drawData?.bracketWinners?.groupA_SF || '',
    groupB_SF: drawData?.bracketWinners?.groupB_SF || '',
    
    champion: drawData?.bracketWinners?.champion || ''
  });

  // State to track match scores
  const [scores, setScores] = useState(drawData?.matchScores || {});

  // Modal State for Score Entry Pop-Up Card
  const [activeModalMatch, setActiveModalMatch] = useState(null);
  const [modalTeam1Score, setModalTeam1Score] = useState('');
  const [modalTeam2Score, setModalTeam2Score] = useState('');

  // Modal State for Completion & Podium Summary
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (drawData?.bracketWinners) {
      setWinners(prev => ({ ...prev, ...drawData.bracketWinners }));
    }
    if (drawData?.matchScores) {
      setScores(drawData.matchScores);
    }
  }, [drawData]);

  // Filter out real participating teams (excluding any old TBD placeholders)
  const realTeams = teams.map(t => ({
    name: getTeamName(t),
    district: getTeamDistrict(t)
  })).filter(t => t.name && !t.name.includes('TBD') && !t.name.includes('Bye'));

  const numTeams = realTeams.length > 0 ? realTeams.length : 6;

  // Split participating teams dynamically into Group A and Group B
  const half = Math.ceil(realTeams.length / 2);
  const groupATeams = realTeams.slice(0, half);
  const groupBTeams = realTeams.slice(half);

  // Dynamic Group A Quarter-Final Pairs & BYE handling
  const groupAQF = [];
  let groupA_SF_direct_t2 = null;

  if (groupATeams.length === 3) {
    groupAQF.push({ t1: groupATeams[0].name, t2: groupATeams[1].name, id: 'groupA_QF1' });
    groupA_SF_direct_t2 = groupATeams[2].name + ' (BYE)';
  } else if (groupATeams.length >= 4) {
    groupAQF.push({ t1: groupATeams[0].name, t2: groupATeams[1].name, id: 'groupA_QF1' });
    groupAQF.push({ t1: groupATeams[2].name, t2: groupATeams[3].name, id: 'groupA_QF2' });
  }

  // Dynamic Group B Quarter-Final Pairs & BYE handling
  const groupBQF = [];
  let groupB_SF_direct_t2 = null;

  if (groupBTeams.length === 3) {
    groupBQF.push({ t1: groupBTeams[0].name, t2: groupBTeams[1].name, id: 'groupB_QF1' });
    groupB_SF_direct_t2 = groupBTeams[2].name + ' (BYE)';
  } else if (groupBTeams.length >= 4) {
    groupBQF.push({ t1: groupBTeams[0].name, t2: groupBTeams[1].name, id: 'groupB_QF1' });
    groupBQF.push({ t1: groupBTeams[2].name, t2: groupBTeams[3].name, id: 'groupB_QF2' });
  }

  // Determine Semi-Final A competitors dynamically based on team count
  let groupA_SF_t1 = 'Winner Match 1';
  let groupA_SF_t2 = 'Winner Match 2';

  if (groupATeams.length <= 2) {
    groupA_SF_t1 = groupATeams[0]?.name || 'TBD';
    groupA_SF_t2 = groupATeams[1]?.name || 'TBD';
  } else if (groupATeams.length === 3) {
    groupA_SF_t1 = winners.groupA_QF1 || 'Winner Match 1';
    groupA_SF_t2 = groupA_SF_direct_t2 || 'BYE';
  } else {
    groupA_SF_t1 = winners.groupA_QF1 || 'Winner Match 1';
    groupA_SF_t2 = winners.groupA_QF2 || 'Winner Match 2';
  }

  // Determine Semi-Final B competitors dynamically based on team count
  let groupB_SF_t1 = 'Winner Match 3';
  let groupB_SF_t2 = 'Winner Match 4';

  if (groupBTeams.length <= 2) {
    groupB_SF_t1 = groupBTeams[0]?.name || 'TBD';
    groupB_SF_t2 = groupBTeams[1]?.name || 'TBD';
  } else if (groupBTeams.length === 3) {
    groupB_SF_t1 = winners.groupB_QF1 || 'Winner Match 3';
    groupB_SF_t2 = groupB_SF_direct_t2 || 'BYE';
  } else {
    groupB_SF_t1 = winners.groupB_QF1 || 'Winner Match 3';
    groupB_SF_t2 = winners.groupB_QF2 || 'Winner Match 4';
  }

  // Final Competitors derived dynamically from Semi-Final Winners
  const final_t1 = winners.groupA_SF || 'Group A Champion';
  const final_t2 = winners.groupB_SF || 'Group B Champion';

  // Calculate Podium Results (Champion, RunnerUp, SemiFinalists)
  const getPodiumResults = () => {
    const champion = stripByeTag(winners.champion);
    
    // Runner-Up is the opponent in Final Match
    const t1 = stripByeTag(final_t1);
    const t2 = stripByeTag(final_t2);
    let runnerUp = 'TBD';
    if (champion === t1 && !isPlaceholder(t2)) runnerUp = t2;
    else if (champion === t2 && !isPlaceholder(t1)) runnerUp = t1;

    // Semi-Finalists (Losers of SF A and SF B)
    const sfA_t1 = stripByeTag(groupA_SF_t1);
    const sfA_t2 = stripByeTag(groupA_SF_t2);
    const sfA_winner = winners.groupA_SF;
    let sfA_loser = '';
    if (sfA_winner === sfA_t1 && !isPlaceholder(sfA_t2)) sfA_loser = sfA_t2;
    else if (sfA_winner === sfA_t2 && !isPlaceholder(sfA_t1)) sfA_loser = sfA_t1;

    const sfB_t1 = stripByeTag(groupB_SF_t1);
    const sfB_t2 = stripByeTag(groupB_SF_t2);
    const sfB_winner = winners.groupB_SF;
    let sfB_loser = '';
    if (sfB_winner === sfB_t1 && !isPlaceholder(sfB_t2)) sfB_loser = sfB_t2;
    else if (sfB_winner === sfB_t2 && !isPlaceholder(sfB_t1)) sfB_loser = sfB_t1;

    const semiFinalists = [sfA_loser, sfB_loser].filter(Boolean);

    return { champion, runnerUp, semiFinalists };
  };

  const podium = getPodiumResults();

  // Open Score Modal (Always allows editing existing scores)
  const openScoreModal = (matchKey, stageTitle, team1Raw, team2Raw) => {
    if (readOnly) return;
    if (!team1Raw || !team2Raw) return;
    
    const team1 = stripByeTag(team1Raw);
    const team2 = stripByeTag(team2Raw);

    if (isPlaceholder(team1) || isPlaceholder(team2)) return;
    
    const existingScore = scores[matchKey] || {};
    setActiveModalMatch({
      key: matchKey,
      title: stageTitle,
      team1: team1,
      team2: team2,
      rawTeam1: team1Raw,
      rawTeam2: team2Raw
    });

    setModalTeam1Score(existingScore.team1Score !== undefined && existingScore.team1Score !== null ? String(existingScore.team1Score) : '');
    setModalTeam2Score(existingScore.team2Score !== undefined && existingScore.team2Score !== null ? String(existingScore.team2Score) : '');
  };

  // Calculate filtered winner based on entered scores
  const getFilteredWinner = (t1, s1, t2, s2) => {
    if (s1 === '' || s2 === '') return '';
    const num1 = parseInt(s1, 10);
    const num2 = parseInt(s2, 10);

    if (isNaN(num1) || isNaN(num2)) return '';
    if (num1 > num2) return t1;
    if (num2 > num1) return t2;
    return 'TIE';
  };

  // Cascading update helper when a stage winner changes
  const cascadeUpdateWinners = (key, newWinner, currentWinners) => {
    const oldWinner = currentWinners[key];
    const nextWinners = { ...currentWinners, [key]: newWinner };

    if (oldWinner && oldWinner !== newWinner) {
      if (key.startsWith('groupA_QF')) {
        if (nextWinners.groupA_SF === oldWinner) {
          nextWinners.groupA_SF = '';
        }
      } else if (key.startsWith('groupB_QF')) {
        if (nextWinners.groupB_SF === oldWinner) {
          nextWinners.groupB_SF = '';
        }
      }
      
      if (nextWinners.champion === oldWinner) {
        nextWinners.champion = '';
      }
    }

    return nextWinners;
  };

  // Save Modal Scores and Filter Winner
  const handleSaveModalScore = () => {
    if (!activeModalMatch) return;

    const { key, team1, team2 } = activeModalMatch;
    const s1 = modalTeam1Score !== '' ? parseInt(modalTeam1Score, 10) : 0;
    const s2 = modalTeam2Score !== '' ? parseInt(modalTeam2Score, 10) : 0;

    const filteredWinner = getFilteredWinner(team1, modalTeam1Score, team2, modalTeam2Score);
    const selectedWinner = filteredWinner === 'TIE' ? team1 : (filteredWinner || team1);

    const matchScoreData = {
      team1Score: s1,
      team2Score: s2,
      scoreText: `${s1} - ${s2}`,
      winner: selectedWinner
    };

    const updatedScores = {
      ...scores,
      [key]: matchScoreData
    };

    const updatedWinners = cascadeUpdateWinners(key, selectedWinner, winners);

    setScores(updatedScores);
    setWinners(updatedWinners);

    if (onWinnersUpdate) {
      onWinnersUpdate(updatedWinners, updatedScores);
    }

    setActiveModalMatch(null);
  };

  return (
    <div className="w-full font-['Poppins'] select-none">
      
      {/* GREEN & WHITE INTERACTIVE KNOCKOUT BRACKET VISUAL CONTAINER */}
      <div className="w-full bg-white text-gray-900 p-6 md:p-8 rounded-3xl border border-[#e5e5e5] shadow-sm overflow-x-auto">
        
        {/* Tournament Green Title Banner & Hint */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-3 bg-[#08733e] px-10 py-3.5 rounded-2xl shadow-md border border-emerald-600">
            <Trophy size={24} className="text-amber-300 shrink-0" />
            <h2 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase">
              {tournamentTitle || 'TOURNAMENT MATCH DRAW'}
            </h2>
          </div>
          <p className="text-xs font-semibold text-gray-500">
            💡 Dynamic {realTeams.length || 6}-Team Knockout Draw. Click any match card to enter scores and advance winners!
          </p>
        </div>

        {/* Main Interactive Green & White Bracket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center min-w-[950px]">
          
          {/* GROUP A BRACKET (LEFT) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="text-center border-b border-gray-200 pb-2">
              <h3 className="text-xs font-extrabold text-[#08733e] uppercase tracking-widest">Group A Bracket</h3>
            </div>

            <div className="flex gap-4 items-center">
              {/* Quarter-Finals (Only render real matches) */}
              {groupAQF.length > 0 ? (
                <div className="flex-1 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center block">Quarter-Finals</span>
                  
                  {groupAQF.map((pair, idx) => (
                    <div 
                      key={idx}
                      onClick={() => openScoreModal(pair.id, `Group A Quarter-Final ${idx+1}`, pair.t1, pair.t2)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-1.5 shadow-2xs hover:border-[#08733e] hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-400 uppercase pb-0.5">
                        <span>Match QF {idx+1}</span>
                        {!readOnly && (
                          <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                            {scores[pair.id] ? 'Edit Score' : 'Enter Score'} <Edit3 size={10} />
                          </span>
                        )}
                      </div>

                      <div className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs border ${
                        winners[pair.id] === pair.t1 
                          ? 'bg-emerald-50 text-[#08733e] border-[#08733e]' 
                          : 'bg-white text-gray-800 border-gray-200/80'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            winners[pair.id] === pair.t1 ? 'bg-[#08733e]' : 'bg-slate-700'
                          }`}>
                            {pair.t1[0]}
                          </div>
                          <span className="truncate">{pair.t1}</span>
                        </div>
                        {winners[pair.id] === pair.t1 && <CheckCircle2 size={14} className="text-[#08733e] shrink-0" />}
                      </div>

                      <div className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs border ${
                        winners[pair.id] === pair.t2 
                          ? 'bg-emerald-50 text-[#08733e] border-[#08733e]' 
                          : 'bg-white text-gray-800 border-gray-200/80'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            winners[pair.id] === pair.t2 ? 'bg-[#08733e]' : 'bg-slate-700'
                          }`}>
                            {pair.t2[0]}
                          </div>
                          <span className="truncate">{pair.t2}</span>
                        </div>
                        {winners[pair.id] === pair.t2 && <CheckCircle2 size={14} className="text-[#08733e] shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 text-center text-xs text-gray-400 font-medium">
                  Direct to Semi-Finals
                </div>
              )}

              {/* Group A Semi-Finals (Advancing Winners & BYEs) */}
              <div className="flex-1 flex flex-col gap-6 justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center block">Semi-Finals</span>
                <div 
                  onClick={() => openScoreModal('groupA_SF', 'Group A Semi-Final', groupA_SF_t1, groupA_SF_t2)}
                  className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-2.5 space-y-1.5 shadow-xs hover:border-[#08733e] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-[#08733e] uppercase pb-0.5">
                    <span>Semi Final A</span>
                    {!readOnly && (
                      <span className="text-[#08733e] font-bold group-hover:underline flex items-center gap-1">
                        {scores.groupA_SF ? 'Edit Score' : 'Enter Score'} <Edit3 size={10} />
                      </span>
                    )}
                  </div>

                  <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between shadow-2xs border ${
                    winners.groupA_SF === stripByeTag(groupA_SF_t1) && !isPlaceholder(groupA_SF_t1)
                      ? 'bg-[#08733e] text-white border-[#08733e]' 
                      : 'bg-white text-[#08733e] border-emerald-200'
                  }`}>
                    <span className="truncate">{groupA_SF_t1}</span>
                    {winners.groupA_SF === stripByeTag(groupA_SF_t1) && !isPlaceholder(groupA_SF_t1) && <CheckCircle2 size={14} className="text-white shrink-0" />}
                  </div>

                  <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between shadow-2xs border ${
                    winners.groupA_SF === stripByeTag(groupA_SF_t2) && !isPlaceholder(groupA_SF_t2)
                      ? 'bg-[#08733e] text-white border-[#08733e]' 
                      : 'bg-white text-[#08733e] border-emerald-200'
                  }`}>
                    <span className="truncate">{groupA_SF_t2}</span>
                    {winners.groupA_SF === stripByeTag(groupA_SF_t2) && !isPlaceholder(groupA_SF_t2) && <CheckCircle2 size={14} className="text-white shrink-0" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: FINALS & WINNER TROPHY */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center text-center my-4 lg:my-0 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-emerald-400/30 rounded-full blur-md opacity-75"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#08733e] to-[#065b31] p-1 flex items-center justify-center shadow-lg border-2 border-emerald-100">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-[#08733e]">
                  <Trophy size={28} className="text-amber-500" />
                </div>
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <h4 className="text-xs font-black text-[#08733e] tracking-wider uppercase">CHAMPION</h4>
              <div className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 rounded-xl text-xs font-black text-slate-900 shadow-md">
                {winners.champion || 'TBD'}
              </div>
            </div>

            {/* Final Match Green & White Card */}
            <div 
              onClick={() => openScoreModal('champion', 'Championship Final Match', final_t1, final_t2)}
              className="w-full mt-2 bg-gradient-to-b from-white to-emerald-50/50 border-2 border-[#08733e] rounded-2xl p-3.5 space-y-2 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] font-black text-[#08733e] uppercase">
                <span>FINAL MATCH</span>
                {!readOnly && (
                  <span className="text-[#08733e] font-bold group-hover:underline flex items-center gap-1">
                    {scores.champion ? 'Edit Score' : 'Enter Score'} <Edit3 size={10} />
                  </span>
                )}
              </div>
              
              <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold text-center transition-all border shadow-2xs flex items-center justify-between ${
                winners.champion === stripByeTag(final_t1) && !isPlaceholder(final_t1)
                  ? 'bg-[#08733e] text-white border-[#08733e]'
                  : 'bg-white text-gray-900 border-emerald-200'
              }`}>
                <span className="truncate">{final_t1}</span>
                {winners.champion === stripByeTag(final_t1) && !isPlaceholder(final_t1) && <CheckCircle2 size={14} className="text-white shrink-0" />}
              </div>

              <div className="text-[10px] font-extrabold text-[#08733e] text-center uppercase tracking-widest">VS</div>

              <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold text-center transition-all border shadow-2xs flex items-center justify-between ${
                winners.champion === stripByeTag(final_t2) && !isPlaceholder(final_t2)
                  ? 'bg-[#08733e] text-white border-[#08733e]'
                  : 'bg-white text-gray-900 border-emerald-200'
              }`}>
                <span className="truncate">{final_t2}</span>
                {winners.champion === stripByeTag(final_t2) && !isPlaceholder(final_t2) && <CheckCircle2 size={14} className="text-white shrink-0" />}
              </div>
            </div>
          </div>

          {/* GROUP B BRACKET (RIGHT) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="text-center border-b border-gray-200 pb-2">
              <h3 className="text-xs font-extrabold text-[#08733e] uppercase tracking-widest">Group B Bracket</h3>
            </div>

            <div className="flex gap-4 items-center">
              {/* Group B Semi-Finals (Advancing Winners & BYEs) */}
              <div className="flex-1 flex flex-col gap-6 justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center block">Semi-Finals</span>
                <div 
                  onClick={() => openScoreModal('groupB_SF', 'Group B Semi-Final', groupB_SF_t1, groupB_SF_t2)}
                  className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-2.5 space-y-1.5 shadow-xs hover:border-[#08733e] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-[#08733e] uppercase pb-0.5">
                    <span>Semi Final B</span>
                    {!readOnly && (
                      <span className="text-[#08733e] font-bold group-hover:underline flex items-center gap-1">
                        {scores.groupB_SF ? 'Edit Score' : 'Enter Score'} <Edit3 size={10} />
                      </span>
                    )}
                  </div>

                  <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between shadow-2xs border ${
                    winners.groupB_SF === stripByeTag(groupB_SF_t1) && !isPlaceholder(groupB_SF_t1)
                      ? 'bg-[#08733e] text-white border-[#08733e]' 
                      : 'bg-white text-[#08733e] border-emerald-200'
                  }`}>
                    <span className="truncate">{groupB_SF_t1}</span>
                    {winners.groupB_SF === stripByeTag(groupB_SF_t1) && !isPlaceholder(groupB_SF_t1) && <CheckCircle2 size={14} className="text-white shrink-0" />}
                  </div>

                  <div className={`px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between shadow-2xs border ${
                    winners.groupB_SF === stripByeTag(groupB_SF_t2) && !isPlaceholder(groupB_SF_t2)
                      ? 'bg-[#08733e] text-white border-[#08733e]' 
                      : 'bg-white text-[#08733e] border-emerald-200'
                  }`}>
                    <span className="truncate">{groupB_SF_t2}</span>
                    {winners.groupB_SF === stripByeTag(groupB_SF_t2) && !isPlaceholder(groupB_SF_t2) && <CheckCircle2 size={14} className="text-white shrink-0" />}
                  </div>
                </div>
              </div>

              {/* Quarter-Finals (Only render real matches) */}
              {groupBQF.length > 0 ? (
                <div className="flex-1 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center block">Quarter-Finals</span>
                  
                  {groupBQF.map((pair, idx) => (
                    <div 
                      key={idx}
                      onClick={() => openScoreModal(pair.id, `Group B Quarter-Final ${idx+1}`, pair.t1, pair.t2)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-1.5 shadow-2xs hover:border-[#08733e] hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-400 uppercase pb-0.5">
                        <span>Match QF {idx+3}</span>
                        {!readOnly && (
                          <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                            {scores[pair.id] ? 'Edit Score' : 'Enter Score'} <Edit3 size={10} />
                          </span>
                        )}
                      </div>

                      <div className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs border ${
                        winners[pair.id] === pair.t1 
                          ? 'bg-emerald-50 text-[#08733e] border-[#08733e]' 
                          : 'bg-white text-gray-800 border-gray-200/80'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            winners[pair.id] === pair.t1 ? 'bg-[#08733e]' : 'bg-slate-700'
                          }`}>
                            {pair.t1[0]}
                          </div>
                          <span className="truncate">{pair.t1}</span>
                        </div>
                        {winners[pair.id] === pair.t1 && <CheckCircle2 size={14} className="text-[#08733e] shrink-0" />}
                      </div>

                      <div className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs border ${
                        winners[pair.id] === pair.t2 
                          ? 'bg-emerald-50 text-[#08733e] border-[#08733e]' 
                          : 'bg-white text-gray-800 border-gray-200/80'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            winners[pair.id] === pair.t2 ? 'bg-[#08733e]' : 'bg-slate-700'
                          }`}>
                            {pair.t2[0]}
                          </div>
                          <span className="truncate">{pair.t2}</span>
                        </div>
                        {winners[pair.id] === pair.t2 && <CheckCircle2 size={14} className="text-[#08733e] shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 text-center text-xs text-gray-400 font-medium">
                  Direct to Semi-Finals
                </div>
              )}
            </div>
          </div>

        </div>

        {/* CATEGORIZED MATCH RESULTS & SCORES BREAKDOWN AT THE BOTTOM */}
        {Object.keys(scores).length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-sm font-black text-[#08733e] uppercase tracking-wider flex items-center gap-2">
                <Swords size={18} /> Official Match Results & Scores Summary
              </h4>
              <span className="text-[10px] font-extrabold text-[#08733e] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Categorized By Round
              </span>
            </div>

            <div className="space-y-6">
              
              {/* 1. QUARTER FINALS */}
              {Object.keys(scores).some(k => k.includes('QF')) && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    🎯 Quarter Finals
                  </h5>
                  <div className="space-y-2">
                    {groupAQF.map(pair => scores[pair.id] && (
                      <div key={pair.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm font-black">•</span>
                          <span className="text-[#08733e] font-black">{pair.t1}</span>
                          <span className="text-gray-400 text-[10px] font-black uppercase px-1">VS</span>
                          <span className="text-[#08733e] font-black">{pair.t2}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-xl text-xs font-black text-gray-800 shadow-2xs">
                            Scores: {scores[pair.id].team1Score} - {scores[pair.id].team2Score}
                          </span>
                          <span className="bg-emerald-100 text-[#08733e] border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1">
                            Winner: {scores[pair.id].winner}
                          </span>
                        </div>
                      </div>
                    ))}
                    {groupBQF.map(pair => scores[pair.id] && (
                      <div key={pair.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm font-black">•</span>
                          <span className="text-[#08733e] font-black">{pair.t1}</span>
                          <span className="text-gray-400 text-[10px] font-black uppercase px-1">VS</span>
                          <span className="text-[#08733e] font-black">{pair.t2}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-xl text-xs font-black text-gray-800 shadow-2xs">
                            Scores: {scores[pair.id].team1Score} - {scores[pair.id].team2Score}
                          </span>
                          <span className="bg-emerald-100 text-[#08733e] border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1">
                            Winner: {scores[pair.id].winner}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SEMI FINALS */}
              {(scores.groupA_SF || scores.groupB_SF) && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    ⚔️ Semi Finals
                  </h5>
                  <div className="space-y-2">
                    {scores.groupA_SF && (
                      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm font-black">•</span>
                          <span className="text-[#08733e] font-black">{groupA_SF_t1}</span>
                          <span className="text-gray-400 text-[10px] font-black uppercase px-1">VS</span>
                          <span className="text-[#08733e] font-black">{groupA_SF_t2}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-xl text-xs font-black text-gray-800 shadow-2xs">
                            Scores: {scores.groupA_SF.team1Score} - {scores.groupA_SF.team2Score}
                          </span>
                          <span className="bg-emerald-100 text-[#08733e] border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1">
                            Winner: {scores.groupA_SF.winner}
                          </span>
                        </div>
                      </div>
                    )}
                    {scores.groupB_SF && (
                      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm font-black">•</span>
                          <span className="text-[#08733e] font-black">{groupB_SF_t1}</span>
                          <span className="text-gray-400 text-[10px] font-black uppercase px-1">VS</span>
                          <span className="text-[#08733e] font-black">{groupB_SF_t2}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-xl text-xs font-black text-gray-800 shadow-2xs">
                            Scores: {scores.groupB_SF.team1Score} - {scores.groupB_SF.team2Score}
                          </span>
                          <span className="bg-emerald-100 text-[#08733e] border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1">
                            Winner: {scores.groupB_SF.winner}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. FINALS */}
              {scores.champion && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                    🏆 Championship Finals
                  </h5>
                  <div className="bg-gradient-to-r from-emerald-50 to-amber-50/60 border border-emerald-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-black text-gray-900 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-base font-black">•</span>
                      <span className="text-[#08733e] font-black text-sm">{final_t1}</span>
                      <span className="text-gray-400 text-xs font-black uppercase px-1">VS</span>
                      <span className="text-[#08733e] font-black text-sm">{final_t2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-[#08733e] text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-xs">
                        Scores: {scores.champion.team1Score} - {scores.champion.team2Score}
                      </span>
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                        🏆 Winner: {scores.champion.winner}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Bottom Action Footer for Completing Tournament */}
        {winners.champion && winners.champion !== 'TBD' && !isPlaceholder(winners.champion) && onCompleteTournament && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#08733e]/10 text-[#08733e] flex items-center justify-center font-bold shrink-0">
                <Trophy size={20} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">Champion Crowned: {stripByeTag(winners.champion)} 🎉</h4>
                <p className="text-xs text-gray-500 font-medium">Click below to review tournament results and mark as completed.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCompletionModal(true)}
              disabled={isTournamentCompleted}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                isTournamentCompleted 
                  ? 'bg-emerald-100 text-[#08733e] border border-emerald-300 cursor-default'
                  : 'bg-[#08733e] hover:bg-[#065b31] text-white active:scale-95'
              }`}
            >
              <CheckCircle2 size={16} />
              {isTournamentCompleted ? 'Tournament Completed' : 'Complete Tournament'}
            </button>
          </div>
        )}
      </div>

      {/* SCORE ENTRY POP-UP MODAL CARD */}
      {activeModalMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#08733e]/10 text-[#08733e] flex items-center justify-center font-bold">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{activeModalMatch.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">Enter or update match scores to filter winner</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModalMatch(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Score Inputs Form */}
            <div className="space-y-4">
              {/* Team 1 Score Input */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#08733e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {activeModalMatch.team1[0]}
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 truncate">
                    {activeModalMatch.team1}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-[11px] font-bold text-gray-500">Score:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={modalTeam1Score}
                    onChange={(e) => setModalTeam1Score(e.target.value)}
                    className="w-20 h-10 bg-white border border-gray-300 rounded-xl text-center text-sm font-black text-gray-900 focus:outline-none focus:border-[#08733e] focus:ring-2 focus:ring-[#08733e]/20"
                  />
                </div>
              </div>

              <div className="text-center text-xs font-black text-gray-400 uppercase tracking-widest">VS</div>

              {/* Team 2 Score Input */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {activeModalMatch.team2[0]}
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 truncate">
                    {activeModalMatch.team2}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-[11px] font-bold text-gray-500">Score:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={modalTeam2Score}
                    onChange={(e) => setModalTeam2Score(e.target.value)}
                    className="w-20 h-10 bg-white border border-gray-300 rounded-xl text-center text-sm font-black text-gray-900 focus:outline-none focus:border-[#08733e] focus:ring-2 focus:ring-[#08733e]/20"
                  />
                </div>
              </div>

              {/* Real-time Filtered Winner Preview Banner */}
              {(() => {
                const previewWinner = getFilteredWinner(
                  activeModalMatch.team1, 
                  modalTeam1Score, 
                  activeModalMatch.team2, 
                  modalTeam2Score
                );
                
                if (!previewWinner) return null;

                return (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-[#08733e] font-bold">
                    <div className="flex items-center gap-2">
                      <Award size={16} />
                      <span>Filtered Winner:</span>
                    </div>
                    <span className="bg-[#08733e] text-white px-3 py-1 rounded-full font-extrabold">
                      {previewWinner === 'TIE' ? `${activeModalMatch.team1} (Tie)` : previewWinner}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalMatch(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalScore}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <Save size={14} />
                Save Score & Advance Winner
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOURNAMENT COMPLETION & PODIUM SUMMARY POP-UP MODAL CARD */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Tournament Completion</h3>
                  <p className="text-xs text-gray-500 font-medium">Official Tournament Winners & Podium Summary</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCompletionModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Podium Cards Grid */}
            <div className="space-y-3">
              {/* Champion Card */}
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-4 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl font-black">
                    🥇
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-900/80">Champion (1st Place)</span>
                    <p className="text-base font-black text-slate-950">{podium.champion}</p>
                  </div>
                </div>
                <Trophy size={24} className="text-slate-900" />
              </div>

              {/* Runner-Up Card */}
              <div className="bg-slate-100 border border-slate-300 text-slate-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-black">
                    🥈
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Runner-Up (2nd Place)</span>
                    <p className="text-base font-extrabold text-gray-900">{podium.runnerUp}</p>
                  </div>
                </div>
                <Award size={22} className="text-slate-500" />
              </div>

              {/* 3rd Place / Semi-Finalists */}
              {podium.semiFinalists.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 text-[#08733e] p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#08733e]/80">Semi-Finalists (3rd Place)</span>
                  <p className="text-xs font-bold text-[#08733e]">
                    • {podium.semiFinalists.join('  •  ')}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  if (onCompleteTournament) onCompleteTournament(podium);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Confirm & Complete Tournament
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
