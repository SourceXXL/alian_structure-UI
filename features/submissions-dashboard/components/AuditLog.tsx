import { Submission } from "../types";

interface AuditLogProps {
  submissions: Submission[];
}

export function AuditLog({ submissions }: AuditLogProps) {
  if (submissions.length === 0) {
    return <p>No audit activity.</p>;
  }

  const sorted = [...submissions].sort((a, b) => {
    const ta = typeof a.timestamp === "number" ? a.timestamp : Date.parse(String(a.timestamp));
    const tb = typeof b.timestamp === "number" ? b.timestamp : Date.parse(String(b.timestamp));
    return ta - tb;
  });

  return (
    <ul className="space-y-2">
      {sorted.map((submission) => (
        <li key={`${submission.id}-${submission.txHash}`} className="rounded border border-slate-200 p-2 text-sm">
          [{String(submission.timestamp)}] {submission.status} - {submission.txHash}
        </li>
      ))}
    </ul>
  );
}
