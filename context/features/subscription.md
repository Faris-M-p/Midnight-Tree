# Subscription

Status: **Not implemented** as a user-facing feature. Firestore helpers exist and are unused by pages.

## Code that exists

`src/firebase/firestore/planService.ts`

- `getPlan`, `getPlans`, `createPlan`
- `getPlans` returns only `duration === "yearly"`
- `createPlan` forces `duration: "yearly"`
- File comment: client writes are denied by rules; seed plans in the Firebase console
- `firestore.rules` allows signed-in read of `plans` and denies all writes

`src/firebase/firestore/subscriptionService.ts`

- `createSubscription` always sets `status: "pending"`
- Comment: the client cannot mark a payment successful; that is left for a later server-side function
- `getSubscription`, `getSubscriptionsByUser`, `getSubscriptionsByFamily`
- No function updates status to `active`, `expired`, or `cancelled`

Types in `firebaseTypes.ts`:

- Plan: `name`, `price`, `duration`, `maxMembers`, `status`
- Subscription: `userId`, `familyId`, `planId`, `startDate`, `expiryDate`, `status`, optional `paymentId`, `createdAt`
- Status union: `pending` | `active` | `expired` | `cancelled`

## What is absent

- No checkout page, no price table, no Stripe/Razorpay/other SDK in `package.json`
- No call to `createSubscription` or `getPlans` outside those two files
- No check that `members.length` stays under `maxMembers`
- No Cloud Function in the repo to confirm payment

Pricing, billing provider, and what a plan unlocks are **TBD**.
