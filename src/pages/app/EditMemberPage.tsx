import { matchPath, navigateTo } from "../../routing/navigate";
import { useFamilyData } from "../../context/FamilyDataContext";
import { EditMember } from "../../components/members/EditMember";
import { ErrorState } from "../../components/ui/PageStates";

interface EditMemberPageProps {
  pathname: string;
}

export function EditMemberPage({ pathname }: EditMemberPageProps) {
  const match = matchPath("/members/:id/edit", pathname);
  const id = Number(match?.params.id);
  const { members, refresh } = useFamilyData();
  const fallback = members.find((m) => m.id === String(id));

  if (!Number.isFinite(id)) {
    return <ErrorState message="Invalid member id." />;
  }

  return (
    <EditMember
      open
      variant="page"
      memberId={id}
      fallback={fallback}
      onClose={() => navigateTo(`/members/${id}`)}
      onSaved={async () => {
        await refresh();
      }}
    />
  );
}
