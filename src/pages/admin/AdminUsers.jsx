import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search, Trash2, AlertCircle, CheckCircle2, UserCheck, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL', 'TEAM', 'SPONSOR', 'REFEREE', 'PLAYGROUND', 'ORGANIZER'
  
  // Deletion Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // User Details Modal state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/getAllUsers');
      if (response.data && response.data.success !== false) {
        setUsers(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to load users.");
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message || "An error occurred while loading users.");
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!selectedUser) return;
    try {
      setDeleteLoading(true);
      setError(null);
      setSuccessMsg(null);
      
      const response = await api.delete(`/user/delete/${selectedUser.user_id}`);
      if (response.data && response.data.success !== false) {
        setSuccessMsg(response.data.message || "User account deleted successfully.");
        setShowDeleteModal(false);
        setSelectedUser(null);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchUsers();
      } else {
        throw new Error(response.data.message || "Failed to delete user account.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while deleting the user.");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleStyle = (role) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r === 'TEAM') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r === 'SPONSOR') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r === 'REFEREE') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (r === 'PLAYGROUND') return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200'; // ORGANIZER
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (s === 'REJECTED') return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'; // PENDING
  };

  const filteredUsers = users.filter((u) => {
    // Exclude currently logged in admin user to prevent self-deletion
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const loggedInId = localUser.userId || localUser.id;
    if (parseInt(u.user_id, 10) === parseInt(loggedInId, 10)) return false;

    const matchesSearch = u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.contact_number || '').includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
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
        <h1 className="text-[28px] font-black text-[#111111] tracking-tight">System Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and audit all registered teams, sponsors, referees, playground hosts, and organizers.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200 flex items-center gap-2 font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200 flex items-center gap-2 font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Toolbar / Search & Filter */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search name, email, contact..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm outline-none focus:border-[#00382D] focus:ring-1 focus:ring-[#00382D] transition-all font-medium"
          />
        </div>

        {/* Role Filters Selection */}
        <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
          {[
            { key: 'ALL', label: 'All Users' },
            { key: 'TEAM', label: 'Teams' },
            { key: 'SPONSOR', label: 'Sponsors' },
            { key: 'REFEREE', label: 'Referees' },
            { key: 'PLAYGROUND', label: 'Playgrounds' },
            { key: 'ORGANIZER', label: 'Organizers' }
          ].map((role) => (
            <button
              key={role.key}
              onClick={() => setRoleFilter(role.key)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-sm ${
                roleFilter === role.key
                  ? 'bg-[#00382D] text-white border-[#00382D]'
                  : 'bg-[#f8f7f4] text-gray-600 border-[#e5e5e5] hover:bg-gray-50'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-semibold flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#08733e]/20 border-t-[#08733e] rounded-full animate-spin mb-4"></div>
            Loading user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6 text-gray-400 border border-[#e5e5e5] shadow-inner">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No Users Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              We couldn't find any user profiles matching your selected criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-semibold">
              <thead>
                <tr className="bg-[#f8f7f4] border-b border-[#e5e5e5]">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">User Identity</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Role Badge</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Contact Number</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Date Joined</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr 
                    key={u.user_id} 
                    onClick={() => {
                      setSelectedUserForDetails(u);
                      setShowDetailsModal(true);
                    }}
                    className="hover:bg-[#f8f7f4]/40 transition-colors cursor-pointer"
                  >
                    
                    {/* User Identity */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.display_name)}`} 
                            alt={u.display_name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#111111] text-sm leading-snug">{u.display_name}</div>
                          <div className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Mail size={12} />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-5">
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getRoleStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Contact Number */}
                    <td className="p-5 text-xs font-bold text-gray-600 flex items-center gap-1.5 pt-8">
                      <Phone size={12} className="text-gray-400" />
                      {u.contact_number || 'N/A'}
                    </td>

                    {/* Date Joined */}
                    <td className="p-5 text-xs text-gray-500 font-semibold">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getStatusStyle(u.status)}`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => triggerDelete(u)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-lg border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#002c21] p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedUserForDetails(null); }}
                className="absolute top-4 right-4 text-white/75 hover:text-white cursor-pointer text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden bg-white mx-auto mb-3 shadow-md">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedUserForDetails.display_name)}`} 
                  alt={selectedUserForDetails.display_name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-lg font-bold">{selectedUserForDetails.display_name}</h3>
              <span className={`px-2.5 py-0.5 mt-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border inline-block ${getRoleStyle(selectedUserForDetails.role)}`}>
                {selectedUserForDetails.role}
              </span>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                  <Mail size={14} className="text-gray-400" />
                  {selectedUserForDetails.email}
                </span>
              </div>
              
              <div>
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Contact Number</span>
                <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-0.5">
                  <Phone size={14} className="text-gray-400" />
                  {selectedUserForDetails.contact_number || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Account Status</span>
                  <span className={`px-2 py-0.5 mt-1 text-[9px] font-black uppercase tracking-wider rounded-md border inline-block ${getStatusStyle(selectedUserForDetails.status)}`}>
                    {selectedUserForDetails.status}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Joined Date</span>
                  <span className="text-sm font-bold text-[#111111] flex items-center gap-1.5 mt-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(selectedUserForDetails.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedUserForDetails(null); }}
                className="px-5 py-2.5 bg-[#00382d] hover:bg-[#002a22] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm w-full text-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg border border-[#e5e5e5] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">Delete User Account</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Are you sure you want to permanently delete the account for <span className="font-bold text-gray-700">"{selectedUser.display_name}"</span> ({selectedUser.email})? 
              This action cannot be undone and will delete all associated data.
            </p>
            <div className="flex gap-4">
              <button
                disabled={deleteLoading}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 border border-[#e5e5e5] text-gray-600 hover:bg-gray-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={executeDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-xs transition-all shadow-sm cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
