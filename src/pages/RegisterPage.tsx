import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "../services/apiClient";
import { registerAccount } from "../services/authService";

type FormField =
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "familyCode"
  | "familyName"
  | "description";

type RegisterFormValues = Record<FormField, string>;
type FormErrors = Partial<Record<FormField, string>>;

interface RegisterPageProps {
  onNavigate: (path: "/" | "/register" | "/login") => void;
}

const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  familyCode: "",
  familyName: "",
  description: ""
};

function validateForm(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

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

  if (!values.familyCode.trim()) {
    errors.familyCode = "Family code is required.";
  }

  if (!values.familyName.trim()) {
    errors.familyName = "Family name is required.";
  }

  if (values.description.length > 1000) {
    errors.description = "Description must be 1000 characters or less.";
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
  placeholder?: string;
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
        autoComplete={props.id === "email" ? "email" : props.id}
        value={props.value}
        onChange={(event) => props.onChange(props.id, event.target.value)}
        placeholder={props.placeholder}
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
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

  const updateField = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const nextErrors = validateForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    try {
      await registerAccount({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        familyCode: values.familyCode.trim(),
        familyName: values.familyName.trim(),
        description: values.description.trim() || undefined
      });

      setSuccessMessage("Registration successful. Redirecting to login...");
      setValues(initialValues);
      window.setTimeout(() => onNavigate("/login"), 1200);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (Object.keys(error.fieldErrors).length > 0) {
          setErrors((current) => ({ ...current, ...(error.fieldErrors as FormErrors) }));
        }

        setServerError(error.message || "Something went wrong. Please try again.");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
          <h1 className="font-serif text-3xl text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-400">
            Register your family admin account to begin building your lineage.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-100">
            <InputField
              id="username"
              label="Username"
              value={values.username}
              error={errors.username}
              disabled={isSubmitting}
              onChange={updateField}
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              value={values.email}
              error={errors.email}
              disabled={isSubmitting}
              onChange={updateField}
            />

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="familyCode"
                label="Family code"
                value={values.familyCode}
                error={errors.familyCode}
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
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-200">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                disabled={isSubmitting}
                maxLength={1000}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                  errors.description
                    ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
                    : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              />
              <div className="flex items-center justify-between">
                <p className={`text-xs ${errors.description ? "text-rose-400" : "text-slate-500"}`}>
                  {errors.description ?? " "}
                </p>
                <p className="text-xs text-slate-500">{values.description.length}/1000</p>
              </div>
            </div>
          </fieldset>

          <div
            className={`overflow-hidden rounded-xl border px-4 py-3 text-sm transition ${
              successMessage
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 max-h-20 opacity-100"
                : "max-h-0 border-transparent bg-transparent p-0 opacity-0"
            }`}
            aria-live="polite"
          >
            {successMessage}
          </div>

          <div
            className={`overflow-hidden rounded-xl border px-4 py-3 text-sm transition ${
              serverError
                ? "border-rose-500/40 bg-rose-950/40 text-rose-300 max-h-24 opacity-100"
                : "max-h-0 border-transparent bg-transparent p-0 opacity-0"
            }`}
            aria-live="assertive"
          >
            {serverError}
          </div>

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
  );
}
