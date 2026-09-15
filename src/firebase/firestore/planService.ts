/**
 * =============================================================================
 * FILE: src/firebase/firestore/planService.ts
 * ROLE: Firestore plans/{planId} — yearly plans only
 * =============================================================================
 * Client writes are denied by firestore.rules. Seed plans in Firebase Console.
 * =============================================================================
 */

import { addDoc } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebasePlan } from "../types/firebaseTypes";
import { firestoreCollection, getDocumentById, queryCollection } from "./helpers";

export function getPlan(planId: string): Promise<FirebasePlan | null> {
  return runFirebase("firebase.plan.get", () =>
    getDocumentById<FirebasePlan>(FIRESTORE_COLLECTIONS.plans, planId)
  );
}

export function getPlans(): Promise<FirebasePlan[]> {
  return runFirebase("firebase.plan.list", async () => {
    const plans = await queryCollection<FirebasePlan>(FIRESTORE_COLLECTIONS.plans);
    return plans.filter((plan) => plan.duration === "yearly");
  });
}

export function createPlan(input: Omit<FirebasePlan, "id">): Promise<FirebasePlan> {
  return runFirebase("firebase.plan.create", async () => {
    const payload: Omit<FirebasePlan, "id"> = {
      ...input,
      duration: "yearly"
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.plans), payload);
    return { id: reference.id, ...payload };
  });
}
