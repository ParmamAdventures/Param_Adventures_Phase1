import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Static routes
  const routes = ["", "/trips", "/blogs", "/login", "/signup"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  async function safeFetch(url: string) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!res.ok) {
        console.warn(`Sitemap fetch failed: ${url} (Status: ${res.status})`);
        return [];
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Sitemap fetch returned non-JSON: ${url} (Type: ${contentType})`);
        return [];
      }

      const json = await res.json();
      const items = json.data?.data || json.data || json;
      return Array.isArray(items) ? items : [];
    } catch (e) {
      console.error(`Sitemap fetch error: ${url}`, e);
      return [];
    }
  }

  // Dynamic Trip routes
  const trips = await safeFetch(`${apiBase}/api/v1/trips/public`);
  const tripRoutes = trips.map((trip: any) => ({
    url: `${baseUrl}/trips/${trip.slug}`,
    lastModified: trip.updatedAt || trip.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic Blog routes
  const blogs = await safeFetch(`${apiBase}/api/v1/blogs/public`);
  const blogRoutes = blogs.map((blog: any) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: blog.updatedAt || blog.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...tripRoutes, ...blogRoutes];
}
