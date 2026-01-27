"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

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

interface ServerConfigFormProps {
  config: ServerConfig;
  onUpdate: () => void;
}

export default function ServerConfigForm({ config, onUpdate }: ServerConfigFormProps) {
  const [value, setValue] = useState(config.value);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isReadOnly = config.isEnvironmentVar;
  const isPassword = config.isEncrypted;

  async function handleUpdate() {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiFetch("/admin/server-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: config.category,
          key: config.key,
          value,
          description: config.description,
          dataType: config.dataType,
          isEncrypted: config.isEncrypted,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setValue(config.value); // Reset to masked value
        setTimeout(() => setSuccess(false), 3000);
        onUpdate?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(
          typeof errorData?.message === "string"
            ? errorData.message
            : "Failed to update configuration"
        );
      }
    } catch (e) {
      console.error(e);
      setError("Error updating configuration");
    } finally {
      setIsSaving(false);
    }
  }

  // Render based on data type
  const renderInput = () => {
    const baseClasses =
      "w-full rounded border border-[var(--border)] bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed";

    if (config.dataType === "boolean") {
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isReadOnly}
          className={baseClasses}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      );
    }

    if (config.dataType === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isReadOnly}
          className={baseClasses}
          placeholder={config.description || "Enter value"}
        />
      );
    }

    if (isPassword) {
      return (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isReadOnly}
            className={`${baseClasses} pr-10`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isReadOnly}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "👁" : "👁‍🗨"}
          </button>
        </div>
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isReadOnly}
        className={baseClasses}
        placeholder={config.description || "Enter value"}
      />
    );
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-card p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{config.key}</h3>
            {isReadOnly && (
              <span className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                ENV VAR
              </span>
            )}
            {isPassword && (
              <span className="rounded bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                ENCRYPTED
              </span>
            )}
          </div>
          {config.description && (
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Updated: {new Date(config.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Warning for environment variable */}
      {isReadOnly && (
        <div className="mb-4 rounded border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            This configuration is controlled by environment variable. Local changes will not affect
            production.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-4 rounded border border-green-500/20 bg-green-500/5 p-3">
          <p className="text-xs text-green-600 dark:text-green-400">✓ Configuration updated successfully</p>
        </div>
      )}

      {/* Input */}
      <div className="mb-4 space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Value</label>
        {renderInput()}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setValue(config.value)}
          disabled={isSaving || value === config.value || isReadOnly}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleUpdate}
          disabled={isSaving || value === config.value || isReadOnly}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
