/**
 * Shared add-member modal used by Family Tree and Members.
 * Re-exports AddMember so older imports keep working.
 */

export { AddMember as CreateMemberModal } from "./members/AddMember";
export type { AddMemberProps as CreateMemberModalProps } from "./members/AddMember";
