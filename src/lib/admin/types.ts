/** Plain types shared by the admin shell (browser) and the admin data layer (server). No imports: nothing server-only can leak into the browser through here. */
export type AdminCounts = {
  /** Things that are waiting for a person: status "New". */
  appointments: number;
  homeVisits: number;
  orders: number;
  messages: number;
};
