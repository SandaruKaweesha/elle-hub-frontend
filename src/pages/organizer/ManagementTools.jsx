import React from 'react';
import { Zap, Edit, Radio, ChevronRight, FileText, Settings } from "lucide-react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export default function ManagementTools() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname.endsWith('/management-tools');

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Management Tools</h1>
        <p className="text-[#666666] text-sm mt-1">Select a tool from the options below to manage your tournament operations.</p>
      </div>

      {/* Landscape Bar (Horizontal Row of Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {/* Card 1 */}
        <button 
          onClick={() => navigate('/organizer/management-tools/draw')}
          className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
        >
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
             <FileText size={180} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Zap size={20} className="text-[#4ade80]" />
              </div>
              <h3 className="text-white font-bold text-[18px] leading-tight">Generate Match Draw</h3>
              <p className="text-white/70 text-[13px] mt-1">Automated bracket creation</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[#4ade80] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Open Tool <ChevronRight size={16} />
            </div>
          </div>
        </button>

        {/* Card 2 */}
        <button 
          onClick={() => navigate('/organizer/management-tools/results')}
          className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
        >
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
             <FileText size={180} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Edit size={20} className="text-[#4ade80]" />
              </div>
              <h3 className="text-white font-bold text-[18px] leading-tight">Update Results</h3>
              <p className="text-white/70 text-[13px] mt-1">Real-time scoring input</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[#4ade80] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Open Tool <ChevronRight size={16} />
            </div>
          </div>
        </button>

        {/* Card 3 */}
        <button 
          onClick={() => navigate('/organizer/management-tools/broadcast')}
          className="bg-[#00382D] relative overflow-hidden rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-[#4ade80]/30 flex flex-col h-full min-h-[160px]"
        >
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[15%] translate-y-[15%]">
             <FileText size={180} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Radio size={20} className="text-[#4ade80]" />
              </div>
              <h3 className="text-white font-bold text-[18px] leading-tight">Live Broadcast Hub</h3>
              <p className="text-white/70 text-[13px] mt-1">Manage stream overlays</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[#4ade80] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Open Tool <ChevronRight size={16} />
            </div>
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full flex flex-col relative">
        {isRoot ? (
          <div className="absolute inset-0 bg-white rounded-2xl border border-[#e5e5e5] p-8 flex items-center justify-center shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f4f4f4] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e5e5]">
                <Settings size={24} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-bold text-[#111111]">Select a Management Tool</h2>
              <p className="text-[#666666] mt-2 max-w-sm mx-auto">Click on one of the tools above to start managing your tournament operations.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 h-full relative">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
