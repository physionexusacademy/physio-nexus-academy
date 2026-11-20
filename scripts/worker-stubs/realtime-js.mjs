// Stand-in for @supabase/realtime-js in the server and edge builds (see README.md). The site never opens a realtime channel.
const unavailable = (what) => {
  throw new Error(`Supabase Realtime (${what}) is not available in the server build.`);
};

export class RealtimeClient {
  constructor() {}
  setAuth() {}
  connect() {}
  disconnect() {
    return Promise.resolve("ok");
  }
  isConnected() {
    return false;
  }
  channel() {
    return unavailable("channel");
  }
  getChannels() {
    return [];
  }
  removeChannel() {
    return Promise.resolve("ok");
  }
  removeAllChannels() {
    return Promise.resolve([]);
  }
}
export class RealtimeChannel {
  constructor() {
    unavailable("channel");
  }
}
export class RealtimePresence {}
