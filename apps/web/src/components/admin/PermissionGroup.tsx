import React from "react";

interface PermissionGroupProps {
  title: string;
  permissions: string[];
  allSystemPermissions: string[];
  icon?: React.ReactNode;
}

export default function PermissionGroup({
  title,
  permissions,
  allSystemPermissions,
  icon,
}: PermissionGroupProps) {
  const domainPermissions = allSystemPermissions.filter((p) =>
    p.startsWith(title.toLowerCase().slice(0, -1)),
  );

  // Actually, let's make the filtering more robust based on common prefixes
  const getPrefix = (t: string) => {
    const mapping: Record<string, string> = {
      Trips: "trip:",
      Blogs: "blog:",
      Bookings: "booking:",
      Users: "user:",
      Roles: "role:",
      Media: "media:",
      Audit: "audit:",
    };
    return mapping[t] || t.toLowerCase() + ":";
  };

  const prefix = getPrefix(title);
  const relevantPermissions = allSystemPermissions.filter((p) => p.startsWith(prefix));

  if (relevantPermissions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {relevantPermissions.map((perm) => {
          const isActive = permissions.includes(perm);
          return (
            <div
              key={perm}
              className={`group relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition-all ${
                isActive
                  ? "border-[var(--accent)]/30 bg-[var(--accent)]/5 text-[var(--accent)] shadow-[var(--accent)]/5 shadow-sm"
                  : "gray-scale border-transparent bg-[var(--border)]/30 text-[var(--muted)] opacity-50"
              } `}
            >
              <div
                className={`h-1 w-1 rounded-full ${isActive ? "animate-pulse bg-[var(--accent)]" : "bg-[var(--muted)]/50"}`}
              />
              {perm.split(":")[1]?.replace(/-/g, " ") || perm}

              {!isActive && (
                <div
                  className="absolute inset-0 bg-transparent"
                  title="Not assigned to this role"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
