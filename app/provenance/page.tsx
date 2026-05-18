import React from "react";
import ProvenanceExplorer from "@/features/provenance/components/ProvenanceExplorer";

export const metadata = {
  title: "Provenance Explorer | stellAIverse",
  description: "Audit and visualize agent actions and provenance records.",
};

export default function ProvenancePage() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-cosmic-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProvenanceExplorer />
      </div>
    </main>
  );
}
