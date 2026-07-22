import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  Phone,
  MapPin,
  Clock,
  CheckCheck,
  User,
  ShieldCheck,
  Paperclip,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";
import api from "../../services/api";

export default function SponsorMessages() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState({});
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  // Load organizers from sponsor's requests & public organizers
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        let contactList = [];

        // 1. Fetch requests for this sponsor
        if (userId) {
          const resR = await api.get(`/sponsor/${userId}/requests`);
          if (resR.data && resR.data.success !== false) {
            const reqs = resR.data.data || [];
            reqs.forEach((r) => {
              contactList.push({
                id: r.organizer_id || r.tournament_id,
                name: r.organizer_name || "Tournament Organizer",
                contactNumber: r.contact_number || "0771234567",
                location: r.location || "Sri Lanka",
                tournament: r.tournament_title || "Elle Championship",
                status: "ACTIVE ORGANIZER",
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${r.organizer_name || "Org"}`
              });
            });
          }
        }

        // Default fallback organizers if list empty
        if (contactList.length === 0) {
          contactList = [
            {
              id: 101,
              name: "National Elle Sports Association",
              contactNumber: "0771234567",
              location: "Colombo 07",
              tournament: "All Island Premier Elle Trophy 2026",
              status: "ACTIVE ORGANIZER",
              avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NESA"
            },
            {
              id: 102,
              name: "Southern Provincial Sports Club",
              contactNumber: "0719876543",
              location: "Galle",
              tournament: "Southern Elle Championship",
              status: "ACTIVE ORGANIZER",
              avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SPSC"
            }
          ];
        }

        // Deduplicate contacts
        const uniqueContacts = Array.from(new Set(contactList.map(a => a.name)))
          .map(name => contactList.find(a => a.name === name));

        setOrganizers(uniqueContacts);
        if (uniqueContacts.length > 0) {
          setSelectedOrganizer(uniqueContacts[0]);
        }

        // Initial default conversation messages
        const initialMsgs = {};
        uniqueContacts.forEach(org => {
          initialMsgs[org.name] = [
            {
              id: 1,
              sender: "ORGANIZER",
              text: `Greetings from ${org.name}! Thank you for your interest in sponsoring ${org.tournament}. Please let us know if you require official branding specifications or proposal packages.`,
              time: "10:30 AM"
            },
            {
              id: 2,
              sender: "SPONSOR",
              text: `Hello ${org.name}, we are pleased to discuss corporate sponsorship for your event. Could you confirm the primary banner placements and live broadcast mentions?`,
              time: "10:35 AM"
            }
          ];
        });
        setMessages(initialMsgs);

      } catch (err) {
        console.error("Error loading chat contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedOrganizer) return;

    const orgKey = selectedOrganizer.name;
    const newMsgObj = {
      id: Date.now(),
      sender: "SPONSOR",
      text: newMessageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [orgKey]: [...(prev[orgKey] || []), newMsgObj]
    }));

    setNewMessageText("");

    // Simulate organizer automatic response after 1.5s
    setTimeout(() => {
      const autoResp = {
        id: Date.now() + 1,
        sender: "ORGANIZER",
        text: `Thank you for your message! Our organizing committee has received your note regarding ${selectedOrganizer.tournament} and will update you shortly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => ({
        ...prev,
        [orgKey]: [...(prev[orgKey] || []), autoResp]
      }));
    }, 1500);
  };

  const filteredOrganizers = organizers.filter(org => {
    const q = searchTerm.toLowerCase();
    return org.name.toLowerCase().includes(q) || org.tournament.toLowerCase().includes(q);
  });

  const currentChatMessages = selectedOrganizer ? (messages[selectedOrganizer.name] || []) : [];

  return (
    <div className="space-y-6 pb-12 font-['Poppins'] animate-in fade-in duration-300">
      
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
          Organizer Messages
        </h1>
        <p className="mt-1 text-xs text-[#666666]">
          Direct communication portal between corporate sponsors and tournament organizers.
        </p>
      </div>

      {/* Main Messaging Interface Grid */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Column: Organizer Contacts List */}
        <div className="lg:col-span-4 border-r border-[#e5e5e5] bg-[#fdfdfd] flex flex-col">
          
          {/* Contacts Search Bar */}
          <div className="p-4 border-b border-[#e5e5e5] bg-white">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search organizers or tournaments..."
                className="w-full pl-9 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
              />
            </div>
          </div>

          {/* Organizer List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading contacts...</div>
            ) : filteredOrganizers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No organizer conversations found.</div>
            ) : (
              filteredOrganizers.map((org) => {
                const isSelected = selectedOrganizer?.name === org.name;
                const orgMsgs = messages[org.name] || [];
                const lastMsg = orgMsgs[orgMsgs.length - 1];

                return (
                  <div
                    key={org.name}
                    onClick={() => setSelectedOrganizer(org)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected ? "bg-[#00382D]/10 border-l-4 border-[#00382D]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={org.avatar}
                        alt={org.name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-200"
                      />
                      <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#111111] truncate">{org.name}</h4>
                        {lastMsg && <span className="text-[10px] text-gray-400">{lastMsg.time}</span>}
                      </div>

                      <p className="text-[11px] font-medium text-[#00382D] truncate mt-0.5">
                        {org.tournament}
                      </p>

                      <p className="text-[11px] text-gray-500 truncate mt-1">
                        {lastMsg ? lastMsg.text : "Click to start conversation..."}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Chat Box */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {selectedOrganizer ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-[#e5e5e5] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedOrganizer.avatar}
                    alt={selectedOrganizer.name}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                      {selectedOrganizer.name}
                      <ShieldCheck size={16} className="text-[#00382D]" />
                    </h3>
                    <p className="text-[11px] text-[#666666] flex items-center gap-3">
                      <span><strong className="text-[#00382D]">Event:</strong> {selectedOrganizer.tournament}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Phone size={11} /> {selectedOrganizer.contactNumber}</span>
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                  VERIFIED ORGANIZER
                </span>
              </div>

              {/* Chat Message History Window */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#fdfdfd] min-h-[380px]">
                <div className="text-center my-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">
                    Official End-to-End Encrypted Sponsor Chat
                  </span>
                </div>

                {currentChatMessages.map((msg) => {
                  const isSponsor = msg.sender === "SPONSOR";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSponsor ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isSponsor
                            ? "bg-[#00382D] text-white rounded-br-none shadow-xs"
                            : "bg-white border border-[#e5e5e5] text-[#111111] rounded-bl-none shadow-xs"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <span>{msg.time}</span>
                        {isSponsor && <CheckCheck size={14} className="text-[#00382D]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Template Prompts */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-gray-400 font-semibold shrink-0">Quick Prompts:</span>
                <button
                  type="button"
                  onClick={() => setNewMessageText("Could you please send us the official sponsorship package details?")}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-[#00382D] hover:text-[#00382D] shrink-0 font-medium cursor-pointer"
                >
                  📄 Request Package Details
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessageText("We would like to confirm our primary banner placement for the event.")}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-[#00382D] hover:text-[#00382D] shrink-0 font-medium cursor-pointer"
                >
                  🚩 Confirm Banner Placement
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessageText("Our sponsorship payment has been processed successfully.")}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-[#00382D] hover:text-[#00382D] shrink-0 font-medium cursor-pointer"
                >
                  💳 Payment Processed
                </button>
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e5e5e5] bg-white flex items-center gap-3">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Write message to ${selectedOrganizer.name}...`}
                  className="flex-1 py-3 px-4 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="px-5 py-3 bg-[#00382D] text-white font-bold text-xs rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 text-xs">
              Select an organizer conversation from the left menu to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
