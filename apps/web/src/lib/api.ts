let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
