import { useEffect, useState } from "react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { getMemberDetails, deleteMember } from "../../services/memberService";
import type { MemberProfile } from "../../types/member";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { logUnexpected } from "../../utils/logFailure";
import { MemberDetails } from "../../components/members/MemberDetails";
import { EditMember } from "../../components/members/EditMember";
import { ErrorState, LoadingState } from "../../components/ui/PageStates";
import { useFamilyData } from "../../context/FamilyDataContext";

interface MemberDetailsPageProps {
  pathname: string;
}

export function MemberDetailsPage({ pathname }: MemberDetailsPageProps) {
  const match = matchPath("/members/:id", pathname);
  const id = Number(match?.params.id);
  const { members, memberRanks, unions, refresh } = useFamilyData();
  const fallback = members.find((m) => m.id === String(id));
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid member id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getMemberDetails(id)
      .then((data) => {
        setProfile(data);
        setError("");
      })
      .catch((err) => {
        logUnexpected("MemberDetails", err);
        setError(err instanceof ApiClientError ? err.message : "Unable to load member details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await deleteMember(id);
      notify.success("Member deleted successfully.");
      await refresh();
      navigateTo("/members");
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to delete member right now.");
    }
  };

  if (loading) return <LoadingState label="Loading member..." />;
  if (error || !profile) return <ErrorState message={error || "Member not found."} onRetry={() => navigateTo("/members")} />;

  return (
    <>
      <MemberDetails
        profile={profile}
        location={fallback?.location}
        memberRanks={memberRanks}
        unions={unions}
        onEdit={() => setEditOpen(true)}
        onDelete={handleDelete}
      />
      <EditMember
        open={editOpen}
        memberId={id}
        fallback={fallback}
        onClose={() => setEditOpen(false)}
        onSaved={async (updated) => {
          setProfile(updated);
          await refresh();
        }}
      />
    </>
  );
}
