import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET() {
  const body = `User-agent: *\nDisallow:\nSitemap: ${APP_URL}/sitemap.xml\n`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
