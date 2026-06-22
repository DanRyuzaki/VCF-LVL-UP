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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderRole: string;
  createdAt?: unknown;
  timestamp?: number; // epoch ms for client-side sort fallback
}

export default function CommunicationModule() {
  const { profile, profileError, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Guard ─────────────────────────────────────────────────────────────────
  const roleConfirmed = !!profile;
  const allowed =
    profile?.role === "admin" || profile?.role === "developer";
  const denied = roleConfirmed && !allowed;

  // ── Firestore listener ────────────────────────────────────────────────────
  // Wait for authLoading to finish before setting up the listener.
  // Without this guard, the effect runs while authLoading=true / allowed=false,
  // exits early, and never re-runs because `allowed` stays false until auth
  // resolves — meaning the listener is never registered and messages only
  // appear after a manual reload.
  useEffect(() => {
    if (authLoading || !allowed) return;

    const q = query(
      collection(db, "chats"),
      where("context", "==", "admin"),
      // Sort by the client-side epoch timestamp instead of serverTimestamp.
      // serverTimestamp() is null on the sender's client until the Firestore
      // write round-trips back, so orderBy("createdAt") skips the just-sent
      // message until the server confirms it — causing the "must reload to
      // see own message" bug. `timestamp` is set to Date.now() synchronously
      // before addDoc returns, so it's always present immediately.
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, "id">),
        }));
        setMessages(all);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [authLoading, allowed]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !profile) return;
    setSending(true);
    setError(null);
    try {
      const ref = await addDoc(collection(db, "chats"), {
        text: text.trim(),
        senderUid: profile.uid,
        senderName: `${profile.firstName} ${profile.lastName}`,
        senderRole: profile.role,
        context: "admin",
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
      });

      // addDoc() resolves as soon as the write lands in the local optimistic
      // cache — it does NOT mean the server actually accepted it. If a
      // Firestore security rule rejects the write, the SDK rolls the local
      // copy back silently and this catch block never fires, because the
      // promise above already resolved "successfully." That rollback is
      // exactly what looks like "I sent a message and it vanished" for your
      // own messages specifically (messages from others never go through
      // this optimistic-then-maybe-rolled-back path, since they only ever
      // arrive via the server's authoritative push). Forcing a server read
      // turns a silent rollback into a real, catchable error.
      await getDocFromServer(ref);

      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(
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
  if (denied) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Access denied. Admins and Developers only.
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!allowed && (profileError || !profile)) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
        Couldn't verify your role right now. Try refreshing the page.
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

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-[#1a1f2e] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="text-white font-semibold text-sm tracking-wide">
          Communication Channel
        </h2>
        <span className="ml-auto text-xs text-white/40">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <p className="text-center text-white/40 text-sm mt-8">Loading messages…</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-16">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${isMine(msg) ? "items-end" : "items-start"}`}
          >
            {/* Sender label */}
            <div className="flex items-center gap-2 mb-1">
              {!isMine(msg) && (
                <>
                  <span className="text-xs font-medium text-white/70">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-white/30 capitalize bg-white/5 px-1.5 py-0.5 rounded">
                    {msg.senderRole}
                  </span>
                </>
              )}
              <span className="text-[10px] text-white/30">{formatTime(msg)}</span>
              {isMine(msg) && (
                <span className="text-xs font-medium text-white/70">You</span>
              )}
            </div>

            {/* Bubble */}
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

      {/* Error */}
      {error && (
        <p className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-t border-red-500/20">
          {error}
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