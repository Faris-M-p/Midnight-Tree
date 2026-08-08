/**
 * Dark-themed calendar popup for date of birth selection.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  max?: string;
  placeholder?: string;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  max,
  placeholder = 'Select date',
  className = ''
}) => {
  const selected = parseDate(value);
  const maxDate = parseDate(max || '') ?? new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? maxDate.getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? 0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean } | null> = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(viewYear, viewMonth, day), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isDisabled = (date: Date) => date > maxDate;

  const isSelected = (date: Date) =>
    Boolean(
      selected &&
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate()
    );

  const years = useMemo(() => {
    const end = maxDate.getFullYear();
    const start = end - 120;
    const list: number[] = [];
    for (let y = end; y >= start; y -= 1) list.push(y);
    return list;
  }, [maxDate]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <span className={value ? 'text-slate-100' : 'text-slate-500'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar size={14} className="text-emerald-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[280px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
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
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
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
              <div key={day} className="text-[10px] font-semibold text-slate-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-8" />;
              }
              const disabled = isDisabled(cell.date);
              const selectedDay = isSelected(cell.date);
              return (
                <button
                  key={formatDate(cell.date)}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(formatDate(cell.date));
                    setOpen(false);
                  }}
                  className={`
                    h-8 rounded-md text-xs font-medium transition-colors
                    ${selectedDay ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'}
                    ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}
                  `}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
