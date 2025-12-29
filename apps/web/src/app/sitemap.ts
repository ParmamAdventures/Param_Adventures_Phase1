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

  try {
    // Dynamic Trip routes
    const tripsRes = await fetch(`${apiBase}/trips/public`);
    const trips = await tripsRes.json();
    const tripRoutes = trips.map((trip: any) => ({
      url: `${baseUrl}/trips/${trip.slug}`,
      lastModified: trip.updatedAt || trip.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Dynamic Blog routes
    const blogsRes = await fetch(`${apiBase}/blogs/public`);
    const blogs = await blogsRes.json();
    const blogRoutes = blogs.map((blog: any) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...routes, ...tripRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return routes;
  }
}
