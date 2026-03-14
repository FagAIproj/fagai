import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./AuthModal.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Each Supabase row has a `content` column that stores a JSON string:
// { title, subject, body }   (body = rich HTML from the editor)
const pack   = ({ title, subject, body }) => JSON.stringify({ title, subject, body });
const unpack = (row) => {
  try {
    const { title = "Uden titel", subject = "math", body = "" } = JSON.parse(row.content);
    return {
      id:         row.id,
      user_id:    row.user_id,
      title,
      subject,
      content:    body,          // kept as "content" so existing UI needs no changes
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Friendly display date
      date: formatDate(row.updated_at || row.created_at),
    };
  } catch {
    return { id: row.id, user_id: row.user_id, title: "Uden titel", subject: "math", content: "", date: "–", created_at: row.created_at, updated_at: row.updated_at };
  }
};

function formatDate(iso) {
  if (!iso) return "";
  const d    = new Date(iso);
  const now  = new Date();
  const diff = (now - d) / 1000; // seconds
  if (diff < 60)                  return "Lige nu";
  if (diff < 3600)                return `${Math.floor(diff / 60)} min siden`;
  if (diff < 86400)               return `${Math.floor(diff / 3600)} t siden`;
  if (diff < 86400 * 2)           return "I går";
  return d.toLocaleDateString("da-DK", { day:"numeric", month:"short" });
}

// ─── useNotes hook ────────────────────────────────────────────────────────────
export function useNotes(userId) {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false); // shows "Gemmer…" indicator
  const debounceRef           = useRef({});       // { [noteId]: timeoutId }

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadNotes = useCallback(async () => {
    if (!userId) { setNotes([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) { setError(error.message); }
    else       { setNotes((data || []).map(unpack)); }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createNote = useCallback(async ({ title, subject, body }) => {
    if (!userId) return null;
    const payload = {
      user_id: userId,
      content: pack({ title, subject, body }),
    };
    const { data, error } = await supabase
      .from("notes")
      .insert(payload)
      .select()
      .single();

    if (error) { setError(error.message); return null; }
    const newNote = unpack(data);
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [userId]);

  // ── Update (immediate, called explicitly) ─────────────────────────────────
  const updateNote = useCallback(async (id, fields) => {
    if (!userId) return;
    // fields can be { title?, subject?, content? (=body) }
    // We need to merge with the existing packed content
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...fields, date: "Lige nu" } : n));

    const existing = notes.find(n => n.id === id) || {};
    const merged = {
      title:   fields.title   ?? existing.title,
      subject: fields.subject ?? existing.subject,
      body:    fields.content ?? existing.content,
    };
    const { error } = await supabase
      .from("notes")
      .update({ content: pack(merged) })
      .eq("id", id)
      .eq("user_id", userId); // RLS double-check on client

    if (error) setError(error.message);
  }, [userId, notes]);

  // ── Debounced update (called on every keystroke) ──────────────────────────
  // Waits 2.5 s after the last edit before hitting Supabase.
  const debouncedUpdate = useCallback((id, fields) => {
    // Optimistically update local state immediately for snappy UI
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...fields, date: "Ikke gemt endnu…" } : n));

    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);

    debounceRef.current[id] = setTimeout(async () => {
      setSaving(true);
      const latest = await supabase
        .from("notes")
        .select("content")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      let base = { title: "Uden titel", subject: "math", body: "" };
      if (!latest.error && latest.data) {
        try { base = JSON.parse(latest.data.content); } catch {}
      }

      const merged = {
        title:   fields.title   ?? base.title,
        subject: fields.subject ?? base.subject,
        body:    fields.content ?? base.body,
      };

      const { error } = await supabase
        .from("notes")
        .update({ content: pack(merged) })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
      } else {
        // Update date stamp after successful save
        setNotes(prev => prev.map(n =>
          n.id === id ? { ...n, ...fields, date: "Lige nu" } : n
        ));
      }
      setSaving(false);
    }, 2500);
  }, [userId]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteNote = useCallback(async (id) => {
    if (!userId) return;
    // Clear any pending debounced save for this note
    if (debounceRef.current[id]) {
      clearTimeout(debounceRef.current[id]);
      delete debounceRef.current[id];
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      loadNotes(); // reload to restore if delete failed
    }
  }, [userId, loadNotes]);

  // Clean up all debounce timers on unmount
  useEffect(() => {
    return () => Object.values(debounceRef.current).forEach(clearTimeout);
  }, []);

  return {
    notes,
    loading,
    saving,
    error,
    createNote,
    updateNote,
    debouncedUpdate,
    deleteNote,
    reload: loadNotes,
  };
}
