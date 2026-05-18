import { Submission } from "../types";
import { StatusBadge } from "./StatusBadge";

interface SubmissionTableProps {
  submissions: Submission[];
}

export function SubmissionTable({ submissions }: SubmissionTableProps) {
  if (submissions.length === 0) {
    return <p>No submissions available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Tx Hash</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-3 py-2 align-top truncate max-w-xs">{submission.id}</td>
              <td className="px-3 py-2 align-top truncate max-w-xs">{submission.txHash}</td>
              <td className="px-3 py-2 align-top">
                <StatusBadge status={submission.status} />
              </td>
              <td className="px-3 py-2 align-top">{String(submission.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
