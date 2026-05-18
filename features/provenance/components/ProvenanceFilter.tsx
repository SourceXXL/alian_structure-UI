"use client";

import React from "react";
import { ProvenanceFilter as FilterType } from "../../../lib/provenance/types";

interface ProvenanceFilterProps {
  filter: FilterType;
  agents: { id: string; name: string }[];
  users: { id: string; name: string }[];
  onFilterChange: (filter: FilterType) => void;
  onClear: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export default function ProvenanceFilter({
  filter,
  agents,
  users,
  onFilterChange,
  onClear,
  onExportJSON,
  onExportCSV
}: ProvenanceFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filter, [name]: value });
  };

  return (
    <div className="p-6 rounded-xl border border-cosmic-purple/20 nebula-bg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agent Filter */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Agent</label>
          <select
            name="agentId"
            value={filter.agentId || ""}
            onChange={handleChange}
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50 transition-smooth"
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">User</label>
          <select
            name="userId"
            value={filter.userId || ""}
            onChange={handleChange}
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50 transition-smooth"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Status</label>
          <select
            name="status"
            value={filter.status || ""}
            onChange={handleChange}
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50 transition-smooth"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Search Query */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Search</label>
          <input
            type="text"
            name="searchQuery"
            value={filter.searchQuery || ""}
            onChange={handleChange}
            placeholder="Search details..."
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50 transition-smooth"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-cosmic-purple/10">
        <button
          onClick={onClear}
          className="text-sm text-cosmic-purple hover:text-white transition-smooth"
        >
          Clear Filters
        </button>

        <div className="flex gap-2">
          <button
            onClick={onExportJSON}
            className="px-4 py-2 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg text-sm hover:bg-cosmic-purple/20 transition-smooth"
          >
            Export JSON
          </button>
          <button
            onClick={onExportCSV}
            className="px-4 py-2 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg text-sm hover:bg-cosmic-purple/20 transition-smooth"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
