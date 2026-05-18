import { db } from "../db/mock-db";
import { ProvenanceRecord, ProvenanceFilter } from "./types";

export const provenanceService = {
  async getRecords(filter?: ProvenanceFilter): Promise<ProvenanceRecord[]> {
    let records = await db.provenance.findMany();

    if (filter) {
      if (filter.agentId) {
        records = records.filter((r) => r.agentId === filter.agentId);
      }
      if (filter.userId) {
        records = records.filter((r) => r.userId === filter.userId);
      }
      if (filter.status) {
        records = records.filter((r) => r.status === filter.status);
      }
      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        records = records.filter((r) => new Date(r.timestamp).getTime() >= start);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        records = records.filter((r) => new Date(r.timestamp).getTime() <= end);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        records = records.filter(
          (r) =>
            r.agentName.toLowerCase().includes(query) ||
            r.userName.toLowerCase().includes(query) ||
            r.action.toLowerCase().includes(query) ||
            (r.details.input && r.details.input.toLowerCase().includes(query)) ||
            (r.details.output && r.details.output.toLowerCase().includes(query))
        );
      }
    }

    // Sort by timestamp descending
    return records.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async getAgents(): Promise<{ id: string; name: string }[]> {
    const records = await db.provenance.findMany();
    const agents = new Map<string, string>();
    records.forEach((r) => agents.set(r.agentId, r.agentName));
    return Array.from(agents.entries()).map(([id, name]) => ({ id, name }));
  },

  async getUsers(): Promise<{ id: string; name: string }[]> {
    const records = await db.provenance.findMany();
    const users = new Map<string, string>();
    records.forEach((r) => users.set(r.userId, r.userName));
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }
};
