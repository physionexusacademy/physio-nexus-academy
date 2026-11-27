# Pending push (local only, waiting for the GitHub limit to reset)

Owner instruction: do not push to GitHub until the owner says the limit is open again. Commit locally only.

- Local branch: `content/teacher-evidence-and-safety` (no upstream set).
- Push target for this session: `ccr-d80b2ca1-20vitw`. On the remote it is still at `a4ad840`.
- Local commits not on GitHub yet: 49 commits on top of the remote branch, at the time of writing (`git log --oneline origin/ccr-d80b2ca1-20vitw..HEAD`).
- Pushing to `ccr-d80b2ca1-20vitw` does not start any GitHub Action. Production deploys only from `cloudflare-deploy`.

## What is waiting
- PNA Teacher: the 67 finalised lessons (S picks, research track R1-R52, evidence map G31-G35), 5 new learning paths and the regenerated daily pool.
- Full Posture Scan: 4-view capture, report, 3D skeleton viewer and validators, and PNA's own skeleton in `public/posture-skeleton/`.
- Skeleton model scripts in `scripts/posture-skeleton/own/`. They replace the removed BodyParts3D model and licence texts.

## When the limit is open
1. `git fetch origin ccr-d80b2ca1-20vitw`
2. `git push -u origin HEAD:ccr-d80b2ca1-20vitw`. If it is rejected, merge `FETCH_HEAD` first. Do not force-push.
3. Run all workflow checks again before any deploy (posture scan included). Production deploy only on the owner's go-ahead.
