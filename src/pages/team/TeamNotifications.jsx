import React, { useState, useEffect } from 'react';
import { Trophy, Bell, Settings, CheckCircle2, ChevronRight, Filter, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function TeamNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Using tournaments as mock notifications based on the current implementation
        const response = await api.get('/tournaments');
        if (response.data.success) {
          const tournaments = response.data.data.slice(0, 5);
          
          const formatted = tournaments.map((t, index) => ({
            id: t.tournament_id || index,
            title: `New tournament ${t.title} was added to the portal.`,
            type: 'tournament',
            date: t.created_at || 'Recently Added',
            isRead: index > 1,
            link: `/tournaments/${t.tournament_id || t.id}`,
          }));
          
          // Add some mock team-specific notifications
          formatted.push({
            id: 'n1',
            title: 'Roster Updated: Marcus V. has been added to the starting lineup.',
            type: 'team',
            date: '2 hours ago',
            isRead: false,
            link: '/team/settings',
          });
          
          formatted.push({
            id: 'n2',
            title: 'Match Confirmed: Zenith Titans match scheduled on North Field.',
            type: 'match',
            date: '5 hours ago',
            isRead: true,
            link: '/team',
          });

          // Sort so unread is on top
          formatted.sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
          
          setNotifications(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'tournament': return <Trophy size={18} className="text-[#08733e]" />;
      case 'team': return <Bell size={18} className="text-blue-600" />;
      case 'match': return <CheckCircle2 size={18} className="text-purple-600" />;
      default: return <Bell size={18} className="text-gray-600" />;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'tournament': return 'bg-[#eaf1ec]';
      case 'team': return 'bg-blue-100';
      case 'match': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-['Poppins']">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-3xl font-bold text-[#111111] tracking-tight">Notifications</h1>
          <p className="text-[#666666] text-sm md:text-base mt-1">Stay updated on tournaments, matches, and team alerts.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center p-2 border border-[#e5e5e5] rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter size={20} />
          </button>
          <button className="flex items-center justify-center p-2 border border-[#e5e5e5] rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={markAllAsRead} className="flex items-center gap-2 text-[#08733e] text-sm font-bold bg-[#98F5E1]/30 hover:bg-[#98F5E1]/60 border border-[#98F5E1] px-4 py-2 rounded-lg transition-colors">
            <CheckCircle2 size={18} /> Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        
        <div className="flex items-center gap-6 border-b border-[#e5e5e5] px-6 pt-4 bg-gray-50/50">
           <button className="text-sm font-bold text-[#111111] border-b-2 border-[#111111] pb-3 px-1">All Notifications</button>
           <button className="text-sm font-semibold text-[#666666] hover:text-[#111111] pb-3 px-1 border-b-2 border-transparent transition-colors">Unread ({notifications.filter(n => !n.isRead).length})</button>
        </div>

        <div className="flex-1 divide-y divide-[#f0f0f0]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <div className="w-8 h-8 border-4 border-[#e5e5e5] border-t-[#08733e] rounded-full animate-spin mb-4"></div>
               <p className="text-sm font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-1">No notifications yet</h3>
              <p className="text-sm text-[#666666]">When you receive updates, they'll show up here.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                className={`w-full text-left p-4 md:p-6 transition-colors flex gap-4 ${
                  notification.isRead 
                    ? 'hover:bg-[#f8f7f4] opacity-80' 
                    : 'bg-[#98F5E1]/10 hover:bg-[#98F5E1]/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <p className={`text-[15px] leading-relaxed pr-4 ${notification.isRead ? 'text-[#444444] font-medium' : 'text-[#111111] font-bold'}`}
                       dangerouslySetInnerHTML={{__html: notification.title.replace(/(New tournament) (.*?) (was added)/, '$1 <span class="font-black text-[#002c21]">$2</span> $3')}}>
                    </p>
                    {!notification.isRead && (
                      <span className="text-[10px] font-bold text-[#08733e] bg-[#98F5E1] px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider">New</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-[#888888]">{notification.date}</span>
                    <span className="text-[#e5e5e5]">•</span>
                    <span className="text-xs font-semibold text-[#08733e] hover:underline flex items-center">
                      View details <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {!loading && notifications.length > 0 && (
          <div className="p-5 bg-gray-50 border-t border-[#e5e5e5] text-center">
            <p className="text-sm font-semibold text-[#666666]">You have reached the end of your notifications.</p>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] p-6 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${getIconBg(selectedNotification.type)} rounded-full flex items-center justify-center shrink-0 border border-black/5`}>
                  {getIcon(selectedNotification.type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111111] leading-tight capitalize">{selectedNotification.type} Alert</h3>
                  <p className="text-xs font-semibold text-[#666666] mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded-md">{selectedNotification.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-[#f8f7f4] rounded-xl p-5 mb-8 border border-[#e5e5e5]">
              <p className="text-[#333333] leading-relaxed text-[15px]" dangerouslySetInnerHTML={{__html: selectedNotification.title.replace(/(New tournament) (.*?) (was added)/, '$1 <span class="font-black text-[#111111]">$2</span> $3')}}></p>
              
              {selectedNotification.type === 'tournament' && (
                <p className="text-[#666666] mt-3 text-sm border-t border-[#e5e5e5] pt-3">
                  Registration is now open. Assemble your team and don't miss the chance to participate and win amazing prizes!
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-3 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-bold text-[#333333] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedNotification.link && (
                <button 
                  onClick={() => {
                    const link = selectedNotification.link;
                    setSelectedNotification(null);
                    navigate(link);
                  }}
                  className="flex-1 py-3 px-4 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  View Details <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TeamNotifications;
