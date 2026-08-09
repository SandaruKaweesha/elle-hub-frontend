import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Trophy, Award, ShieldAlert, Loader2, BadgeDollarSign } from 'lucide-react';
import api from '../../services/api';

export default function SponsorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const localUser = JSON.parse(userString);
      const targetId = localUser.userId || localUser.user_id || localUser.id;
      if (!targetId) return;

      const res = await api.get(`/user/${targetId}/notifications`);
      if (res.data && res.data.success !== false) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
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
        await api.put(`/user/${targetId}/notifications/read-all`);
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
      if (targetId) {
        await api.put(`/user/${targetId}/notifications/${notifId}/read`);
      }
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  return (
    <div className="max-w-5xl mx-auto font-['Poppins'] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Sponsor Notifications</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Real-time alerts for sponsorship requests, tournament announcements, and winner updates.</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#08733e] border border-emerald-200 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col min-h-[400px]">
        
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-gray-900">Your Activity Feed</span>
            <span className="bg-emerald-100 text-[#08733e] text-xs font-black px-3 py-0.5 rounded-full">
              {unreadCount} Unread
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 flex-1">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 size={32} className="animate-spin text-[#08733e] mx-auto mb-2" />
              <p className="text-xs font-bold">Loading Sponsor Notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400 space-y-2">
              <Bell size={40} className="mx-auto text-gray-300" />
              <h3 className="text-base font-extrabold text-gray-800">No Notifications Yet</h3>
              <p className="text-xs text-gray-500">When organizers send sponsorship requests or announce tournaments, alerts will show here.</p>
            </div>
          ) : (
            notifications.map(n => {
              const isUnread = Number(n.is_read) === 0;
              return (
                <div 
                  key={n.notification_id}
                  onClick={() => markSingleRead(n.notification_id)}
                  className={`p-5 md:p-6 transition-all cursor-pointer flex items-start gap-4 ${isUnread ? 'bg-emerald-50/40 hover:bg-emerald-50/80 font-bold' : 'hover:bg-gray-50 opacity-80'}`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    n.type === 'SPONSOR' ? 'bg-purple-100 text-purple-700' :
                    n.type === 'TOURNAMENT' ? 'bg-emerald-100 text-[#08733e]' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {n.type === 'SPONSOR' ? <BadgeDollarSign size={20} /> : <Trophy size={20} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{n.title}</h4>
                        <p className="text-xs text-gray-700 mt-1 font-medium leading-relaxed">{n.message}</p>
                      </div>
                      {isUnread && (
                        <span className="text-[10px] font-black uppercase text-[#08733e] bg-emerald-100 px-3 py-1 rounded-full shrink-0 border border-emerald-200">New</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 mt-3 block">{n.created_at || n.received_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && notifications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold">End of sponsor notification stream.</p>
          </div>
        )}

      </div>

    </div>
  );
}
