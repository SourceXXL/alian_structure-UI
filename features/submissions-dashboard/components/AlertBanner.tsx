import { Submission } from "../types";

interface AlertBannerProps {
  submissions: Submission[];
}

export function AlertBanner({ submissions }: AlertBannerProps) {
  const failures = submissions.filter((item) => item.status === "failed" || !!item.error);

  if (failures.length === 0) {
    return null;
  }

  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-800">
      ⚠️ {failures.length} failed or mismatched submissions detected
    </div>
  );
}
