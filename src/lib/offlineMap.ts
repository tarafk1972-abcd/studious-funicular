'use client';

// ===============================================================
// PETA OFFLINE — Download & simpan tile OpenStreetMap area klaster
// Area ditentukan oleh ADMIN PERTAMA klaster, lalu di-download ke
// penyimpanan smartphone anggota (IndexedDB) agar peta tetap
// berfungsi ketika perangkat OFFLINE.
// ===============================================================

import { GeoArea, areaSpans } from '@/lib/geo';

const DB_NAME = 'wjw-offline-map';
const STORE = 'tiles';
const META_STORE = 'meta';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tileKey(z: number, x: number, y: number): string {
  return `${z}/${x}/${y}`;
}

export async function getTileBlob(z: number, x: number, y: number): Promise<Blob | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(tileKey(z, x, y));
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function putTileBlob(z: number, x: number, y: number, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, tileKey(z, x, y));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export interface OfflineMapMeta {
  clusterName: string;
  tileCount: number;
  sizeBytes: number;
  downloadedAt: string;
  area: GeoArea;
  minZoom: number;
  maxZoom: number;
}

export async function getOfflineMeta(): Promise<OfflineMapMeta | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get('meta');
      req.onsuccess = () => resolve((req.result as OfflineMapMeta) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function putOfflineMeta(meta: OfflineMapMeta): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put(meta, 'meta');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearOfflineMap(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, META_STORE], 'readwrite');
    tx.objectStore(STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Hitung daftar tile (z/x/y) yang menutupi area klaster
function lng2tile(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}
function lat2tile(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z));
}

export function listTilesForArea(area: GeoArea, minZoom: number, maxZoom: number): Array<[number, number, number]> {
  const { spanLat, spanLng } = areaSpans(area);
  const north = area.centerLat + spanLat / 2;
  const south = area.centerLat - spanLat / 2;
  const west = area.centerLng - spanLng / 2;
  const east = area.centerLng + spanLng / 2;

  const tiles: Array<[number, number, number]> = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const x1 = lng2tile(west, z);
    const x2 = lng2tile(east, z);
    const y1 = lat2tile(north, z);
    const y2 = lat2tile(south, z);
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        tiles.push([z, x, y]);
      }
    }
  }
  return tiles;
}

// Download seluruh tile area klaster ke IndexedDB (dengan progress callback).
// Batas maksimum tile dijaga agar sopan terhadap server OSM.
export async function downloadAreaTiles(
  clusterName: string,
  area: GeoArea,
  minZoom: number,
  maxZoom: number,
  onProgress?: (done: number, total: number) => void
): Promise<OfflineMapMeta> {
  let tiles = listTilesForArea(area, minZoom, maxZoom);
  const MAX_TILES = 300; // batas aman (area klaster kecil biasanya < 150 tile)
  if (tiles.length > MAX_TILES) {
    tiles = tiles.slice(0, MAX_TILES);
  }

  let done = 0;
  let sizeBytes = 0;

  // Unduh berurutan dengan jeda kecil (sopan terhadap tile server OSM)
  for (const [z, x, y] of tiles) {
    try {
      const existing = await getTileBlob(z, x, y);
      if (!existing) {
        const sub = ['a', 'b', 'c'][(x + y) % 3];
        const res = await fetch(`https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
        if (res.ok) {
          const blob = await res.blob();
          sizeBytes += blob.size;
          await putTileBlob(z, x, y, blob);
        }
        await new Promise((r) => setTimeout(r, 60));
      } else {
        sizeBytes += existing.size;
      }
    } catch {
      // lewati tile yang gagal — akan dimuat online bila tersedia
    }
    done += 1;
    onProgress?.(done, tiles.length);
  }

  const meta: OfflineMapMeta = {
    clusterName,
    tileCount: tiles.length,
    sizeBytes,
    downloadedAt: new Date().toISOString(),
    area,
    minZoom,
    maxZoom,
  };
  await putOfflineMeta(meta);
  return meta;
}
