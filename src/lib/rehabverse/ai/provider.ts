import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Which AI services the chats may use, and where their settings live. Secrets and settings are read from the Worker environment (a Worker
 * secret or variable), never from the browser and never from the repository.
 *
 *   REHAB_AI_PROVIDER   "auto" (default): Claude, then Groq, then the free Workers AI chain, each only if it is set up;
 *                       "claude" / "groq": that service only; "workers-ai": the free chain only (every paid or keyed service off).
 */
export type ChatProvider = "auto" | "claude" | "groq" | "workers-ai";

export const fromEnvironment = (name: string): string => {
  const direct = process.env[name];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  try {
    const value = (getCloudflareContext() as unknown as { env?: Record<string, unknown> }).env?.[name];
    return typeof value === "string" ? value.trim() : "";
  } catch {
    return ""; // outside Cloudflare (local development)
  }
};

export const chatProvider = (): ChatProvider => {
  const value = fromEnvironment("REHAB_AI_PROVIDER").toLowerCase();
  return value === "claude" || value === "groq" || value === "workers-ai" ? value : "auto";
};
