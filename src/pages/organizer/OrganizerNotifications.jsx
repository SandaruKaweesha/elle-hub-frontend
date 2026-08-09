import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, CheckCircle2, Bell, Loader2 } from "lucide-react";
import api from "../../services/api";

function OrganizerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const userId = currentUser.userId || currentUser.user_id || currentUser.id;

      if (!userId) return;

      const response = await api.get(`/user/${userId}/notifications`);
      if (response.data && response.data.success !== false) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const userId = currentUser.userId || currentUser.user_id || currentUser.id;
      if (userId) {
        await api.put(`/user/${userId}/notifications/read-all`);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleAsRead = async (notifId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const userId = currentUser.userId || currentUser.user_id || currentUser.id;
      if (userId) {
        await api.put(`/user/${userId}/notifications/${notifId}/read`);
      }
      setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  return (
    <div className="max-w-4xl mx-auto font-['Poppins'] space-y-6">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Organizer Notifications</h1>
          <p className="text-[#666666] text-sm mt-1">Stay updated on tournament approvals, user registrations, and system broadcasts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="flex items-center gap-2 text-[#08733e] text-sm font-semibold hover:bg-[#08733e]/10 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col min-h-[350px]">
        
        <div className="flex items-center gap-4 border-b border-[#e5e5e5] px-6 py-4 bg-gray-50/50">
           <span className="text-sm font-semibold text-[#111111] border-b-2 border-[#111111] pb-1">All Notifications</span>
           <span className="text-sm font-medium text-[#666666] pb-1">Unread ({unreadCount})</span>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 size={32} className="animate-spin text-[#08733e] mx-auto mb-2" />
              <p className="text-xs font-semibold">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Bell size={36} className="mx-auto text-gray-300" />
              <h4 className="font-bold text-gray-800 text-base">No Notifications Yet</h4>
              <p className="text-xs font-medium">When you receive tournament approvals or updates, they will appear here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = Number(n.is_read) === 0;
              return (
                <div 
                  key={n.notification_id}
                  onClick={() => markSingleAsRead(n.notification_id)}
                  className={`p-6 transition-colors cursor-pointer flex gap-4 ${isUnread ? 'bg-emerald-50/40 hover:bg-emerald-50/80 font-bold' : 'hover:bg-[#f8f7f4] opacity-80'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-emerald-100 text-[#08733e]' : 'bg-gray-100 text-gray-600'}`}>
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{n.title}</h4>
                        <p className="text-xs text-gray-700 mt-1 font-medium leading-relaxed">{n.message}</p>
                      </div>
                      {isUnread && (
                        <span className="text-[10px] font-black uppercase text-[#08733e] bg-emerald-100 px-2.5 py-1 rounded-full shrink-0 border border-emerald-200">New</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">{n.created_at || n.received_at}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && notifications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-[#e5e5e5] text-center">
            <p className="text-xs text-[#666666] font-semibold">End of notification feed.</p>
          </div>
        )}

      </div>

    </div>
  );
}

export default OrganizerNotifications;
