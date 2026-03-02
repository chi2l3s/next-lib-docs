import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllDocs } from "@/lib/content";

const BASE_URL = "https://nextlib-docs.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    ...routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
    })),
  ];

  for (const locale of routing.locales) {
    for (const doc of getAllDocs(locale)) {
      items.push({
        url: `${BASE_URL}${doc.href}`,
        lastModified: new Date(),
      });
    }
  }

  return items;
}
