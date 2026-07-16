import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Calendar, MapPin } from 'lucide-react';

export default function TeamRequests() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'

  // Mock list of team join requests
  const [requests] = useState([]);

  // Calculate status counts
  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const getStatusStyle = (status) => {
    if (status === 'APPROVED') return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (status === 'REJECTED') return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; // Pending
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={13} className="text-[#166534]" />;
    if (status === 'REJECTED') return <XCircle size={13} className="text-[#991b1b]" />;
    return <Clock size={13} className="text-[#d97706]" />;
  };

  const filteredRequests = requests.filter(r => {
    return activeTab === 'ALL' || r.status === activeTab;
  });

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Sent Join Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Track the review status of your team's applications for upcoming tournaments.</p>
      </div>


      {/* Filters */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests Listing */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-4 text-gray-400 border border-[#e5e5e5]">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#111111]">No Requests Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mt-1">There are no submission records matching the selected parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((r) => (
              <div key={r.request_id} className="p-6 hover:bg-[#f8f7f4]/40 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Info Column */}
                  <div className="space-y-3 flex-grow max-w-3xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-[17px] font-bold text-[#111111] leading-snug group-hover:text-[#08733e] transition-colors">
                        {r.tournament_title}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 shadow-sm ${getStatusStyle(r.status)}`}>
                        {getStatusIcon(r.status)}
                        {r.status}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <div className="bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl p-3.5 text-xs text-gray-600 font-medium italic">
                      "{r.message}"
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {r.location}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Event Date: {new Date(r.held_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="md:text-right shrink-0 flex flex-row md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-none pt-4 md:pt-0 border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Submitted On</p>
                      <p className="text-sm font-black text-gray-700 mt-0.5">
                        {new Date(r.applied_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
