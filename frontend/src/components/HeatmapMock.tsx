'use client';

import { useEffect, useRef } from 'react';
import { Problem } from '@/lib/types';

export default function HeatmapMock({ problems }: { problems: Problem[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamic import for Leaflet (SSR-safe)
    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Check if map already initialized
      if ((mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current).setView([41.2995, 69.2401], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add markers for problems with locations
      problems.forEach((p) => {
        if (p.lat && p.lng) {
          const urgencyColors: Record<number, string> = {
            1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444',
          };

          const color = urgencyColors[p.urgency] || '#eab308';

          const circleMarker = L.circleMarker([p.lat, p.lng], {
            radius: 6 + p.vote_count * 0.5,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          circleMarker.bindPopup(
            `<strong>${p.title}</strong><br>` +
            `<small>${p.category} | Ovozlar: ${p.vote_count}</small>`
          );
        }
      });
    });
  }, [problems]);

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="h-[300px] rounded-xl overflow-hidden border border-gray-200" />
    </div>
  );
}
