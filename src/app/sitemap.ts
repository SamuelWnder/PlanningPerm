import type { MetadataRoute } from "next";

const BASE = "https://planningperm.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/blog/do-you-need-planning-permission-for-a-conservatory`,
      lastModified: new Date("2025-04-01"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/blog/how-much-does-planning-permission-cost-uk`,
      lastModified: new Date("2025-04-01"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/blog/do-you-need-planning-permission-for-solar-panels`,
      lastModified: new Date("2025-04-01"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/blog/do-you-need-planning-permission-for-a-pergola`,
      lastModified: new Date("2025-04-01"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
