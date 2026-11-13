"use client";

import { useEffect } from "react";
import { flushStudentOutbox } from "@/lib/student/flush";
import { OUTBOX_EVENT } from "@/lib/student/outbox";

/** Loaded in the browser only, and only for signed-in students: sends queued activity to their PNA record. */
export default function StudentSyncRunner() {
  useEffect(() => {
    const run = () => void flushStudentOutbox();
    run();
    window.addEventListener(OUTBOX_EVENT, run);
    window.addEventListener("online", run);
    return () => {
      window.removeEventListener(OUTBOX_EVENT, run);
      window.removeEventListener("online", run);
    };
  }, []);
  return null;
}
