import type { HomeAgeBucket, HomeGenderSlice, HomeGrowthPoint } from "../../data/mockHome";

export function GrowthChart({ points }: { points: HomeGrowthPoint[] }) {
  const width = 520;
  const height = 180;
  const padX = 16;
  const padY = 18;
  const max = Math.max(...points.map((p) => p.count), 1);
  const min = Math.min(...points.map((p) => p.count), 0);
  const span = Math.max(max - min, 1);

  const coords = points.map((point, index) => {
    const x = padX + (index / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((point.count - min) / span) * (height - padY * 2);
    return { ...point, x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const area = `${line} L ${coords.at(-1)?.x ?? padX} ${height - padY} L ${coords[0]?.x ?? padX} ${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="Family growth chart">
      <defs>
        <linearGradient id="homeGrowthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--theme-accent-hover)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--theme-accent-hover)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#homeGrowthFill)" />
      <path d={line} fill="none" stroke="var(--theme-accent-hover)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="3.5" fill="var(--theme-page)" stroke="var(--theme-accent-hover)" strokeWidth="2" />
          <text x={point.x} y={height - 2} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function GenderDonut({ slices }: { slices: HomeGenderSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 54;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label="Gender distribution">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--theme-border)" strokeWidth={stroke} />
        {slices.map((slice) => {
          const length = (slice.value / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const el = (
            <circle
              key={slice.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
          offset += length;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="fill-slate-100 text-xl font-semibold">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" className="fill-slate-500 text-[10px]">
          members
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <span>{slice.label}</span>
            <span className="text-slate-500">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgeBars({ buckets }: { buckets: HomeAgeBucket[] }) {
  const max = Math.max(...buckets.map((b) => b.value), 1);

  return (
    <div className="space-y-1.5">
      {buckets.map((bucket) => (
        <div
          key={bucket.label}
          className="grid grid-cols-[3.25rem_minmax(0,1fr)_1.75rem] items-center gap-2 text-xs sm:grid-cols-[3.5rem_minmax(0,1fr)_2rem]"
        >
          <span className="text-slate-500">{bucket.label}</span>
          <div className="h-2 min-w-0 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
              style={{ width: `${bucket.value === 0 ? 0 : Math.max((bucket.value / max) * 100, 4)}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-slate-300">{bucket.value}</span>
        </div>
      ))}
    </div>
  );
}
