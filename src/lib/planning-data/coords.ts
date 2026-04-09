/**
 * Coordinate conversion utilities
 *
 * WGS84 (lat/lng) ↔ British National Grid (BNG / OSGB36 / EPSG:27700)
 *
 * Uses the standard 7-parameter Helmert datum shift + Transverse Mercator
 * projection. Accuracy: ~10–40m across England — sufficient for bounding-box
 * queries against national spatial datasets.
 */

// Helmert datum shift: WGS84 → OSGB36
const TX = -446.448, TY = 125.157, TZ = -542.060; // metres
const RX = (-0.1502 / 3600) * (Math.PI / 180);    // radians
const RY = (-0.2470 / 3600) * (Math.PI / 180);
const RZ = (-0.8421 / 3600) * (Math.PI / 180);
const S  = 20.4894 / 1e6;                          // scale factor

// WGS84 ellipsoid (GRS80)
const aW = 6378137.0, bW = 6356752.3142;
// Airy 1830 ellipsoid (OSGB36)
const aA = 6377563.396, bA = 6356256.910;

function e2(a: number, b: number) {
  return (a * a - b * b) / (a * a);
}

export interface BngCoord {
  easting:  number;
  northing: number;
}

/**
 * Convert WGS84 decimal degrees to BNG easting/northing (rounded to nearest metre).
 */
export function wgs84ToBng(lat: number, lng: number): BngCoord {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // WGS84 → Cartesian ECEF
  const eW2 = e2(aW, bW);
  const NuW  = aW / Math.sqrt(1 - eW2 * Math.sin(latR) ** 2);
  const X1   = NuW * Math.cos(latR) * Math.cos(lngR);
  const Y1   = NuW * Math.cos(latR) * Math.sin(lngR);
  const Z1   = NuW * (1 - eW2) * Math.sin(latR);

  // Helmert: WGS84 → OSGB36
  const X2 = TX + (1 + S) * (       X1 - RZ * Y1 + RY * Z1);
  const Y2 = TY + (1 + S) * ( RZ *  X1 +      Y1 - RX * Z1);
  const Z2 = TZ + (1 + S) * (-RY *  X1 + RX * Y1 +      Z1);

  // Cartesian → OSGB36 geodetic (iterative)
  const eA2 = e2(aA, bA);
  const lngOS = Math.atan2(Y2, X2);
  const p     = Math.sqrt(X2 ** 2 + Y2 ** 2);
  let latOS   = Math.atan2(Z2, p * (1 - eA2));
  for (let i = 0; i < 5; i++) {
    const NuA = aA / Math.sqrt(1 - eA2 * Math.sin(latOS) ** 2);
    latOS = Math.atan2(Z2 + eA2 * NuA * Math.sin(latOS), p);
  }

  // OSGB36 geodetic → National Grid (Transverse Mercator)
  const F0  = 0.9996012717;
  const lat0 = (49 * Math.PI) / 180;
  const lng0 = (-2 * Math.PI) / 180;
  const N0  = -100000, E0 = 400000;

  const NuTM = aA * F0 / Math.sqrt(1 - eA2 * Math.sin(latOS) ** 2);
  const rho  = (aA * F0 * (1 - eA2)) / Math.pow(1 - eA2 * Math.sin(latOS) ** 2, 1.5);
  const eta2 = NuTM / rho - 1;
  const n    = (aA - bA) / (aA + bA);

  const M = bA * F0 * (
      (1 + n + (5 / 4) * n ** 2 + (5 / 4) * n ** 3) * (latOS - lat0)
    - (3 * n + 3 * n ** 2 + (21 / 8) * n ** 3) * Math.sin(latOS - lat0) * Math.cos(latOS + lat0)
    + ((15 / 8) * n ** 2 + (15 / 8) * n ** 3) * Math.sin(2 * (latOS - lat0)) * Math.cos(2 * (latOS + lat0))
    - (35 / 24) * n ** 3 * Math.sin(3 * (latOS - lat0)) * Math.cos(3 * (latOS + lat0))
  );

  const I    = M + N0;
  const II   = (NuTM / 2) * Math.sin(latOS) * Math.cos(latOS);
  const III  = (NuTM / 24) * Math.sin(latOS) * Math.cos(latOS) ** 3 * (5 - Math.tan(latOS) ** 2 + 9 * eta2);
  const IIIA = (NuTM / 720) * Math.sin(latOS) * Math.cos(latOS) ** 5 * (61 - 58 * Math.tan(latOS) ** 2 + Math.tan(latOS) ** 4);
  const IV   = NuTM * Math.cos(latOS);
  const V    = (NuTM / 6) * Math.cos(latOS) ** 3 * (NuTM / rho - Math.tan(latOS) ** 2);
  const VI   = (NuTM / 120) * Math.cos(latOS) ** 5 * (5 - 18 * Math.tan(latOS) ** 2 + Math.tan(latOS) ** 4 + 14 * eta2 - 58 * Math.tan(latOS) ** 2 * eta2);

  const dLng = lngOS - lng0;
  const easting  = Math.round(E0 + IV * dLng + V * dLng ** 3 + VI * dLng ** 5);
  const northing = Math.round(I  + II * dLng ** 2 + III * dLng ** 4 + IIIA * dLng ** 6);

  return { easting, northing };
}

/**
 * Build a BNG bounding-box envelope suitable for ArcGIS REST queries.
 * Returns a JSON-stringifiable object with xmin/ymin/xmax/ymax in EPSG:27700.
 */
export function bngEnvelope(lat: number, lng: number, radiusMetres: number) {
  const { easting, northing } = wgs84ToBng(lat, lng);
  return {
    xmin: easting  - radiusMetres,
    ymin: northing - radiusMetres,
    xmax: easting  + radiusMetres,
    ymax: northing + radiusMetres,
  };
}
