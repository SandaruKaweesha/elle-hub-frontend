import React, { useState } from 'react';
import { QrCode, Download, CheckCircle2, Trophy, User, Award, FileText } from 'lucide-react';

export default function CertificateQR() {
  const [tournament, setTournament] = useState('');
  const [certType, setCertType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const isFormComplete = tournament && certType && recipient;

  const handleGenerate = () => {
    if (isFormComplete) {
      setIsGenerated(true);
    }
  };

  const handleReset = () => {
    setTournament('');
    setCertType('');
    setRecipient('');
    setIsGenerated(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 shadow-sm h-full flex flex-col font-['Poppins'] animate-in fade-in duration-300 relative overflow-hidden">
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f8f7f4] rounded-bl-full -z-0 opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00382D] text-white flex items-center justify-center shadow-sm">
                <QrCode size={20} />
              </div>
              Certificate QR Generator
            </h2>
            <p className="text-[#666666]">Select tournament details to auto-generate a smart verification QR code.</p>
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
                    onChange={(e) => { setTournament(e.target.value); setIsGenerated(false); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a tournament...</option>
                    <option value="National Elle Championship 2026">National Elle Championship 2026</option>
                    <option value="Western Province League">Western Province League</option>
                    <option value="President's Cup 2026">President's Cup 2026</option>
                  </select>
                </div>
              </div>
              
              <div>
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
            </div>

            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2">Recipient Name (Team or Player)</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input 
                  type="text" 
                  placeholder="e.g. Lions Club or Kamal Perera" 
                  value={recipient}
                  onChange={(e) => { setRecipient(e.target.value); setIsGenerated(false); }}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
                />
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
                    <span className="font-bold text-[#166534]">TRN-8924</span>
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
                    <span className="font-bold text-[#166534] text-[11px] sm:text-xs">ellehub.com/v/cert-7a9b</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#888888] italic">Fill out all fields above to fetch system data.</p>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!isFormComplete || isGenerated}
              className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isFormComplete && !isGenerated ? 'bg-[#00382D] text-white hover:bg-[#002a22] hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
            >
              <QrCode size={18} /> {isGenerated ? 'QR Code Generated' : 'Generate Secure QR Code'}
            </button>
          </div>

          {/* Preview Section */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center">
            <div className={`w-full aspect-square bg-[#f8f7f4] border-2 border-dashed ${isGenerated ? 'border-transparent' : 'border-[#d6d8d4]'} rounded-2xl flex flex-col items-center justify-center p-8 relative transition-all`}>
              {isGenerated ? (
                <div className="animate-in zoom-in duration-300 flex flex-col items-center w-full h-full justify-center relative">
                  {/* Mock QR Code UI */}
                  <div className="w-56 h-56 bg-white p-3.5 rounded-xl shadow-lg border border-[#e5e5e5] flex items-center justify-center relative">
                     <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5 bg-[#111111] p-1.5 rounded-sm">
                       <div className="col-span-2 row-span-2 bg-white flex items-center justify-center"><div className="w-2/3 h-2/3 bg-[#111111]"></div></div>
                       <div className="col-start-4 col-span-2 row-span-2 bg-white flex items-center justify-center"><div className="w-2/3 h-2/3 bg-[#111111]"></div></div>
                       <div className="col-span-2 row-start-4 row-span-2 bg-white flex items-center justify-center"><div className="w-2/3 h-2/3 bg-[#111111]"></div></div>
                       <div className="col-start-3 row-start-3 bg-white"></div>
                       <div className="col-start-4 row-start-4 bg-white"></div>
                       <div className="col-start-5 row-start-5 bg-white"></div>
                       <div className="col-start-1 row-start-3 bg-white"></div>
                       <div className="col-start-3 row-start-1 bg-white"></div>
                     </div>
                  </div>
                  <div className="absolute -top-3 -right-3 text-[#166534] bg-[#f0fdf4] p-1.5 rounded-full shadow-md animate-in zoom-in delay-150 border border-[#bbf7d0]">
                    <CheckCircle2 size={24} />
                  </div>
                  
                  <div className="absolute bottom-2 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold text-[#111111] border border-[#e5e5e5] shadow-sm truncate max-w-[90%]">
                    TRN-8924 • {certType.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="text-[#888888] flex flex-col items-center text-center">
                  <QrCode size={48} className="mb-4 opacity-30 text-[#00382D]" />
                  <p className="font-semibold text-[#333333]">Ready to Generate</p>
                  <p className="text-xs mt-1 px-4">Complete the form to encode system details</p>
                </div>
              )}
            </div>
            
            {isGenerated && (
              <button className="w-full mt-6 py-3 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl font-bold transition-all border border-[#e5e5e5] shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 fade-in hover:-translate-y-0.5">
                <Download size={18} /> Download High-Res PNG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
