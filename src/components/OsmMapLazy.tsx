'use client';

// Wrapper dynamic import — Leaflet hanya berjalan di browser (tanpa SSR)
import dynamic from 'next/dynamic';
import type { OsmMarker, OsmCircle } from './OsmMap';

export type { OsmMarker, OsmCircle };

export const OsmMapLazy = dynamic(() => import('./OsmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Memuat peta OpenStreetMap...
      </p>
    </div>
  ),
});
