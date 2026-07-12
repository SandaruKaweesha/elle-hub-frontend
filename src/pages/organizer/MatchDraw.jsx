import React, { useState } from 'react';
import { Trophy, Users, Shuffle, Download, Eye, ChevronRight, Zap } from 'lucide-react';

export default function MatchDraw() {
  const [selectedTournament, setSelectedTournament] = useState('');
  const [drawFormat, setDrawFormat] = useState('knockout');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drawGenerated, setDrawGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setDrawGenerated(true);
    }, 1500);
  };

  return (
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
            <div className="w-full px-4 py-2.5 bg-white border border-[#d6d8d4] rounded-lg text-sm flex items-center justify-between">
              <span className="text-[#666666]">Approved Teams</span>
              <span className="font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded text-xs">16</span>
            </div>
          </div>

          <div className="mt-2 pt-5 border-t border-[#d6d8d4]">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTournament}
              className={`
                w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                ${isGenerating || !selectedTournament 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#4ade80] text-[#00382D] hover:bg-[#3bcf71] hover:-translate-y-0.5 hover:shadow-md'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00382D] border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Shuffle size={18} />
                  Generate Bracket
                </>
              )}
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
                 <span className="text-xs font-bold px-3 py-1.5 bg-[#4ade80]/20 text-[#08733e] rounded-md uppercase tracking-wide">Format: Knockout</span>
               </div>
               
               {/* Dummy Bracket Visual */}
               <div className="flex items-center gap-8 min-w-[600px] px-2">
                 {/* Quarter Finals */}
                 <div className="flex flex-col gap-6">
                   <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 w-56 shadow-sm relative before:content-[''] before:absolute before:-right-8 before:top-1/2 before:w-8 before:h-[2px] before:bg-[#d6d8d4]">
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-gray-100 pb-2 mb-2"><span className="text-[#111111]">Lions Club</span> <span className="text-gray-300">-</span></div>
                      <div className="flex justify-between items-center text-sm font-semibold"><span className="text-[#111111]">Tigers SC</span> <span className="text-gray-300">-</span></div>
                   </div>
                   <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 w-56 shadow-sm relative before:content-[''] before:absolute before:-right-8 before:top-1/2 before:w-8 before:h-[2px] before:bg-[#d6d8d4] after:content-[''] after:absolute after:-right-8 after:bottom-1/2 after:w-[2px] after:h-[calc(100%+1.5rem)] after:bg-[#d6d8d4]">
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-gray-100 pb-2 mb-2"><span className="text-[#111111]">Eagles CC</span> <span className="text-gray-300">-</span></div>
                      <div className="flex justify-between items-center text-sm font-semibold"><span className="text-[#111111]">Sharks</span> <span className="text-gray-300">-</span></div>
                   </div>
                 </div>

                 {/* Semi Finals */}
                 <div className="flex flex-col gap-12 relative before:content-[''] before:absolute before:-left-0 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-[2px] before:bg-[#00382D]">
                   <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 w-56 shadow-sm border-l-4 border-l-[#00382D] ml-8 relative before:content-[''] before:absolute before:-left-8 before:top-1/2 before:w-8 before:h-[2px] before:bg-[#00382D]">
                      <div className="flex justify-between items-center text-sm font-medium border-b border-gray-100 pb-2 mb-2"><span className="text-gray-400 italic">Winner Match 1</span></div>
                      <div className="flex justify-between items-center text-sm font-medium"><span className="text-gray-400 italic">Winner Match 2</span></div>
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
