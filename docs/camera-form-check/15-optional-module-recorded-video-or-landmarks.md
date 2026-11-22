---
title: "Optional module: storing de-identified landmark data or video clips"
subtitle: "Camera exercise-feedback studies (PNA RehabVerse Form Check) — version 0.1 DRAFT — NOT part of the base submission; add only if the investigators decide to and the committee approves"
---

**Status.** The base submission (documents 01 to 14) states that **no video, image or landmark coordinates are stored**. This optional module exists so that the investigators can ask the committee for more, if they choose to. Nothing in it is built or enabled. It must not be started without the committee's written approval of this module, and for patients (Part B) it needs its own separate approval.

# 1. Why consider it

Stored data would let the analysis be re-run when the model or the rules change, would let failures be examined, and would make the study reproducible by others. It is **not** needed for the primary question (agreement of the camera's angle with the reference), which is why the base submission does without it. The price is that the data become more identifiable and the safeguards heavier.

# 2. Options

| Option | What is stored | Identifiability | Re-analysis possible | Recommended use |
|---|---|---|---|---|
| 0 (base submission) | Numbers only (angles, counts, times) | Pseudonymised numbers | No | Part A and Part B |
| 1: Landmark time series | For each trial, the 33 body-landmark coordinates and their confidence per frame (a few tens of kilobytes), no image | A pose trace is not a picture, but it is body-derived data and could in principle be a biometric signature; treat as pseudonymised health data | Yes for the geometry and counting; not for the model | Part A, optional separate tick-box |
| 2: Face-blurred clips | Short video of the trial with the face blurred **on the participant's device before anything leaves it** | The body and the setting remain; some people could still be recognised | Yes, including the model | Part A only, optional separate tick-box, only if the committee agrees that the benefit justifies it |
| 3: Raw video | Unblurred video | Identifiable | Yes | **Not proposed** |

**Recommendation.** If anything is added, add Option 1 for Part A, with a separate optional consent. Option 2 only if the committee sees a clear need. No storage beyond Option 0 for patients unless separately approved.

# 3. Where it would be stored

| Place | For | Against |
|---|---|---|
| The application's private database storage (access-controlled bucket, signed short-lived upload links, row-level security, audit log) | Same controls as the study numbers; the participant's code already links them; one place to delete | The application provider hosts it [TO COMPLETE: region] |
| A Google Drive folder of the clinic's account | Familiar; large free space; easy for the investigators to open | Consumer-grade sharing (a link can be forwarded), weaker audit trail, the investigator's personal account becomes a data store; Google's terms apply; needs a restricted folder, a work account with two-step verification, no link sharing, access list, and a deletion routine; the browser would need permission to write to that account |

If Drive is chosen it should be a **work (Workspace) account with two-step verification, one restricted folder, sharing by link switched off, named editors only and the Drive access log kept**, and files uploaded by the participant's device straight to that folder, never through the application's server. The application cannot create the Google project or the folder; the investigator must provide them (see section 8).

# 4. Safeguards that would apply

- A **separate, optional** tick-box on the consent form; declining it does not change taking part in anything else.
- Nothing recorded unless the participant has ticked and the assessor confirms; a visible "recording" indicator on screen while it runs.
- Face blurring (Option 2) done on the device; the blurred file is the only one that is ever uploaded.
- File names contain the study code only; no names, dates of birth or contact details anywhere in the metadata.
- Access limited to named investigators; the independent analyst receives landmark files (Option 1) or clips only if the committee agrees.
- Encryption in transit and at rest; the audit log kept.
- **Short retention**: delete the files after analysis lock plus [TO COMPLETE: for example 6 months], earlier on request before analysis lock.
- No use for any purpose other than the study (no marketing, no model training outside the study) unless separately consented and approved.
- A participant who withdraws can have their files deleted before analysis lock.
- A breach plan that treats these files as higher-risk than the numbers (document 07, section 9).

# 5. Added risks and how they are controlled

| Risk | Control |
|---|---|
| Re-identification from the body or the setting | Option 1 preferred; blurring; plain background advised; short retention; limited access |
| Leak through a shared link or an unsecured account (Drive) | Work account, two-step verification, no link sharing, named editors, audit log; or private storage with signed links |
| Use beyond the study | Consent wording; the data-use statement; no secondary use without approval |
| Participant discomfort at being recorded | Separate optional tick-box; visible indicator; may stop; the base study is complete without it |
| Large files, long retention | Option 1 is small; deletion date recorded |

# 6. Text to add to the participant information sheet (English)

**Optional: keeping a record of your movement.** If you agree, we would also keep [Option 1: a list of numbers that describes where your joints were during each movement (this is not a picture or a video)] [Option 2: a short video of each movement in which your face is blurred by your own phone before anything is saved]. We would use it only to re-check the measurements for this study, would keep it for [TO COMPLETE: period] after the results are final, and would not share it outside the research team. It would be labelled with your study code, not your name. You can say no and still take part in everything else. You can ask us to delete it before the final analysis.

**Roman Urdu.** *Ikhtiyari: aap ki harkat ka record rakhna.* Agar aap razi hon to hum [Option 1: aap ke jodon ki jagah ko bayan karne wale numbers ki ek list (yeh tasveer ya video nahi hai)] [Option 2: har harkat ki ek chhoti video jis mein aap ka chehra aap ke apne phone se dhundla kar diya jata hai, is se pehle ke kuch save ho] bhi rakhenge. Hum ise sirf is study ke naapon ko dobara check karne ke liye istemal karenge, nateejon ke aakhri hone ke baad [TO COMPLETE: muddat] tak rakhenge, aur research team ke bahar share nahi karenge. Is par aap ka study code hoga, naam nahi. Aap na kah sakte hain aur baaki sab mein phir bhi shamil reh sakte hain. Aakhri tajziye se pehle aap ise hatane ko keh sakte hain.

# 7. Text to add to the consent form

- [ ] **Optional:** I agree that [a list of numbers describing my movement (no picture)] [a short video with my face blurred] may be kept for [TO COMPLETE: period] and used only to re-check this study's measurements. I know I can say no and still take part, and that I can ask for it to be deleted before the final analysis.

# 8. What the investigators must decide or provide, and what the engineers build

**Decisions.** Which option (none, 1, or 2); where it is stored; retention period; who may see it.
**If Google Drive is chosen, the investigator provides:** a Google work account; a Google Cloud project with the Drive API enabled and an OAuth client for the application's address; one restricted folder (its folder ID); confirmation of two-step verification and the access list. The application would then upload from the participant's device to that folder with the narrowest permission Google offers (access only to files the application itself creates).
**Engineering (after approval only):** an explicit recording control with a visible indicator; on-device face blur for Option 2; the upload and retry; deletion and withdrawal handling; the audit entries; tests that nothing is captured unless consent is recorded; a separate migration if private storage is used; updates to the data management plan and risk file.
