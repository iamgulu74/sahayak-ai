'use client';
import { useEffect, useRef } from "react";
import { PartnerWithDistance } from "@/lib/partner-router";
import { SCHEMES } from "@/lib/schemes-data";

interface PartnerMapProps {
  partners: PartnerWithDistance[];
  selected?: PartnerWithDistance;
  userLat?: number;
  userLng?: number;
  onSelect: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  limited: "#f59e0b",
  restricted: "#ef4444",
};

export default function PartnerMap({ partners, selected, userLat, userLng, onSelect }: PartnerMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    // Clean up any existing leaflet instance on container
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Double-check leaflet ID hasn't been re-attached
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Default center: India
      const center: [number, number] = userLat && userLng ? [userLat, userLng] :
        partners.length > 0 ? [partners[0].lat, partners[0].lng] : [20.5937, 78.9629];

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: userLat ? 10 : partners.length > 0 ? 7 : 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      // Add user location marker
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#6366f1;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(99,102,241,0.8)"></div>`,
          className: "", iconAnchor: [7, 7],
        });
        L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("Your Location");
      }
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update markers when partners change
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    import("leaflet").then((L) => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      partners.forEach((partner, i) => {
        const color = STATUS_COLORS[partner.routingStatus];
        const isSelected = selected?.id === partner.id;
        const size = i === 0 ? 18 : 14;

        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:${isSelected ? "3px solid white" : "2px solid rgba(255,255,255,0.6)"};box-shadow:0 2px 8px rgba(0,0,0,0.4)${isSelected ? ",0 0 12px " + color : ""}"></div>`,
          className: "", iconAnchor: [size/2, size/2],
        });

        const schemes = partner.supportedSchemes.slice(0, 3).map(id => SCHEMES.find(s => s.id === id)?.shortName).filter(Boolean).join(", ");
        const popup = L.popup({ className: "custom-popup" }).setContent(`
          <div style="min-width:200px;font-family:Inter,sans-serif">
            <div style="font-weight:600;color:#f8fafc;margin-bottom:4px">${partner.name}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${partner.type} • ${partner.district}, ${partner.state}</div>
            <div style="font-size:11px;color:${color};font-weight:500">● ${partner.routingStatus === "available" ? "Available" : partner.routingStatus === "limited" ? "Limited Capacity" : "Restricted"}</div>
            <div style="font-size:10px;color:#64748b;margin-top:4px">Schemes: ${schemes}</div>
          </div>
        `);

        const marker = L.marker([partner.lat, partner.lng], { icon })
          .addTo(mapRef.current!)
          .bindPopup(popup)
          .on("click", () => onSelect(partner.id));

        if (isSelected) {
          marker.openPopup();
          mapRef.current!.flyTo([partner.lat, partner.lng], 11, { duration: 1 });
        }

        markersRef.current.push(marker);
      });
    });
  }, [partners, selected]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
