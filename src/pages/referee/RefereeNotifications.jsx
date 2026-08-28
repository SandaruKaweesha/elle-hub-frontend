import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, Trophy, ClipboardList, Loader2, ShieldCheck, 
  Search, Filter, Calendar, MapPin, Check, AlertCircle, ArrowRight 
} from 'lucide-react';
import api from '../../services/api';

export default function RefereeNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (!targetId) return;

      const [notifRes, reqRes] = await Promise.all([
        api.get(`/user/${targetId}/notifications`).catch(() => null),
        api.get(`/referee/${targetId}/requests`).catch(() => null)
      ]);

      let combined = [];

      if (notifRes?.data?.data && Array.isArray(notifRes.data.data)) {
        combined = [...notifRes.data.data];
      }

      if (reqRes?.data?.data && Array.isArray(reqRes.data.data)) {
        const reqAlerts = reqRes.data.data.map(req => ({
          notification_id: `req_${req.request_id || req.id}`,
          title: `Officiating Invitation: ${req.tournament_title || 'Tournament Assignment'}`,
          message: `You have been invited to officiate in ${req.tournament_title || 'a tournament match'}. Status: ${req.status || 'PENDING'}.`,
          type: 'OFFICIATING',
          is_read: req.status === 'PENDING' ? 0 : 1,
          created_at: req.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
          link: '/referee/schedule'
        }));
        
        reqAlerts.forEach(r => {
          if (!combined.some(c => c.notification_id === r.notification_id)) {
            combined.unshift(r);
          }
        });
      }

      setNotifications(combined);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (targetId) {
        await api.put(`/user/${targetId}/notifications/read-all`).catch(() => null);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (notifId) => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (targetId && !String(notifId).startsWith('req_')) {
        await api.put(`/user/${targetId}/notifications/${notifId}/read`).catch(() => null);
      }
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = 
      filterTab === 'ALL' ? true :
      filterTab === 'UNREAD' ? Number(n.is_read) === 0 :
      filterTab === 'OFFICIATING' ? (n.type === 'OFFICIATING' || n.type === 'REFEREE' || n.type === 'MATCH') : true;

    const matchesSearch = 
      !searchQuery.trim() ||
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.message || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#00382D]/10 text-[#00382D] rounded-xl">
              <Bell size={22} />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Referee Notifications</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Stay updated on match officiating requests, fixture schedules, and tournament alerts.</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#08733e] border border-emerald-200 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer w-fit shadow-2xs"
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'ALL' ? 'bg-[#00382D] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilterTab('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'UNREAD' ? 'bg-[#00382D] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('OFFICIATING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'OFFICIATING' ? 'bg-[#00382D] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Officiating Requests
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs focus:outline-none focus:border-[#00382D]"
          />
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col min-h-[420px]">
        
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-gray-900">Officiating Activity Feed</span>
            <span className="bg-emerald-100 text-[#08733e] text-xs font-black px-3 py-0.5 rounded-full">
              {unreadCount} Unread
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500">Showing {filteredNotifications.length} items</span>
        </div>

        <div className="divide-y divide-gray-100 flex-1">
          {loading ? (
            <div className="py-24 text-center text-gray-400">
              <Loader2 size={32} className="animate-spin text-[#08733e] mx-auto mb-2" />
              <p className="text-xs font-bold">Loading Referee Notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-24 text-center text-gray-400 space-y-2">
              <Bell size={44} className="mx-auto text-gray-300" />
              <h3 className="text-base font-extrabold text-gray-800">No Notifications Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery ? "No alerts match your search query." : "When organizers assign matches or announce tournaments, alerts will show here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const isUnread = Number(n.is_read) === 0;
              return (
                <div 
                  key={n.notification_id}
                  onClick={() => {
                    markSingleRead(n.notification_id);
                    if (n.link) navigate(n.link);
                  }}
                  className={`p-5 md:p-6 transition-all cursor-pointer flex items-start gap-4 ${isUnread ? 'bg-emerald-50/40 hover:bg-emerald-50/80 font-bold' : 'hover:bg-gray-50 opacity-85'}`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    n.type === 'OFFICIATING' || n.type === 'REFEREE' || n.type === 'MATCH' ? 'bg-emerald-100 text-[#08733e]' :
                    n.type === 'TOURNAMENT' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {n.type === 'OFFICIATING' || n.type === 'REFEREE' || n.type === 'MATCH' ? <ClipboardList size={20} /> : <Trophy size={20} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-gray-900">{n.title}</h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1 font-medium leading-relaxed">{n.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread ? (
                          <span className="text-[10px] font-black uppercase text-[#08733e] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">New</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-md">Read</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[11px]">
                      <span className="font-mono text-gray-400">{n.created_at || n.received_at}</span>
                      {n.link && (
                        <span className="text-[#08733e] font-bold hover:underline flex items-center gap-1">
                          View Details <ArrowRight size={13} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && filteredNotifications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold">End of officiating notification feed.</p>
          </div>
        )}

      </div>

    </div>
  );
}
