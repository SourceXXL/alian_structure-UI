export interface ProvenanceRecord {
  id: string;
  agentId: string;
  agentName: string;
  userId: string;
  userName: string;
  action: "input_received" | "provider_call" | "on_chain_submission" | "output_generated" | "error_encountered";
  timestamp: string;
  status: "success" | "failure" | "pending";
  provider?: string; // e.g., "OpenAI", "Anthropic", "Stellar"
  txHash?: string;
  details: {
    input?: string;
    output?: string;
    payload?: any;
    error?: string;
  };
}

export interface ProvenanceFilter {
  agentId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
