/**
 * =============================================================================
 * FILE: src/firebase/auth/firebaseAccount.ts
 * ROLE: Register / login against Firebase (no MidnightApi)
 * =============================================================================
 * Used by RegisterPage and LoginPage email/password only.
 * Access-token login still uses the existing API service.
 * =============================================================================
 */

import type { User } from "firebase/auth";
import { saveAuthSession } from "../../services/authSessionService";
import { addFamilyMemberAccess } from "../firestore/familyMemberService";
import { createFamily, getFamily as getFirebaseFamily } from "../firestore/familyService";
import { createUserProfile, updateUserProfile } from "../firestore/userService";
import { FirebaseClientError } from "../errors/firebaseErrorHandler";
import { ensureCurrentFamilyId } from "./currentFamily";
import { firebaseLogin, firebaseRegister } from "./firebaseAuth";

function nameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
  const [firstName, ...rest] = local.split(/\s+/);
  return {
    firstName: firstName || "Member",
    lastName: rest.join(" ")
  };
}

async function persistFirebaseSession(
  user: User,
  firebaseFamilyId?: string | null,
  familyName?: string | null
): Promise<void> {
  const accessToken = await user.getIdToken();
  saveAuthSession({
    accessToken,
    expiresAtUtc: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    tokenType: "Bearer",
    refreshToken: null,
    authProvider: "firebase",
    firebaseFamilyId: firebaseFamilyId ?? null,
    authType: "admin",
    isAdmin: true,
    permission: "ADMIN_FULL",
    scope: "EntireFamily",
    scopeMemberId: null,
    tokenId: null,
    tokenName: null,
    user: {
      username: user.email ?? user.uid,
      email: user.email ?? undefined,
      firebaseUid: user.uid,
      firebaseFamilyId: firebaseFamilyId ?? undefined,
      familyName: familyName ?? undefined
    }
  });
}

export async function registerWithFirebase(input: {
  email: string;
  password: string;
  familyName: string;
}): Promise<void> {
  const credential = await firebaseRegister(input.email, input.password);
  const user = credential.user;
  const names = nameFromEmail(input.email);

  await persistFirebaseSession(user, null, input.familyName);

  await createUserProfile({
    uid: user.uid,
    firstName: names.firstName,
    lastName: names.lastName,
    email: input.email,
    status: "active"
  });

  const family = await createFamily({
    name: input.familyName,
    ownerId: user.uid,
    memberCount: 0,
    status: "active"
  });

  if (!family.id) {
    throw new FirebaseClientError("Family could not be created.", "failed-precondition");
  }

  await addFamilyMemberAccess({
    familyId: family.id,
    userId: user.uid,
    role: "owner",
    status: "active"
  });
  await updateUserProfile(user.uid, { familyId: family.id });
  await persistFirebaseSession(user, family.id, input.familyName);
}

export async function loginWithFirebase(input: { email: string; password: string }): Promise<void> {
  const credential = await firebaseLogin(input.email, input.password);
  const user = credential.user;
  await persistFirebaseSession(user, null, null);

  const familyId = await ensureCurrentFamilyId();
  const family = await getFirebaseFamily(familyId);
  await persistFirebaseSession(user, familyId, family?.name?.trim() || null);
}
