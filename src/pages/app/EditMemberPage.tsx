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
  const id = match?.params.id ?? "";
  const { members, unions, refresh } = useFamilyData();
  const fallback = members.find((m) => m.id === id);
  const allowed = Boolean(id) && canEditMember(id, unions);

  useEffect(() => {
    if (id && !allowed) {
      notify.validation("You don't have permission to perform this action.");
      navigateTo(`/members/${id}`);
    }
  }, [id, allowed]);

  if (!id) {
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
