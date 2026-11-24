"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormCheckSession, type CameraSpec, type SessionState, type SessionSummary, type Side } from "@/lib/formcheck";
import { closeCamera, openCamera, type CameraProblem } from "@/lib/formcheck/browser/camera";
import { createHudMemo, drawHud, type HudMemo } from "@/lib/formcheck/browser/hud";
import { motionReduced } from "@/lib/motion";
import { PoseRuntime } from "@/lib/formcheck/browser/runtime";
import type { SoftwareRecord } from "@/lib/formcheck/version";

/**
 * One camera session on a page: opens the camera and the pose model when `start()` is called, feeds every frame to the engine's FormCheckSession, draws the skeleton,
 * and closes everything (the camera light goes off) on `stop()`, when the page is hidden and when the component goes away. Nothing is recorded or sent.
 */
export type FormCheckStatus = "idle" | "loading" | "live" | "error" | "finished";
export type FormCheckProblem = CameraProblem | "model";
export type FormCheckOptions = { tested?: Side; pass?: 1 | 2; facing?: "user" | "environment"; simple?: boolean };

export function useFormCheck(spec: CameraSpec, options: FormCheckOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runtimeRef = useRef<PoseRuntime | null>(null);
  const sessionRef = useRef<FormCheckSession | null>(null);
  const loopRef = useRef<{ stop: boolean }>({ stop: false });
  const hudRef = useRef<HudMemo>(createHudMemo());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [status, setStatus] = useState<FormCheckStatus>("idle");
  const [problem, setProblem] = useState<FormCheckProblem | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [software, setSoftware] = useState<SoftwareRecord | null>(null);
  const shown = useRef({ phase: "", hint: "", cue: "", reps: -1, tick: 0 });

  const release = useCallback(() => {
    loopRef.current.stop = true;
    closeCamera(videoRef.current, streamRef.current);
    streamRef.current = null;
    runtimeRef.current?.close();
    runtimeRef.current = null;
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const stop = useCallback(() => {
    const session = sessionRef.current;
    if (session) setSummary(session.finish());
    release();
    setStatus("finished");
  }, [release]);

  const start = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setProblem(null);
    setSummary(null);
    setState(null);
    setStatus("loading");
    const opened = await openCamera(video, optionsRef.current.facing ?? "user");
    if (!opened.ok) { setProblem(opened.problem); setStatus("error"); return; }
    streamRef.current = opened.camera.stream;
    let runtime: PoseRuntime;
    try {
      runtime = await PoseRuntime.create({ model: "full", face: !!spec.needFace });
    } catch {
      release();
      setProblem("model");
      setStatus("error");
      return;
    }
    runtimeRef.current = runtime;
    setSoftware(runtime.software);
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = opened.camera.width; canvas.height = opened.camera.height; }
    const session = new FormCheckSession(spec, { tested: optionsRef.current.tested, pass: optionsRef.current.pass ?? 1, face: !!spec.needFace });
    sessionRef.current = session;
    loopRef.current = { stop: false };
    shown.current = { phase: "", hint: "", cue: "", reps: -1, tick: 0 };
    hudRef.current = createHudMemo();
    setStatus("live");

    const mirror = (optionsRef.current.facing ?? "user") === "user";
    const loop = loopRef.current;
    // Each frame is stamped with the video's own presentation time when the browser supplies it (requestVideoFrameCallback): it is steady even when the phone is busy, so the
    // smoothing and the timing of repetitions do not wobble with the processing. A picture that has not changed since the last call is not processed twice.
    let lastMedia = -1;
    const step = (_now?: number, meta?: { mediaTime?: number }) => {
      if (loop.stop || !runtimeRef.current) return;
      const media = meta?.mediaTime !== undefined ? meta.mediaTime * 1000 : video.currentTime * 1000;
      if (media !== lastMedia) {
        lastMedia = media;
        try {
          const { frame, landmarks } = runtimeRef.current.detect(video, media);
          const next = session.push(frame);
          if (canvasRef.current) drawHud(canvasRef.current, next, landmarks, { mirror, simple: optionsRef.current.simple ?? false, reducedMotion: motionReduced(), now: performance.now() }, hudRef.current);
          const mark = shown.current;
          const hint = next.hint?.en ?? "";
          const cue = next.cue?.id ?? "";
          const now = performance.now();
          if (next.phase !== mark.phase || hint !== mark.hint || cue !== mark.cue || next.reps !== mark.reps || now - mark.tick > 100) {
            shown.current = { phase: next.phase, hint, cue, reps: next.reps, tick: now };
            setState(next);
          }
        } catch {
          /* one bad frame is skipped */
        }
      }
      if ("requestVideoFrameCallback" in video) (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: (now: number, meta: { mediaTime?: number }) => void) => void }).requestVideoFrameCallback(step);
      else requestAnimationFrame(() => step());
    };
    step();
  }, [spec, release]);

  const recalibrate = useCallback(() => sessionRef.current?.recalibrate(), []);

  // the camera never stays on behind a hidden page or after the component goes away
  useEffect(() => {
    const hide = () => { if (document.hidden && streamRef.current) stop(); };
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); release(); };
  }, [stop, release]);

  return { videoRef, canvasRef, status, problem, state, summary, software, start, stop, recalibrate, getSession: () => sessionRef.current };
}
