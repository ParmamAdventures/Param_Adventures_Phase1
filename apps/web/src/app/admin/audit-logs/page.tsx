"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filter) query.append("action", filter);
        const res = await apiFetch(`/admin/audit-logs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (e) {
        console.error("Failed to load audit logs", e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [filter]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId?.toLowerCase().includes(search.toLowerCase()) ||
      log.actorId?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Audit <span className="text-[var(--accent)]">Trail</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase opacity-60">
            Complete history of system interactions
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search action, user or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border-[var(--border)] bg-[var(--card)]/50 md:w-64"
          />
          <div className="w-48">
            <Select
              value={filter}
              onChange={(val) => setFilter(val)}
              triggerClassName="h-12 px-6 text-[10px] font-black uppercase tracking-widest"
              options={[
                { value: "", label: "All Actions" },
                { value: "LOGIN", label: "Logins" },
                { value: "USER_STATUS_CHANGE", label: "User Bans/Suspensions" },
                { value: "TRIP_CREATED", label: "Trip Creations" },
                { value: "TRIP_UPDATED", label: "Trip Updates" },
                { value: "BOOKING_STATUS_CHANGE", label: "Booking Updates" },
                { value: "BLOG_PUBLISH", label: "Blog Publishing" },
              ]}
            />
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-[48px] border border-[var(--border)] bg-[var(--card)]/50 shadow-2xl shadow-indigo-500/5 backdrop-blur-2xl">
        {loading ? (
          <div className="flex justify-center p-20">
            <Spinner size={40} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="space-y-4 p-20 text-center">
            <div className="text-4xl font-black text-[var(--accent)] uppercase italic opacity-20">
              No records
            </div>
            <p className="text-muted-foreground text-xs font-black tracking-widest uppercase">
              No matching security signals found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-muted-foreground px-10 py-6 text-[10px] font-black tracking-[0.2em] uppercase">
                    Timestamp
                  </th>
                  <th className="text-muted-foreground px-10 py-6 text-[10px] font-black tracking-[0.2em] uppercase">
                    Action
                  </th>
                  <th className="text-muted-foreground px-10 py-6 text-[10px] font-black tracking-[0.2em] uppercase">
                    Actor
                  </th>
                  <th className="text-muted-foreground px-10 py-6 text-[10px] font-black tracking-[0.2em] uppercase">
                    Entity
                  </th>
                  <th className="text-muted-foreground px-10 py-6 text-right text-[10px] font-black tracking-[0.2em] uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="group transition-colors hover:bg-[var(--border)]/10">
                    <td className="px-10 py-6">
                      <div className="text-[10px] font-bold opacity-60">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-black text-[var(--accent)] uppercase italic">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-3 py-1 text-xs font-black tracking-tight text-[var(--accent)] uppercase italic">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-xs leading-none font-bold">
                        {log.actor?.name || log.actorName || "SYSTEM"}
                      </div>
                      <div
                        className="mt-1 w-32 truncate text-[8px] font-black tracking-tighter uppercase opacity-30"
                        title={log.actor?.email}
                      >
                        {log.actor?.email || `ID: ${log.actorId || "N/A"}`}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-xs leading-none font-bold italic">{log.targetType}</div>
                      <div className="mt-1 text-[8px] font-black tracking-tighter uppercase opacity-30">
                        ID: {log.targetId}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase opacity-40 transition-opacity group-hover:opacity-100 hover:underline"
                      >
                        Inspect ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Security Record Insight"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 border-border rounded-2xl border p-4">
                <label className="mb-1 block text-[8px] font-black tracking-widest uppercase opacity-40">
                  Action
                </label>
                <div className="font-black text-[var(--accent)] uppercase italic">
                  {selectedLog.action}
                </div>
              </div>
              <div className="bg-muted/30 border-border rounded-2xl border p-4">
                <label className="mb-1 block text-[8px] font-black tracking-widest uppercase opacity-40">
                  Timestamp
                </label>
                <div className="text-xs font-bold">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[8px] font-black tracking-widest uppercase opacity-40">
                Metadata Payload
              </label>
              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/95 p-6 shadow-inner">
                <pre className="font-mono text-[10px] leading-relaxed text-emerald-400">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-foreground text-background rounded-full px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
              >
                Clear Signal
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
