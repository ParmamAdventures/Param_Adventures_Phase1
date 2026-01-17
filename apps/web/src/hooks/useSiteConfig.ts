import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface SiteConfig {
  [key: string]: string;
}

/**
 * Site configuration hook for accessing global site settings.
 * @returns {Object} Site configuration data
 */
export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, isLoading };
}
