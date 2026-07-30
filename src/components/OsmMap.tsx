'use client';

// Komponen peta OpenStreetMap (Leaflet) untuk WargaJagaWarga.
// Dipakai oleh Peta Klaster (MapTab) dan Modul Patroli QR (PatrolTab).
// Tile peta: (c) OpenStreetMap contributors — https://www.openstreetmap.org

import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CLUSTER_CENTER, xyToLatLng, latLngToXY, unitToMeters } from '@/lib/geo';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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
  height?: number | string;
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (xy: { x: number; y: number }) => void;
  clickHint?: string;
}

// Tangkap klik pada peta -> konversi ke koordinat unit aplikasi
function ClickCatcher({ onMapClick }: { onMapClick?: (xy: { x: number; y: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        // Konversi lat/lng OSM -> unit x/y internal
        onMapClick(latLngToXY(e.latlng.lat, e.latlng.lng));
      }
    },
  });
  return null;
}

export function OsmMap({
  markers,
  circles = [],
  height = 480,
  zoom = 16,
  onMarkerClick,
  onMapClick,
  clickHint,
}: OsmMapProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700" style={{ height }}>
      <MapContainer
        center={[CLUSTER_CENTER.lat, CLUSTER_CENTER.lng]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer url={OSM_URL} attribution={OSM_ATTRIB} />
        <ClickCatcher onMapClick={onMapClick} />

        {circles.map((c) => {
          const [lat, lng] = xyToLatLng(c.x, c.y);
          return (
            <Circle
              key={c.id}
              center={[lat, lng]}
              radius={unitToMeters(c.radiusUnits)}
              pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: c.fillOpacity ?? 0.12, weight: 2 }}
            />
          );
        })}

        {markers.map((m) => {
          const [lat, lng] = xyToLatLng(m.x, m.y);
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
