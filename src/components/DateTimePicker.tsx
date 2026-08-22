import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { localPartsToUtcIso, utcIsoToLocalParts } from "../utils/eventDateTime";

interface DateTimePickerProps {
  value?: string | null;
  onChange: (utcIso: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplay(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className = "",
  disabled = false
}: DateTimePickerProps) {
  const parts = utcIsoToLocalParts(value);
  const selectedDate = parseDate(parts.date);
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(parts.date);
  const [draftHour, setDraftHour] = useState(parts.hour12);
  const [draftMinute, setDraftMinute] = useState(parts.minute);
  const [draftPeriod, setDraftPeriod] = useState<"AM" | "PM">(parts.period);
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? new Date().getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = utcIsoToLocalParts(value);
    setDraftDate(next.date);
    setDraftHour(next.hour12);
    setDraftMinute(next.minute);
    setDraftPeriod(next.period);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean } | null> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(viewYear, viewMonth, day), inMonth: true });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const applyDraft = () => {
    if (!draftDate) return;
    onChange(localPartsToUtcIso(draftDate, draftHour, draftMinute, draftPeriod));
    setOpen(false);
  };

  const isSelectedDay = (date: Date) => {
    const parsed = parseDate(draftDate);
    if (!parsed) return false;
    return (
      date.getFullYear() === parsed.getFullYear() &&
      date.getMonth() === parsed.getMonth() &&
      date.getDate() === parsed.getDate()
    );
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
      >
        <span className={value ? "text-slate-100" : "text-slate-500"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar size={14} className="text-emerald-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[300px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-[10px] font-semibold text-slate-500 text-center py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {days.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="h-8" />;
              const y = cell.date.getFullYear();
              const m = String(cell.date.getMonth() + 1).padStart(2, "0");
              const d = String(cell.date.getDate()).padStart(2, "0");
              const isoDate = `${y}-${m}-${d}`;
              const selectedDay = isSelectedDay(cell.date);
              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => setDraftDate(isoDate)}
                  className={`h-8 rounded-md text-xs font-medium transition-colors ${
                    selectedDay ? "bg-emerald-500 text-slate-950" : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
            <select
              value={draftHour}
              onChange={(e) => setDraftHour(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <select
              value={draftMinute}
              onChange={(e) => setDraftMinute(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>{String(minute).padStart(2, "0")}</option>
              ))}
            </select>
            <select
              value={draftPeriod}
              onChange={(e) => setDraftPeriod(e.target.value as "AM" | "PM")}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyDraft}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
