import { ProvenanceRecord } from "./types";

export const provenanceExport = {
  toJSON(records: ProvenanceRecord[]): string {
    return JSON.stringify(records, null, 2);
  },

  toCSV(records: ProvenanceRecord[]): string {
    if (records.length === 0) return "";

    const headers = [
      "ID",
      "Agent Name",
      "User Name",
      "Action",
      "Timestamp",
      "Status",
      "Provider",
      "Transaction Hash",
      "Details"
    ];

    const rows = records.map((r) => [
      r.id,
      r.agentName,
      r.userName,
      r.action,
      r.timestamp,
      r.status,
      r.provider || "",
      r.txHash || "",
      JSON.stringify(r.details).replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    return csvContent;
  },

  downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
};
