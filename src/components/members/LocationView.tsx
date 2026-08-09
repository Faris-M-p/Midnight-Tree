import { useEffect, useState, type ReactNode } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

export function toCoord(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) return "Pinned location";
  const data = (await response.json()) as { display_name?: string };
  return data.display_name?.trim() || "Pinned location";
}

function MapReady({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.setView(center, 15);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [map, center]);
  return null;
}

export function LocationMapPreview({
  latitude,
  longitude,
  label,
  action,
  heightClassName = "h-36"
}: {
  latitude: number;
  longitude: number;
  label: string;
  action?: ReactNode;
  heightClassName?: string;
}) {
  const center: [number, number] = [latitude, longitude];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <div className={heightClassName}>
        <MapContainer
          center={center}
          zoom={15}
          className="h-full w-full"
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapReady center={center} />
          <Marker position={center} />
        </MapContainer>
      </div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500">Selected on map</p>
          <p className="mt-1 text-sm text-slate-100">{label || "Pinned location"}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

export function LocationView({
  locationName,
  latitude,
  longitude
}: {
  locationName?: string | null;
  latitude?: unknown;
  longitude?: unknown;
}) {
  const address = locationName?.trim() || "";
  const lat = toCoord(latitude);
  const lng = toCoord(longitude);
  const hasPin = lat !== null && lng !== null;
  const [mapLabel, setMapLabel] = useState("");

  useEffect(() => {
    if (!hasPin || lat === null || lng === null) {
      setMapLabel("");
      return;
    }
    let active = true;
    void reverseGeocode(lat, lng).then((label) => {
      if (active) setMapLabel(label);
    });
    return () => {
      active = false;
    };
  }, [hasPin, lat, lng]);

  if (!address && !hasPin) {
    return <p className="text-slate-500">Not specified</p>;
  }

  return (
    <div className="space-y-3">
      {address ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Address</p>
          <p className="mt-1 text-slate-100">{address}</p>
        </div>
      ) : null}
      {hasPin && lat !== null && lng !== null ? (
        <LocationMapPreview latitude={lat} longitude={lng} label={mapLabel} heightClassName="h-44" />
      ) : null}
    </div>
  );
}
