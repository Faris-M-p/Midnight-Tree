/**
 * Resolve / create the signed-in user's Firestore family.
 */

import { getAuthSession, saveAuthSession } from "../../services/authSessionService";
import { FirebaseClientError } from "../errors/firebaseErrorHandler";
import { getCurrentFirebaseUser, waitForCurrentFirebaseUser } from "./firebaseAuth";
import { addFamilyMemberAccess } from "../firestore/familyMemberService";
import { createFamily, getFamily } from "../firestore/familyService";
import { createUserProfile, getUserProfile, updateUserProfile } from "../firestore/userService";

function rememberFamilyId(familyId: string, familyName?: string | null): void {
  const session = getAuthSession();
  if (!session) return;
  saveAuthSession({
    ...session,
    firebaseFamilyId: familyId,
    user: {
      ...(session.user ?? {}),
      firebaseFamilyId: familyId,
      familyName: familyName || session.user?.familyName
    }
  });
}

function namesFromUser(email: string | null): { firstName: string; lastName: string } {
  const local = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
  const [firstName, ...rest] = local.split(/\s+/);
  return {
    firstName: firstName || "Member",
    lastName: rest.join(" ")
  };
}

async function familyIfOwned(familyId: string | null | undefined): Promise<{ id: string; name?: string } | null> {
  const id = familyId?.trim();
  if (!id) return null;
  try {
    const family = await getFamily(id);
    return family?.id ? { id: family.id, name: family.name } : null;
  } catch {
    return null;
  }
}

export async function ensureCurrentFamilyId(): Promise<string> {
  const session = getAuthSession();
  if (session?.authType === "access_token" && session.firebaseFamilyId) {
    const tokenUser = getCurrentFirebaseUser() ?? (await waitForCurrentFirebaseUser());
    if (!tokenUser) {
      throw new FirebaseClientError("You are not signed in.", "unauthenticated");
    }
    return session.firebaseFamilyId;
  }

  const user = getCurrentFirebaseUser() ?? (await waitForCurrentFirebaseUser());
  if (!user) {
    throw new FirebaseClientError("You are not signed in.", "unauthenticated");
  }

  const names = namesFromUser(user.email);
  const familyName =
    (typeof session?.user?.familyName === "string" && session.user.familyName.trim()) || "Your Family";

  let profile = null;
  try {
    profile = await getUserProfile(user.uid);
  } catch {
    profile = null;
  }

  if (!profile) {
    profile = await createUserProfile({
      uid: user.uid,
      firstName: names.firstName,
      lastName: names.lastName,
      email: user.email ?? "",
      status: "active"
    });
  }

  const existing =
    (await familyIfOwned(session?.firebaseFamilyId)) ?? (await familyIfOwned(profile.familyId));
  if (existing) {
    if (profile.familyId !== existing.id) {
      await updateUserProfile(user.uid, { familyId: existing.id });
    }
    rememberFamilyId(existing.id, existing.name);
    return existing.id;
  }

  const created = await createFamily({
    name: familyName,
    ownerId: user.uid,
    memberCount: 0,
    status: "active"
  });
  if (!created.id) {
    throw new FirebaseClientError("Family could not be created.", "failed-precondition");
  }

  await addFamilyMemberAccess({
    familyId: created.id,
    userId: user.uid,
    role: "owner",
    status: "active"
  });
  await updateUserProfile(user.uid, { familyId: created.id });
  rememberFamilyId(created.id, familyName);
  return created.id;
}
