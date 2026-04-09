"use client";

import dynamic from "next/dynamic";

// Leaflet requires browser APIs — must never run on the server
export const PropertyMapDynamic = dynamic(
  () => import("./property-map").then((m) => ({ default: m.PropertyMap })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg bg-[#F0EDE6] animate-pulse" style={{ minHeight: 240 }} />
    ),
  }
);
