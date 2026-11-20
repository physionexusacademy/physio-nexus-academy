// Stand-in for @supabase/storage-js in the edge middleware only (see README.md). The middleware never touches storage.
export class StorageApiError extends Error {
  constructor(message, status, statusCode) {
    super(message);
    this.name = "StorageApiError";
    this.status = status;
    this.statusCode = statusCode;
  }
}
export class StorageClient {
  constructor() {}
  from() {
    throw new Error("Supabase Storage is not available in the edge middleware.");
  }
}
