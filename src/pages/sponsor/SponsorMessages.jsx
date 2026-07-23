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
  Info
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

  // 1. Fetch contacts list
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

        // Auto select first contact if none selected
        if (sortedList.length > 0 && !selectedContact) {
          setSelectedContact(sortedList[0]);
        } else if (selectedContact) {
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
    }
  }, [selectedContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchContacts(true);
      if (selectedContact) {
        fetchConversation(selectedContact.user_id, true);
      }
    }, 4000);
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
        // Refresh conversation & contacts list
        fetchConversation(selectedContact.user_id, true);
        fetchContacts(true);
      } else {
        setError(res.data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.response?.data?.message || "An error occurred while sending your message.");
    } finally {
      setIsSending(false);
    }
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter((c) =>
    (c.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.organization_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00382D]/10 text-[#00382D] p-2 rounded-xl">
              <MessageSquare size={24} />
            </span>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Direct Communications</h1>
          </div>
          <p className="text-[#666666] text-sm mt-1">
            Private 1-on-1 messaging channel between Sponsors and Tournament Organizers.
          </p>
        </div>

        <button
          onClick={() => { fetchContacts(); if (selectedContact) fetchConversation(selectedContact.user_id); }}
          className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-xs font-bold text-[#333333] hover:bg-gray-50 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RefreshCw size={14} className={loadingContacts ? "animate-spin text-[#00382D]" : "text-[#00382D]"} />
          Refresh Messages
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Main Messaging Layout */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] h-[calc(100vh-250px)]">
        
        {/* Left Panel: Contact List */}
        <div className="lg:col-span-4 border-r border-[#e5e5e5] flex flex-col bg-[#fcfbf9]">
          
          {/* Search Box */}
          <div className="p-4 border-b border-[#e5e5e5]">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e5e5] rounded-2xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D] transition-colors"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0efeb]">
            {loadingContacts ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-[#666666] font-medium">Loading organizers...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Building2 size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-[#555555]">No Organizers Found</p>
                <p className="text-[11px] text-[#888888] mt-1">Organizers will appear here when registered on the platform.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.user_id === contact.user_id;
                return (
                  <div
                    key={contact.user_id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[#00382D]/10 border-l-4 border-[#00382D]"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#e5e5e5] overflow-hidden shadow-2xs flex items-center justify-center">
                        <img
                          src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.display_name}`}
                          alt={contact.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {contact.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
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
        <div className="lg:col-span-8 flex flex-col bg-white">
          {selectedContact ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-[#e5e5e5] bg-[#fdfdfc] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#e5e5e5] overflow-hidden shadow-2xs">
                    <img
                      src={selectedContact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.display_name}`}
                      alt={selectedContact.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111111]">{selectedContact.display_name}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-[#666666] mt-0.5">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <ShieldCheck size={12} /> Tournament Organizer
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-[#00382D]" /> {selectedContact.contact_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Official Communication Channel
                  </span>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fbfbfa]">
                {loadingMessages ? (
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fbfbfa]">
              <MessageSquare size={56} className="text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-[#111111]">Select a Tournament Organizer</h3>
              <p className="text-xs text-[#666666] max-w-sm mt-1">
                Choose an organizer from the list on the left to start or view sponsorship messages.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
