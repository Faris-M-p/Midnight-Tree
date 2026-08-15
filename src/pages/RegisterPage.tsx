/**
 * =============================================================================
 * FILE: src/pages/RegisterPage.tsx
 * ROLE: Create-account screen
 * =============================================================================
 */

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { registerAccount } from "../services/authService";
import { setPendingVerificationEmail } from "../auth/pendingAuth";
import { notify } from "../utils/notify";

type FormField = "email" | "password" | "confirmPassword" | "familyName";
type RegisterFormValues = Record<FormField, string>;
type FormErrors = Partial<Record<FormField, string>>;

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

const initialValues: RegisterFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  familyName: ""
};

function validateForm(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(values.password)
  ) {
    errors.password =
      "Password must include upper/lowercase letters, a number, a symbol, and be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!values.familyName.trim()) {
    errors.familyName = "Family name is required.";
  }

  return errors;
}

function InputField(props: {
  id: FormField;
  label: string;
  type?: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (field: FormField, value: string) => void;
}) {
  const hasError = Boolean(props.error);
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-200">
        {props.label}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type ?? "text"}
        autoComplete={props.id === "email" ? "email" : props.id === "password" || props.id === "confirmPassword" ? "new-password" : "organization"}
        value={props.value}
        onChange={(event) => props.onChange(props.id, event.target.value)}
        disabled={props.disabled}
        className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
          hasError
            ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
            : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
        } ${props.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
      />
      <p
        className={`min-h-[1.25rem] text-xs transition ${
          hasError ? "text-rose-400 opacity-100" : "text-transparent opacity-0"
        }`}
      >
        {props.error ?? "placeholder"}
      </p>
    </div>
  );
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

  const updateField = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const nextErrors = validateForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerAccount({
        email: values.email.trim(),
        password: values.password,
        familyName: values.familyName.trim()
      });

      setPendingVerificationEmail(values.email.trim());
      notify.info("We've sent a verification code to your email.");
      setValues(initialValues);
      onNavigate("/verify-email");
    } catch (error) {
      if (error instanceof ApiClientError) {
        notify.fromApiError(error);
      } else {
        notify.error("Unable to register right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/register" />
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
            <h1 className="font-serif text-3xl text-slate-100">Create your account</h1>
            <p className="text-sm text-slate-400">Start your family chronicle in a few steps.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-100">
              <InputField
                id="email"
                label="Email"
                type="email"
                value={values.email}
                error={errors.email}
                disabled={isSubmitting}
                onChange={updateField}
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                value={values.password}
                error={errors.password}
                disabled={isSubmitting}
                onChange={updateField}
              />
              <InputField
                id="confirmPassword"
                label="Confirm password"
                type="password"
                value={values.confirmPassword}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                onChange={updateField}
              />
              <InputField
                id="familyName"
                label="Family name"
                value={values.familyName}
                error={errors.familyName}
                disabled={isSubmitting}
                onChange={updateField}
              />
            </fieldset>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                canSubmit
                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  : "cursor-not-allowed bg-emerald-500/60 text-slate-900"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate("/login")}
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Go to Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
