// Konversi koordinat internal aplikasi <-> koordinat geografis OpenStreetMap.
//
// Data area/patroli aplikasi memakai sistem koordinat unit (x, y) dalam rentang 0-100.
// Agar kompatibel dengan data lama, kita memetakan kotak 0-100 tersebut ke sebuah
// bounding box geografis di sekitar pusat klaster (demo: kawasan Menteng, Jakarta).

export const CLUSTER_CENTER = {
  lat: -6.193,
  lng: 106.836,
};

// Lebar bounding box dalam derajat (~1.3 km) — cukup untuk satu klaster perumahan
export const SPAN_LAT = 0.012;
export const SPAN_LNG = 0.012;

const NORTH = CLUSTER_CENTER.lat + SPAN_LAT / 2;
const WEST = CLUSTER_CENTER.lng - SPAN_LNG / 2;

// (x, y) unit 0-100 -> [lat, lng]
export function xyToLatLng(x: number, y: number): [number, number] {
  const lat = NORTH - (y / 100) * SPAN_LAT;
  const lng = WEST + (x / 100) * SPAN_LNG;
  return [lat, lng];
}

// [lat, lng] -> (x, y) unit 0-100 (dibatasi 0..100)
export function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = Math.min(100, Math.max(0, ((lng - WEST) / SPAN_LNG) * 100));
  const y = Math.min(100, Math.max(0, ((NORTH - lat) / SPAN_LAT) * 100));
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// Konversi radius unit (skala 0-100) ke meter untuk lingkaran Leaflet
// 100 unit ~ SPAN_LAT derajat ~ 111.32 km/derajat
export function unitToMeters(units: number): number {
  return (units / 100) * SPAN_LAT * 111320;
}
