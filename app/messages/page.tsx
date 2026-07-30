"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Inbox, RefreshCw, Send, ShieldCheck } from "lucide-react";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  type ConversationSummary,
  type DirectMessage,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function MessagesPage() {
  const identity = usePlatformIdentity();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [participant, setParticipant] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setParticipant(new URLSearchParams(window.location.search).get("to")?.toLowerCase() ?? "");
  }, []);

  const loadConversations = useCallback(async () => {
    if (!identity) return;
    try {
      setConversations(await fetchConversations());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Inbox unavailable.");
    }
  }, [identity]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!identity || !participant) {
      setMessages([]);
      return;
    }
    fetchMessages(participant).then(setMessages).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Conversation unavailable.");
    });
  }, [identity, participant]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identity) return openPlatformAccount();
    if (!participant.trim() || !body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const message = await sendMessage(participant.trim().toLowerCase(), body);
      setMessages((current) => [...current, message]);
      setBody("");
      await loadConversations();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Message failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!identity) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-lg rounded-card border border-silver-mid/60 bg-white p-7 text-center shadow-resting">
          <ShieldCheck className="mx-auto text-primary" size={25} />
          <h1 className="mt-3 text-base font-bold text-primary-dark">Sign in to open messages</h1>
          <p className="mt-1 text-xs text-gray-500">Messaging is limited to active `.mil` platform identities.</p>
          <button type="button" onClick={openPlatformAccount} className="mt-4 rounded-inner bg-primary px-4 py-2.5 text-xs font-bold text-white">Open simulated identity</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Platform communications</p>
        <h1 className="mt-2 text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-on-dark">Direct, mission-focused coordination between active platform users.</p>
      </div>

      {error && <p role="alert" className="mx-4 mt-4 rounded-inner bg-danger-tint px-3 py-2 text-xs font-semibold text-danger-mid">{error}</p>}

      <div className="grid min-h-0 flex-1 gap-4 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-card border border-silver-mid/60 bg-white shadow-resting">
          <div className="flex items-center justify-between border-b border-silver-mid/50 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark"><Inbox size={16} /> Inbox</h2>
            <button type="button" onClick={() => void loadConversations()} aria-label="Refresh inbox" className="flex h-8 w-8 items-center justify-center rounded-inner text-primary hover:bg-primary-ghost"><RefreshCw size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto lg:max-h-[60vh]">
            {conversations.map((conversation) => (
              <button key={conversation.participantEmail} type="button" onClick={() => setParticipant(conversation.participantEmail)} className={`w-full border-b border-silver-mid/40 px-4 py-3 text-left ${participant === conversation.participantEmail ? "bg-primary-ghost" : "hover:bg-silver-tint"}`}>
                <div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-xs font-bold text-primary-dark">{conversation.participantEmail}</p>{conversation.unreadCount > 0 && <span className="rounded-badge bg-primary px-2 py-0.5 text-[9px] font-bold text-white">{conversation.unreadCount}</span>}</div>
                <p className="mt-1 truncate text-[11px] text-gray-500">{conversation.lastMessage}</p>
              </button>
            ))}
            {conversations.length === 0 && <p className="p-5 text-center text-xs text-gray-500">No conversations yet.</p>}
          </div>
        </aside>

        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-card border border-silver-mid/60 bg-white shadow-resting">
          <div className="border-b border-silver-mid/50 px-4 py-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-silver">Recipient `.mil` email
              <input type="email" value={participant} onChange={(event) => setParticipant(event.target.value.toLowerCase())} placeholder="first.last@us.af.mil" className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2 text-sm font-normal text-primary-dark focus:border-primary focus:outline-none" />
            </label>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-silver-tint/40 p-4">
            {messages.map((message) => {
              const mine = message.senderEmail === identity.email;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-card px-3 py-2 ${mine ? "bg-primary text-white" : "border border-silver-mid/60 bg-white text-gray-700"}`}>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed">{message.body}</p>
                    <p className={`mt-1 text-[9px] ${mine ? "text-on-dark-dim" : "text-gray-400"}`}>{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {participant && messages.length === 0 && <p className="py-10 text-center text-xs text-gray-500">Start a focused conversation with {participant}.</p>}
            {!participant && <p className="py-10 text-center text-xs text-gray-500">Choose a conversation or enter a recipient.</p>}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-silver-mid/50 p-3">
            <textarea rows={2} maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message" className="min-w-0 flex-1 resize-none rounded-input border border-silver-mid px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <button type="submit" disabled={busy || !participant.trim() || !body.trim()} aria-label="Send message" className="flex w-11 flex-shrink-0 items-center justify-center rounded-inner bg-primary text-white disabled:bg-gray-300"><Send size={17} /></button>
          </form>
        </section>
      </div>
    </div>
  );
}
