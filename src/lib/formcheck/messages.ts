import type { SetupIssue } from "./quality.ts";
import type { Bi } from "./types.ts";

/**
 * Everything the tool says that is not an exercise cue: what to change when the set-up is not right, what is happening while it takes the person's own neutral
 * position, and the plain statements about what it cannot do. Short, calm, and in the same two languages as the cues (every line is checked by lintCue).
 */
export const SETUP_MESSAGES: Record<SetupIssue, Bi> = {
  no_person: { en: "I cannot see you yet. Step into view.", ru: "Abhi aap nazar nahi aa rahe. Camera ke samne aayein." },
  body_not_visible: { en: "Part of your body is out of view. Adjust the phone.", ru: "Aap ka kuch hissa nazar nahi aa raha. Phone theek karein." },
  too_far: { en: "Come a little closer to the phone.", ru: "Phone ke thora qareeb aayein." },
  too_close: { en: "Move back a little so your whole body fits.", ru: "Thora peeche hatein taake poora jism nazar aaye." },
  off_centre: { en: "Move to the middle of the picture.", ru: "Tasveer ke darmiyan mein aayein." },
  too_dark: { en: "It is too dark. Turn on a light.", ru: "Roshni kam hai. Light jala lein." },
  too_bright: { en: "It is too bright. Move away from the window.", ru: "Roshni bohat tez hai. Khirki se hat jayein." },
  wrong_view: { en: "Turn so the phone sees you from the right side.", ru: "Is tarah mudein ke phone aap ko sahi taraf se dekhe." },
};

export const STATUS_MESSAGES = {
  needSide: { en: "Choose which side you are exercising.", ru: "Chunein ke aap kis taraf ki exercise kar rahe hain." },
  needFace: { en: "This exercise needs the face view, which is not available here.", ru: "Is exercise ke liye chehre ka view chahiye, jo yahan maujood nahi." },
  calibrating: { en: "Stay still for a moment.", ru: "Zara der saakin rahein." },
  ready: { en: "Ready. Start when you like.", ru: "Tayyar. Jab chahein shuru karein." },
  lost: { en: "I lost you for a moment. Come back into view.", ru: "Aap kuch der ke liye nazar se ghaib ho gaye. Wapas aayein." },
  paused: { en: "Paused until I can see you again.", ru: "Jab tak aap dobara nazar na aayein, ruka hua hai." },
  done: { en: "Well done. That is the set.", ru: "Shabash. Yeh set mukammal hua." },
} satisfies Record<string, Bi>;

/** What the summary screen says the tool cannot see (the exercise's own limits come from its spec). */
export const GENERAL_LIMITS: Bi = {
  en: "This is exercise guidance from a camera. It cannot see your spine, your pelvis or your deep muscles, and it does not diagnose.",
  ru: "Yeh camera se exercise ki rehnumayi hai. Yeh aap ki reerh, pelvis ya gehre muscles nahi dekh sakta, aur tashkhees nahi karta.",
};

/** One neutral line on the set-up screen about the camera (no recording, no storage), calm and short. */
export const CAMERA_NOTE: Bi = {
  en: "The camera is on only during this check.",
  ru: "Camera sirf is check ke dauran chalta hai.",
};
