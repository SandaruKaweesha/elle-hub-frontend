import React, { useState } from 'react';
import { Search, Filter, MoreVertical, ChevronRight, DollarSign, Award, Briefcase, CheckCircle2, MessageSquare, X, Send, Paperclip } from 'lucide-react';

export default function OrganizerSponsors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatSponsor, setActiveChatSponsor] = useState(null);

  // Dummy sponsor data
  const sponsors = [
    { id: 1, name: 'Dialog Axiata', initials: 'DA', tier: 'Platinum', amount: 'LKR 1,500,000', status: 'Active', color: 'bg-slate-800' },
    { id: 2, name: 'MAS Holdings', initials: 'MH', tier: 'Gold', amount: 'LKR 800,000', status: 'Active', color: 'bg-yellow-600' },
    { id: 3, name: 'Red Bull Energy', initials: 'RB', tier: 'Silver', amount: 'LKR 350,000', status: 'Pending', color: 'bg-red-600' },
    { id: 4, name: 'Bank of Ceylon', initials: 'BOC', tier: 'Gold', amount: 'LKR 750,000', status: 'Active', color: 'bg-yellow-600' },
    { id: 5, name: 'Elephant House', initials: 'EH', tier: 'Silver', amount: 'LKR 400,000', status: 'Pending', color: 'bg-gray-400' },
    { id: 6, name: 'Mobitel', initials: 'MB', tier: 'Platinum', amount: 'LKR 1,200,000', status: 'Active', color: 'bg-slate-800' },
  ];

  const filteredSponsors = sponsors.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Sponsors & Partners</h1>
          <p className="text-[#666666] text-sm mt-1">Manage tournament funding, partnership tiers, and review sponsor requests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#00382D] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#002a22] transition-colors shadow-sm">
            <Briefcase size={16} /> Add Sponsor
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search sponsors by name or tier..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="text-[#666666]">
            Total Sponsors: <span className="text-[#111111] font-bold">{sponsors.length}</span>
          </div>
          <button className="flex items-center gap-2 bg-[#f8f7f4] border border-[#e5e5e5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#333333] hover:bg-gray-100 transition-colors">
            <Filter size={14} /> Filter Tiers
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            
            {/* Card Header */}
            <div className={`h-24 ${sponsor.color} relative`}>
              <button className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="p-6 relative pt-0">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm">
                <div className="w-full h-full rounded-xl bg-[#f8f7f4] flex items-center justify-center font-black text-xl text-[#111111] border border-[#e5e5e5]">
                  {sponsor.initials}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-end pt-3 mb-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1 ${sponsor.status === 'Active' ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]' : 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]'}`}>
                  {sponsor.status === 'Active' ? <CheckCircle2 size={12} /> : null}
                  {sponsor.status}
                </span>
              </div>

              {/* Info */}
              <div className="mt-2">
                <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{sponsor.name}</h3>
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Award size={14} className={sponsor.tier === 'Platinum' ? 'text-slate-500' : sponsor.tier === 'Gold' ? 'text-yellow-500' : 'text-gray-400'} /> 
                  <span className={sponsor.tier === 'Platinum' ? 'text-slate-600' : sponsor.tier === 'Gold' ? 'text-yellow-600' : 'text-gray-500'}>
                    {sponsor.tier} Partner
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-5 border-t border-[#f4f4f4]">
                <div>
                  <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Pledged Amount</p>
                  <p className="font-black text-2xl text-[#111111] flex items-center gap-1">
                    <DollarSign size={20} className="text-[#08733e]" /> {sponsor.amount}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-[#e5e5e5] shadow-sm">
                    View Agreement
                  </button>
                  <button 
                    onClick={() => setActiveChatSponsor(sponsor)}
                    className="w-[38px] h-[38px] shrink-0 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#00382D] rounded-xl flex items-center justify-center border border-[#e5e5e5] shadow-sm transition-colors" 
                    title="Message Sponsor"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>

                {sponsor.status === 'Pending' ? (
                  <button className="w-full py-2 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center shadow-sm">
                    Accept Request
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-[#f0fdf4] text-[#166534] cursor-not-allowed rounded-xl text-sm font-bold flex items-center justify-center border border-[#bbf7d0]">
                    Active Partner
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Chat Slide-out Panel */}
      {activeChatSponsor && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#111111]/40 z-40 animate-in fade-in duration-300 backdrop-blur-sm"
            onClick={() => setActiveChatSponsor(null)}
          ></div>
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-['Poppins'] border-l border-[#e5e5e5]">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white ${activeChatSponsor.color} shadow-sm`}>
                  {activeChatSponsor.initials}
                </div>
                <div>
                  <h3 className="font-bold text-[#111111] text-lg leading-tight">{activeChatSponsor.name}</h3>
                  <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatSponsor(null)}
                className="text-[#888888] hover:text-[#111111] hover:bg-[#f4f4f4] p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#f8f7f4] flex flex-col gap-4">
              <div className="text-center text-xs text-[#888888] font-semibold uppercase tracking-wider my-2">Today</div>
              
              {/* Received */}
              <div className="flex gap-3 max-w-[85%]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${activeChatSponsor.color} shrink-0 mt-1 shadow-sm`}>
                  {activeChatSponsor.initials}
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-[#e5e5e5] text-sm text-[#333333] leading-relaxed">
                  Hi there! We are very interested in the <span className="font-bold text-[#111111]">{activeChatSponsor.tier}</span> sponsorship package for your upcoming tournament.
                  <span className="block text-[10px] font-medium text-[#888888] text-right mt-1.5">10:42 AM</span>
                </div>
              </div>

              {/* Sent */}
              <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
                <div className="bg-[#00382D] text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-sm leading-relaxed">
                  Hello! That's wonderful to hear. I can send over the detailed agreement for your review right away.
                  <span className="block text-[10px] font-medium text-white/70 text-right mt-1.5">10:45 AM</span>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-[#e5e5e5]">
              <div className="flex items-center gap-2 bg-[#f8f7f4] rounded-full p-1.5 border border-[#e5e5e5] shadow-inner">
                <button className="p-2 text-[#888888] hover:text-[#00382D] transition-colors rounded-full hover:bg-white hover:shadow-sm">
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 bg-transparent text-sm focus:outline-none px-2 text-[#333333] font-medium"
                />
                <button className="p-2.5 bg-[#00382D] hover:bg-[#002a22] text-white rounded-full transition-all flex items-center justify-center shadow-md hover:-translate-y-0.5">
                  <Send size={16} className="-ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
