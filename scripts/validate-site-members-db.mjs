/**
 * Members-only website, database side (runs the real migrations on local Postgres 17):
 *   node scripts/validate-site-members-db.mjs
 *
 * Covers: the switch defaults to OFF and anyone may ask its state; who counts as approved (staff, approved rows, active RehabVerse patients); a rejection or a
 * suspension always wins; a signed-in person with no request gets a pending one; the registration form; approve / reject / suspend / reinstate with the allowed
 * transitions only, a reason for reject and suspend, and no locking yourself out; only staff can see the list, decide or flip the switch; the member table is not
 * readable through the API; people who already use the site are approved by the migration so turning the switch on locks nobody out.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { createDb, callRpc, withRole } from "./rehabverse-local/db.mjs";

const db = await createDb();
let checks = 0;
const ok = (c, m) => { checks += 1; assert.ok(c, m); };
const eq = (a, b, m) => { checks += 1; assert.deepEqual(a, b, m); };
const sql = (text, params = []) => db.query(text, params).then((r) => r.rows);
async function makeUser(email, { admin = false, role = "owner" } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', $2)", [rows[0].id, role]);
  return { sub: rows[0].id, email, role: "authenticated", aud: "authenticated" };
}
const rpc = async (claims, fn, args) => (await callRpc(db, claims, fn, args)).value;
async function fails(claims, fn, args, pattern, message) {
  checks += 1;
  try { await callRpc(db, claims, fn, args); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error matching ${pattern}`);
}
const status = async (who) => (await rpc(who, "site_member_status", {})).status;

/* ---------- people who already use the site (before the switch exists in their life) ---------- */
const staff = await makeUser("staff@example.com", { admin: true });
const editor = await makeUser("editor@example.com", { admin: true, role: "editor" });
const student = await makeUser("student@example.com");
await db.query("insert into public.student_profiles (user_id, display_name) values ($1, 'Sana')", [student.sub]);
const activePatient = await makeUser("active@example.com");
const pendingPatient = await makeUser("pendingpt@example.com");
await db.query("insert into public.rehab_patients (user_id, full_name, age_years, phone, consent_version, status) values ($1, 'Active Patient', 40, '0300 1112223', 'v1', 'active'), ($2, 'Pending Patient', 41, '0300 1112224', 'v1', 'pending')", [activePatient.sub, pendingPatient.sub]);
// the migration's one-off step for existing people, run again now that these people exist
const mig = fs.readFileSync(new URL("../supabase/migrations/20261203120000_site_members.sql", import.meta.url), "utf8");
const backfill = mig.slice(mig.indexOf("-- People who already use the site"), mig.indexOf("-- ─────────────────────────────── for everyone"));
ok(/existing_staff/.test(backfill) && /existing_student/.test(backfill) && /existing_patient/.test(backfill), "the migration approves staff, students and active patients");
await db.exec(backfill);
eq((await sql("select source, status from public.site_members order by source")).map((r) => `${r.source}:${r.status}`), ["existing_patient:approved", "existing_staff:approved", "existing_staff:approved", "existing_student:approved"], "existing staff, the student and the active patient are approved; the pending patient is not");
eq(await status(staff), "approved", "staff are approved"); eq(await status(student), "approved", "the existing student is approved"); eq(await status(activePatient), "approved", "an active patient is approved");

/* ---------- the switch ---------- */
const anon = null;
eq(await rpc(anon, "site_access_mode", {}), false, "the website is open until the switch is turned on (anyone can ask)");
const stranger = await makeUser("new@example.com");
eq(await rpc(stranger, "site_access_mode", {}), false, "a signed-in person can ask too");
await fails(anon, "site_member_status", {}, /permission denied|not authorised|not signed in/, "an anonymous visitor has no standing to read");
await fails(stranger, "site_admin_set_access_mode", { p_on: true }, /not authorised/, "only staff can flip the switch");
await fails(staff, "site_admin_set_access_mode", { p_on: null }, /say on or off/, "the switch needs on or off");
eq(await rpc(staff, "site_admin_set_access_mode", { p_on: true }), { members_only: true }, "staff can turn it on");
eq(await rpc(anon, "site_access_mode", {}), true, "and everyone sees it on");
await rpc(staff, "site_admin_set_access_mode", { p_on: false });
eq(await rpc(anon, "site_access_mode", {}), false, "and off again");
ok((await sql("select count(*)::int as n from public.rehab_audit_log where action = 'member.access_mode'"))[0].n === 2, "each change of the switch is in the audit log");

/* ---------- a new person ---------- */
eq(await status(stranger), "none", "a signed-in person with no request has no standing yet");
eq((await rpc(stranger, "site_member_ensure", {})).status, "pending", "arriving creates a pending request");
eq((await sql("select count(*)::int as n from public.site_members where user_id = $1", [stranger.sub]))[0].n, 1, "one row");
await rpc(stranger, "site_member_ensure", {});
eq((await sql("select count(*)::int as n from public.site_members where user_id = $1", [stranger.sub]))[0].n, 1, "arriving again does not add another");
eq(await status(pendingPatient), "none", "a pending RehabVerse patient has no site request yet…");
eq((await rpc(pendingPatient, "site_member_ensure", {})).status, "pending", "…and becomes pending when they arrive");
eq((await rpc(activePatient, "site_member_ensure", {})).status, "approved", "an active patient stays approved");
eq((await rpc(staff, "site_member_ensure", {})).status, "approved", "staff stay approved");

/* ---------- the registration form ---------- */
const reg = await makeUser("reg@example.com");
await fails(reg, "site_member_register", { p_payload: { full_name: "A", phone: "03001112223" } }, /full name/, "a name is required");
await fails(reg, "site_member_register", { p_payload: { full_name: "Reg Person", phone: "123" } }, /phone number/, "a phone number the clinic can call is required");
await fails(reg, "site_member_register", { p_payload: { full_name: "Reg Person", phone: "0300 1112223", who: "wizard" } }, /say who you are/, "who must be one of the choices");
await fails(null, "site_member_register", { p_payload: { full_name: "Reg Person", phone: "0300 1112223" } }, /permission denied|not signed in/, "a visitor who is not signed in cannot register");
const r1 = await rpc(reg, "site_member_register", { p_payload: { full_name: "Reg Person", phone: "0300 1112223", city: "Lahore", who: "student" } });
eq(r1.status, "pending", "registering makes a pending request");
eq((await sql("select full_name, phone, city, who, email, source from public.site_members where user_id = $1", [reg.sub]))[0], { full_name: "Reg Person", phone: "0300 1112223", city: "Lahore", who: "student", email: "reg@example.com", source: "signup" }, "the details are kept");
await rpc(reg, "site_member_register", { p_payload: { full_name: "Reg P. Person", phone: "0300 1112223", who: "physiotherapist" } });
eq((await sql("select full_name, who from public.site_members where user_id = $1", [reg.sub]))[0], { full_name: "Reg P. Person", who: "physiotherapist" }, "while pending, the person can correct their details");

/* ---------- the member table is not readable by the API ---------- */
for (const who of [anon, stranger, staff]) {
  checks += 1;
  let blocked = false;
  try { await withRole(db, who, (tx) => tx.query("select * from public.site_members")); } catch { blocked = true; }
  assert.ok(blocked, `site_members cannot be read through the API (${who ? who.email : "anon"})`);
}
checks += 1;
let blockedSettings = false;
try { await withRole(db, stranger, (tx) => tx.query("update public.site_access_settings set members_only = true")); } catch { blockedSettings = true; }
assert.ok(blockedSettings, "the switch row cannot be changed through the API");

/* ---------- staff decide ---------- */
for (const [fn, args] of [["site_admin_members", {}], ["site_admin_decide_member", { p_user_id: reg.sub, p_decision: "approve" }], ["site_admin_set_access_mode", { p_on: true }], ["site_member_ensure", {}], ["site_member_status", {}], ["site_member_register", { p_payload: {} }]]) {
  await fails(null, fn, args, /permission denied/, `${fn}: an anonymous visitor is refused before the function even runs`);
}
await fails(stranger, "site_admin_members", {}, /not authorised/, "only staff see the list");
await fails(stranger, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "approve" }, /not authorised/, "only staff decide");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "maybe" }, /unknown decision/, "an unknown decision is refused");
await fails(staff, "site_admin_decide_member", { p_user_id: "00000000-0000-0000-0000-000000000000", p_decision: "approve" }, /person not found/, "an unknown person is refused");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "reject" }, /reason/, "a rejection needs a reason the person can read");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "suspend", p_note: "no" }, /reason/, "a suspension needs a reason too");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "suspend", p_note: "Not yet a member" }, /cannot be suspend/, "only an approved person can be suspended");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "reinstate" }, /cannot be reinstate/, "only a suspended person can be reinstated");
const list0 = await rpc(staff, "site_admin_members", {});
ok(list0.counts.pending === 3 && list0.counts.approved === 4 && list0.members_only === false, `counts: ${JSON.stringify(list0.counts)}`);
const rej = await rpc(staff, "site_admin_decide_member", { p_user_id: stranger.sub, p_decision: "reject", p_note: "We could not verify you" });
eq(rej.status, "rejected", "a pending request can be rejected");
const st = await rpc(stranger, "site_member_status", {});
eq([st.status, st.note], ["rejected", "We could not verify you"], "the person can read why");
await fails(staff, "site_admin_decide_member", { p_user_id: stranger.sub, p_decision: "reject", p_note: "again" }, /cannot be reject/, "a rejected person cannot be rejected again");
eq((await rpc(staff, "site_admin_decide_member", { p_user_id: stranger.sub, p_decision: "approve" })).status, "approved", "a rejected request can be approved later");
eq(await status(stranger), "approved", "and then the person is in");
eq((await rpc(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "approve", p_note: "Called and verified" })).status, "approved", "approve");
await fails(staff, "site_admin_decide_member", { p_user_id: reg.sub, p_decision: "approve" }, /cannot be approve/, "an approved person cannot be approved again");

/* ---------- a suspension always wins ---------- */
eq((await rpc(staff, "site_admin_decide_member", { p_user_id: activePatient.sub, p_decision: "suspend", p_note: "Misuse of the AI chat" })).status, "suspended", "an active patient can be suspended from the site");
eq(await status(activePatient), "suspended", "and the suspension beats the active patient record");
eq((await rpc(staff, "site_admin_decide_member", { p_user_id: activePatient.sub, p_decision: "reinstate" })).status, "approved", "reinstate");
eq(await status(activePatient), "approved", "back in");
await fails(staff, "site_admin_decide_member", { p_user_id: staff.sub, p_decision: "suspend", p_note: "oops" }, /lock yourself out/, "staff cannot lock themselves out");
eq((await rpc(staff, "site_admin_decide_member", { p_user_id: editor.sub, p_decision: "suspend", p_note: "Left the team" })).status, "suspended", "another staff member can be suspended");
await rpc(staff, "site_admin_decide_member", { p_user_id: editor.sub, p_decision: "reinstate" });
const owner2 = await makeUser("owner2@example.com", { admin: true, role: "admin" });
await rpc(owner2, "site_member_ensure", {});
eq(await status(owner2), "approved", "a second administrator is approved");
await rpc(staff, "site_admin_decide_member", { p_user_id: owner2.sub, p_decision: "suspend", p_note: "Left the team" });
eq(await status(owner2), "suspended", "a suspended administrator is suspended on the site (a suspension beats being staff; the admin area has its own check)");
await rpc(staff, "site_admin_decide_member", { p_user_id: owner2.sub, p_decision: "reinstate" });

/* ---------- registering never changes a decided request ---------- */
await rpc(reg, "site_member_register", { p_payload: { full_name: "Changed Name", phone: "0300 9998887" } });
eq((await sql("select full_name, status from public.site_members where user_id = $1", [reg.sub]))[0], { full_name: "Reg P. Person", status: "approved" }, "an approved person cannot rewrite their record through the form");

/* ---------- the list: filter, search, audit ---------- */
const approved = await rpc(staff, "site_admin_members", { p_status: "approved" });
ok(approved.members.every((m) => m.status === "approved") && approved.members.length === approved.counts.approved, "the list can be filtered by status");
eq((await rpc(staff, "site_admin_members", { p_search: "reg p." })).members.length, 1, "search finds a name");
ok((await rpc(staff, "site_admin_members", { p_search: "0300 1112223" })).members.some((m) => m.email === "reg@example.com"), "search finds a phone number");
await fails(staff, "site_admin_members", { p_status: "weird" }, /unknown status/, "an unknown status filter is refused");
ok((await sql("select count(*)::int as n from public.rehab_audit_log where action like 'member.%'"))[0].n >= 8, "every decision is in the audit log");

console.log(`Members-only database: ${checks} checks passed (switch off by default, approval, suspension wins, existing people approved, API cannot read the table).`);
