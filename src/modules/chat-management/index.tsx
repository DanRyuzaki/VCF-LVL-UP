"use client";

import { useState } from "react";
import { useOrganizerContext } from "@/lib/organizer-context";

export default function ChatManagementModule() {
  const { chatLeaders, setChatLeaders } = useOrganizerContext();

  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [chatText, setChatText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    const newMsg = {
      sender: "Organizer",
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatLeaders((prev) =>
      prev.map((leader, i) => {
        if (i !== activeChatIndex) return leader;
        return { ...leader, unread: 0, history: [...leader.history, newMsg] };
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
          if (i !== activeChatIndex) return leader;
          return { ...leader, history: [...leader.history, autoReply] };
        })
      );
    }, 1500);
  };

  const activeLeader = chatLeaders[activeChatIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Leader list */}
      <div className="dash-card p-4 space-y-2">
        <div className="dash-section-title">Team Leaders</div>
        {chatLeaders.map((leader, i) => (
          <button
            key={leader.name}
            onClick={() => setActiveChatIndex(i)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
              i === activeChatIndex
                ? "border-[#00F5D4] bg-[#00F5D4]/5"
                : "border-[var(--c-border)] hover:border-[var(--c-border-hover)]"
            }`}
          >
            <div>
              <div className="text-xs font-bold text-[var(--c-text)]">{leader.name}</div>
              <div className="text-[10px] text-[var(--c-text-muted)]">{leader.team}</div>
            </div>
            {leader.unread > 0 && (
              <span className="text-[9px] font-bold bg-[#FF4655] text-white px-1.5 py-0.5 rounded-full">
                {leader.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="md:col-span-2 dash-card p-4 flex flex-col h-[480px]">
        <div className="pb-3 mb-3 border-b border-[var(--c-border)]">
          <div className="text-xs font-bold text-[var(--c-text)]">{activeLeader.name}</div>
          <div className="text-[10px] text-[var(--c-text-muted)]">{activeLeader.team}</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeLeader.history.map((msg, i) => {
            const isOrganizer = msg.sender === "Organizer";
            return (
              <div
                key={i}
                className={`flex flex-col max-w-[75%] ${isOrganizer ? "ml-auto items-end" : "items-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-xs ${
                    isOrganizer
                      ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                      : "bg-[var(--c-surface2)] text-[var(--c-text)]"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-[9px] text-[var(--c-text-dim)] mt-1">
                  {msg.sender} · {msg.time}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 mt-3 pt-3 border-t border-[var(--c-border)]">
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Type a message..."
            className="dash-input flex-1"
          />
          <button
            type="submit"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
