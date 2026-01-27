"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import PermissionRoute from "@/components/PermissionRoute";
import { apiFetch } from "@/lib/api";
import ServerConfigForm from "@/components/admin/ServerConfigForm";

interface ServerConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
  dataType: string;
  isEncrypted: boolean;
  isEnvironmentVar: boolean;
  updatedAt: string;
}

type CategoryType = "smtp" | "payment" | "system" | "external";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<CategoryType>("smtp");
  const [configs, setConfigs] = useState<Record<string, ServerConfig[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories: { id: CategoryType; label: string; description: string }[] = [
    { id: "smtp", label: "Email (SMTP)", description: "Email delivery configuration" },
    { id: "payment", label: "Payment Gateway", description: "Razorpay payment settings" },
    { id: "system", label: "System Settings", description: "Core system configuration" },
    { id: "external", label: "External Services", description: "Third-party integrations" },
  ];

  useEffect(() => {
    loadConfigurations();
  }, []);

  async function loadConfigurations() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/server-config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.data || data || {});
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(
          typeof errorData?.message === "string"
            ? errorData.message
            : "Failed to load configurations",
        );
      }
    } catch (e) {
      console.error(e);
      setError("Error loading configurations");
    } finally {
      setIsLoading(false);
    }
  }

  const getCategoryConfigs = (): ServerConfig[] => {
    return configs[activeTab] || [];
  };

  return (
    <PermissionRoute permission={["admin:settings"]}>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Server Configuration</h1>
          <p className="text-muted-foreground">Manage critical system settings and integrations</p>
        </div>

        {/* Warning Banner */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            ⚠️ Important: Changes to server configuration affect your application&apos;s behavior.
            Proceed with caution and test thoroughly before applying in production.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === category.id
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={category.description}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading configurations...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {getCategoryConfigs().length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-muted-foreground">No configurations found for this category.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {getCategoryConfigs().map((config) => (
                  <ServerConfigForm key={config.id} config={config} onUpdate={loadConfigurations} />
                ))}
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={loadConfigurations}>
                ↻ Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </PermissionRoute>
  );
}
