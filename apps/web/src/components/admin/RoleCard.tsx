
import React from "react";
import Card from "../ui/Card";
import PermissionGroup from "./PermissionGroup";

interface RoleCardProps {
  role: {
    id: string;
    name: string;
    isSystem: boolean;
    permissions: string[];
  };
  allSystemPermissions: string[];
  onConfigure?: (role: RoleCardProps['role']) => void;
}

export default function RoleCard({ role, allSystemPermissions, onConfigure }: RoleCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--accent)]/30 hover:shadow-2xl hover:shadow-[var(--accent)]/5">
      <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black tracking-tighter uppercase">{role.name}</h3>
            {role.isSystem && (
              <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest border border-[var(--accent)]/20">
                System
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium italic">
            {role.permissions.length} total permissions assigned
          </p>
        </div>
        
        <div className="h-10 w-10 rounded-2xl bg-[var(--border)]/30 flex items-center justify-center text-[var(--muted)] group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8 bg-gradient-to-br from-transparent to-[var(--border)]/5">
        <PermissionGroup 
          title="Trips" 
          permissions={role.permissions} 
          allSystemPermissions={allSystemPermissions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>}
        />
        
        <PermissionGroup 
          title="Blogs" 
          permissions={role.permissions} 
          allSystemPermissions={allSystemPermissions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 1 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>}
        />

        <PermissionGroup 
          title="Bookings" 
          permissions={role.permissions} 
          allSystemPermissions={allSystemPermissions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
        />

        <PermissionGroup 
          title="Users" 
          permissions={role.permissions} 
          allSystemPermissions={allSystemPermissions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        />
        
        <PermissionGroup 
          title="Media" 
          permissions={role.permissions} 
          allSystemPermissions={allSystemPermissions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>}
        />
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--border)]/10 flex justify-end">
        <button 
          onClick={() => onConfigure?.(role)}
          className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline disabled:opacity-50"
          disabled={role.isSystem || !onConfigure}
        >
          {role.isSystem || !onConfigure ? "Read Only Access" : "Configure Access ➔"}
        </button>
      </div>
    </Card>
  );
}
