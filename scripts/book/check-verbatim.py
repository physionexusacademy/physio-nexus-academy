#!/usr/bin/env python3
"""
Prove the extracted chapters hold the book's words exactly: for every chapter, the words of the JSON (bold marks removed) must equal the words printed
in that chapter of the PDF, one for one, except the page furniture (running heads, page numbers), the chapter marker and title, and the
"Figure X (needed)" placeholder lines that the owner chose to hide. Any missing, extra or changed word is reported with its chapter.

Usage: python3 -I scripts/book/check-verbatim.py <book.pdf> <json-dir>
It also writes <json-dir>/fingerprints.json: per chapter, the SHA-256 of the sorted word list, so CI can check that nobody edits the book's words
in the JSON by hand (scripts/validate-book-conditions.ts) without the PDF.
"""
import collections, hashlib, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import importlib.util

spec = importlib.util.spec_from_file_location("ext", Path(__file__).parent / "extract-book.py")
ext = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ext)

import pymupdf as fitz

WORD = re.compile(r"[^\s]+")


def words(s: str):
    s = s.replace("**", "")
    return [w for w in WORD.findall(s)]


def unwrap(ws):
    """Join a word that ends in a hyphen with the next one, as the extractor does for words split at a line end."""
    out = []
    for w in ws:
        if out and out[-1].endswith("-") and len(out[-1]) > 1 and w[:1].isalnum():
            out[-1] += w
        else:
            out.append(w)
    return out


def json_words(rec):
    out = []
    if rec["lead"]:
        out += words(rec["lead"])
    for sec in rec["sections"]:
        if sec["title"]:
            out += words(sec["title"])
        for b in sec["blocks"]:
            t = b["t"]
            if t in ("p", "h"):
                out += words(b["text"])
            elif t in ("ul", "ol"):
                for i, it in enumerate(b["items"]):
                    if t == "ol":
                        out.append(f"{b['start'] + i}.")
                    out += words(it)
            elif t == "table":
                for _ in range(b.get("repeats", 0)):
                    for cell in b["rows"][0]:
                        out += words(cell)
                for r in b["rows"]:
                    for c in r:
                        out += words(c)
            elif t == "callout":
                out += words(b["label"])
                for x in b["body"]:
                    out += words(x)
            elif t == "flow":
                for x in b["steps"]:
                    out += words(x)
    return out


def book_words(doc):
    """Words per chapter, straight from the PDF lines (same furniture rules as the extractor, nothing else)."""
    per = {}
    cur = None
    title_done = False
    for pn in range(doc.page_count):
        items = ext.page_items(doc[pn])
        if "Index of Conditions, Tests and Techniques" in doc[pn].get_text() and pn > 20:
            cur = None
            continue
        if ext.is_divider(doc[pn]):
            continue
        for it in items:
            if it["k"] == "table":
                if cur:
                    for r in it["rows"]:
                        for c in r:
                            per[cur] += unwrap(words(c))
                continue
            p = ext.plain(it["text"])
            m = ext.MARK.match(p)
            if m:
                cur = (int(re.sub(r"\s", "", m.group(1))), int(re.sub(r"\s", "", m.group(2))))
                per[cur] = []
                title_done = False
                continue
            if cur is None:
                continue
            kind = ext.classify(it)
            if kind == "title":
                continue
            if kind in ("figure", "arrow"):
                continue
            per[cur] += words(it["text"])
    for k in per:
        per[k] = unwrap(per[k])
    return per


def main(pdf, jdir):
    doc = fitz.open(pdf)
    per = book_words(doc)
    bad = 0
    fps = {}
    for f in sorted(Path(jdir).glob("v*c*.json")):
        rec = json.loads(f.read_text())
        key = (rec["vol"], rec["ch"])
        got = collections.Counter(unwrap(json_words(rec)))
        want = collections.Counter(per.get(key, []))
        missing = want - got
        extra = got - want
        n = sum(want.values())
        fps[f.stem] = {"words": sum(got.values()), "sha256": hashlib.sha256("\n".join(sorted(got.elements())).encode()).hexdigest()}
        if missing or extra:
            bad += 1
            print(f"{f.stem}: {n} words; missing {sum(missing.values())} {list(missing.items())[:8]}; extra {sum(extra.values())} {list(extra.items())[:8]}")
    (Path(jdir) / "fingerprints.json").write_text(json.dumps(fps, indent=1))
    total = sum(len(v) for v in per.values())
    print(f"{len(per)} chapters, {total} words checked; {bad} chapter(s) differ")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
