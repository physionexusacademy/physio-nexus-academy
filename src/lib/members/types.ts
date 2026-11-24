export type MemberStatus = "pending" | "approved" | "rejected" | "suspended";
export type MemberRow = {
  user_id: string; full_name: string; email: string | null; phone: string | null; city: string | null; who: string | null;
  status: MemberStatus; source: string; requested_at: string; decided_at: string | null; decision_note: string | null;
};
export type MembersList = { members_only: boolean; counts: Record<MemberStatus, number>; members: MemberRow[] };
export type MemberDecision = "approve" | "reject" | "suspend" | "reinstate";
