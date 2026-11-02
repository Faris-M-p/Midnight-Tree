export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      {children}
    </div>
  );
}
