'use client';

// Komponen peta OpenStreetMap (Leaflet) untuk WargaJagaWarga.
// Dipakai oleh Peta Klaster (MapTab) dan Modul Patroli QR (PatrolTab).
// Tile peta: (c) OpenStreetMap contributors — https://www.openstreetmap.org
//
// MODE OFFLINE-FIRST: tile dibaca dari cache IndexedDB (hasil download area
// klaster yang ditentukan Admin) terlebih dahulu; bila tidak ada, dimuat
// dari server OSM ketika online.

import React, { useEffect, useRef } from 'react';
import { MapContainer, Marker, Circle, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoArea, DEFAULT_AREA, xyToLatLng, latLngToXY, unitToMeters } from '@/lib/geo';
import { getTileBlob } from '@/lib/offlineMap';

const OSM_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// TileLayer kustom: cek IndexedDB dulu (offline), fallback ke server OSM (online)
const OfflineFirstTileLayer = L.TileLayer.extend({
  createTile(coords: { x: number; y: number; z: number }, done: (err: Error | null, tile: HTMLElement) => void) {
    const img = document.createElement('img');
    img.alt = '';
    img.setAttribute('role', 'presentation');

    getTileBlob(coords.z, coords.x, coords.y)
      .then((blob) => {
        if (blob) {
          // Tile tersedia OFFLINE dari penyimpanan perangkat
          img.src = URL.createObjectURL(blob);
          done(null, img);
        } else {
          // Muat online dari server OSM
          const sub = ['a', 'b', 'c'][(coords.x + coords.y) % 3];
          img.crossOrigin = 'anonymous';
          img.onload = () => done(null, img);
          img.onerror = () => done(null, img); // biarkan kosong bila offline & tak ter-cache
          img.src = `https://${sub}.tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
        }
      })
      .catch(() => {
        const sub = ['a', 'b', 'c'][(coords.x + coords.y) % 3];
        img.onload = () => done(null, img);
        img.onerror = () => done(null, img);
        img.src = `https://${sub}.tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
      });

    return img;
  },
});

function OfflineTiles() {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layer = new (OfflineFirstTileLayer as any)('', {
      attribution: OSM_ATTRIB,
      maxZoom: 19,
    }) as L.TileLayer;
    layer.addTo(map);
    layerRef.current = layer;
    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}

export interface OsmMarker {
  id: string;
  x: number; // koordinat unit 0-100
  y: number;
  html: string; // isi HTML ikon (divIcon)
  iconSize?: [number, number];
  tooltip?: string;
  zIndexOffset?: number;
}

export interface OsmCircle {
  id: string;
  x: number;
  y: number;
  radiusUnits: number; // radius dalam unit 0-100
  color: string;
  fillOpacity?: number;
}

interface OsmMapProps {
  markers: OsmMarker[];
  circles?: OsmCircle[];
  area?: GeoArea; // Area peta klaster (ditentukan Admin) — default kawasan demo
  height?: number | string;
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (xy: { x: number; y: number }) => void;
  clickHint?: string;
}

// Tangkap klik pada peta -> konversi ke koordinat unit aplikasi
function ClickCatcher({
  area,
  onMapClick,
}: {
  area: GeoArea;
  onMapClick?: (xy: { x: number; y: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(latLngToXY(e.latlng.lat, e.latlng.lng, area));
      }
    },
  });
  return null;
}

// Pindahkan tampilan peta bila area klaster berubah
function RecenterOnArea({ area, zoom }: { area: GeoArea; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([area.centerLat, area.centerLng], zoom);
  }, [map, area.centerLat, area.centerLng, zoom]);
  return null;
}

export function OsmMap({
  markers,
  circles = [],
  area = DEFAULT_AREA,
  height = 480,
  zoom = 16,
  onMarkerClick,
  onMapClick,
  clickHint,
}: OsmMapProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700"
      style={{ height }}
    >
      <MapContainer
        center={[area.centerLat, area.centerLng]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <OfflineTiles />
        <RecenterOnArea area={area} zoom={zoom} />
        <ClickCatcher area={area} onMapClick={onMapClick} />

        {circles.map((c) => {
          const [lat, lng] = xyToLatLng(c.x, c.y, area);
          return (
            <Circle
              key={c.id}
              center={[lat, lng]}
              radius={unitToMeters(c.radiusUnits, area)}
              pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: c.fillOpacity ?? 0.12, weight: 2 }}
            />
          );
        })}

        {markers.map((m) => {
          const [lat, lng] = xyToLatLng(m.x, m.y, area);
          const size = m.iconSize || [44, 44];
          const icon = L.divIcon({
            html: m.html,
            className: 'wjw-divicon',
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1] / 2],
          });
          return (
            <Marker
              key={m.id}
              position={[lat, lng]}
              icon={icon}
              zIndexOffset={m.zIndexOffset || 0}
              eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
            >
              {m.tooltip && (
                <Tooltip direction="top" offset={[0, -size[1] / 2]} opacity={1}>
                  <span className="text-xs font-semibold">{m.tooltip}</span>
                </Tooltip>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {clickHint && (
        <div className="absolute bottom-2 left-2 z-[500] px-3 py-1.5 rounded-lg bg-slate-900/85 text-slate-200 text-[11px] font-semibold pointer-events-none">
          {clickHint}
        </div>
      )}
    </div>
  );
}

export default OsmMap;
