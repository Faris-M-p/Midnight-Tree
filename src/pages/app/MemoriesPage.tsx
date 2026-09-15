import { matchPath } from "../../routing/navigate";
import { MemoriesListView } from "../../components/memories/MemoriesListView";
import { MemoryCreateView } from "../../components/memories/MemoryCreateView";
import { MemoryDetailsView } from "../../components/memories/MemoryDetailsView";
import { MemoryEditView } from "../../components/memories/MemoryEditView";
import { EmptyState } from "../../components/ui/PageStates";

interface MemoriesPageProps {
  pathname: string;
}

function memoryIdFromParams(id?: string): string {
  const value = id?.trim() ?? "";
  if (!value || value === "create") return "";
  return value;
}

export function MemoriesPage({ pathname }: MemoriesPageProps) {
  if (pathname === "/memories/create") {
    return <MemoryCreateView />;
  }

  const editMatch = matchPath("/memories/:id/edit", pathname);
  if (editMatch) {
    const id = memoryIdFromParams(editMatch.params.id);
    if (!id) {
      return <EmptyState title="Memory not found" message="This memory is no longer available." />;
    }
    return <MemoryEditView memoryId={id} />;
  }

  const detailMatch = matchPath("/memories/:id", pathname);
  if (detailMatch && detailMatch.params.id !== "create") {
    const id = memoryIdFromParams(detailMatch.params.id);
    if (!id) {
      return <EmptyState title="Memory not found" message="This memory is no longer available." />;
    }
    return <MemoryDetailsView memoryId={id} />;
  }

  if (pathname === "/memories") {
    return <MemoriesListView />;
  }

  return <MemoriesListView />;
}
