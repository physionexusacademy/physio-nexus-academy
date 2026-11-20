# Daily PNA content architecture

This folder holds the Daily Clinical Challenge question pool (`pool.generated.ts`).

The Knowledge Hub articles were retired in 2026-11 (their addresses redirect to the Conditions & Treatment Guide). The Clinical Case Lab,
its research case reports and the Clinical Registry pages were retired in 2026-11 too (`/case-lab` redirects to the Virtual Patient,
`/clinical-registry` to the Learn hub). The Registry's database definitions stay in `supabase/clinical-registry/` and its data was not touched.

## Safety rules

- Never delete or overwrite existing daily content without a replacement.
- Avoid duplicate question ids.
- Keep all references traceable.
