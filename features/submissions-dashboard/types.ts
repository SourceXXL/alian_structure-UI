export type SubmissionStatus = "pending" | "success" | "failed" | string;

export interface Submission {
  id: string;
  txHash: string;
  status: SubmissionStatus;
  timestamp: string | number;
  error?: string;
  [key: string]: unknown;
}
