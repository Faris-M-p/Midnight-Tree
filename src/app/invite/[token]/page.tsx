import Link from "next/link";
import { acceptInvitationAction } from "@/features/invitations/actions";
import { redirect } from "next/navigation";

export const instant = false;

type PageProps = { params: Promise<{ token: string }> };

export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params;
  const result = await acceptInvitationAction(token);

  if (!result.error) {
    redirect("/app");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Invitation</h1>
      <p className="mt-3 text-sm text-red-600">{result.error}</p>
      <p className="mt-4 text-sm">
        <Link href="/login" className="underline">
          Sign in
        </Link>{" "}
        and open this link again if needed.
      </p>
    </main>
  );
}
