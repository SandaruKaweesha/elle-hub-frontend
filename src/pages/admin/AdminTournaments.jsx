import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, Search, Filter, AlertCircle, ShieldCheck, HelpCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/tournaments');
      if (response.data && response.data.success !== false) {
        setTournaments(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to retrieve tournaments.");
      }
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'UPCOMING') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'ONGOING') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'COMPLETED') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-red-50 text-red-700 border-red-200'; // CANCELLED
  };

  const getApprovalStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (s === 'REJECTED') return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; // PENDING
  };

  const getApprovalIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return <CheckCircle2 size={12} className="text-[#166534]" />;
    if (s === 'REJECTED') return <XCircle size={12} className="text-[#991b1b]" />;
    return <Clock size={12} className="text-[#d97706]" />;
  };

  // Filter and search logic
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.organizer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter;
    const matchesApproval = approvalFilter === 'ALL' || (t.approval_status || '').toUpperCase() === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#111111] tracking-tight">System Tournaments</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor, search, and manage all registered tournaments across the system.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search title, ground, organizer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00382D] transition-all"
            >
              <option value="ALL">Status: All</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 md:w-40">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full h-11 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00382D] transition-all"
            >
              <option value="ALL">Approval: All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

      </div>

      {/* Tournaments Grid/Table */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading tournaments directory...
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6 text-gray-400 border border-[#e5e5e5] shadow-inner">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No Tournaments Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              We couldn't find any tournaments matching your query or filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#f8f7f4] border-b border-[#e5e5e5]">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Tournament Info</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Organizer</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Held Date</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Max Teams</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTournaments.map((t) => (
                  <tr key={t.tournament_id} className="hover:bg-[#f8f7f4]/40 transition-colors">
                    
                    {/* Tournament Info */}
                    <td className="p-5">
                      <div className="font-bold text-[#111111] text-[15px]">{t.title}</div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mt-1">
                        <MapPin size={12} />
                        {t.location}
                      </div>
                    </td>

                    {/* Organizer */}
                    <td className="p-5">
                      <div className="font-bold text-gray-700 text-sm">{t.organizer_name || 'N/A'}</div>
                      <div className="text-[11px] font-semibold text-gray-400 mt-0.5">ID: #{t.organizer_id}</div>
                    </td>

                    {/* Held Date */}
                    <td className="p-5 text-sm font-bold text-gray-700">
                      {formatDate(t.tournament_held_date)}
                    </td>

                    {/* Max Teams */}
                    <td className="p-5 text-sm font-bold text-gray-700">
                      {t.maximum_team_limit || 'N/A'} Teams
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getStatusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Approval */}
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 w-fit ${getApprovalStyle(t.approval_status)}`}>
                        {getApprovalIcon(t.approval_status)}
                        {t.approval_status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
