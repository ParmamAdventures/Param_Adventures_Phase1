import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface SiteConfig {
  [key: string]: string;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await apiFetch("/content/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch site config", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading };
}
