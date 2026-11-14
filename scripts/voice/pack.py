#!/usr/bin/env python3
"""
Packs the recordings into the files the website serves.

  python3 scripts/voice/pack.py <sentences.json> <cache-dir> <out-dir> [voice-name]

For every group (avatar, rehab, one per lesson ...) it joins that group's sentences into one MP3 (mono, 24 kHz, 32 kbit/s) and writes
<out-dir>/clips.json: for each sentence key (src/lib/speech/clip-key.ts) the pack file it is in and where. Each sentence is trimmed of the
silence the voice puts around it, brought to the same loudness, and followed by a short pause, so the browser can play sentences from
any packs one after another as one natural line. <out-dir>/packs.json is just the list of pack names (tiny: a page reads it to find
out whether its lines are recorded without loading clips.json). Needs ffmpeg (libmp3lame) and numpy.
"""
import hashlib, json, os, subprocess, sys
import numpy as np

RATE = 24000
LEAD = 0.25        # silence at the start of every pack (an MP3 decoder may drop a few ms there)
TAIL = 0.26        # pause after every sentence
EDGE = 0.04        # kept around the voiced part
THRESH = 0.012     # below this is silence
TARGET_RMS = 0.075 # loudness of the voiced part
PEAK = 0.9


def load(path):
    return np.frombuffer(open(path, "rb").read(), dtype="<i2").astype(np.float32) / 32768.0


def prepare(x):
    loud = np.where(np.abs(x) > THRESH)[0]
    if len(loud) == 0:
        return None
    a = max(0, loud[0] - int(EDGE * RATE))
    b = min(len(x), loud[-1] + int(EDGE * RATE))
    y = x[a:b].copy()
    voiced = y[np.abs(y) > THRESH]
    rms = float(np.sqrt(np.mean(voiced ** 2))) if len(voiced) else 0.0
    gain = TARGET_RMS / rms if rms > 0 else 1.0
    gain = min(gain, PEAK / max(1e-6, float(np.abs(y).max())))
    y *= gain
    return np.concatenate([y, np.zeros(int(TAIL * RATE), dtype=np.float32)])


def main(list_file, cache, out, voice="bm_george"):
    groups = json.load(open(list_file))["groups"]
    os.makedirs(out, exist_ok=True)
    index = {"v": 1, "voice": voice, "rate": RATE, "packs": [], "clips": {}}
    total_ms = 0
    names = []
    for g in groups:
        pieces, clips, at = [np.zeros(int(LEAD * RATE), dtype=np.float32)], {}, int(LEAD * RATE)
        for key in g["keys"]:
            path = os.path.join(cache, key + ".pcm")
            if not os.path.exists(path):
                continue
            y = prepare(load(path))
            if y is None:
                continue
            clips[key] = (round(at * 1000 / RATE), round(len(y) * 1000 / RATE))
            pieces.append(y)
            at += len(y)
        if not clips:
            continue
        if len(clips) < len(g["keys"]):
            # A pack is only published when all its sentences were read: a lesson with a hole in it would show a Listen button that sometimes stays silent.
            print("%-52s incomplete (%d of %d sentences): not packed" % (g["name"], len(clips), len(g["keys"])))
            continue
        pcm = (np.clip(np.concatenate(pieces), -1, 1) * 32767).astype("<i2").tobytes()
        # The file name carries a hash of its content, so a browser can keep a pack for ever and a regenerated pack is a new file.
        stem = "%s.%s" % (g["name"], hashlib.sha1(pcm).hexdigest()[:8])
        mp3 = os.path.join(out, stem + ".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "-", "-codec:a", "libmp3lame", "-b:a", "32k", "-ar", str(RATE), "-ac", "1", mp3], input=pcm, check=True)
        pack_id = len(index["packs"])
        index["packs"].append(stem)
        names.append(g["name"])
        for key, (start, dur) in clips.items():
            index["clips"][key] = [pack_id, start, dur]
        total_ms += round(at * 1000 / RATE)
        print("%-52s %4d sentences %6.1f s %6.0f KB" % (g["name"], len(clips), at / RATE, os.path.getsize(mp3) / 1024))
    json.dump(index, open(os.path.join(out, "clips.json"), "w"), separators=(",", ":"))
    json.dump(names, open(os.path.join(out, "packs.json"), "w"), separators=(",", ":"))
    print("total %.1f min, %d clips, clips.json %d KB" % (total_ms / 60000, len(index["clips"]), os.path.getsize(os.path.join(out, "clips.json")) / 1024))


if __name__ == "__main__":
    main(*sys.argv[1:])
