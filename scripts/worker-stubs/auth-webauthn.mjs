// Stand-in for @supabase/auth-js lib/webauthn in the server and edge builds (see README.md). Passkeys are a browser ceremony.
const unavailable = () => {
  throw new Error("WebAuthn (passkeys) is not available in the server build.");
};

export class WebAuthnApi {
  constructor(client) {
    this.client = client;
  }
}
export const webAuthnAbortService = { createNewAbortSignal: () => new AbortController().signal, cancelCeremony() {} };
export const browserSupportsWebAuthn = () => false;
export const isValidDomain = () => true;
export const createCredential = unavailable;
export const getCredential = unavailable;
export const deserializeCredentialCreationOptions = unavailable;
export const deserializeCredentialRequestOptions = unavailable;
export const serializeCredentialCreationResponse = unavailable;
export const serializeCredentialRequestResponse = unavailable;
