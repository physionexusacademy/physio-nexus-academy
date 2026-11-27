# Conditions & Treatment Guide (`/conditions`)

Since 27 Nov 2026 the guide is the owner's book, **The Complete Physiotherapy Clinical Mastery** (Dr. Sajjad Raza PT), shown word for
word. Older addresses (`/msk-injuries`, `/treatment-plans`, `/knowledge-hub`) still redirect here.

## What the visitor gets

* **68 condition guides** (`/conditions/<slug>`), browsed by body area and kind of problem, with search that also knows everyday names.
* **16 Clinical Foundations chapters** (`/conditions/foundations/<slug>`): reasoning, history, examination, test accuracy, outcome measures,
  cardiopulmonary assessment, tissue healing, return to sport, and the treatment methods of Volume 13.
* Each chapter keeps the book's order (A to N) and is laid out to be easy to use: an at-a-glance strip (what it is, must not miss, start with),
  an A–N rail (side rail on a computer, chips on a phone), test cards, a red-flag panel with urgency, a yes/no decision pathway, flowcharts,
  exercise cards with progress and regress rules, reassessment traffic lights, a case card with the reasoning folded, answers to reveal, a
  checklist saved on the device, and a print view.
* **The book's words are never changed.** Bold runs are kept; `[Ref – to verify]` shows as a small "ref" badge; "Figure X (needed)"
  placeholders are hidden (owner's decisions).
* **Roman Urdu help** under each section is PNA's own plain explanation, labelled as such, and opens by itself when the site is in Roman Urdu.

## Where the content lives

| Path | What |
| --- | --- |
| `content/book/chapters/vXXcYY.json` | One chapter, extracted from the PDF (do not edit by hand) |
| `content/book/fingerprints.json` | Word fingerprint of every chapter, made from the PDF |
| `content/book/map.ts` | Where each chapter lives: slug, body area, type, older addresses (`was`), search names; retired guides |
| `content/book/help/<slug>.json` | Roman Urdu help per section (PNA's words) |
| `public/conditions-data/*.json` | Built guides (static files, not in the Worker) |
| `src/lib/conditions/generated/` | Small catalogue, foundations list, search words, redirects |

## Updating from a new edition of the book

```
python3 -I scripts/book/extract-book.py <book.pdf> /tmp/bookjson        # PyMuPDF; reads text, fonts, table borders, boxes
python3 -I scripts/book/check-verbatim.py <book.pdf> /tmp/bookjson       # must say: 0 chapter(s) differ
# copy /tmp/bookjson/v*.json (compact) to content/book/chapters/ and fingerprints.json to content/book/
npm run build:conditions-data
npm run build:related-data
npm run validate:conditions
```

The extractor drops page furniture, the PDF's doubled text layer, volume divider pages, the index, and rows that the PDF split at a page bottom
(their full copy is on the next page; the clipped copy is kept in `content/` only so the word check can count it).

`validate:conditions` (in CI before every deploy) fails if the built data is stale, if any chapter's words differ from the fingerprints, if a
chapter is not placed or has no Roman Urdu help, if help is for the wrong chapter or not in Roman letters, if a figure placeholder leaks, if an
old address would 404, or if a page links to a retired guide.

## Known gaps in the book (reported to the owner)

* 574 `[Ref – to verify]` marks and no verified reference list yet; 62 figures still to be drawn.
* 41 of the 68 condition chapters have every section A to N; the others mostly lack L (management pathway), F (differentials) or K (modalities).
* About 32 condition chapters have no clinical case (Section N has questions only).
