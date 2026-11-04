"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fieldClass, labelClass } from "./AuthFormStyles";

type Props = {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

export function PasswordField({
  label,
  name,
  autoComplete = "current-password",
  minLength,
  required = true
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={labelClass}>
      {label}
      <span className="relative mt-1 block">
        <input
          className={`${fieldClass} mt-0 pr-10`}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </span>
    </label>
  );
}
