import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = "Param Adventures | Expedition into the Unknown",
  description = "Join premium adventure travel experiences across the globe. From Spiti Valley to the Himalayas, discover the unseen with Param Adventures.",
  image = "/og-image.png",
  noIndex = false,
}: MetadataProps = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | Param Adventures`,
    },
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
      type: "website",
      siteName: "Param Adventures",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@paramadventures",
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://param-adventures-phase1-web.vercel.app"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
