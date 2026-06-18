"use client";
import { useState, useEffect, useRef } from "react";
import { IconSearch } from "@/components/shared/icons";

interface ChatUser {
  id: string;
  name: string;
  role: "Admin" | "Developer";
  status: "online" | "offline";
  lastActive: string;
  avatarColor: string;
}

interface CommunicationMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string; // ISO String
  status: "sent" | "delivered" | "read" | "unread";
}

const chatUsers: ChatUser[] = [
  { id: "adm_maria", name: "Maria Santos", role: "Admin", status: "online", lastActive: "Active now", avatarColor: "#FF4655" },
  { id: "adm_ana", name: "Ana Reyes", role: "Admin", status: "offline", lastActive: "2 hours ago", avatarColor: "#EC4899" },
  { id: "adm_marco", name: "Marco Torres", role: "Admin", status: "online", lastActive: "5 mins ago", avatarColor: "#F59E0B" },
  { id: "adm_luis", name: "Luis Fernandez", role: "Admin", status: "offline", lastActive: "1 day ago", avatarColor: "#10B981" },
  { id: "adm_rizal", name: "Rizal Mendoza", role: "Admin", status: "online", lastActive: "15 mins ago", avatarColor: "#3B82F6" },
  { id: "dev_john", name: "John Smith", role: "Developer", status: "online", lastActive: "Active now", avatarColor: "#8B5CF6" },
  { id: "dev_dan", name: "Dan Ryuzaki", role: "Developer", status: "online", lastActive: "Active now", avatarColor: "#10B981" },
  { id: "dev_andrea", name: "Andrea Deng", role: "Developer", status: "offline", lastActive: "3 hours ago", avatarColor: "#EC4899" },
  { id: "dev_kevin", name: "Kevin Bautista", role: "Developer", status: "online", lastActive: "10 mins ago", avatarColor: "#F59E0B" }
];

const defaultMessages: CommunicationMessage[] = [
  {
    id: "msg_1",
    senderId: "dev_john",
    receiverId: "adm_maria",
    text: "Hi Maria, I saw a database timeout error in the logs. Did you experience any slowness in User Management?",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "read"
  },
  {
    id: "msg_2",
    senderId: "adm_maria",
    receiverId: "dev_john",
    text: "Yes, John! Some actions took about 3 seconds to respond around 2:00 PM.",
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    status: "read"
  },
  {
    id: "msg_3",
    senderId: "dev_john",
    receiverId: "adm_maria",
    text: "Got it. I will optimize the query indexes and database connections.",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: "read"
  },
  {
    id: "msg_4",
    senderId: "adm_rizal",
    receiverId: "dev_dan",
    text: "Can you please inspect the system activity log? I deleted a duplicate user but don't see it in reports.",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: "unread"
  },
  {
    id: "msg_5",
    senderId: "dev_dan",
    receiverId: "dev_john",
    text: "Hey John, did you look at the new Archived section layout?",
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    status: "unread"
  },
  {
    id: "msg_6",
    senderId: "dev_kevin",
    receiverId: "dev_dan",
    text: "Hey Dan, the staging database backup has completed successfully.",
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    status: "read"
  }
];

interface Props {
  context: "admin" | "developer";
}

export default function CommunicationModule({ context }: Props) {
  const isDev = context === "developer";
  const currentUser = isDev
    ? chatUsers.find((u) => u.id === "dev_dan")!
    : chatUsers.find((u) => u.id === "adm_maria")!;

  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vcf_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages(defaultMessages);
      }
    } else {
      setMessages(defaultMessages);
    }
    setIsLoaded(true);
  }, []);

  // Centralized localStorage Sync & Badge Update
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("vcf_chat_messages", JSON.stringify(messages));

    // Update unread count badges in Sidebar & LocalStorage
    const unreadMap = new Set<string>();
    messages.forEach((m) => {
      if (m.receiverId === currentUser.id && m.status === "unread") {
        unreadMap.add(m.senderId);
      }
    });

    localStorage.setItem("vcf_unread_communication_count", String(unreadMap.size));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("vcf-unread-chat-update"));
  }, [messages, isLoaded, currentUser.id]);

  // Mark messages as read when active user changes
  useEffect(() => {
    if (!activeUserId || !isLoaded) return;
    
    setMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (m.senderId === activeUserId && m.receiverId === currentUser.id && m.status === "unread") {
          changed = true;
          return { ...m, status: "read" as const };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, [activeUserId, isLoaded, currentUser.id]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeUserId, messages]);

  // Directory filter rules
  const directoryUsers = chatUsers.filter((u) => {
    if (u.id === currentUser.id) return false; // exclude self
    if (isDev) {
      // Developer can chat with Admins and Developers
      return u.role === "Admin" || u.role === "Developer";
    } else {
      // Admin can chat with Developers only
      return u.role === "Developer";
    }
  });

  // Search logic
  const getConversationMessages = (uid1: string, uid2: string) => {
    return messages.filter(
      (m) =>
        (m.senderId === uid1 && m.receiverId === uid2) ||
        (m.senderId === uid2 && m.receiverId === uid1)
    );
  };

  const filteredUsers = directoryUsers.filter((u) => {
    const nameMatch = u.name.toLowerCase().includes(search.toLowerCase());
    
    // Search in conversations
    const userMsgs = getConversationMessages(currentUser.id, u.id);
    const msgMatch = userMsgs.some((m) => {
      const textMatch = m.text.toLowerCase().includes(search.toLowerCase());
      const dateString = new Date(m.timestamp)
        .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        .toLowerCase();
      const dateMatch = dateString.includes(search.toLowerCase()) || m.timestamp.includes(search);
      return textMatch || dateMatch;
    });

    return nameMatch || msgMatch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUserId) return;

    const newMsg: CommunicationMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: activeUserId,
      text: inputText,
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate standard messaging system statuses ("Sent" -> "Delivered" -> "Read" on click)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: "delivered" as const } : m
        )
      );
    }, 1500);
  };

  // Chat target stats
  const activeUser = chatUsers.find((u) => u.id === activeUserId);
  const activeConversation = activeUserId ? getConversationMessages(currentUser.id, activeUserId) : [];

  const formatMsgTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return "";
    }
  };

  const getUnreadIndicator = (userId: string) => {
    const count = messages.filter(
      (m) => m.senderId === userId && m.receiverId === currentUser.id && m.status === "unread"
    ).length;
    return count;
  };

  const renderStatus = (status: "sent" | "delivered" | "read" | "unread") => {
    if (status === "read") {
      return <span style={{ color: "#00F5D4", fontSize: "11px", fontWeight: "bold" }}>✓✓ Read</span>;
    }
    if (status === "delivered") {
      return <span style={{ color: "var(--c-text-dim)", fontSize: "11px" }}>✓✓ Delivered</span>;
    }
    if (status === "sent") {
      return <span style={{ color: "var(--c-text-dim)", fontSize: "11px" }}>✓ Sent</span>;
    }
    return null;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "20px",
        height: "calc(100vh - 220px)",
        minHeight: "480px",
        backgroundColor: "rgba(20, 20, 20, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(12px)"
      }}
    >
      {/* LEFT PANEL: Directory & Search */}
      <div
        style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(10, 10, 10, 0.3)",
          height: "100%",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--c-accent)",
              marginBottom: "12px"
            }}
          >
            {isDev ? "User Directory" : "Developer Directory"}
          </h3>
          <div className="relative">
            <IconSearch
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--c-text-dim)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats, text, date..."
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "12px",
                height: "36px",
                fontSize: "12px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "var(--c-text)",
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--c-text-dim)" }}>
              No active contacts found.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const active = u.id === activeUserId;
              const unreadCount = getUnreadIndicator(u.id);
              const userMsgs = getConversationMessages(currentUser.id, u.id);
              const lastMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;

              return (
                <div
                  key={u.id}
                  onClick={() => setActiveUserId(u.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: active ? "rgba(255, 70, 85, 0.08)" : "transparent",
                    border: active ? "1px solid rgba(255, 70, 85, 0.15)" : "1px solid transparent",
                    transition: "all 0.15s ease",
                    marginBottom: "4px"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Avatar Icon */}
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: u.avatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "12px",
                        color: "#FFFFFF",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                      }}
                    >
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {/* Status dot */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        border: "2px solid #1A1A1A",
                        backgroundColor: u.status === "online" ? "#00F5D4" : "#6B7280"
                      }}
                    />
                  </div>

                  {/* Body Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>{u.name}</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: u.role === "Admin" ? "rgba(255,70,85,0.15)" : "rgba(139,92,246,0.15)",
                          color: u.role === "Admin" ? "#FF4655" : "#8B5CF6"
                        }}
                      >
                        {u.role}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--c-text-dim)", marginTop: "2px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                        {lastMsg ? lastMsg.text : u.lastActive}
                      </span>
                      {lastMsg && <span>{formatMsgTime(lastMsg.timestamp)}</span>}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {unreadCount > 0 && (
                    <div
                      style={{
                        backgroundColor: "#FF4655",
                        color: "#FFFFFF",
                        fontSize: "9px",
                        fontWeight: "bold",
                        borderRadius: "10px",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px"
                      }}
                    >
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Chat Conversation */}
      <div style={{ display: "flex", flexDirection: "column", backgroundColor: "rgba(0, 0, 0, 0.15)", height: "100%", overflow: "hidden" }}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "rgba(10, 10, 10, 0.2)"
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: activeUser.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#FFFFFF"
                }}
              >
                {activeUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{activeUser.name}</h4>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: activeUser.role === "Admin" ? "rgba(255,70,85,0.15)" : "rgba(139,92,246,0.15)",
                      color: activeUser.role === "Admin" ? "#FF4655" : "#8B5CF6"
                    }}
                  >
                    {activeUser.role}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--c-text-dim)" }}>
                  {activeUser.status === "online" ? (
                    <span style={{ color: "#00F5D4", fontWeight: "bold" }}>● Online</span>
                  ) : (
                    <span>Last active: {activeUser.lastActive}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Messages */}
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeConversation.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "var(--c-text-dim)" }}>
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                activeConversation.map((msg) => {
                  const fromMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: fromMe ? "flex-end" : "flex-start",
                        marginBottom: "4px"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          borderTopRightRadius: fromMe ? "2px" : "12px",
                          borderTopLeftRadius: fromMe ? "12px" : "2px",
                          backgroundColor: fromMe ? "rgba(255, 70, 85, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          border: fromMe ? "1px solid rgba(255, 70, 85, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                          color: "#FFFFFF",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                        }}
                      >
                        <div style={{ fontSize: "13px", lineHeight: 1.4, wordBreak: "break-word" }}>{msg.text}</div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "10px",
                            color: "var(--c-text-dim)",
                            marginTop: "4px",
                            textAlign: "right"
                          }}
                        >
                          <span>{formatMsgTime(msg.timestamp)}</span>
                          {fromMe && renderStatus(msg.status)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                gap: "10px",
                backgroundColor: "rgba(10, 10, 10, 0.2)"
              }}
            >
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a message to ${activeUser.name}...`}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: "13px",
                  backgroundColor: "rgba(0,0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "var(--c-accent)",
                  color: "#FFFFFF",
                  padding: "0 20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent)")}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
            {/* Large Chat Bubble Icon */}
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "16px" }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h4 style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 600, marginBottom: "6px" }}>Select a Contact</h4>
            <p style={{ fontSize: "12px", color: "var(--c-text-dim)", maxWidth: "280px", margin: 0 }}>
              Choose a contact from the directory list on the left to view conversation history and send direct messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
