"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Share2, Copy, MessageCircle, Check, LoaderCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  episodeId: number;
  episodeTitle: string;
};

type ReactionKey = "laugh" | "cry" | "fire";
type DiaryReaction = { reaction: ReactionKey; visitor_id: string };
type DiaryComment = {
  id: string;
  display_name: string;
  comment: string;
  created_at: string;
};

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: "laugh", emoji: "😂", label: "Funny" },
  { key: "cry", emoji: "😭", label: "Relatable" },
  { key: "fire", emoji: "🔥", label: "Savage" },
];

const EMPTY_COUNTS: Record<ReactionKey, number> = { laugh: 0, cry: 0, fire: 0 };

function getVisitorId() {
  const key = "pna-sid-visitor-v1";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, id);
  return id;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function StupidInternClient({ episodeId, episodeTitle }: Props) {
  const [counts, setCounts] = useState<Record<ReactionKey, number>>(EMPTY_COUNTS);
  const [myReaction, setMyReaction] = useState<ReactionKey | null>(null);
  const [visitorId, setVisitorId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<DiaryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingReaction, setSavingReaction] = useState<ReactionKey | null>(null);
  const [postingComment, setPostingComment] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const loadCommunityData = useCallback(async (currentVisitorId: string) => {
    setLoading(true);
    setError("");
    try {
      const [reactionResult, commentResult] = await Promise.all([
        supabase
          .from("stupid_intern_reactions")
          .select("reaction, visitor_id")
          .eq("episode_id", episodeId),
        supabase
          .from("stupid_intern_comments")
          .select("id, display_name, comment, created_at")
          .eq("episode_id", episodeId)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (reactionResult.error) throw reactionResult.error;
      if (commentResult.error) throw commentResult.error;

      const nextCounts: Record<ReactionKey, number> = { ...EMPTY_COUNTS };
      for (const row of (reactionResult.data ?? []) as DiaryReaction[]) {
        if (row.reaction in nextCounts) nextCounts[row.reaction] += 1;
        if (row.visitor_id === currentVisitorId) setMyReaction(row.reaction);
      }
      setCounts(nextCounts);
      setComments((commentResult.data ?? []) as DiaryComment[]);
    } catch {
      setError("Community reactions and comments could not load. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [episodeId, supabase]);

  useEffect(() => {
    try {
      const id = getVisitorId();
      setVisitorId(id);
      void loadCommunityData(id);
    } catch {
      setLoading(false);
      setError("This browser is blocking local storage, so reactions cannot be saved here.");
    }
  }, [loadCommunityData]);

  const handleReact = async (key: ReactionKey) => {
    if (!visitorId || savingReaction) return;
    if (myReaction === key) return;
    setSavingReaction(key);
    setError("");
    try {
      const { error: saveError } = await supabase
        .from("stupid_intern_reactions")
        .upsert(
          { episode_id: episodeId, visitor_id: visitorId, reaction: key },
          { onConflict: "episode_id,visitor_id" }
        );
      if (saveError) throw saveError;
      setMyReaction(key);
      await loadCommunityData(visitorId);
    } catch {
      setError("Your reaction could not be saved. Please try again.");
    } finally {
      setSavingReaction(null);
    }
  };

  const handleCopy = async () => {
    const url = `https://physionexusacademy.com/stupid-intern-diaries#ep-${episodeId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link on this browser.");
    }
  };

  const handleWhatsApp = () => {
    const url = `https://physionexusacademy.com/stupid-intern-diaries#ep-${episodeId}`;
    const text = encodeURIComponent(
      `😂 Stupid Intern Diaries – ${episodeTitle}\n\nCheck this clinical disaster + lesson:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleAddComment = async () => {
    const cleanName = displayName.trim();
    const cleanComment = comment.trim();
    if (cleanName.length < 2 || cleanName.length > 40 || !cleanComment || cleanComment.length > 500 || postingComment) return;

    setPostingComment(true);
    setError("");
    try {
      const { error: saveError } = await supabase
        .from("stupid_intern_comments")
        .insert({ episode_id: episodeId, display_name: cleanName, comment: cleanComment });
      if (saveError) throw saveError;
      setComment("");
      setShowComment(false);
      const { data, error: loadError } = await supabase
        .from("stupid_intern_comments")
        .select("id, display_name, comment, created_at")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (loadError) throw loadError;
      setComments((data ?? []) as DiaryComment[]);
    } catch {
      setError("Your comment could not be posted. Please check your connection and try again.");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <section aria-label="Episode reactions" className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#193e50]">React to this episode</p>
          <span className="text-xs text-slate-500">
            {Object.values(counts).reduce((total, count) => total + count, 0)} total reactions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => void handleReact(r.key)}
              disabled={loading || savingReaction !== null || myReaction === r.key}
              aria-pressed={myReaction === r.key}
              title={r.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition disabled:cursor-default ${
                myReaction === r.key
                  ? "border-teal-600 bg-teal-100 text-teal-900 ring-1 ring-teal-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
              }`}
            >
              <span className="text-base">{r.emoji}</span>
              <span className="font-medium">{r.label}</span>
              <span className="min-w-4 font-bold tabular-nums">{counts[r.key]}</span>
              {savingReaction === r.key && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Counts are shared across visitors. One reaction per browser for each episode.</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleWhatsApp}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1ebe57]">
          <Share2 className="h-4 w-4" /> WhatsApp
        </button>
        <button type="button" onClick={() => void handleCopy()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300">
          {copied ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button type="button" onClick={() => setShowComment((value) => !value)} aria-expanded={showComment}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300">
          <MessageCircle className="h-4 w-4" /> Add comment ({comments.length})
        </button>
      </div>

      {showComment && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="Write a comment">
          <label htmlFor={`sid-name-${episodeId}`} className="mb-1.5 block text-sm font-semibold text-slate-700">Your display name</label>
          <input
            id={`sid-name-${episodeId}`}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How should your name appear?"
            maxLength={40}
            autoComplete="nickname"
            className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400"
          />
          <label htmlFor={`sid-comment-${episodeId}`} className="mb-1.5 block text-sm font-semibold text-slate-700">Your comment</label>
          <textarea
            id={`sid-comment-${episodeId}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add your thoughts or clinical takeaway..."
            rows={3}
            maxLength={500}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{comment.length}/500</span>
            <button type="button" onClick={() => void handleAddComment()}
              disabled={postingComment || displayName.trim().length < 2 || !comment.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
              {postingComment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {postingComment ? "Posting…" : "Post comment"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Your display name and comment will be visible to everyone. Please do not include patient-identifiable information.</p>
        </section>
      )}

      <section aria-label="Community comments" className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold text-[#193e50]">Community comments</h4>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{comments.length} shown</span>
        </div>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading community activity…</div>
        ) : comments.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">No comments yet. Be the first to start the conversation.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {comments.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-bold text-teal-900">{item.display_name}</p>
                  <time dateTime={item.created_at} className="text-xs text-slate-400">{formatDate(item.created_at)}</time>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.comment}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}
    </div>
  );
}
