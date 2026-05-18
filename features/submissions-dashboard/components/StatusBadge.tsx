import { SubmissionStatus } from "../types";

interface StatusBadgeProps {
  status: SubmissionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = String(status).toLowerCase();

  let className = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  let label = normalizedStatus;

  if (normalizedStatus === "success") {
    className += " bg-emerald-100 text-emerald-800";
  } else if (normalizedStatus === "pending") {
    className += " bg-amber-100 text-amber-800";
  } else if (normalizedStatus === "failed") {
    className += " bg-rose-100 text-rose-800";
  } else {
    className += " bg-slate-100 text-slate-800";
  }

  return <span className={className}>{label}</span>;
}
