"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";

type DialogueLine = {
  speaker: "Dr. Sajjad" | "Intern" | "Other";
  text: string;
};

type Props = {
  episodeId: number;
  episodeTitle: string;
  dialogue: DialogueLine[];
  lesson: string;
};

const REACTIONS = [
  { key: "laugh", emoji: "😂", label: "Funny" },
  { key: "cry", emoji: "😭", label: "Relatable" },
  { key: "fire", emoji: "🔥", label: "Savage" },
] as const;

export function StupidInternClient({ episodeId, episodeTitle, dialogue, lesson }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({
    laugh: 0,
    cry: 0,
    fire: 0,
  });
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const storageKey = `sid-react-${episodeId}`;
  const commentKey = `sid-comments-${episodeId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCounts(parsed.counts || { laugh: 0, cry: 0, fire: 0 });
        setMyReaction(parsed.myReaction || null);
      }
      const savedComments = localStorage.getItem(commentKey);
      if (savedComments) setComments(JSON.parse(savedComments));
    } catch {}
  }, [storageKey, commentKey]);

  const handleReact = (key: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      if (myReaction === key) {
        next[key] = Math.max(0, next[key] - 1);
        setMyReaction(null);
        localStorage.setItem(storageKey, JSON.stringify({ counts: next, myReaction: null }));
        return next;
      }
      if (myReaction) next[myReaction] = Math.max(0, next[myReaction] - 1);
      next[key] = (next[key] || 0) + 1;
      setMyReaction(key);
      localStorage.setItem(storageKey, JSON.stringify({ counts: next, myReaction: key }));
      return next;
    });
  };

  const episodeUrl = `https://physionexusacademy.com/stupid-intern-diaries#ep-${episodeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(episodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsApp = () => {
    const conversation = dialogue
      .map((line) => {
        const speaker = line.speaker === "Other" ? "Senior Doctor" : line.speaker;
        return `${speaker}: ${line.text}`;
      })
      .join("\n\n");

    const shareText = [
      `😂 STUPID INTERN DIARIES | EP ${String(episodeId).padStart(2, "0")}`,
      episodeTitle,
      "",
      conversation,
      "",
      "🩺 CLINICAL TAKEAWAY",
      lesson,
      "",
      "Learn with a laugh. Practise with care.",
      "",
      "Physio Nexus Academy",
      episodeUrl,
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const next = [comment.trim(), ...comments].slice(0, 20);
    setComments(next);
    localStorage.setItem(commentKey, JSON.stringify(next));
    setComment("");
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => handleReact(r.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              myReaction === r.key
                ? "border-teal-500 bg-teal-50 text-teal-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
            }`}
          >
            <span className="text-base">{r.emoji}</span>
            <span className="font-medium">{counts[r.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1ebe57]"
        >
          <Share2 className="h-4 w-4" /> WhatsApp
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300"
        >
          {copied ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => setShowComment(!showComment)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300"
        >
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
      </div>

      {/* Comment box */}
      {showComment && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a short comment..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleAddComment}
              className="rounded-full bg-teal-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Post
            </button>
          </div>
          {comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {comments.map((c, i) => (
                <div key={i} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
