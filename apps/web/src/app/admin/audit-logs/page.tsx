"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

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

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.targetId?.toLowerCase().includes(search.toLowerCase()) ||
    log.actorId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Audit <span className="text-[var(--accent)]">Trail</span></h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest opacity-60">Complete history of system interactions</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Input 
            placeholder="Search action or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-[var(--card)]/50 border-[var(--border)] rounded-2xl h-12"
          />
          <select 
            className="h-12 px-6 rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[var(--accent)]/50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="TRIP_CREATE">Trip Creations</option>
            <option value="BOOKING_STATUS_CHANGE">Booking Updates</option>
            <option value="BLOG_PUBLISH">Blog Publishing</option>
          </select>
        </div>
      </header>

      <div className="rounded-[48px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Spinner size={40} /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="text-4xl opacity-20 text-[var(--accent)] font-black uppercase italic">No records</div>
            <p className="text-muted-foreground uppercase text-xs font-black tracking-widest">No matching security signals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Timestamp</th>
                  <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                  <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Actor</th>
                  <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity</th>
                  <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-[var(--border)]/10 transition-colors">
                    <td className="py-6 px-10">
                      <div className="text-[10px] font-bold opacity-60">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-black italic uppercase text-[var(--accent)]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <span className="text-xs font-black italic uppercase tracking-tight bg-[var(--border)]/30 px-3 py-1 rounded-lg">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-6 px-10">
                      <div className="text-xs font-bold leading-none">{log.actorName || "SYSTEM"}</div>
                      <div className="text-[8px] font-black opacity-30 mt-1 uppercase tracking-tighter truncate w-24">ID: {log.actorId || "N/A"}</div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="text-xs font-bold leading-none">{log.targetType}</div>
                      <div className="text-[8px] font-black opacity-30 mt-1 uppercase tracking-tighter">ID: {log.targetId}</div>
                    </td>
                    <td className="py-6 px-10 text-right">
                       <button className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline">
                         View Source
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
