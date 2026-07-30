// Konversi koordinat internal aplikasi <-> koordinat geografis OpenStreetMap.
//
// Data area/patroli aplikasi memakai sistem koordinat unit (x, y) dalam rentang 0-100.
// Kotak 0-100 tersebut dipetakan ke AREA PETA KLASTER — bounding box geografis yang
// DITENTUKAN OLEH ADMIN PERTAMA klaster. Area inilah yang di-download ke aplikasi
// setiap anggota agar peta dapat bekerja secara offline.

export interface GeoArea {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

// Area default (demo): kawasan Menteng, Jakarta — dipakai bila Admin belum menentukan area
export const DEFAULT_AREA: GeoArea = {
  centerLat: -6.193,
  centerLng: 106.836,
  radiusKm: 0.67,
};

const KM_PER_DEG_LAT = 111.32;

export function areaSpans(area: GeoArea): { spanLat: number; spanLng: number } {
  const spanLat = (area.radiusKm * 2) / KM_PER_DEG_LAT;
  const cos = Math.max(0.2, Math.cos((area.centerLat * Math.PI) / 180));
  const spanLng = (area.radiusKm * 2) / (KM_PER_DEG_LAT * cos);
  return { spanLat, spanLng };
}

// (x, y) unit 0-100 -> [lat, lng] relatif terhadap area klaster
export function xyToLatLng(x: number, y: number, area: GeoArea = DEFAULT_AREA): [number, number] {
  const { spanLat, spanLng } = areaSpans(area);
  const north = area.centerLat + spanLat / 2;
  const west = area.centerLng - spanLng / 2;
  return [north - (y / 100) * spanLat, west + (x / 100) * spanLng];
}

// [lat, lng] -> (x, y) unit 0-100 (dibatasi 0..100)
export function latLngToXY(lat: number, lng: number, area: GeoArea = DEFAULT_AREA): { x: number; y: number } {
  const { spanLat, spanLng } = areaSpans(area);
  const north = area.centerLat + spanLat / 2;
  const west = area.centerLng - spanLng / 2;
  const x = Math.min(100, Math.max(0, ((lng - west) / spanLng) * 100));
  const y = Math.min(100, Math.max(0, ((north - lat) / spanLat) * 100));
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// Konversi radius unit (skala 0-100) ke meter untuk lingkaran Leaflet
export function unitToMeters(units: number, area: GeoArea = DEFAULT_AREA): number {
  const { spanLat } = areaSpans(area);
  return (units / 100) * spanLat * 111320;
}
