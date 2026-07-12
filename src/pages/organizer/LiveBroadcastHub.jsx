import React, { useState } from 'react';
import { Trophy, Radio, Copy, MonitorPlay, ExternalLink } from 'lucide-react';

export default function LiveBroadcastHub() {
  const [selectedMatch, setSelectedMatch] = useState('m1');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [overlayTheme, setOverlayTheme] = useState('dark');
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyUrl = () => {
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 1500);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e5e5e5] p-6 lg:p-8 shadow-sm flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
            <Radio className="text-[#4ade80]" size={20} />
            Live Broadcast Hub
          </h2>
          <p className="text-[#666666] text-sm mt-1">Manage and preview live stream overlays for OBS or vMix.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-[#f8f7f4] p-5 rounded-xl border border-[#e5e5e5]">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-wider">Overlay Controls</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Active Match</label>
            <div className="relative">
              <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <select 
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d6d8d4] rounded-lg text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] appearance-none"
              >
                <option value="m1">Lions Club vs Tigers SC (Live)</option>
                <option value="m2">Eagles CC vs Sharks (Upcoming)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#333333]">Overlay Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setOverlayTheme('dark')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  overlayTheme === 'dark' 
                    ? 'border-[#00382D] bg-[#00382D]/5 text-[#00382D]' 
                    : 'border-[#d6d8d4] bg-white text-[#666666] hover:bg-gray-50'
                }`}
              >
                Dark Mode
              </button>
              <button 
                onClick={() => setOverlayTheme('light')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  overlayTheme === 'light' 
                    ? 'border-[#00382D] bg-[#00382D]/5 text-[#00382D]' 
                    : 'border-[#d6d8d4] bg-white text-[#666666] hover:bg-gray-50'
                }`}
              >
                Light Mode
              </button>
            </div>
          </div>

          <div className="mt-2 pt-5 border-t border-[#d6d8d4] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#333333]">Activate Overlay</span>
              <button 
                onClick={() => setIsOverlayActive(!isOverlayActive)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${isOverlayActive ? 'bg-[#4ade80]' : 'bg-[#d6d8d4]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isOverlayActive ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            
            <button 
              onClick={handleCopyUrl}
              className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 bg-[#00382D] text-white hover:bg-[#002a22] transition-colors text-sm"
            >
              {isCopying ? (
                <>Copied to Clipboard!</>
              ) : (
                <><Copy size={16} /> Copy OBS Browser URL</>
              )}
            </button>
            <button className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 bg-white border border-[#d6d8d4] text-[#333333] hover:bg-gray-50 transition-colors text-sm">
              <ExternalLink size={16} /> Open in New Tab
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-[#111111] rounded-xl border border-[#e5e5e5] min-h-[400px] relative overflow-hidden flex flex-col">
          {/* Mock Video Stream Background */}
          <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center opacity-80">
            <MonitorPlay size={48} className="text-[#333333]" />
          </div>

          <div className="absolute top-4 left-4">
             <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-wide flex items-center gap-1.5 shadow-md">
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Preview
             </span>
          </div>
          
          {/* Lower Third Overlay Preview */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] transition-all duration-500 transform">
             {isOverlayActive ? (
                <div className={`animate-in slide-in-from-bottom-8 fade-in duration-500 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col ${overlayTheme === 'dark' ? 'bg-[#00382D] text-white' : 'bg-white text-[#111111]'}`}>
                   <div className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${overlayTheme === 'dark' ? 'bg-[#4ade80] text-[#00382D]' : 'bg-[#00382D] text-white'}`}>
                     Quarter Finals - Live
                   </div>
                   <div className="flex items-center justify-between p-4">
                     <div className="flex items-center gap-4 flex-1">
                       <span className="font-bold text-xl sm:text-2xl truncate">Lions Club</span>
                       <span className={`text-xl sm:text-2xl font-black ${overlayTheme === 'dark' ? 'text-[#4ade80]' : 'text-[#00382D]'}`}>45/2</span>
                     </div>
                     
                     <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-xs font-bold mx-2 ${overlayTheme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
                       VS
                     </div>
                     
                     <div className="flex items-center justify-end gap-4 flex-1">
                       <span className={`text-xl sm:text-2xl font-black ${overlayTheme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>0/0</span>
                       <span className="font-bold text-xl sm:text-2xl truncate text-right">Tigers SC</span>
                     </div>
                   </div>
                   <div className={`px-4 py-2 flex items-center justify-between text-sm font-medium border-t ${overlayTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                     <span>Overs: 5.2 / 10</span>
                     <span>Target: -</span>
                   </div>
                </div>
             ) : (
                <div className="text-center p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
                   <p className="text-white/60 text-sm font-medium">Overlay is currently inactive. Toggle it on in the controls.</p>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
