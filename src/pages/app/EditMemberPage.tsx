import { useEffect } from "react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { useFamilyData } from "../../context/FamilyDataContext";
import { EditMember } from "../../components/members/EditMember";
import { ErrorState } from "../../components/ui/PageStates";
import { canEditMember } from "../../auth/permissions";
import { notify } from "../../utils/notify";

interface EditMemberPageProps {
  pathname: string;
}

export function EditMemberPage({ pathname }: EditMemberPageProps) {
  const match = matchPath("/members/:id/edit", pathname);
  const id = Number(match?.params.id);
  const { members, unions, refresh } = useFamilyData();
  const fallback = members.find((m) => m.id === String(id));
  const allowed = Number.isFinite(id) && canEditMember(id, unions);

  useEffect(() => {
    if (Number.isFinite(id) && !allowed) {
      notify.validation("You don't have permission to perform this action.");
      navigateTo(`/members/${id}`);
    }
  }, [id, allowed]);

  if (!Number.isFinite(id)) {
    return <ErrorState message="Invalid member id." />;
  }

  if (!allowed) {
    return null;
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
