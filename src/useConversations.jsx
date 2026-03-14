import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./AuthModal.jsx";

// ─── Date grouping helper ─────────────────────────────────────────────────────
export function groupByDate(conversations) {
  const groups = {};
  const now    = new Date();

  for (const conv of conversations) {
    const d    = new Date(conv.updated_at || conv.created_at);
    const diff = (now - d) / 86400000; // days

    let label;
    if (diff < 1)       label = "I dag";
    else if (diff < 2)  label = "I går";
    else if (diff < 8)  label = "Denne uge";
    else if (diff < 31) label = "Denne måned";
    else                label = d.toLocaleDateString("da-DK", { month: "long", year: "numeric" });

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }
  return groups; // { "I dag": [...], "I går": [...], ... }
}

// ─── useConversations hook ────────────────────────────────────────────────────
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(null);   // current conv id
  const [messages, setMessages]           = useState([]);      // current messages
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const titleSetRef = useRef(new Set());  // track which convs already have a real title

  // ── Load all conversations for the user ───────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!userId) { setConversations([]); setLoadingConvs(false); return; }
    setLoadingConvs(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error) setConversations(data || []);
    setLoadingConvs(false);
  }, [userId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Load messages for a specific conversation ─────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId) { setMessages([]); return; }
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error) setMessages((data || []).map(m => ({ role: m.role, content: m.content })));
    setLoadingMsgs(false);
  }, []);

  // ── Select a conversation ─────────────────────────────────────────────────
  const selectConversation = useCallback(async (convId) => {
    setActiveId(convId);
    await loadMessages(convId);
    // Persist selection so page refresh restores it
    sessionStorage.setItem("activeConvId", convId);
  }, [loadMessages]);

  // ── Create a new conversation ─────────────────────────────────────────────
  const createConversation = useCallback(async () => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title: "Ny samtale" })
      .select()
      .single();

    if (error || !data) return null;
    setConversations(prev => [data, ...prev]);
    setActiveId(data.id);
    setMessages([]);
    sessionStorage.setItem("activeConvId", data.id);
    return data.id;
  }, [userId]);

  // ── Save a message ────────────────────────────────────────────────────────
  const saveMessage = useCallback(async (convId, role, content) => {
    if (!convId) return;
    await supabase.from("messages").insert({ conversation_id: convId, role, content });

    // Bump updated_at so conversation rises to top of list
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

    // Re-sort conversations list
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c
      );
      return [...updated].sort((a, b) =>
        new Date(b.updated_at) - new Date(a.updated_at)
      );
    });
  }, []);

  // ── Auto-title: set title from first user message (runs once per conv) ────
  const maybeSetTitle = useCallback(async (convId, firstUserMessage) => {
    if (titleSetRef.current.has(convId)) return;
    titleSetRef.current.add(convId);

    // Truncate to ~40 chars for a clean sidebar title
    const title = firstUserMessage.trim().slice(0, 42) +
      (firstUserMessage.trim().length > 42 ? "…" : "");

    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", convId);

    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, title } : c)
    );
  }, []);

  // ── Delete a conversation ─────────────────────────────────────────────────
  const deleteConversation = useCallback(async (convId) => {
    await supabase.from("conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeId === convId) {
      setActiveId(null);
      setMessages([]);
      sessionStorage.removeItem("activeConvId");
    }
  }, [activeId]);

  // ── Restore last active conversation on mount ─────────────────────────────
  const restoreSession = useCallback(async (convList) => {
    const savedId = sessionStorage.getItem("activeConvId");
    if (savedId && convList.find(c => c.id === savedId)) {
      await selectConversation(savedId);
    }
  }, [selectConversation]);

  // Run restore after initial load
  const hasRestored = useRef(false);
  useEffect(() => {
    if (!loadingConvs && conversations.length > 0 && !hasRestored.current) {
      hasRestored.current = true;
      restoreSession(conversations);
    }
  }, [loadingConvs, conversations, restoreSession]);

  return {
    conversations,
    activeId,
    messages,
    loadingConvs,
    loadingMsgs,
    selectConversation,
    createConversation,
    saveMessage,
    maybeSetTitle,
    deleteConversation,
    setMessages,
    reload: loadConversations,
  };
}
