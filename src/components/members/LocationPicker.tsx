import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { LocationMapPreview, reverseGeocode } from "./LocationView";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

export interface MemberLocationValue {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationPickerProps {
  value: MemberLocationValue;
  onChange: (next: MemberLocationValue) => void;
  inputClassName: string;
}

interface SearchHit {
  label: string;
  lat: number;
  lng: number;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

function readCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  });
}

async function searchPlaces(query: string): Promise<SearchHit[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) return [];
  const rows = (await response.json()) as Array<{ display_name?: string; lat?: string; lon?: string }>;
  return rows
    .map((row) => ({
      label: row.display_name?.trim() || "",
      lat: Number(row.lat),
      lng: Number(row.lon)
    }))
    .filter((row) => row.label && Number.isFinite(row.lat) && Number.isFinite(row.lng));
}

function MapClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
}

function MapReady({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.setView(center, zoom);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [map, center, zoom]);
  return null;
}

function LocationMapModal({
  open,
  initial,
  onClose,
  onApply
}: {
  open: boolean;
  initial: MemberLocationValue;
  onClose: () => void;
  onApply: (lat: number, lng: number, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftLat, setDraftLat] = useState<number | null>(initial.latitude);
  const [draftLng, setDraftLng] = useState<number | null>(initial.longitude);
  const [lookingUp, setLookingUp] = useState(false);
  const [locating, setLocating] = useState(false);

  const pickPoint = async (lat: number, lng: number, label?: string) => {
    setDraftLat(lat);
    setDraftLng(lng);
    setHits([]);
    if (label) {
      setDraftLabel(label);
      setQuery(label);
      return;
    }
    setLookingUp(true);
    try {
      setDraftLabel(await reverseGeocode(lat, lng));
    } finally {
      setLookingUp(false);
    }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const here = await readCurrentPosition();
      if (!here) return false;
      await pickPoint(here.lat, here.lng);
      return true;
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setQuery("");
    setHits([]);
    setDraftLabel("");

    const start = async () => {
      if (typeof initial.latitude === "number" && typeof initial.longitude === "number") {
        setDraftLat(initial.latitude);
        setDraftLng(initial.longitude);
        const label = await reverseGeocode(initial.latitude, initial.longitude);
        if (!cancelled) setDraftLabel(label);
        return;
      }

      setDraftLat(null);
      setDraftLng(null);
      setLocating(true);
      try {
        const here = await readCurrentPosition();
        if (cancelled || !here) return;
        setDraftLat(here.lat);
        setDraftLng(here.lng);
        const label = await reverseGeocode(here.lat, here.lng);
        if (!cancelled) setDraftLabel(label);
      } finally {
        if (!cancelled) setLocating(false);
      }
    };

    void start();
    return () => {
      cancelled = true;
    };
  }, [open, initial.latitude, initial.longitude]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 3) {
      setHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSearching(true);
      void searchPlaces(term)
        .then(setHits)
        .finally(() => setSearching(false));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query, open]);

  const center = useMemo<[number, number]>(() => {
    if (typeof draftLat === "number" && typeof draftLng === "number") return [draftLat, draftLng];
    return DEFAULT_CENTER;
  }, [draftLat, draftLng]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Choose location</h3>
            <p className="text-xs text-slate-500">Starts at your current location. Search or tap the map to change it.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-3.5 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search village, city, or landmark"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-12 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => void useCurrentLocation()}
              disabled={locating}
              title="Use my current location"
              className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-300 disabled:opacity-50"
            >
              <LocateFixed size={16} />
            </button>
            {searching ? <p className="mt-1 text-xs text-slate-500">Searching…</p> : null}
            {hits.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                {hits.map((hit) => (
                  <button
                    key={`${hit.lat}-${hit.lng}-${hit.label}`}
                    type="button"
                    onClick={() => void pickPoint(hit.lat, hit.lng, hit.label)}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                  >
                    {hit.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative z-0 h-72 isolate overflow-hidden rounded-xl border border-slate-800">
            <MapContainer center={center} zoom={typeof draftLat === "number" ? 15 : 5} className="h-full w-full" scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapReady center={center} zoom={typeof draftLat === "number" ? 15 : 5} />
              <MapClickPicker onPick={(lat, lng) => void pickPoint(lat, lng)} />
              {typeof draftLat === "number" && typeof draftLng === "number" ? <Marker position={[draftLat, draftLng]} /> : null}
            </MapContainer>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200">
            {locating
              ? "Finding your current location…"
              : lookingUp
                ? "Finding place name…"
                : draftLabel || "Search or tap the map to choose a place."}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={typeof draftLat !== "number" || typeof draftLng !== "number"}
            onClick={() => onApply(draftLat as number, draftLng as number, draftLabel)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            Use this place
          </button>
        </div>
      </div>
    </div>
  );
}

export function LocationPicker({ value, onChange, inputClassName }: LocationPickerProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLabel, setMapLabel] = useState("");
  const hasPin = typeof value.latitude === "number" && typeof value.longitude === "number";

  useEffect(() => {
    if (!hasPin) {
      setMapLabel("");
      return;
    }
    let active = true;
    void reverseGeocode(value.latitude as number, value.longitude as number).then((label) => {
      if (active) setMapLabel(label);
    });
    return () => {
      active = false;
    };
  }, [hasPin, value.latitude, value.longitude]);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-slate-300">
        Place / Address
        <input
          value={value.locationName}
          onChange={(event) =>
            onChange({
              locationName: event.target.value,
              latitude: value.latitude,
              longitude: value.longitude
            })
          }
          placeholder="Enter home, village, city, or address"
          className={inputClassName}
        />
      </label>

      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
      >
        <MapPin size={14} /> {hasPin ? "Change map location" : "Choose Location"}
      </button>

      {hasPin ? (
        <LocationMapPreview
          latitude={value.latitude as number}
          longitude={value.longitude as number}
          label={mapLabel}
          action={
            <button
              type="button"
              onClick={() => onChange({ ...value, latitude: null, longitude: null })}
              className="shrink-0 text-xs text-slate-400 hover:text-rose-300"
            >
              Remove pin
            </button>
          }
        />
      ) : null}

      <LocationMapModal
        open={mapOpen}
        initial={value}
        onClose={() => setMapOpen(false)}
        onApply={(lat, lng, label) => {
          setMapLabel(label);
          onChange({
            locationName: value.locationName,
            latitude: lat,
            longitude: lng
          });
          setMapOpen(false);
        }}
      />
    </div>
  );
}
