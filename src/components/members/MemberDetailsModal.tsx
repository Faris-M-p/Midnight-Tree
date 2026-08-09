import { X } from "lucide-react";
import type { MemberProfile } from "../../types/member";
import type { MemberRanks } from "../../utils/memberRanks";
import { ErrorState, LoadingState } from "../ui/PageStates";
import { MemberDetails } from "./MemberDetails";

interface MemberDetailsModalProps {
  open: boolean;
  loading?: boolean;
  error?: string;
  profile: MemberProfile | null;
  location?: string;
  education?: string;
  career?: string;
  memberRanks?: MemberRanks;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenMember?: (memberId: number) => void;
  showViewInTree?: boolean;
}

export function MemberDetailsModal({
  open,
  loading = false,
  error,
  profile,
  location,
  education,
  career,
  memberRanks,
  onClose,
  onEdit,
  onDelete,
  onOpenMember,
  showViewInTree = false
}: MemberDetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Member details</h2>
            <p className="text-xs text-slate-500">Same details view on Members and Family Tree.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          {loading ? <LoadingState label="Loading member..." /> : null}
          {!loading && (error || !profile) ? <ErrorState message={error || "Member not found."} /> : null}
          {!loading && profile ? (
            <MemberDetails
              profile={profile}
              location={location}
              education={education}
              career={career}
              memberRanks={memberRanks}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenMember={onOpenMember}
              showViewInTree={showViewInTree}
              embedded
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
