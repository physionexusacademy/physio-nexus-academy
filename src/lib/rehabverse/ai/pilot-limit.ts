/**
 * The pilot limit (how many patients may have AI switched on). By default there is none: "no limit" is stored as this number, which no clinic
 * reaches, so the database functions need no special case. See supabase/migrations/20261125120000_rehab_ai_pilot_no_limit.sql.
 */
export const PILOT_NO_LIMIT = 100000;

export const isNoLimit = (max: number) => max >= PILOT_NO_LIMIT;

/** "no limit" or "limit 25", for the dashboard. */
export const limitLabel = (max: number) => (isNoLimit(max) ? "no limit" : `limit ${max}`);
