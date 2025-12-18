let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const envBase =
  (typeof (globalThis as any).importMeta !== "undefined" &&
    (globalThis as any).importMeta?.env?.VITE_API_URL) ||
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL);
const baseUrl =
  envBase ||
  (process.env.NEXT_PUBLIC_API_URL as string) ||
  "http://localhost:3000";

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
