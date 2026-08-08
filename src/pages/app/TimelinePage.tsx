import { useState } from "react";
import { mockTimeline, type TimelineCategory } from "../../data/mockTimeline";
import { navigateTo } from "../../routing/navigate";
import { EmptyState } from "../../components/ui/PageStates";

const categories: Array<TimelineCategory | "all"> = [
  "all",
  "birth",
  "marriage",
  "education",
  "career",
  "migration",
  "achievement",
  "death",
  "family-event"
];

const colors: Record<TimelineCategory, string> = {
  birth: "bg-emerald-500/20 text-emerald-300",
  marriage: "bg-rose-500/20 text-rose-300",
  education: "bg-sky-500/20 text-sky-300",
  career: "bg-amber-500/20 text-amber-300",
  migration: "bg-violet-500/20 text-violet-300",
  achievement: "bg-teal-500/20 text-teal-300",
  death: "bg-slate-700 text-slate-300",
  "family-event": "bg-emerald-500/10 text-emerald-200"
};

export function TimelinePage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const items = mockTimeline
    .filter((item) => category === "all" || item.category === category)
    .sort((a, b) => b.year - a.year);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              category === item ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-300"
            }`}
          >
            {item.replace("-", " ")}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState title="No timeline entries" message="Family history will appear here." />
      ) : (
        <ol className="relative space-y-4 border-l border-slate-800 pl-6">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-emerald-400" />
              <p className="text-sm font-semibold text-emerald-400">{item.year}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase ${colors[item.category]}`}>
                {item.category.replace("-", " ")}
              </span>
              <h3 className="mt-2 font-semibold text-slate-100">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.description}</p>
              {item.memberId && (
                <button
                  type="button"
                  onClick={() => navigateTo(`/members/${item.memberId}`)}
                  className="mt-1 text-xs text-emerald-400 hover:underline"
                >
                  {item.memberName}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
