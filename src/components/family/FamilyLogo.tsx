interface FamilyLogoProps {
  name: string;
  src?: string;
  className: string;
}

export function FamilyLogo({ name, src, className }: FamilyLogoProps) {
  if (src?.trim()) {
    return <img src={src} alt="" className={className} />;
  }

  const initial = (name.trim()[0] || "F").toUpperCase();
  return (
    <div className={`flex items-center justify-center bg-slate-800 font-semibold text-emerald-300 ${className}`}>
      {initial}
    </div>
  );
}
