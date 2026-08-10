import type { HomeTreePreviewNode } from "../../data/mockHome";
import { navigateTo } from "../../routing/navigate";

function TreeNode({ node, isRoot = false }: { node: HomeTreePreviewNode; isRoot?: boolean }) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className={`flex flex-col items-center ${isRoot ? "" : "pt-4"}`}>
      {!isRoot ? <div className="mb-0 h-4 w-px bg-emerald-500/50" /> : null}
      <div className="min-w-[5.5rem] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-100">{node.name}</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{node.relation}</p>
      </div>
      {hasChildren ? (
        <>
          <div className="h-4 w-px bg-emerald-500/50" />
          <div className="relative flex items-start gap-6 pt-0">
            <div className="absolute left-6 right-6 top-0 h-px bg-emerald-500/40" />
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function FamilyTreePreview({ root }: { root: HomeTreePreviewNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
      <div className="mx-auto flex min-w-[20rem] justify-center">
        <TreeNode node={root} isRoot />
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => navigateTo("/family-tree")}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          View Full Family Tree
        </button>
      </div>
    </div>
  );
}
