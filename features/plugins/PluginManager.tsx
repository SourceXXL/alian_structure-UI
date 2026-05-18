"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldOff,
  Power,
  PowerOff,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronDown,
  Activity,
} from "lucide-react";
import {
  Plugin,
  AuditLog,
  PluginStatus,
  AuditAction,
  MOCK_PLUGINS,
  MOCK_AUDIT_LOGS,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function statusColor(s: PluginStatus) {
  return {
    active:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    inactive: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
    pending:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
    error:    "text-red-400 bg-red-400/10 border-red-400/30",
  }[s];
}

function statusIcon(s: PluginStatus) {
  return {
    active:   <CheckCircle2 className="h-3.5 w-3.5" />,
    inactive: <PowerOff className="h-3.5 w-3.5" />,
    pending:  <Clock className="h-3.5 w-3.5" />,
    error:    <XCircle className="h-3.5 w-3.5" />,
  }[s];
}

function sandboxIcon(level: Plugin["sandboxLevel"]) {
  return {
    full:    <Shield className="h-4 w-4 text-emerald-400" />,
    partial: <ShieldAlert className="h-4 w-4 text-amber-400" />,
    none:    <ShieldOff className="h-4 w-4 text-red-400" />,
  }[level];
}

function sandboxLabel(level: Plugin["sandboxLevel"]) {
  return { full: "Full Sandbox", partial: "Partial", none: "No Sandbox" }[level];
}

function auditColor(action: AuditAction) {
  return {
    registered:    "text-sky-400",
    activated:     "text-emerald-400",
    deactivated:   "text-zinc-400",
    updated:       "text-violet-400",
    error:         "text-red-400",
    security_flag: "text-amber-400",
  }[action];
}

function formatTs(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Modal (stub)
// ─────────────────────────────────────────────────────────────────────────────
const RegisterModal: React.FC<{ onClose: () => void; onRegister: (p: Partial<Plugin>) => void }> = ({
  onClose, onRegister,
}) => {
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111114] p-6 shadow-2xl">
        <h2 className="mb-5 text-base font-semibold text-white">Register New Plugin</h2>
        <div className="space-y-3">
          {[
            { label: "Plugin Name", val: name, set: setName, placeholder: "e.g. StellarPay Gateway" },
            { label: "Author", val: author, set: setAuthor, placeholder: "e.g. Stellar Labs" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="mb-1 block text-xs text-zinc-400">{label}</label>
              <input
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this plugin do?"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={() => { onRegister({ name, author, description }); onClose(); }}
            disabled={!name || !author}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
          >
            Register Plugin
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin Card
// ─────────────────────────────────────────────────────────────────────────────
const PluginCard: React.FC<{
  plugin: Plugin;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}> = ({ plugin, onActivate, onDeactivate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border bg-[#111114] transition-all ${
      plugin.status === "error" ? "border-red-500/30" : "border-white/8 hover:border-white/15"
    }`}>
      <div className="flex items-start gap-4 p-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg font-bold text-violet-400">
          {plugin.name[0]}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{plugin.name}</span>
            <span className="text-xs text-zinc-500">v{plugin.version}</span>
            {plugin.verified && (
              <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(plugin.status)}`}>
              {statusIcon(plugin.status)}
              {plugin.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{plugin.description}</p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              {sandboxIcon(plugin.sandboxLevel)}
              {sandboxLabel(plugin.sandboxLevel)}
            </span>
            <span>·</span>
            <span>{plugin.category}</span>
            <span>·</span>
            <span>by {plugin.author}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {plugin.status === "active" ? (
            <button
              onClick={() => onDeactivate(plugin.id)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <PowerOff className="h-3.5 w-3.5" /> Deactivate
            </button>
          ) : plugin.status === "inactive" || plugin.status === "pending" ? (
            <button
              onClick={() => onActivate(plugin.id)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <Power className="h-3.5 w-3.5" /> Activate
            </button>
          ) : (
            <span className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400">
              Error state
            </span>
          )}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/8 px-4 py-3">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div>
              <p className="mb-1 text-zinc-500">Permissions</p>
              <div className="flex flex-wrap gap-1">
                {plugin.permissions.map((p) => (
                  <span key={p} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-zinc-500">Registered</p>
              <p className="text-zinc-300">{formatTs(plugin.registeredAt)}</p>
            </div>
            <div>
              <p className="mb-1 text-zinc-500">Last Updated</p>
              <p className="text-zinc-300">{formatTs(plugin.lastUpdated)}</p>
            </div>
          </div>
          {plugin.sandboxLevel === "none" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This plugin runs without sandboxing. Admin review required before activation.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Row
// ─────────────────────────────────────────────────────────────────────────────
const AuditRow: React.FC<{ log: AuditLog }> = ({ log }) => (
  <div className="flex items-start gap-3 border-b border-white/5 px-4 py-3 last:border-0">
    <Activity className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${auditColor(log.action)}`} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-medium text-white">{log.pluginName}</span>
        <span className={`font-mono ${auditColor(log.action)}`}>{log.action}</span>
        <span className="text-zinc-500">by {log.performedBy}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-zinc-500">{log.details}</p>
    </div>
    <span className="shrink-0 text-[11px] text-zinc-600">{formatTs(log.timestamp)}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main PluginManager Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>(MOCK_PLUGINS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PluginStatus | "all">("all");
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<"plugins" | "audit">("plugins");

  const filtered = useMemo(
    () =>
      plugins.filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.author.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
      }),
    [plugins, search, filterStatus]
  );

  const addLog = (pluginId: string, pluginName: string, action: AuditAction, details: string) => {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      pluginId,
      pluginName,
      action,
      performedBy: "admin@stellaiverse.io",
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleActivate = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" as PluginStatus } : p))
    );
    const plugin = plugins.find((p) => p.id === id)!;
    addLog(id, plugin.name, "activated", "Plugin activated by admin.");
  };

  const handleDeactivate = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "inactive" as PluginStatus } : p))
    );
    const plugin = plugins.find((p) => p.id === id)!;
    addLog(id, plugin.name, "deactivated", "Plugin deactivated by admin.");
  };

  const handleRegister = (partial: Partial<Plugin>) => {
    const newPlugin: Plugin = {
      id: `plg_${Date.now()}`,
      name: partial.name ?? "Unnamed Plugin",
      version: "1.0.0",
      author: partial.author ?? "Unknown",
      description: partial.description ?? "",
      status: "pending",
      sandboxLevel: "full",
      permissions: [],
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      category: "General",
      verified: false,
    };
    setPlugins((prev) => [...prev, newPlugin]);
    addLog(newPlugin.id, newPlugin.name, "registered", "New plugin registered by admin.");
  };

  const stats = {
    active:   plugins.filter((p) => p.status === "active").length,
    inactive: plugins.filter((p) => p.status === "inactive").length,
    pending:  plugins.filter((p) => p.status === "pending").length,
    error:    plugins.filter((p) => p.status === "error").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-sm text-white">
      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} onRegister={handleRegister} />
      )}

      {/* ── Header ── */}
      <div className="border-b border-white/8 bg-[#0d0d10] px-6 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-violet-400" />
                <h1 className="text-base font-semibold text-white">Plugin Manager</h1>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                  Admin Only
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Register, activate, and audit third-party plugins with sandboxing controls.
              </p>
            </div>
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" /> Register Plugin
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: "Active", value: stats.active, color: "text-emerald-400" },
              { label: "Inactive", value: stats.inactive, color: "text-zinc-400" },
              { label: "Pending", value: stats.pending, color: "text-amber-400" },
              { label: "Error", value: stats.error, color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1 w-fit">
          {(["plugins", "audit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "audit" ? "Audit Log" : "Plugins"}
            </button>
          ))}
        </div>

        {activeTab === "plugins" && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search plugins…"
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="flex gap-1.5">
                {(["all", "active", "inactive", "pending", "error"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition ${
                      filterStatus === s
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-white/8 py-12 text-center text-zinc-500">
                  No plugins match your filters.
                </div>
              ) : (
                filtered.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "audit" && (
          <div className="rounded-xl border border-white/8 bg-[#111114] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <p className="text-xs font-medium text-zinc-300">
                {auditLogs.length} events recorded
              </p>
              <button className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            {auditLogs.map((log) => (
              <AuditRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}