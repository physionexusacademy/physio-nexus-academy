"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, MessageCircle, Check, Image as ImageIcon } from "lucide-react";

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

const IMAGE_WIDTH = 1080;
const IMAGE_PADDING = 68;
const CONTENT_WIDTH = IMAGE_WIDTH - IMAGE_PADDING * 2;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function createEpisodeImage(
  episodeId: number,
  episodeTitle: string,
  dialogue: DialogueLine[],
  lesson: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Your browser could not create the share image."));
      return;
    }

    const left = IMAGE_PADDING;
    const right = IMAGE_WIDTH - IMAGE_PADDING;
    const innerWidth = CONTENT_WIDTH;
    let y = 0;

    const titleFont = "700 52px Arial, sans-serif";
    const bodyFont = "400 31px Arial, sans-serif";
    const labelFont = "700 25px Arial, sans-serif";
    const smallFont = "600 22px Arial, sans-serif";

    const titleLines = (() => {
      ctx.font = titleFont;
      return wrapCanvasText(ctx, episodeTitle, innerWidth - 60);
    })();

    const dialogueLayouts = dialogue.map((line) => {
      ctx.font = bodyFont;
      const textLines = wrapCanvasText(ctx, line.text, innerWidth - 72);
      return {
        speaker: line.speaker === "Other" ? "Senior Doctor" : line.speaker,
        textLines,
        height: 38 + 34 + textLines.length * 43 + 30,
        isIntern: line.speaker === "Intern",
      };
    });

    ctx.font = "400 30px Arial, sans-serif";
    const lessonLines = wrapCanvasText(ctx, lesson, innerWidth - 76);

    const headerHeight = 300 + titleLines.length * 62;
    const dialogueHeight = dialogueLayouts.reduce((sum, item) => sum + item.height + 18, 0);
    const lessonHeight = 150 + lessonLines.length * 43;
    const footerHeight = 190;
    const totalHeight = IMAGE_PADDING + headerHeight + 46 + dialogueHeight + 42 + lessonHeight + footerHeight + IMAGE_PADDING;

    canvas.width = IMAGE_WIDTH;
    canvas.height = totalHeight;

    // Premium PNA clinical palette with a soft, readable canvas background.
    ctx.fillStyle = "#edf7f5";
    ctx.fillRect(0, 0, IMAGE_WIDTH, totalHeight);

    // Header panel.
    y = IMAGE_PADDING;
    roundedRect(ctx, left, y, innerWidth, headerHeight, 34, "#ffffff", "#c8e7df");
    ctx.fillStyle = "#087e78";
    ctx.font = "700 24px Arial, sans-serif";
    ctx.fillText("PHYSIO NEXUS ACADEMY  •  LEARN WITH A LAUGH", left + 42, y + 58);

    ctx.fillStyle = "#193e50";
    ctx.font = "800 58px Arial, sans-serif";
    ctx.fillText("STUPID INTERN DIARIES", left + 42, y + 137);

    roundedRect(ctx, left + 42, y + 164, 220, 52, 26, "#e5f5f1");
    ctx.fillStyle = "#087e78";
    ctx.font = "700 25px Arial, sans-serif";
    ctx.fillText(`EPISODE #${String(episodeId).padStart(2, "0")}`, left + 62, y + 199);

    ctx.fillStyle = "#193e50";
    ctx.font = titleFont;
    let titleY = y + 286;
    for (const line of titleLines) {
      ctx.fillText(line, left + 42, titleY);
      titleY += 62;
    }
    ctx.fillStyle = "#647b83";
    ctx.font = smallFont;
    ctx.fillText("REAL CLINIC CONVERSATIONS  •  MEMORABLE CLINICAL LESSONS", left + 42, y + headerHeight - 36);

    // Dialogue section.
    y += headerHeight + 46;
    ctx.fillStyle = "#193e50";
    ctx.font = "800 32px Arial, sans-serif";
    ctx.fillText("THE CONVERSATION", left + 4, y);
    y += 28;

    for (const item of dialogueLayouts) {
      const cardY = y;
      const cardFill = item.isIntern ? "#ffffff" : "#e1f2ee";
      roundedRect(ctx, left, cardY, innerWidth, item.height, 24, cardFill, "#d4e8e3");

      ctx.fillStyle = item.isIntern ? "#a45b12" : "#087e78";
      ctx.font = labelFont;
      ctx.fillText(item.speaker.toUpperCase(), left + 34, cardY + 48);

      ctx.fillStyle = "#263f4b";
      ctx.font = bodyFont;
      let lineY = cardY + 100;
      for (const line of item.textLines) {
        ctx.fillText(line, left + 34, lineY);
        lineY += 43;
      }
      y += item.height + 18;
    }

    // Clinical takeaway panel.
    y += 20;
    roundedRect(ctx, left, y, innerWidth, lessonHeight, 28, "#193e50");
    ctx.fillStyle = "#8ce0cf";
    ctx.font = "800 27px Arial, sans-serif";
    ctx.fillText("CLINICAL TAKEAWAY", left + 38, y + 58);
    ctx.fillStyle = "#ffffff";
    ctx.font = "400 30px Arial, sans-serif";
    let lessonY = y + 112;
    for (const line of lessonLines) {
      ctx.fillText(line, left + 38, lessonY);
      lessonY += 43;
    }

    // Footer and source link.
    y += lessonHeight + 52;
    ctx.fillStyle = "#193e50";
    ctx.font = "800 28px Arial, sans-serif";
    ctx.fillText("LEARN WITH A LAUGH. PRACTISE WITH CARE.", left + 4, y);
    ctx.fillStyle = "#087e78";
    ctx.font = "700 25px Arial, sans-serif";
    ctx.fillText("physionexusacademy.com/stupid-intern-diaries", left + 4, y + 48);
    ctx.fillStyle = "#71858b";
    ctx.font = "600 21px Arial, sans-serif";
    ctx.fillText("Physio Nexus Academy  |  #DrSajjadRazaPT", left + 4, y + 91);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The share image could not be generated."));
    }, "image/png");
  });
}

export function StupidInternClient({ episodeId, episodeTitle, dialogue, lesson }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({
    laugh: 0,
    cry: 0,
    fire: 0,
  });
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
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

  const handleWhatsApp = async () => {
    if (sharing) return;
    setSharing(true);
    const caption = `😂 Stupid Intern Diaries | Episode #${String(episodeId).padStart(2, "0")}\n${episodeTitle}\n\nLearn with a laugh. Practise with care.\nPhysio Nexus Academy\n${episodeUrl}`;

    try {
      const blob = await createEpisodeImage(episodeId, episodeTitle, dialogue, lesson);
      const file = new File([blob], `stupid-intern-diaries-ep-${episodeId}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Stupid Intern Diaries — Episode #${episodeId}`,
          text: caption,
        });
      } else {
        // Older browsers: save the complete image, then open WhatsApp with its caption.
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Episode image sharing failed:", error);
      alert("Image share could not start. Please try again or use Copy Link.");
    } finally {
      setSharing(false);
    }
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
          disabled={sharing}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1ebe57] disabled:cursor-wait disabled:opacity-70"
        >
          {sharing ? <ImageIcon className="h-4 w-4 animate-pulse" /> : <Share2 className="h-4 w-4" />}
          {sharing ? "Preparing image..." : "Share as Image"}
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
