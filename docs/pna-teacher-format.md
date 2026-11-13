# PNA Teacher lessons in the `.pna` format

Clinical-skills lessons are written as plain text in `src/lib/teacher/lessons/authored/*.pna` (one lesson per file, files sorted by name).
`src/lib/teacher/authored.ts` parses them into the same `TeacherLesson` objects the TypeScript lessons use, so they go through the same
build (`npm run build:teacher-data`) and the same validator (`npm run validate:teacher`).

## Grammar

* One `key: value` pair per line; blank lines and lines starting with `#` are ignored.
* `EN || UR` separates English from natural Roman Urdu (a mix of English and Urdu). `\n` inside a value is a line break; `**bold**` works.
* Header keys: `slug`, `title`, `area` (see `TeacherArea`), `level` (`Foundation` | `Clinical`), `best`, `minutes`, `hook`, `goal`.
* Beats are written in teaching order:

| Line | Meaning |
| --- | --- |
| `say:`, `analogy:`, `memory:`, `mistake:`, `clinic:`, `safety:`, `evidence:` | `EN \|\| UR` text. `simpler:` after a `say` or `analogy` adds the simpler re-explanation. |
| `demo:` | `skill/item :: Title :: EN \|\| UR`. Plays a Skills Lab 3D demonstration (key must exist in `scenes.ts` or `demo3d.ts`) inside the lesson. |
| `widget:` | `widget-key :: EN \|\| UR`. One of the existing interactive widgets. |
| `check:` + `ok:` / `no:` lines (+ optional `hint:`) | Question `EN \|\| UR`; each option `option EN \|\| option UR \|\| feedback EN \|\| feedback UR`. Exactly one `ok:`. |
| `reveal:` | `Q EN \|\| Q UR \|\| A EN \|\| A UR`. |
| `steps:` + `step:` lines (+ optional `stepsur:`) | Title `EN \|\| UR`; each step `title :: detail` (English; `stepsur` replaces the list in Urdu). |
| `compare:` + `head:` + `row:` lines | Title `EN \|\| UR`; three columns separated by ` ;; `, each cell `EN \|\| UR`. |
| `sort:` + `cats:` + `item:` lines | Prompt; `cats:` two categories separated by ` ;; `; `item:` `text EN \|\| text UR \|\| 0\|1 \|\| why EN \|\| why UR`. |
| `case:` (+ `caseur:`) | `patient \|\| assessment \|\| treatment \|\| reassessment`. |
| `try:` + `tstep:` + `ask:` + `topt:` | Embodied activity (see `TeacherBeat`). |

* Footer: exactly three `summary:`, at least four `card:` (`front EN || front UR || back EN || back UR`), at least two `deeper:`
  (`title || href || note EN || note UR`; the href must be a real route) and two `source:` (`citation || PubMed search words`).

The validator also enforces: 10–20 beats, at least three checks, an analogy, a mistake and a clinical-application beat, balanced `**bold**`
in both languages, and complete Roman Urdu everywhere.

## Skills Lab link-up

`src/lib/skills/ur/lesson-links.ts` lists which lessons belong to each Skills Lab skill; they appear as chips at the top of the skill page and
at the end of every PNA Teacher walkthrough. The validator fails if a slug is unknown.
