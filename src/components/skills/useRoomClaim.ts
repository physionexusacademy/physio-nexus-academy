"use client";

/**
 * Claims the one shared 3D patient for a demo when it scrolls into view (and gives it up when another demo takes over),
 * the same way Demo3DPlayer does. Used by the Skills Lab scene player.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExamRoom } from "@/lib/virtual-patient/engine";
import { claimRoom, handOff, players, releaseRoom, shared, snapshot, type Owner } from "@/lib/virtual-patient/shared-room";

export type RoomStatus = "idle" | "loading" | "active" | "parked";

export function useRoomClaim(enabled: boolean, onFail: () => void) {
  const hostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ExamRoom | null>(null);
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [progress, setProgress] = useState(shared.progress);
  const [poster, setPoster] = useState<string | null>(null);
  const visible = useRef(false);
  /** True once the shared patient has been posed for this demo (so a still picture shows this test). */
  const posed = useRef(false);
  const ownerRef = useRef<Owner>({ lost: () => undefined, reload: () => undefined, activate: () => undefined, isVisible: () => visible.current, hasRoom: () => roomRef.current !== null });

  ownerRef.current.lost = () => {
    const room = roomRef.current;
    if (room && posed.current) setPoster(snapshot(room));
    posed.current = false;
    roomRef.current = null;
    setStatus("parked");
  };
  ownerRef.current.reload = () => {
    posed.current = false;
    roomRef.current = null;
    setPoster(null);
    if (shared.losses > 2) onFail();
    else ownerRef.current.activate();
  };

  const activate = useCallback(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    setStatus((s) => (s === "active" ? s : "loading"));
    const listener = (p: number) => setProgress(p);
    shared.listeners.add(listener);
    claimRoom(host, ownerRef.current)
      .then((room) => {
        shared.listeners.delete(listener);
        if (shared.owner !== ownerRef.current) return;
        roomRef.current = room;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __pnaDemoRoom?: ExamRoom }).__pnaDemoRoom = room;
        setStatus("active");
      })
      .catch(() => {
        shared.listeners.delete(listener);
        onFail();
      });
  }, [enabled, onFail]);
  ownerRef.current.activate = activate;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        const owner = shared.owner;
        const justClaimed = owner && owner !== ownerRef.current && owner.isVisible() && performance.now() - shared.claimedAt < 700;
        if (entry.isIntersecting && !roomRef.current && !justClaimed) activate();
        else if (!entry.isIntersecting && shared.owner === ownerRef.current) handOff(ownerRef.current);
      },
      { threshold: 0.35 },
    );
    observer.observe(host);
    const owner = ownerRef.current;
    players.add(owner);
    return () => {
      observer.disconnect();
      players.delete(owner);
      releaseRoom(owner);
    };
  }, [activate]);

  const mine = useCallback(() => shared.owner === ownerRef.current, []);
  return { hostRef, roomRef, status, progress, poster, visible, posed, activate, mine };
}
