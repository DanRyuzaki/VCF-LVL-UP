"use client";
import { useState } from "react";

interface ChatLeader {
  name: string;
  team: string;
  unread: number;
  history: Array<{ sender: string; text: string; time: string }>;
}

interface ChatManagementModuleProps {
  // Chat leaders data and setter
  chatLeaders: ChatLeader[];
  setChatLeaders: React.Dispatch<React.SetStateAction<ChatLeader[]>>;
}

export default function ChatManagementModule({
  chatLeaders,
  setChatLeaders,
}: ChatManagementModuleProps) {
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [chatText, setChatText] = useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    const newMsg = {
      sender: "Organizer",
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatLeaders((prev) =>
      prev.map((leader, i) => {
        if (i === activeChatIndex) {
          return {
            ...leader,
            unread: 0,
            history: [...leader.history, newMsg],
          };
        }
        return leader;
      })
    );

    setChatText("");

    setTimeout(() => {
      const autoReply = {
        sender: chatLeaders[activeChatIndex].name,
        text: "Got it! Thanks for reaching out, I will coordinate this with the team.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatLeaders((prev) =>
        prev.map((leader, i) => {
          if (i === activeChatIndex) {
            return {
              ...leader,
              history: [...leader.history, autoReply],
            };
          }
          return leader;
        })
      );
    }, 1500);
  };

  const currentChat = chatLeaders[activeChatIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="dash-card p-4 space-y-2">
        <div className="dash-section-title px-1">Team Leaders</div>
        <div className="space-y-1">
          {chatLeaders.map((l, index) => (
            <button
              key={l.name}
              onClick={() => {
                setActiveChatIndex(index);
                setChatLeaders((prev) =>
                  prev.map((leader, i) => (i === index ? { ...leader, unread: 0 } : leader))
                );
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
              style={{
                backgroundColor: activeChatIndex === index ? "rgba(139, 92, 246, 0.1)" : "var(--c-surface2)",
                border: activeChatIndex === index ? "1px solid #8B5CF6" : "1px solid var(--c-border)",
              }}
            >
              <div>
                <div className="text-xs font-bold text-[var(--c-text)]">{l.name}</div>
                <div className="text-[10px] text-[var(--c-text-dim)]">{l.team}</div>
              </div>
              {l.unread > 0 && (
                <span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 dash-card p-5 flex flex-col h-[500px]">
        <div className="dash-section-title pb-3 border-b border-[var(--c-border)]">
          Chat with {currentChat.name} ({currentChat.team})
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
          {currentChat.history.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === "Organizer" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--c-text-dim)]">
                  {msg.sender}
                </span>
                <span className="text-[8px] text-[var(--c-text-muted)]">{msg.time}</span>
              </div>
              <div
                className="px-4 py-2 rounded-lg text-xs max-w-sm"
                style={{
                  backgroundColor: msg.sender === "Organizer" ? "rgba(139, 92, 246, 0.1)" : "var(--c-surface3)",
                  border: msg.sender === "Organizer" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid var(--c-border)",
                  color: "var(--c-text)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendChatMessage} className="flex gap-2">
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={`Send message to ${currentChat.name}...`}
            className="dash-input flex-1"
          />
          <button
            type="submit"
            className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}