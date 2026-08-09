import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";

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

export function mapsRedirectUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function osmEmbedUrl(latitude: number, longitude: number): string {
  const span = 0.02;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - span},${latitude - span},${longitude + span},${latitude + span}&layer=mapnik&marker=${latitude},${longitude}`;
}

export function LocationMapPreview({
  latitude,
  longitude,
  label,
  action,
  href,
  heightClassName = "h-36"
}: {
  latitude: number;
  longitude: number;
  label: string;
  action?: ReactNode;
  href?: string;
  heightClassName?: string;
}) {
  const wrapperClass = `relative z-0 isolate block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 ${
    href ? "transition hover:border-emerald-500/70" : ""
  }`;

  const body = (
    <>
      <div className={`relative z-0 isolate overflow-hidden ${heightClassName}`}>
        <iframe
          title={label || "Selected location"}
          src={osmEmbedUrl(latitude, longitude)}
          className="pointer-events-none h-full w-full border-0"
          loading="lazy"
        />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500">Selected on map</p>
          <p className={`mt-1 inline-flex items-start gap-1.5 text-sm ${href ? "text-emerald-400" : "text-slate-100"}`}>
            <span>{label || "Pinned location"}</span>
            {href ? <ExternalLink size={13} className="mt-0.5 shrink-0" /> : null}
          </p>
        </div>
        {action}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title="Open this location in Maps" className={wrapperClass}>
        {body}
      </a>
    );
  }

  return <div className={wrapperClass}>{body}</div>;
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
        <LocationMapPreview
          latitude={lat}
          longitude={lng}
          label={mapLabel}
          heightClassName="h-44"
          href={mapsRedirectUrl(lat, lng)}
        />
      ) : null}
    </div>
  );
}
