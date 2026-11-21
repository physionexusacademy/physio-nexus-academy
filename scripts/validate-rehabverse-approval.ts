import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * RehabVerse account approval: a new account is a request the clinic approves; no confirmation e-mail is sent, and until it is approved the person
 * can do nothing. (The behaviour in the database is tested by validate-rehabverse-db.mjs; the screens by scripts/rehabverse-local/e2e-approval.cjs.)
 */
let checks = 0;
const ok = (condition: boolean, message: string) => { checks++; assert.ok(condition, message); };
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const actions = read("src/app/rehabverse/actions.ts");
const register = actions.slice(actions.indexOf("export async function registerAction"), actions.indexOf("type SignedProfile"));
ok(/auth\.admin\.createUser/.test(register) && /email_confirm:\s*true/.test(register), "register: the server creates the sign-in already confirmed (no confirmation e-mail)");
ok(!/auth\.signUp\(/.test(register) && !/emailRedirectTo/.test(register), "register: Supabase's own sign-up (which sends the confirmation mail) is not used");
ok(/bad_phone/.test(register) && /replace\(\/\\D\/g/.test(register), "register: a phone number the clinic can call is required");
ok(/rehab_register_patient/.test(register) && /alertClinic\(/.test(register), "register: the patient record is created and the clinic is told");
ok(/pendingApproval:\s*true/.test(register), "register: the answer says the request is waiting");
ok(/needsEmailConfirmation/.test(actions) === false, "no screen waits for an e-mail confirmation any more");

const guard = read("src/lib/rehabverse/guard.ts");
ok(/status !== "active"\) redirect\("\/rehabverse\/pending"\)/.test(guard), "guard: a patient who is not active is sent to the waiting screen");
const pending = read("src/components/rehabverse/PendingApproval.tsx");
ok(/myAccountStatusAction/.test(pending) && /setInterval\(check, 20000\)/.test(pending) && /\/rehabverse\/start/.test(pending), "waiting screen: asks again every 20 seconds and moves on when approved");
ok(/WhatsApp the clinic/.test(pending) && /Clinic ka note/.test(pending), "waiting screen: the clinic can be reached and a rejection reason is shown (English and Roman Urdu)");

const auth = read("src/components/rehabverse/AuthForm.tsx");
ok(/Send my account request/.test(auth) && /rv-hint/.test(auth) && /name="phone"[^>]*required/.test(auth), "sign-up form: it is a request and the phone is required");
ok(/\/rehabverse\/pending/.test(auth), "forms: a waiting account is sent to the waiting screen after sign-up and sign-in");

const admin = read("src/components/rehabverse/admin/AccountRequests.tsx");
ok(/decideRegistrationAction/.test(admin) && /Approve/.test(admin) && /Reject/.test(admin) && /Tell them on WhatsApp/.test(admin), "admin: approve, reject with a reason, and tell the person on WhatsApp");
ok(/AccountRequests/.test(read("src/app/admin/(dashboard)/rehabverse/page.tsx")) && /getRegistrations/.test(read("src/app/admin/(dashboard)/rehabverse/page.tsx")), "admin: the clinician inbox shows the account requests");
ok(/rehab_admin_decide_patient/.test(read("src/app/admin/(dashboard)/rehabverse/actions.ts")), "admin: the decision goes through the staff-only database function");

const migration = read("supabase/migrations/20261126120000_rehab_account_approval.sql");
ok(/'pending', 'active', 'rejected', 'archived'/.test(migration) && /'pending'\s*\n\s*\)\s*\n\s*on conflict/.test(migration), "migration: new accounts start pending");
ok(/rehab_admin_registrations\(\)/.test(migration) && /rehab_admin_decide_patient\(uuid, text, text\)/.test(migration) && /rehab__require_admin/.test(migration), "migration: only staff can list and decide");
ok(/patient\.registration_requested/.test(migration) && /'patient\.' \|\| p_decision/.test(migration), "migration: every request and decision is written to the audit log");
ok(/'ai_assist', p\.ai_assist/.test(migration), "migration: the admin patient list keeps the AI switch (the latest earlier definition is carried over)");

const middleware = read("src/middleware.ts");
ok(/\/rehabverse\/pending/.test(middleware), "middleware: the sign-in session is refreshed on the waiting screen");

console.log(`RehabVerse account approval: ${checks} checks passed (no confirmation e-mail, the clinic approves, a waiting account can do nothing).`);
