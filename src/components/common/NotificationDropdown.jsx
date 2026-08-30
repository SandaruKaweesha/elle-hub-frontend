import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trophy, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function NotificationDropdown({ rolePath, isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/user/${userId}/notifications`);
      if (response.data && response.data.success !== false) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await api.put(`/user/${userId}/notifications/read-all`);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white opacity-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#e5e5e5] z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-['Poppins']" onClick={onClose}></div>
      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white opacity-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#e5e5e5] z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-['Poppins']">
        
        {/* Header */}
        <div className="p-3.5 px-4 bg-white border-b border-[#e5e5e5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#08733e]" />
            <h3 className="font-bold text-sm text-[#111111]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-[#eaf1ec] text-[#08733e] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#08733e]/20">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead} 
                className="text-xs text-[#08733e] font-semibold hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition-colors cursor-pointer"
              title="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <Bell size={32} className="mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-700">No Notifications Yet</p>
              <p className="text-[11px] text-gray-400">System alerts and tournament updates will appear here.</p>
            </div>
          ) : (
            notifications.slice(0, 8).map((notif, idx) => {
              const isUnread = Number(notif.is_read) === 0;
              return (
                <div 
                  key={notif.notification_id || idx}
                  onClick={() => {
                    handleSingleRead(notif.notification_id);
                    onClose();
                    navigate(`/${rolePath}/notifications`);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-[#eaf1ec]/30 hover:bg-[#eaf1ec]/60' : 'hover:bg-gray-50/80'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#eaf1ec] text-[#08733e] flex items-center justify-center shrink-0 mt-0.5 border border-[#08733e]/15">
                    <Trophy size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-1">
                      <p className={`text-xs ${isUnread ? 'font-bold text-[#111111]' : 'font-semibold text-gray-700'} leading-tight truncate`}>
                        {notif.title}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#08733e] shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#555555] mt-1 leading-snug line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                      {notif.created_at || notif.received_at || 'Recently'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 text-center border-t border-[#e5e5e5]">
          <button 
            onClick={() => { onClose(); navigate(`/${rolePath}/notifications`); }}
            className="text-xs font-bold text-[#00382D] hover:underline cursor-pointer"
          >
            View all notifications →
          </button>
        </div>

      </div>
    </>
  );
}