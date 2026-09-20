import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  Phone,
  Mail,
  Clock,
  CheckCheck,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  Lock,
  X
} from "lucide-react";
import api from "../../services/api";

export default function SponsorMessages() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;
  const userRole = (currentUser.role || "").toString().trim().toUpperCase();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch contacts list (Organizers for Sponsor)
  const fetchContacts = async (silent = false) => {
    if (!userId) return;
    try {
      if (!silent) setLoadingContacts(true);
      const res = await api.get(`/messages/contacts/${userId}`);
      if (res.data && res.data.success !== false) {
        const list = res.data.data || [];
        const sortedList = list.sort((a, b) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          if (timeA === timeB) return (a.display_name || '').localeCompare(b.display_name || '');
          return timeB - timeA;
        });
        setContacts(sortedList);

        // Update selected contact data if active, but do NOT auto-select if user closed chat
        if (selectedContact) {
          const updated = sortedList.find(c => c.user_id === selectedContact.user_id);
          if (updated) setSelectedContact(updated);
        }
      } else {
        if (!silent) setError(res.data.message || "Failed to load contacts.");
      }
    } catch (err) {
      console.error("Fetch contacts error:", err);
      if (!silent) setError(err.response?.data?.message || "Could not load messaging contacts.");
    } finally {
      if (!silent) setLoadingContacts(false);
    }
  };

  // 2. Fetch conversation for selected contact
  const fetchConversation = async (contactId, silent = false) => {
    if (!userId || !contactId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await api.get(`/messages/conversation/${userId}/${contactId}`);
      if (res.data && res.data.success !== false) {
        setMessages(res.data.data || []);
      } else {
        if (!silent) setError(res.data.message || "Failed to load conversation.");
      }
    } catch (err) {
      console.error("Fetch conversation error:", err);
      if (!silent) setError(err.response?.data?.message || "Could not load conversation messages.");
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchContacts();
  }, [userId]);

  // Load conversation when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact.user_id);
    } else {
      setMessages([]);
    }
  }, [selectedContact?.user_id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (selectedContact && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, selectedContact]);

  // Fast & Silent real-time polling every 1.5 seconds (1500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchContacts(true);
      if (selectedContact) {
        fetchConversation(selectedContact.user_id, true);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [userId, selectedContact]);

  // 3. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedContact || isSending) return;

    const content = newMessageText.trim();
    setNewMessageText("");
    setIsSending(true);

    try {
      const res = await api.post("/messages/send", {
        senderId: userId,
        receiverId: selectedContact.user_id,
        message: content
      });

      if (res.data && res.data.success !== false) {
        fetchConversation(selectedContact.user_id, true);
        fetchContacts(true);
      } else {
        setError(res.data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.response?.data?.message || "Error sending message.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-140px)] animate-in fade-in duration-300 font-['Poppins']">
      
      {/* Page Title Bar */}
      <div className="p-6 border-b border-[#e5e5e5] bg-[#fdfdfc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
            <MessageSquare className="text-[#00382D]" size={22} />
            Organizer Communications
          </h2>
          <p className="text-[#666666] text-xs mt-1">Private 1-on-1 messaging channel with Tournament Organizers.</p>
        </div>

        <button 
          onClick={() => {
            fetchContacts();
            if (selectedContact) fetchConversation(selectedContact.user_id);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#00382D] bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] rounded-xl transition-colors shrink-0 w-fit cursor-pointer"
        >
          <RefreshCw size={14} className={loadingContacts ? "animate-spin" : ""} />
          Refresh Messages
        </button>
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
          <button onClick={() => setError(null)} className="text-red-500 font-bold hover:text-red-700">Dismiss</button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        
        {/* Left Panel: Contacts List */}
        <div className="lg:col-span-4 border-r border-[#e5e5e5] flex flex-col bg-[#fbfbfa]">
          
          {/* Search Box */}
          <div className="p-4 border-b border-[#e5e5e5] bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#00382D]"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingContacts && contacts.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">Loading organizer directory...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-medium px-4">No organizer messaging channels found.</div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.user_id === contact.user_id;
                return (
                  <div
                    key={contact.user_id}
                    onClick={() => {
                      setSelectedContact(contact);
                      fetchConversation(contact.user_id);
                    }}
                    className={`p-4 flex items-center gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#eaf1ec] border-l-4 border-[#00382D]"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#e5e5e5] overflow-hidden shadow-2xs">
                        <img
                          src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.display_name}`}
                          alt={contact.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {contact.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? "text-[#00382D]" : "text-[#111111]"}`}>
                          {contact.display_name}
                        </h4>
                        {contact.last_message_time && (
                          <span className="text-[10px] font-medium text-[#888888] shrink-0">
                            {new Date(contact.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#666666] truncate font-medium">
                        {contact.last_message}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                        <ShieldCheck size={12} className="text-[#00382D]" />
                        <span>Verified Organizer</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Conversation */}
        <div className="lg:col-span-8 flex flex-col bg-white min-h-[400px]">
          {selectedContact ? (
            <>
              {/* Active Header with Close Chat Button */}
              <div className="p-4 border-b border-[#e5e5e5] bg-[#fdfdfc] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#e5e5e5] overflow-hidden shadow-2xs shrink-0">
                    <img
                      src={selectedContact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.display_name}`}
                      alt={selectedContact.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#111111] truncate">{selectedContact.display_name}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-[#666666] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold shrink-0">
                        <ShieldCheck size={12} /> Tournament Organizer
                      </span>
                      {selectedContact.contact_number && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Phone size={12} className="text-[#00382D]" /> {selectedContact.contact_number}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden md:inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Official Communication Channel
                  </span>
                  
                  {/* Close Active Chat Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContact(null);
                      setMessages([]);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-gray-200 hover:border-red-200 shadow-2xs"
                    title="Close current chat tab"
                  >
                    <X size={16} />
                    <span className="hidden sm:inline">Close Chat</span>
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fbfbfa] max-h-[500px]">
                {loadingMessages && messages.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-[#666666] font-medium">Loading conversation history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-8 max-w-md mx-auto my-12">
                    <Sparkles size={40} className="mx-auto text-[#00382D] mb-3 opacity-60" />
                    <h4 className="text-sm font-bold text-[#111111]">Start Sponsorship Discussion</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      Send a message to <strong>{selectedContact.display_name}</strong> regarding tournament sponsorships, branding requests, or proposal packages.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = Number(msg.sender_user_id) === Number(userId);
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-[#00382D] text-white rounded-br-none"
                              : "bg-white border border-[#e5e5e5] text-[#111111] rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#888888] px-1 font-medium">
                          <span>
                            {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {isMe && (
                            <CheckCheck size={12} className={msg.is_read ? "text-emerald-500" : "text-gray-400"} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e5e5e5] bg-white flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Type a message to ${selectedContact.display_name}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-2xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isSending}
                  className="px-5 py-3 bg-[#00382D] text-white text-xs font-bold rounded-2xl hover:bg-[#002a22] transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Empty Placeholder State when Chat is Closed / Deselected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fbfbfa] my-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#eaf1ec] text-[#00382D] flex items-center justify-center mb-4 border border-[#c4e3d7]">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-base font-bold text-[#111111]">No Conversation Selected</h3>
              <p className="text-xs text-[#666666] max-w-sm mt-1 leading-relaxed">
                Click on any organizer from the left sidebar to open the chat window, or click <span className="font-bold text-[#00382D]">Close Chat</span> to leave the active view.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}