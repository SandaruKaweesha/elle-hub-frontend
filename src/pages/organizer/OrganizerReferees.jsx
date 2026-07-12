import React, { useState } from 'react';
import { Search, Filter, MapPin, ShieldCheck, MoreVertical, Star, ChevronRight, User } from 'lucide-react';

export default function OrganizerReferees() {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy referee data
  const referees = [
    { id: 1, name: 'Sunil Perera', initials: 'SP', matches: 45, location: 'Colombo', status: 'Verified', rating: 4.9 },
    { id: 2, name: 'Kamal Silva', initials: 'KS', matches: 32, location: 'Kandy', status: 'Verified', rating: 4.7 },
    { id: 3, name: 'Nimal Fernando', initials: 'NF', matches: 12, location: 'Galle', status: 'Pending', rating: 4.1 },
    { id: 4, name: 'Jagath Kumara', initials: 'JK', matches: 56, location: 'Matara', status: 'Verified', rating: 4.8 },
    { id: 5, name: 'Ruwan Rajapaksha', initials: 'RR', matches: 5, location: 'Jaffna', status: 'Pending', rating: 3.8 },
    { id: 6, name: 'Nuwan Pradeep', initials: 'NP', matches: 28, location: 'Negombo', status: 'Verified', rating: 4.5 },
  ];

  return (
    <div className="max-w-6xl mx-auto font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Referees Management</h1>
          <p className="text-[#666666] text-sm mt-1">Review, manage, and verify referees for your tournaments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-[#e5e5e5] px-4 py-2.5 rounded-lg text-sm font-semibold text-[#333333] hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search referees by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all"
          />
        </div>
        
        <div className="text-sm font-medium text-[#666666]">
          Total Referees: <span className="text-[#111111] font-bold">{referees.length}</span>
        </div>
      </div>

      {/* Referee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referees.map(referee => (
          <div key={referee.id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            
            {/* Card Header (Cover Image placeholder) */}
            <div className="h-24 bg-gradient-to-r from-[#00382D] to-[#08733e] relative">
              <button className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="p-6 relative pt-0">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white p-1 absolute -top-8 left-6 shadow-sm">
                <div className="w-full h-full rounded-xl bg-[#f4f4f4] flex items-center justify-center font-bold text-lg text-[#00382D] border border-[#e5e5e5]">
                  {referee.initials}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-end pt-3 mb-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1 ${referee.status === 'Verified' ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]' : 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]'}`}>
                  {referee.status === 'Verified' ? <ShieldCheck size={12} /> : null}
                  {referee.status}
                </span>
              </div>

              {/* Info */}
              <div className="mt-2">
                <h3 className="text-lg font-bold text-[#111111] leading-tight mb-1 group-hover:text-[#00382D] transition-colors">{referee.name}</h3>
                <div className="flex items-center gap-1 text-[#888888] text-sm font-medium">
                  <MapPin size={14} /> {referee.location}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-[#f4f4f4]">
                <div>
                  <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Experience</p>
                  <p className="font-bold text-[#333333] flex items-center gap-1.5">
                    <User size={16} className="text-[#00382D]" /> {referee.matches} Matches
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Rating</p>
                  <p className="font-bold text-[#333333] flex items-center gap-1.5">
                    <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" /> {referee.rating}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                <button className="w-full py-2 bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#333333] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group/btn border border-[#e5e5e5] shadow-sm">
                  View Profile
                  <ChevronRight size={16} className="text-[#888888] group-hover/btn:text-[#333333] transition-colors" />
                </button>

                {referee.status === 'Pending' ? (
                  <button className="w-full py-2 bg-[#00382D] hover:bg-[#002a22] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center shadow-sm">
                    Accept Request
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl text-sm font-bold flex items-center justify-center border border-gray-200">
                    Request Accepted
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
