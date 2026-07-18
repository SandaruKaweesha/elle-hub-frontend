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

  // Auto-fill state
  const [tournamentAwards, setTournamentAwards] = useState([]);

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

  // Fetch awards when a tournament is selected
  useEffect(() => {
    if (selectedTournamentId) {
      const fetchAwards = async () => {
        try {
          const res = await tournamentResultsAPI.getResults(selectedTournamentId);
          if (res.data.success !== false) {
            setTournamentAwards(res.data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch tournament awards", err);
          setTournamentAwards([]);
        }
      };
      fetchAwards();
    } else {
      setTournamentAwards([]);
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
        const response = await certificateAPI.generate({
          tournament,
          cert_type: certType,
          recipient
        });

        if (response.data.success) {
          setIsGenerated(true);
          const verifyUrl = `${window.location.origin}${response.data.data.verify_link}`;
          setGeneratedLink(verifyUrl);
          setGeneratedId(response.data.data.id);
          // Refresh history
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">Select Tournament</label>
                <div className="relative">
                  <Trophy size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <select 
                    value={tournament}
                    onChange={handleTournamentChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a tournament...</option>
                    {tournaments.map(t => (
                      <option key={t.tournament_id || t.id} value={t.title}>{t.title}</option>
                    ))}
                    {/* Fallbacks if DB is empty for demo */}
                    {tournaments.length === 0 && (
                      <option value="National Elle Championship 2026">National Elle Championship 2026</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">Auto-fill from Results</label>
                <div className="relative">
                  <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f59e0b]" />
                  <select 
                    onChange={handleAutoFill}
                    disabled={tournamentAwards.length === 0}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#fffbeb] border border-[#fde68a] text-[#92400e] rounded-xl text-sm focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:bg-[#f8f7f4] disabled:border-[#e5e5e5] disabled:text-[#888888]"
                  >
                    <option value="">{tournamentAwards.length > 0 ? 'Select Award Winner...' : 'No awards saved yet'}</option>
                    {tournamentAwards.map(award => (
                      <option key={award.resultId} value={award.resultId}>
                        {award.awardType.replace(/_/g, ' ')} - {award.recipientName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-[#111111] mb-2">Certificate Type</label>
                <div className="relative">
                  <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <select 
                    value={certType}
                    onChange={(e) => { setCertType(e.target.value); setIsGenerated(false); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose type...</option>
                    <option value="Winner">Winner</option>
                    <option value="Runner-up">Runner-up</option>
                    <option value="Participation">Participation</option>
                    <option value="Best Player">Best Player</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-[#111111] mb-2">Recipient Name (Team or Player)</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input 
                    type="text" 
                    placeholder="e.g. Lions Club or Kamal" 
                    value={recipient}
                    onChange={(e) => { setRecipient(e.target.value); setIsGenerated(false); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* System Details Preview Card */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${isFormComplete ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#f8f7f4] border-[#e5e5e5] opacity-60'}`}>
              <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                <FileText size={16} className={isFormComplete ? 'text-[#166534]' : 'text-[#888888]'} /> 
                <span className={isFormComplete ? 'text-[#166534]' : 'text-[#666666]'}>System Encoded Data</span>
              </h4>
              
              {isFormComplete ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                    <span className="text-[#166534]/70 font-semibold">Tournament ID</span>
                    <span className="font-bold text-[#166534]">{isGenerated ? generatedId.substring(0, 8) + '...' : 'Will be generated'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                    <span className="text-[#166534]/70 font-semibold">Recipient</span>
                    <span className="font-bold text-[#166534] truncate max-w-[150px] sm:max-w-[200px] text-right">{recipient}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#bbf7d0]/50 pb-2">
                    <span className="text-[#166534]/70 font-semibold">Award</span>
                    <span className="font-bold text-[#166534] text-right">{certType}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#166534]/70 font-semibold">Verify Link</span>
                    <span className="font-bold text-[#166534] text-[11px] sm:text-xs">{isGenerated ? generatedLink : 'Will be generated'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#888888] italic">Fill out all fields above to fetch system data.</p>
              )}
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
                     <QRCodeCanvas 
                        id="certificate-qr-code" 
                        value={generatedLink} 
                        size={192} 
                        level="H" 
                        includeMargin={false}
                     />
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
