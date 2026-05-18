import { StellarNetwork } from "../types";

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  contractId: string;
  functionName: string;
  args: any[]; // Decoded arguments
  expectedOutput?: any;
  network: StellarNetwork;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceMetrics {
  cpuInstructions: number;
  ramBytes: number;
  ledgerReadBytes: number;
  ledgerWriteBytes: number;
  readCount: number;
  writeCount: number;
  costXlm: string;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
  metrics?: ResourceMetrics;
  logs: string[];
  events: any[];
  startTime: string;
  endTime?: string;
  qualityScore: number; // 0-100
}

export interface BenchmarkTrend {
  timestamp: string;
  cpuAverage: number;
  costAverage: string;
  successRate: number;
}
