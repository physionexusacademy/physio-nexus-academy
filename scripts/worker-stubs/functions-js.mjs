// Stand-in for @supabase/functions-js in the edge middleware only (see README.md). The middleware never calls edge functions.
export const FunctionRegion = { Any: "any" };
export class FunctionsError extends Error {
  constructor(message, name = "FunctionsError", context) {
    super(message);
    this.name = name;
    this.context = context;
  }
}
export class FunctionsFetchError extends FunctionsError {}
export class FunctionsHttpError extends FunctionsError {}
export class FunctionsRelayError extends FunctionsError {}
export class FunctionsClient {
  constructor() {}
  invoke() {
    throw new Error("Supabase Edge Functions are not available in the edge middleware.");
  }
}
