let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Prefer Next/Vite public env var. Keep this simple to avoid `any` casts
// which trigger lint rules. For Vite dev you can set VITE_API_URL to the
// same value as NEXT_PUBLIC_API_URL.
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  if (response.status === 401) {
    const refreshed = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      const data = await refreshed.json();
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        headers.set("Authorization", `Bearer ${data.accessToken}`);
        return fetch(url, { ...init, headers, credentials: "include" });
      }
    }
  }

  return response;
}
