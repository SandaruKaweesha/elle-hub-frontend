import React, { useState, useEffect } from 'react';
import { QrCode, Download, CheckCircle2, Trophy, User, Award, FileText, Loader2, Zap } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api, { certificateAPI, tournamentResultsAPI } from '../../services/api';

export default function CertificateQR() {
  const [tournaments, setTournaments] = useState([]);
  const [tournament, setTournament] = useState(''); // tournament title for UI and legacy QR data
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  
  const [certType, setCertType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [qrHistory, setQrHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedId, setGeneratedId] = useState('');

  // Auto-fill and participating teams state
  const [tournamentAwards, setTournamentAwards] = useState([]);
  const [participatingTeams, setParticipatingTeams] = useState([]);
  const [sponsorName, setSponsorName] = useState('Dialog');
  const [tournamentDate, setTournamentDate] = useState('');
  const [tournamentWinners, setTournamentWinners] = useState({ champion: '', runnerUp: '' });

  const isFormComplete = tournament && certType && recipient;

  useEffect(() => {
    fetchHistory();
    fetchTournaments();
  }, []);

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

  const fetchHistory = async () => {
    try {
      const response = await certificateAPI.getHistory();
      if (response.data.success) {
        setQrHistory(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch certificate history", error);
    }
  };

  // Fetch awards, participating teams, and draw results (champion & runner-up) when a tournament is selected
  useEffect(() => {
    if (selectedTournamentId) {
      const fetchTournamentDetails = async () => {
        try {
          const [awardsRes, teamsRes, drawRes] = await Promise.all([
            tournamentResultsAPI.getResults(selectedTournamentId).catch(() => null),
            api.get(`/tournament/${selectedTournamentId}/team-requests`).catch(() => null),
            api.get(`/tournament/${selectedTournamentId}/draw`).catch(() => null)
          ]);

          if (awardsRes && awardsRes.data && awardsRes.data.success !== false) {
            setTournamentAwards(awardsRes.data.data || []);
          } else {
            setTournamentAwards([]);
          }

          let approvedTeams = [];
          if (teamsRes && teamsRes.data && teamsRes.data.success !== false) {
            const list = teamsRes.data.data || [];
            approvedTeams = list.filter(t => {
              const st = (t.status || '').toUpperCase();
              return st === 'APPROVED' || st === 'ACCEPTED';
            });
            setParticipatingTeams(approvedTeams);
          } else {
            setParticipatingTeams([]);
          }

          let champ = '';
          let runner = '';

          if (drawRes && drawRes.data && drawRes.data.data) {
            const drawData = drawRes.data.data.drawData || {};
            const bw = drawData.bracketWinners || {};
            const ms = drawData.matchScores || {};

            champ = bw.champion || drawData.winner || (ms.champion && ms.champion.winner) || '';
            runner = bw.runnerUp || '';

            if (!runner && ms.champion) {
              const sfA = bw.groupA_SF;
              const sfB = bw.groupB_SF;
              const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const normChamp = norm(champ);

              if (sfA && norm(sfA) !== normChamp) runner = sfA;
              else if (sfB && norm(sfB) !== normChamp) runner = sfB;
            }
          }

          setTournamentWinners({ champion: champ, runnerUp: runner });

          // Auto-select team based on existing certType if set
          if (certType) {
            const typeUpper = certType.toUpperCase();
            if ((typeUpper.includes('WINNER') || typeUpper.includes('CHAMPION')) && champ) {
              setRecipient(champ);
            } else if (typeUpper.includes('RUNNER') && runner) {
              setRecipient(runner);
            }
          }
        } catch (err) {
          console.error("Failed to fetch tournament details", err);
          setTournamentAwards([]);
          setParticipatingTeams([]);
          setTournamentWinners({ champion: '', runnerUp: '' });
        }
      };
      fetchTournamentDetails();
    } else {
      setTournamentAwards([]);
      setParticipatingTeams([]);
      setTournamentWinners({ champion: '', runnerUp: '' });
    }
  }, [selectedTournamentId]);

  const handleTournamentChange = (e) => {
    const title = e.target.value;
    const t = tournaments.find(x => x.title === title);
    setTournament(title);
    if (t) {
      setSelectedTournamentId(t.tournament_id || t.id);
    }
    setIsGenerated(false);
    // Reset selections
    setCertType('');
    setRecipient('');
  };

  const handleAutoFill = (e) => {
    const awardId = e.target.value;
    if (!awardId) return;
    
    const award = tournamentAwards.find(a => a.resultId.toString() === awardId);
    if (award) {
      // Map awardType to certType options
      const typeMapping = {
        'WINNER': 'Winner',
        'RUNNER_UP': 'Runner-up',
        'BEST_BATSMAN': 'Best Player',
        'BEST_BOWLER': 'Best Player',
        'MAN_OF_THE_MATCH': 'Best Player'
      };
      setCertType(typeMapping[award.awardType] || 'Participation');
      setRecipient(award.recipientName + (award.recipientTeam ? ` (${award.recipientTeam})` : ''));
      setIsGenerated(false);
    }
  };

  const handleGenerate = async () => {
    if (isFormComplete) {
      setLoading(true);
      try {
        const targetId = selectedTournamentId || (tournaments.find(x => x.title === tournament)?.tournament_id) || 1;
        const response = await api.post(`/tournament/${targetId}/certificates/generate`, {
          tournamentId: targetId,
          tournament,
          cert_type: certType,
          recipient
        });

        if (response.data && response.data.success) {
          setIsGenerated(true);
          const rawLink = response.data.data.verify_link || `/verify-certificate/${response.data.data.id}`;
          const verifyUrl = rawLink.startsWith('http') ? rawLink : `${window.location.origin}${rawLink}`;
          setGeneratedLink(verifyUrl);
          setGeneratedId(response.data.data.id || response.data.data.token);
          fetchHistory();
        }
      } catch (error) {
        console.error("Failed to generate certificate", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setTournament('');
    setSelectedTournamentId('');
    setCertType('');
    setRecipient('');
    setIsGenerated(false);
    setGeneratedLink('');
    setGeneratedId('');
    setTournamentAwards([]);
  };

  const handleDownload = () => {
    const canvas = document.getElementById('certificate-qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `certificate_qr_${recipient.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const downloadHistoryQr = (item) => {
    const canvas = document.getElementById(`qr-canvas-${item.id}`);
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `certificate_qr_${item.recipient.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

    const isTeamLocked = (certType || '').toUpperCase().includes('WINNER') || 
                       (certType || '').toUpperCase().includes('CHAMPION') || 
                       (certType || '').toUpperCase().includes('RUNNER');

  return (
    <div className="h-full flex flex-col gap-6 font-['Poppins']">
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 shadow-sm flex flex-col animate-in fade-in duration-300 relative overflow-hidden shrink-0">
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f8f7f4] rounded-bl-full -z-0 opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00382D] text-white flex items-center justify-center shadow-sm">
                <QrCode size={20} />
              </div>
              Secure Certificate QR Generator
            </h2>
            <p className="text-[#666666]">Generate verifiable QR codes that link directly to our secure database.</p>
          </div>
          {isGenerated && (
            <button onClick={handleReset} className="text-sm font-bold text-[#00382D] hover:underline px-4 py-2 bg-[#f8f7f4] rounded-xl border border-[#e5e5e5]">
              Create Another
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Input Section */}
          <div className="flex-1 w-full space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2">Select Tournament</label>
              <div className="relative">
                <Trophy size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                <select 
                  value={selectedTournamentId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTournamentId(tId);
                    const found = tournaments.find(t => String(t.tournament_id || t.id) === String(tId));
                    setTournament(found ? found.title : '');
                    setCertType('');
                    setRecipient('');
                    setIsGenerated(false);
                  }}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium cursor-pointer"
                >
                  <option value="">Choose a tournament...</option>
                  {tournaments.map(t => (
                    <option key={t.tournament_id || t.id} value={t.tournament_id || t.id}>
                      🏆 {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-[#111111] mb-2">Certificate Type</label>
                <div className="relative">
                  <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <select 
                    value={certType}
                    onChange={(e) => { 
                      const newType = e.target.value;
                      setCertType(newType); 
                      setIsGenerated(false); 
                      
                      const typeUpper = (newType || '').toUpperCase();
                      if ((typeUpper.includes('WINNER') || typeUpper.includes('CHAMPION')) && tournamentWinners.champion) {
                        setRecipient(tournamentWinners.champion);
                      } else if (typeUpper.includes('RUNNER') && tournamentWinners.runnerUp) {
                        setRecipient(tournamentWinners.runnerUp);
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="" disabled>Choose type...</option>
                    <option value="Winner">Winner (Champion)</option>
                    <option value="Runner-up">Runner-up</option>
                    <option value="Participation">Participation</option>
                    <option value="Best Player">Best Player</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[#111111]">Select the Team</label>
                  {isTeamLocked ? (
                    <span className="text-[10px] font-black text-[#00382D] bg-[#e8f8f0] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                      🔒 Auto-Locked to Official Result
                    </span>
                  ) : participatingTeams.length > 0 ? (
                    <span className="text-[10px] font-black text-[#00382D] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full shadow-2xs">
                      {participatingTeams.length} Participating Teams
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {participatingTeams.length > 0 ? (
                    <>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00382D]" />
                        <select 
                          disabled={isTeamLocked}
                          value={participatingTeams.some(t => (t.team_name || t.teamName) === recipient) ? recipient : (recipient ? '__CUSTOM__' : '')}
                          onChange={(e) => { 
                            if (isTeamLocked) return;
                            const val = e.target.value;
                            if (val === '__CUSTOM__') {
                              setRecipient('');
                            } else {
                              setRecipient(val);
                            }
                            setIsGenerated(false); 
                          }}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-sm font-bold text-[#00382D] focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all cursor-pointer shadow-2xs disabled:opacity-85 disabled:bg-[#e8f8f0] disabled:cursor-not-allowed disabled:border-[#bbf7d0]"
                        >
                          <option value="">-- Select Participating Team --</option>
                          {participatingTeams.map((t, idx) => {
                            const tName = t.team_name || t.teamName;
                            return (
                              <option key={t.team_user_id || t.teamUserId || idx} value={tName}>
                                {tName}
                              </option>
                            );
                          })}
                          <option value="__CUSTOM__">Type custom player / person name...</option>
                        </select>
                      </div>

                      {(!participatingTeams.some(t => (t.team_name || t.teamName) === recipient) || recipient === '__CUSTOM__') && (
                        <div className="relative animate-in fade-in duration-200">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                          <input 
                            type="text" 
                            placeholder="Type custom player or person name (e.g. Kamal Perera)..." 
                            value={recipient === '__CUSTOM__' ? '' : recipient}
                            onChange={(e) => { setRecipient(e.target.value); setIsGenerated(false); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                      <input 
                        type="text" 
                        placeholder={selectedTournamentId ? "Type team or player name..." : "Select tournament first..."} 
                        value={recipient}
                        onChange={(e) => { setRecipient(e.target.value); setIsGenerated(false); }}
                        className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Details Preview Card */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${isFormComplete ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#f8f7f4] border-[#e5e5e5]'}`}>
              <h4 className="text-sm font-bold flex items-center justify-between gap-2 mb-3">
                <span className="flex items-center gap-2">
                  <FileText size={16} className={isFormComplete ? 'text-[#166534]' : 'text-[#888888]'} /> 
                  <span className={isFormComplete ? 'text-[#166534]' : 'text-[#666666]'}>System Encoded Data</span>
                </span>
                <span className="text-[10px] font-extrabold text-[#08733e] bg-white border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                  🛡️ Live Encoded Payload
                </span>
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Tournament</span>
                  <span className="font-bold text-[#166534] text-right">{tournament || 'Not selected'}</span>
                </div>
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Recipient / Winner</span>
                  <span className="font-bold text-[#166534] truncate max-w-[170px] text-right">{recipient || 'Not selected'}</span>
                </div>
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Award Type</span>
                  <span className="font-bold text-[#166534] text-right">{certType || 'Not selected'}</span>
                </div>
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Tournament Date</span>
                  <span className="font-bold text-[#166534] text-right">{tournamentDate || '2026-09-05'}</span>
                </div>
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Official Sponsor</span>
                  <span className="font-bold text-[#166534] text-right flex items-center gap-1">
                    🏆 {sponsorName || 'Dialog'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                  <span className="text-[#166534]/70 font-semibold">Verification Token</span>
                  <span className="font-bold text-[#166534] font-mono text-xs text-right">
                    {isGenerated ? generatedId : 'Will be generated'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#166534]/70 font-semibold">Verify Link</span>
                  <span className="font-bold text-[#166534] text-[11px] sm:text-xs truncate max-w-[200px] text-right">
                    {isGenerated ? generatedLink : 'Will be generated'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!isFormComplete || isGenerated || loading}
              className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isFormComplete && !isGenerated && !loading ? 'bg-[#00382D] text-white hover:bg-[#002a22] hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />} 
              {isGenerated ? 'QR Code Generated' : loading ? 'Saving to Database...' : 'Generate Secure QR Code'}
            </button>
          </div>

          {/* Preview Section */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
            <div className={`w-full aspect-square bg-[#f8f7f4] border-2 border-dashed ${isGenerated ? 'border-transparent' : 'border-[#d6d8d4]'} rounded-2xl flex flex-col items-center justify-center p-8 relative transition-all`}>
              {isGenerated ? (
                <div className="animate-in zoom-in duration-300 flex flex-col items-center w-full h-full justify-center relative">
                  {/* Real QR Code UI */}
                  <div className="w-56 h-56 bg-white p-4 rounded-xl shadow-lg border border-[#e5e5e5] flex items-center justify-center relative">
                     <a 
                       href={generatedLink} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       title="Click to open Public Verification Site in new tab"
                       className="cursor-pointer transition-transform hover:scale-105"
                     >
                       <QRCodeCanvas 
                          id="certificate-qr-code" 
                          value={generatedLink || `${window.location.origin}/verify-certificate/${generatedId}`} 
                          size={192} 
                          level="M" 
                          includeMargin={false}
                       />
                     </a>
                  </div>

                  <div className="absolute -top-3 -right-3 text-[#166534] bg-[#f0fdf4] p-1.5 rounded-full shadow-md animate-in zoom-in delay-150 border border-[#bbf7d0]">
                    <CheckCircle2 size={24} />
                  </div>
                  
                  <div className="absolute bottom-2 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold text-[#111111] border border-[#e5e5e5] shadow-sm truncate max-w-[90%]">
                    {generatedId.substring(0, 8).toUpperCase()} • {certType.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="text-[#888888] flex flex-col items-center text-center">
                  <QrCode size={48} className="mb-4 opacity-30 text-[#00382D]" />
                  <p className="font-semibold text-[#333333]">Ready to Generate</p>
                  <p className="text-xs mt-1 px-4">Complete the form to save to DB & generate QR</p>
                </div>
              )}
            </div>
            
            {isGenerated && (
              <button 
                onClick={handleDownload}
                className="w-full mt-6 py-3 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl font-bold transition-all border border-[#e5e5e5] shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 fade-in hover:-translate-y-0.5"
              >
                <Download size={18} /> Download High-Res PNG
              </button>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* History Section */}
      {qrHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#111111]">Recent Generations (Saved in DB)</h3>
            <span className="text-xs font-bold text-[#666666] bg-gray-100 px-2.5 py-1 rounded-full">{qrHistory.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrHistory.map(item => (
              <div key={item.id} className="bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl p-4 flex gap-4 items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#00382D]/30 transition-colors">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-[#e5e5e5] shrink-0">
                  <QRCodeCanvas id={`qr-canvas-${item.id}`} value={`${window.location.origin}/verify/${item.id}`} size={54} level="H" includeMargin={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111111] truncate">{item.recipient}</p>
                  <p className="text-xs text-[#666666] truncate">{item.tournament} • {item.cert_type}</p>
                  <p className="text-[10px] text-[#08733e] font-semibold truncate mt-1 bg-[#4ade80]/20 px-1.5 py-0.5 rounded w-fit border border-[#4ade80]/30">{item.id.substring(0, 13)}...</p>
                </div>
                <button 
                  onClick={() => downloadHistoryQr(item)}
                  className="w-9 h-9 rounded-full bg-white border border-[#e5e5e5] text-[#333333] hover:text-[#00382D] hover:border-[#00382D] hover:bg-[#f0fdf4] flex items-center justify-center transition-all shrink-0 shadow-sm"
                  title="Download Again"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
