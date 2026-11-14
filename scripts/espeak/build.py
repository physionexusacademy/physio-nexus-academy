#!/usr/bin/env python3
"""
Builds the small eSpeak NG bundle served from public/teacher/espeak/ (the built-in male reading voice).

Input : the npm package `@echogarden/espeak-ng-emscripten` (eSpeak NG compiled to JavaScript, GPL-3.0), unpacked in a folder.
        (`npm pack @echogarden/espeak-ng-emscripten@0.3.5`, then extract). It is NOT a dependency of the website: only the files
        this script writes are committed.
Output: espeak-ng.js        the same file with its data manifest reduced to the files below
        espeak-ng-data.json the matching data file (about 1 MB instead of 24 MB): English (US/UK), Hindi and Urdu rules,
                            the phoneme data, and the male voice variants. No female variant is included.
                            It is a binary file. It is named .json only so Cloudflare compresses it in transit (it does not
                            compress "octet-stream" files), which halves the download.
Usage : python3 scripts/espeak/build.py <unpacked-package-dir> <output-dir>
"""
import re, sys, os

PREFIX = "/usr/share/espeak-ng-data/"
KEEP_EXACT = {
    "phondata", "phonindex", "phontab", "intonations",
    "en_dict", "hi_dict", "ur_dict",
    "lang/gmw/en", "lang/gmw/en-US", "lang/gmw/en-GB-x-rp", "lang/gmw/en-GB-x-gbclan", "lang/gmw/en-GB-x-gbcwmd",
    "lang/inc/hi", "lang/inc/ur",
}
KEEP_PREFIX = ("voices/!v/m",)  # male variants m1..m8 only
DATA_NAME = "espeak-ng-data.json"


def main(src, out):
    js_path = os.path.join(src, "espeak-ng.js")
    data_path = os.path.join(src, "espeak-ng.data")
    js = open(js_path, encoding="utf-8", errors="surrogateescape").read()
    data = open(data_path, "rb").read()
    m = re.search(r"files:\[(.*?)\],remote_package_size:(\d+)", js, re.S)
    items = re.findall(r'\{filename:"([^"]+)",start:(\d+),end:(\d+)\}', m.group(1))
    kept, blob, pos = [], bytearray(), 0
    for name, a, b in items:
        rel = name[len(PREFIX):] if name.startswith(PREFIX) else name
        if rel in KEEP_EXACT or rel.startswith(KEEP_PREFIX):
            chunk = data[int(a):int(b)]
            kept.append('{filename:"%s",start:%d,end:%d}' % (name, pos, pos + len(chunk)))
            blob += chunk
            pos += len(chunk)
    missing = [k for k in KEEP_EXACT if not any(n == PREFIX + k for n, _, _ in items)]
    if missing:
        sys.exit("missing from the package: %s" % missing)
    new_manifest = "files:[%s],remote_package_size:%d" % (",".join(kept), len(blob))
    js = js[: m.start()] + new_manifest + js[m.end():]
    js = js.replace("espeak-ng.data", DATA_NAME)
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "espeak-ng.js"), "w", encoding="utf-8", errors="surrogateescape").write(js)
    open(os.path.join(out, DATA_NAME), "wb").write(bytes(blob))
    print("kept %d of %d files, data %d bytes (was %d), js %d bytes" % (len(kept), len(items), len(blob), len(data), len(js.encode("utf-8", "surrogateescape"))))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
