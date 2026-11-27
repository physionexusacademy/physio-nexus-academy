#!/usr/bin/env python3
"""
Extract "The Complete Physiotherapy Clinical Mastery" (Dr. Sajjad Raza PT) into one JSON file per chapter, keeping the author's words exactly.

Usage: python3 -I scripts/book/extract-book.py <book.pdf> <out-dir>

What it does, and nothing more:
  * reads every line with its font, size, colour and position, and every table, with PyMuPDF;
  * drops page furniture (running heads, page numbers, volume dividers) and the second copy of lines the PDF draws twice;
  * drops "Figure X (needed): ..." placeholder lines (owner's decision: hidden until the picture exists);
  * groups lines into headings, paragraphs, bullet lists, numbered lists, callouts (Teacher's voice, Common student trap, ...),
    flowchart boxes and tables, in reading order, split by the book's A to N sections.
Bold runs are kept as **...**. Nothing is reworded: scripts/book/check-verbatim.py proves every word of the output is in the book, in order.
"""
import json, re, sys, unicodedata
from pathlib import Path

import pymupdf as fitz

CALLOUTS = {
    "TEACHER'S VOICE": "teacher", "TEACHER’S VOICE": "teacher", "COMMON STUDENT TRAP": "trap", "MEMORY HOOK": "memory",
    "STOP AND THINK": "stop", "CLINICAL CASE": "case", "WHY THIS MATTERS": "why",
}
MARK = re.compile(r"^V\s*O\s*L\s*U\s*M\s*E\s+([\d\s]+?)\s*·\s*C\s*H\s*A\s*P\s*T\s*E\s*R\s+([\d\s]+)$")
FIGURE = re.compile(r"^Figure\s+[\d.]+\s*\(needed\)")
DIVIDER = re.compile(r"^V\s*O\s*L\s*U\s*M\s*E\s+[\d\s]+$", re.M)


def is_divider(page) -> bool:
    """A volume's opening page (big title, its chapter list): not part of any chapter."""
    t = page.get_text()
    return bool(DIVIDER.search(t)) and "C H A P T E R" not in t


SECTION = re.compile(r"^([A-N])(?:\s+to\s+([A-N]))?\.\s+\S")


def clean(s: str) -> str:
    s = unicodedata.normalize("NFC", s).replace(" ", " ").replace("‑", "-")
    return re.sub(r"[ \t]+", " ", s).strip()


def span_text(spans) -> str:
    """Join a line's spans, wrapping bold runs in ** (adjacent bold runs merge)."""
    out = []
    for sp in spans:
        t = sp["text"]
        if not t:
            continue
        bold = "Bold" in sp["font"] or (sp["flags"] & 16)
        out.append((bool(bold), t))
    merged = []
    for b, t in out:
        if merged and merged[-1][0] == b:
            merged[-1] = (b, merged[-1][1] + t)
        else:
            merged.append((b, t))
    s = ""
    for b, t in merged:
        if b and t.strip():
            lead = t[: len(t) - len(t.lstrip())]
            trail = t[len(t.rstrip()):]
            s += f"{lead}**{t.strip()}**{trail}"
        else:
            s += t
    return s


def join(a: str, b: str) -> str:
    """Join two wrapped lines. A line that ends in a hyphen is a compound word split by the wrap (the book does not hyphenate syllables)."""
    if not a:
        return b
    if not b:
        return a
    if a.endswith("-") and not a.endswith(" -") and b[:1].isalnum():
        return a + b
    if a.endswith("-**") and b.startswith("**"):
        return a[:-2] + b[2:]
    return a + " " + b


def plain(s: str) -> str:
    return s.replace("**", "")


HEAD_FILLS = ((0.04, 0.15, 0.27), (0.7, 0.15, 0.12))


def grid_tables(page):
    """The book draws each table row as thin vertical border strips at the column edges (and header cells as dark or red fills).
    Rows with the same column edges that touch one another form one table."""
    bands = {}
    for dr in page.get_drawings():
        f = dr.get("fill")
        r = dr["rect"]
        if not f:
            continue
        if r.width <= 1.6 and r.height >= 5:
            bands.setdefault((round(r.y0), round(r.y1)), set()).add(round(r.x0))
        elif r.height >= 5 and 8 < r.width < 500 and tuple(round(c, 2) for c in f) in HEAD_FILLS:
            b = bands.setdefault((round(r.y0), round(r.y1)), set())
            b.add(round(r.x0))
            b.add(round(r.x1))
    rows = []
    for (y0, y1), xs in sorted(bands.items()):
        xs = sorted(xs)
        merged = []
        for x in xs:
            if merged and x - merged[-1] <= 3:
                continue
            merged.append(x)
        if len(merged) < 3:
            continue  # a panel outline or a single band, not a table row
        if rows and abs(rows[-1]["y0"] - y0) <= 2 and rows[-1]["xs"] == merged:
            rows[-1]["y1"] = max(rows[-1]["y1"], y1)
            continue
        rows.append({"y0": y0, "y1": y1, "xs": merged})
    tables = []
    for r in rows:
        if tables and same_cols(tables[-1]["xs"], r["xs"]) and r["y0"] <= tables[-1]["rows"][-1]["y1"] + 8:
            tables[-1]["rows"].append(r)
        else:
            tables.append({"xs": r["xs"], "rows": [r]})
    return tables


def same_cols(a, b):
    return len(a) == len(b) and all(abs(x - y) <= 3 for x, y in zip(a, b))


def page_items(page):
    """Lines (outside tables) and tables of one page, each with a y position, in reading order."""
    tables = grid_tables(page)
    lines = []
    seen = set()
    for b in page.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            spans = [s for s in l["spans"] if s["text"].strip()]
            if not spans:
                continue
            x0, y0, x1, y1 = l["bbox"]
            txt = clean(span_text(spans))
            if not txt:
                continue
            s0 = spans[0]
            if y0 < 45 or y0 > 795 or s0["font"].startswith("Times"):
                continue  # page furniture: running heads, page numbers, footer
            key = (plain(txt), round(y0 / 4), round(x0 / 4))
            if key in seen:
                continue  # the PDF draws some lines twice
            seen.add(key)
            lines.append({"k": "line", "y": y0, "yc": (y0 + y1) / 2, "x": round(x0), "x1": round(x1), "size": round(s0["size"], 1), "font": s0["font"],
                          "color": s0["color"], "text": txt})
    # flowchart steps: white boxes with a teal border; callouts: wide tinted boxes that hold a callout label
    flow_boxes, tinted = [], []
    for dr in page.get_drawings():
        r, f, c = dr["rect"], dr.get("fill"), dr.get("color")
        if dr["type"] == "fs" and c and tuple(round(v, 2) for v in c) == (0.07, 0.5, 0.55) and f and min(f) > 0.98 and 12 < r.height < 160 and r.width > 60:
            flow_boxes.append(r)
        elif f and dr["type"] == "f" and r.width > 250 and 18 < r.height < 500 and min(f) < 0.995 and tuple(round(v, 2) for v in f) not in HEAD_FILLS:
            tinted.append(r)
    def inside(ln, r):
        return r.x0 - 2 <= ln["x"] <= r.x1 and r.y0 - 2 <= ln["yc"] <= r.y1 + 2
    callout_boxes = []
    for r in tinted:
        if any(inside(ln, r) and (plain(ln["text"]).upper() in CALLOUTS) for ln in lines):
            if not any(abs(r.y0 - q.y0) < 2 and abs(r.y1 - q.y1) < 2 for q in callout_boxes):
                callout_boxes.append(r)
    for ln in lines:
        for i, r in enumerate(flow_boxes):
            if inside(ln, r):
                ln["box"] = f"f{page.number}-{i}"
        for i, r in enumerate(callout_boxes):
            if inside(ln, r):
                ln["box"] = f"c{page.number}-{i}"
    items = []
    used = set()
    for t in tables:
        top, bottom = t["rows"][0]["y0"], t["rows"][-1]["y1"]
        out_rows, head = [], False
        for ri, r in enumerate(t["rows"]):
            cells = [[] for _ in range(len(t["xs"]) - 1)]
            white = False
            for li, ln in enumerate(lines):
                if li in used or not (r["y0"] - 1 <= ln["yc"] <= r["y1"] + 1):
                    continue
                if not (t["xs"][0] - 2 <= ln["x"] < t["xs"][-1]):
                    continue
                col = max(i for i in range(len(t["xs"]) - 1) if ln["x"] >= t["xs"][i] - 2)
                cells[col].append(ln)
                used.add(li)
                if ln["color"] == 0xFFFFFF:
                    white = True
            row = []
            for cell in cells:
                acc = ""
                for c in sorted(cell, key=lambda c: (round(c["y"]), c["x"])):
                    acc = join(acc, c["text"])
                row.append(clean(acc))
            if ri == 0 and white:
                head = True
                row = [plain(c) for c in row]
            if any(row):
                out_rows.append(row)
        if out_rows:
            items.append({"k": "table", "y": top, "y1": bottom, "rows": out_rows, "header": head})
    items.extend(ln for li, ln in enumerate(lines) if li not in used)
    items.sort(key=lambda i: (round(i["y"]), i.get("x", 0)))
    return items


def classify(line):
    t, size, font, color, x = line["text"], line["size"], line["font"], line["color"], line["x"]
    p = plain(t)
    if MARK.match(p):
        return "mark"
    if FIGURE.match(p):
        return "figure"
    if p in ("▼", "↓"):
        return "arrow"
    if p.upper() in CALLOUTS:
        return "callout"
    box = line.get("box", "")
    if box.startswith("f"):
        return "flow"
    if box.startswith("c"):
        return "cbody"
    if color == 0xFFFFFF and "Bold" in font and size >= 9:
        return "section"  # white text on the coloured section band
    if size >= 14 and "Bold" in font:
        return "title"
    if color == 0x13808B and "Bold" in font and size >= 8.4:
        return "subhead"  # E1. Spurling test ..., or a teal sub-heading in the foundation chapters
    return "body"


def build(pdf_path: str, out_dir: str):
    doc = fitz.open(pdf_path)
    chapters = []
    cur = None
    for pn in range(doc.page_count):
        if "Index of Conditions, Tests and Techniques" in doc[pn].get_text() and pn > 20:
            break  # the index at the back ends the last chapter
        if is_divider(doc[pn]):
            continue
        items = page_items(doc[pn])
        for it in items:
            if it["k"] == "line":
                kind = classify(it)
                if kind == "mark":
                    m = MARK.match(plain(it["text"]))
                    vol = int(re.sub(r"\s", "", m.group(1)))
                    ch = int(re.sub(r"\s", "", m.group(2)))
                    cur = {"vol": vol, "ch": ch, "title": "", "lead": "", "raw": [], "page": pn + 1}
                    chapters.append(cur)
                    continue
                if cur is None:
                    continue
                if kind == "title":
                    if not cur["raw"] and not cur.get("title_done"):
                        cur["title"] = join(cur["title"], plain(it["text"]))
                    continue
                if cur["title"]:
                    cur["title_done"] = True
                it["kind"] = kind
                it["page"] = pn + 1
                cur["raw"].append(it)
            else:
                if cur is not None:
                    it["page"] = pn + 1
                    cur["raw"].append(it)
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    out = []
    for c in chapters:
        blocks = group(c["raw"])
        lead = ""
        if blocks and blocks[0]["t"] == "p" and blocks[0].get("italic"):
            lead = blocks.pop(0)["text"]
        sections = split_sections(blocks)
        rec = {"v": 2, "vol": c["vol"], "ch": c["ch"], "title": fix_title(c["title"]), "lead": lead, "page": c["page"], "sections": sections}
        out.append(rec)
        (Path(out_dir) / f"v{c['vol']:02d}c{c['ch']:02d}.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    print(f"{len(out)} chapters written to {out_dir}")


def near(prev, it, factor=1.8):
    """The next line of the same text block: close below the previous one (relative to the font size)."""
    if prev is None or prev["k"] != "line" or prev["page"] != it["page"]:
        return False
    g = it["y"] - prev["y"]
    return 0 < g < max(prev["size"], it["size"]) * factor


RIGHT_FULL = 455  # the text column ends near x = 540; a line that stops well short of it was not wrapped

ENDS = (".", ":", "?", "!", ")", "]", "”", '"', "**")


def fix_title(t: str) -> str:
    """The chapter title is drawn twice: a decorative copy (some words in capitals) and the plain one. Keep the plain copy."""
    w = t.split()
    for k in range(len(w) // 2, 0, -1):
        a, b = w[:len(w) - k], w[len(w) - k:]
        if [x.lower() for x in a] == [x.lower() for x in b]:
            return " ".join(b)
    h = len(w) // 2
    if len(w) % 2 == 0 and [x.lower() for x in w[:h]] == [x.lower() for x in w[h:]]:
        return " ".join(w[h:])
    return t


def group(raw):
    """Turn the stream of lines and tables into blocks: p, ul, ol, h (subhead), callout, flow, table."""
    blocks = []
    prev = None
    for it in raw:
        last = blocks[-1] if blocks else None
        if it["k"] == "table":
            rows = it["rows"]
            # a table that continues on the next page (or below a header-only piece): same column count, nothing in between
            if last and last["t"] == "table" and prev is not None and prev["k"] == "table" and len(rows[0]) == len(last["rows"][0]):
                if it["header"] and rows[0] == last["rows"][0]:
                    rows = rows[1:]  # the header printed again at the top of the next page
                    last["repeats"] = last.get("repeats", 0) + 1
                last["rows"].extend(rows)
                last["head"] = last["head"] or it["header"]
            else:
                blocks.append({"t": "table", "head": it["header"], "rows": rows})
            prev = it
            continue
        kind, text = it["kind"], it["text"]
        if kind in ("figure", "arrow"):
            prev = it if kind == "figure" else prev
            if kind == "arrow" and last and last["t"] == "flow":
                last["_cut"] = True
            continue
        same_box = prev is not None and prev["k"] == "line" and it.get("box") and prev.get("box") == it.get("box")
        if kind == "section":
            if prev is not None and prev.get("kind") == "section" and near(prev, it) and last and last["t"] == "section":
                last["text"] = join(last["text"], plain(text))
            else:
                blocks.append({"t": "section", "text": plain(text)})
        elif kind == "subhead":
            if prev is not None and prev.get("kind") == "subhead" and near(prev, it) and last and last["t"] == "h":
                last["text"] = join(last["text"], plain(text))
            else:
                blocks.append({"t": "h", "text": plain(text)})
        elif kind == "callout":
            blocks.append({"t": "callout", "kind": CALLOUTS[plain(text).upper()], "label": plain(text), "body": []})
        elif kind == "cbody":
            if last and last["t"] == "callout":
                if last["body"] and same_box and near(prev, it):
                    last["body"][-1] = join(last["body"][-1], text)
                else:
                    last["body"].append(text)
            else:
                blocks.append({"t": "p", "text": text})
        elif kind == "flow":
            if last and last["t"] == "flow" and not last.get("_cut") and same_box:
                last["steps"][-1] = join(last["steps"][-1], text)
            elif last and last["t"] == "flow":
                last["steps"].append(text)
                last.pop("_cut", None)
            else:
                blocks.append({"t": "flow", "steps": [text]})
        else:
            body_block(blocks, prev, it)
        prev = it
    for b in blocks:
        b.pop("_cut", None)
    return blocks


def body_block(blocks, prev, it):
    text = it["text"]
    last = blocks[-1] if blocks else None
    num = re.match(r"^(?:\*\*)?(\d{1,2})\.\s+", text)
    # a wrapped line: close below, and the previous line ran to the right margin (a short line ends its item or paragraph)
    close = prev is not None and prev["k"] == "line" and prev.get("kind") == "body" and near(prev, it) and prev["x1"] >= RIGHT_FULL
    # a sentence carried over to the next page
    carried = (prev is not None and prev["k"] == "line" and prev["page"] != it["page"] and prev.get("kind") == "body" and last is not None
               and last["t"] in ("p", "ul", "ol") and not (last["text"] if last["t"] == "p" else last["items"][-1]).rstrip().endswith(ENDS) and not num)
    if (close and not (num and it["x"] <= prev["x"] + 1)) or carried:
        if last is not None and last["t"] == "p":
            last["text"] = join(last["text"], text)
            return
        if last is not None and last["t"] in ("ul", "ol"):
            last["items"][-1] = join(last["items"][-1], text)
            return
    if num and it["size"] < 11:
        body = re.sub(r"^(\*\*)?\d{1,2}\.\s+", lambda m: m.group(1) or "", text)
        if body.startswith("****"):
            body = body[4:]
        n = int(num.group(1))
        if last is not None and last["t"] == "ol" and n == last["start"] + len(last["items"]):
            last["items"].append(body)
        else:
            blocks.append({"t": "ol", "start": n, "items": [body]})
        return
    if it["x"] >= 70:
        if last is not None and last["t"] == "ul" and prev is not None and abs(prev["x"] - it["x"]) <= 3:
            last["items"].append(text)
        else:
            blocks.append({"t": "ul", "items": [text]})
        return
    blocks.append({"t": "p", "text": text, **({"italic": True} if "Italic" in it["font"] else {})})


def split_sections(blocks):
    """Group blocks under their section band. The A to N bands become keyed sections; other bands (summary, evidence, ...) keep their heading."""
    sections = []
    cur = {"key": "intro", "title": "", "blocks": []}
    for b in blocks:
        if b["t"] == "section":
            if cur["blocks"] or cur["title"]:
                sections.append(cur)
            m = SECTION.match(b["text"])
            key = m.group(1) if m else slug(b["text"])
            cur = {"key": key, "title": b["text"], "blocks": []}
        else:
            cur["blocks"].append(b)
    if cur["blocks"] or cur["title"]:
        sections.append(cur)
    return sections


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
