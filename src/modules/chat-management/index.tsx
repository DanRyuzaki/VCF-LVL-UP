"use client";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocFromServer,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderRole: string;
  senderTeam?: string;   // team name for gamer/team-leader senders
  context: string;
  createdAt?: unknown;
  timestamp?: number;
}

export default function ChatManagementModule() {
  const { profile, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [senderTeam, setSenderTeam] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Guard ─────────────────────────────────────────────────────────────────
  // This is the shared organizer ↔ team-leader channel: organizers, and
  // gamer accounts whose gamerType is "team_leader" (regular team members
  // and free agents are excluded — this channel is leader-only by design).
  const allowed =
    profile?.role === "organizer" ||
    (profile?.role === "gamer" && profile?.gamerType === "team_leader");

  // ── Resolve team name for gamer senders ──────────────────────────────────
  // The team name is stored on the teams doc (profile.teamId → teams/{id}.name).
  // We fetch it once and attach it to every outgoing message so other
  // participants can see which team each leader represents in the chat bubble.
  useEffect(() => {
    if (!profile?.teamId || profile?.role !== "gamer") return;
    getDoc(doc(db, "teams", profile.teamId))
      .then((snap) => { if (snap.exists()) setSenderTeam(snap.data().name ?? ""); })
      .catch(() => {}); // non-fatal — falls back to empty string
  }, [profile?.teamId, profile?.role]);

  // ── Firestore listener — organizer context channel ────────────────────────
  // Wait for authLoading to finish before setting up the listener. Without
  // this guard, the effect can run once while authLoading=true / allowed is
  // still false (profile hasn't resolved yet), exit early, and never
  // re-subscribe once profile resolves on a fast reconnect — leaving the
  // chat stuck until a manual reload.
  useEffect(() => {
    if (authLoading || !allowed) return;

    const q = query(
      collection(db, "chats"),
      where("context", "==", "organizer"),
      // Sort by the client-side epoch `timestamp`, not the server-resolved
      // `createdAt`. serverTimestamp() is null on the sender's own client
      // until the write round-trips back from Firestore, so an
      // orderBy("createdAt") query temporarily excludes the just-sent
      // message from the snapshot results — it looks like the message
      // vanished, and only reappears after a reload (once createdAt has
      // resolved). `timestamp: Date.now()` is set synchronously before
      // addDoc returns, so it's always present immediately for everyone.
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessage, "id">),
          }))
        );
        setLoading(false);
        setLoadError(null);
      },
      (err) => {
        console.error("chat snapshot error:", err);
        setLoadError("Couldn't load messages. Try refreshing the page.");
        setLoading(false);
      }
    );

    return unsub;
  }, [authLoading, allowed]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !profile) return;
    setSending(true);
    setSendError(null);
    try {
      const ref = await addDoc(collection(db, "chats"), {
        text: text.trim(),
        senderUid: profile.uid,
        senderName: `${profile.firstName} ${profile.lastName}`,
        senderRole: profile.role,
        ...(senderTeam ? { senderTeam } : {}),
        context: "organizer",
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
      });

      // addDoc() resolves on local optimistic-cache acceptance, not server
      // confirmation. If a security rule rejects the write, the SDK rolls
      // the local copy back silently and this catch never fires — which
      // looks exactly like "I sent it and it vanished," and only for your
      // own messages (others' messages only ever arrive via the server's
      // authoritative push, so they can't go through this rollback path).
      // Forcing a server read turns a silent rollback into a real error.
      await getDocFromServer(ref);

      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setSendError(
        "Failed to send message. This may be a permissions issue — please contact your developer."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Access denied. This channel is for organizers and team leaders only.
      </div>
    );
  }

  const formatTime = (msg: ChatMessage) => {
    try {
      const ts = msg.createdAt as { toDate?: () => Date };
      const d = ts?.toDate ? ts.toDate() : new Date(msg.timestamp ?? 0);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const isMine = (msg: ChatMessage) => msg.senderUid === profile?.uid;
  const headerTitle = profile?.role === "organizer" ? "Leader Chat" : "Organizer Chat";

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-[#1a1f2e] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="text-white font-semibold text-sm tracking-wide">
          {headerTitle}
        </h2>
        <span className="ml-auto text-xs text-white/40">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <p className="text-center text-white/40 text-sm mt-8">Loading…</p>
        )}

        {!loading && !loadError && messages.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-16">
            No messages yet. Start the conversation!
          </p>
        )}

        {!loading && loadError && messages.length === 0 && (
          <p className="text-center text-red-400 text-sm mt-16">{loadError}</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${isMine(msg) ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {!isMine(msg) && (
                <>
                  <span className="text-xs font-medium text-white/70">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-white/30 capitalize bg-white/5 px-1.5 py-0.5 rounded">
                    {msg.senderRole === "organizer"
                      ? "Organizer"
                      : msg.senderTeam
                        ? msg.senderTeam
                        : "Team Leader"}
                  </span>
                </>
              )}
              <span className="text-[10px] text-white/30">{formatTime(msg)}</span>
              {isMine(msg) && (
                <span className="text-xs font-medium text-white/70">You</span>
              )}
            </div>

            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMine(msg)
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white/10 text-white/90 rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-t border-red-500/20">
          {sendError}
        </p>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 flex gap-3 items-end">
        <textarea
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition min-h-[44px] max-h-32"
          placeholder="Type a message… (Enter to send)"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition shrink-0"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
