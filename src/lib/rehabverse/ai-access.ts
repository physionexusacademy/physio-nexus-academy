import "server-only";
import { rpc } from "./api";

/**
 * The one check every RehabVerse AI feature makes on the SERVER before it does anything:
 *   1. the global kill switch (set REHAB_AI_ENABLED=0 in the environment to stop every AI feature at once), and
 *   2. the signed-in patient's own switch, which only the admin can turn on (database function rehab_ai_enabled).
 * Hiding a button is never enough; call this at the top of every AI route and action.
 */
export const aiGloballyEnabled = () => process.env.REHAB_AI_ENABLED !== "0";

export async function aiAssistAllowed(): Promise<boolean> {
  if (!aiGloballyEnabled()) return false;
  try {
    return (await rpc<boolean>("rehab_ai_enabled")) === true;
  } catch {
    return false;
  }
}
