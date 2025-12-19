import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/trips/public`, { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse("", { status: 500 });
    }

    const trips = (await res.json()) as Array<{ slug: string }>;

    const urls = trips.map((t) => `${APP_URL}/trips/${t.slug}`);
    // include index
    urls.unshift(`${APP_URL}/trips`);

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u: string) => `  <url><loc>${u}</loc></url>`).join("\n") +
      `\n</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch {
    return new NextResponse("", { status: 500 });
  }
}
