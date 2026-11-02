"use client";

import { useState, useTransition } from "react";
import { connectExistingPartnerAction } from "./actions";
import type { Member } from "@/types/database";
import { memberLabel } from "@/types/database";
import { buttonClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

type Props = {
  familyId: string;
  members: Member[];
  canEdit: boolean;
};

export function ConnectPartnerForm({ familyId, members, canEdit }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!canEdit || members.length < 2) return null;

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="font-medium">Connect existing partners</h3>
      <p className="text-xs text-neutral-500">Does not create a duplicate person.</p>
      <label className={labelClass}>
        Member A
        <select className={fieldClass} value={a} onChange={(e) => setA(e.target.value)}>
          <option value="">—</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberLabel(m)}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Member B
        <select className={fieldClass} value={b} onChange={(e) => setB(e.target.value)}>
          <option value="">—</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberLabel(m)}
            </option>
          ))}
        </select>
      </label>
      {message ? <p className="text-sm text-neutral-700 dark:text-neutral-300">{message}</p> : null}
      <button
        type="button"
        className={buttonClass}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await connectExistingPartnerAction(familyId, a, b);
            setMessage(res.error ?? "Partners connected.");
          })
        }
      >
        {pending ? "Connecting…" : "Connect partners"}
      </button>
    </div>
  );
}
