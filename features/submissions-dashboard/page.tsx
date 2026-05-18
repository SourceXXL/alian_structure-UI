"use client";

import { AlertBanner } from "./components/AlertBanner";
import { SubmissionTable } from "./components/SubmissionTable";
import { AuditLog } from "./components/AuditLog";
import { useSubmissions } from "./hooks/useSubmissions";

export default function SubmissionsDashboardPage() {
  const { data, loading } = useSubmissions();

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Submissions Dashboard</h1>
      <AlertBanner submissions={data} />
      <section>
        <h2 className="text-lg font-medium">Submissions</h2>
        <SubmissionTable submissions={data} />
      </section>
      <section>
        <h2 className="text-lg font-medium">Audit Log</h2>
        <AuditLog submissions={data} />
      </section>
    </div>
  );
}
