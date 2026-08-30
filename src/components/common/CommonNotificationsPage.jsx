import React, { useState, useEffect } from 'react';
import { Bell, Trophy, CheckCircle2, Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function CommonNotificationsPage({ roleTitle, roleSubtitle }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'UNREAD'
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/user/${userId}/notifications`);
      if (response.data && response.data.success !== false) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await api.put(`/user/${userId}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleRead = async (notifId) => {
    if (!userId) return;
    try {
      await api.put(`/user/${userId}/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  const filteredNotifications = notifications.filter(n => {
    const isUnread = Number(n.is_read) === 0;
    const matchesFilter = filterTab === 'ALL' ? true : isUnread;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto font-['Poppins'] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-[#111111] tracking-tight">{roleTitle || 'Notifications'}</h1>
          <p className="text-[#666666] text-sm mt-1">{roleSubtitle || 'Stay updated on tournament approvals, match fixtures, and system broadcasts.'}</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-[#08733e] bg-[#eaf1ec] hover:bg-[#eaf1ec]/80 border border-[#08733e]/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs w-fit"
          >
            <CheckCircle2 size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Toolbar Tabs & Search */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-[#00382D] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilterTab('UNREAD')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === 'UNREAD'
                ? 'bg-[#00382D] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold outline-none focus:border-[#00382D] transition-all"
          />
        </div>
      </div>

      {/* Notifications Container */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-xs overflow-hidden divide-y divide-gray-100 min-h-[360px]">
        {loading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#08733e] mb-3" />
            <p className="text-xs font-bold">Loading your notifications feed...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center text-gray-400 space-y-3 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#f8f7f4] flex items-center justify-center border border-gray-200 text-gray-400 shadow-inner">
              <Bell size={28} />
            </div>
            <h4 className="font-bold text-gray-900 text-base">No Notifications Found</h4>
            <p className="text-xs font-medium max-w-sm mx-auto text-gray-500">
              When you receive tournament approvals, team updates, or match schedules, they will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => {
            const isUnread = Number(notif.is_read) === 0;
            return (
              <div 
                key={notif.notification_id || idx}
                onClick={() => handleSingleRead(notif.notification_id)}
                className={`p-5 transition-colors cursor-pointer flex gap-4 items-start ${
                  isUnread ? 'bg-[#eaf1ec]/40 hover:bg-[#eaf1ec]/70' : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#eaf1ec] text-[#08733e] flex items-center justify-center shrink-0 mt-0.5 border border-[#08733e]/20 shadow-xs">
                  <Trophy size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm ${isUnread ? 'font-black text-[#111111]' : 'font-bold text-gray-800'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="bg-[#08733e] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {notif.created_at || notif.received_at || 'Recently'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center py-2 text-xs font-semibold text-gray-400">
        You have reached the end of your notifications feed.
      </div>

    </div>
  );
}