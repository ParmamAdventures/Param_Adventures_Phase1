let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Use relative path to leverage Next.js Rewrites (Proxies to Backend)
// This ensures same-origin for cookies
export const API_URL = "/api";
const baseUrl = API_URL;

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = `${baseUrl}${input}`;
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !url.endsWith("/auth/refresh")) {
    console.warn("[API] 401 detected, attempting auto-refresh...");
    const refreshed = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      const data = await refreshed.json();
      if (data?.accessToken) {
        console.log("[API] Token refresh successful");
        setAccessToken(data.accessToken);
        headers.set("Authorization", `Bearer ${data.accessToken}`);
        return fetch(url, { ...init, headers, credentials: "include" });
      }
    }
  }

  return response;
}
