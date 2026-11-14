#!/usr/bin/env python3
"""
Sanity-checks the raw recordings before they are packed (nobody listens to thousands of sentences, so this catches the obvious faults):
a sentence that is silent, clipped, cut short (too few seconds for its words: the model reads at most about 500 phonemes) or stretched
(too many), or that has a long silence inside it.

  python3 scripts/voice/check-audio.py <sentences.json> <cache-dir>
"""
import json, os, sys
import numpy as np

RATE = 24000


def main(list_file, cache):
    groups = json.load(open(list_file))["groups"]
    flagged, total, secs = [], 0, 0.0
    for g in groups:
        for text, key in zip(g["sentences"], g["keys"]):
            path = os.path.join(cache, key + ".pcm")
            if not os.path.exists(path):
                continue
            x = np.frombuffer(open(path, "rb").read(), dtype="<i2").astype(np.float32) / 32768.0
            total += 1
            dur = len(x) / RATE
            secs += dur
            words = max(1, len(text.split()))
            speech = np.abs(x) > 0.012
            voiced = speech.sum() / RATE
            peak = float(np.abs(x).max()) if len(x) else 0.0
            # longest silent run inside the sentence (ignoring the ends)
            idx = np.where(speech)[0]
            gap = 0.0
            if len(idx) > 1:
                gap = float(np.max(np.diff(idx))) / RATE
            why = []
            if peak < 0.05:
                why.append("silent (peak %.2f)" % peak)
            if peak >= 0.999:
                why.append("clipped")
            per_word = dur / words
            if per_word < 0.2:
                why.append("too short: %.2f s/word" % per_word)
            if per_word > 0.95:
                why.append("too long: %.2f s/word" % per_word)
            if gap > 1.4:
                why.append("long silence inside: %.1f s" % gap)
            if voiced < 0.3 * dur:
                why.append("mostly silence")
            if why:
                flagged.append((g["name"], key, text[:80], "; ".join(why)))
    for f in flagged:
        print("FLAG %-40s %s | %s | %s" % f)
    print("%d sentences, %.1f min, %d flagged" % (total, secs / 60, len(flagged)))
    return 1 if flagged else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:3]))
