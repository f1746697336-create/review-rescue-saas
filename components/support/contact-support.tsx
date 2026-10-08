import { SUPPORT_EMAIL } from "@/lib/site";

export function ContactSupport({
  className,
}: {
  className?: string;
}) {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className={
        className ??
        "text-xs leading-relaxed text-slate-500 transition hover:text-indigo-600"
      }
    >
      <span>Need help or reporting a bug? Contact Support</span>
    </a>
  );
}
