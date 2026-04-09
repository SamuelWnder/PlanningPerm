"use client";

import { useEffect, useRef } from "react";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
  zoom?: number;
}

/**
 * Renders an OS Maps tile layer centred on the property.
 * Uses Leaflet + OS Raster WMTS (ZXY format).
 * Dynamically imported to avoid SSR issues with Leaflet's window references.
 */
export function PropertyMap({
  latitude,
  longitude,
  address,
  className = "",
  zoom = 17,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet must be imported client-side only
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [latitude, longitude],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false, // Avoid accidental zoom on scroll
        attributionControl: true,
      });

      mapRef.current = map;

      const osKey = process.env.NEXT_PUBLIC_OS_PLACES_API_KEY;

      if (osKey) {
        // OS Maps Raster — Light_3857 layer via ZXY
        L.tileLayer(
          `https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=${osKey}`,
          {
            attribution:
              '&copy; <a href="https://www.ordnancesurvey.co.uk">Ordnance Survey</a>',
            maxZoom: 20,
          }
        ).addTo(map);
      } else {
        // Fallback to OpenStreetMap if key not available
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);
      }

      // Property marker
      const marker = L.marker([latitude, longitude]).addTo(map);
      if (address) {
        marker.bindPopup(
          `<div style="font-size:13px;font-weight:600;max-width:200px">${address}</div>`,
          { offset: [0, -10] }
        );
      }
    });

    // Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: 240 }}
    />
  );
}
