/**
 * App-wide toast helper (Sonner).
 * Server validation / API messages should go through notify.fromApiError().
 */

import { toast } from "sonner";
import { ToastCard, type ToastKind } from "../components/AppToaster";

export type { ToastKind };

interface ApiErrorLike {
  message?: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  errors?: Array<{ message?: string | null }>;
}

const defaultTitles: Record<ToastKind, string> = {
  success: "Congratulations!",
  info: "Did you know?",
  warning: "Warning!",
  error: "Something went wrong!"
};

function show(kind: ToastKind, description: string, title = defaultTitles[kind], duration = 4500) {
  const text = description.trim();
  if (!text) return;

  toast.custom(
    (id) => <ToastCard id={id} kind={kind} title={title} description={text} />,
    { duration }
  );
}

export const notify = {
  success(description: string, title = defaultTitles.success) {
    show("success", description, title, 4000);
  },
  info(description: string, title = defaultTitles.info) {
    show("info", description, title, 4500);
  },
  warning(description: string, title = defaultTitles.warning) {
    show("warning", description, title, 5000);
  },
  error(description: string, title = defaultTitles.error) {
    show("error", description, title, 6500);
  },
  validation(description: string, title = "Please check this") {
    show("warning", description, title, 5000);
  },
  fromApiError(error: ApiErrorLike) {
    const status = "statusCode" in error ? Number(error.statusCode) : undefined;
    const message = formatApiError(error);
    if (status && status >= 400 && status < 500) {
      notify.validation(message);
      return;
    }
    notify.error(message);
  }
};

export function formatApiError(error: ApiErrorLike): string {
  const fieldMessages = Object.values(error.fieldErrors || {}).filter(Boolean);
  const itemMessages = (error.errors || [])
    .map((item) => item.message)
    .filter((message): message is string => Boolean(message?.trim()));

  const parts = [...fieldMessages, ...itemMessages]
    .map((message) => message.trim())
    .filter(Boolean);

  const unique = [...new Set(parts)];
  const summary = error.message?.trim();

  if (unique.length === 0) {
    return summary || "Please check your input and try again.";
  }

  if (summary && !unique.includes(summary)) {
    return [summary, ...unique].join(" ");
  }

  return unique.join(" ");
}
