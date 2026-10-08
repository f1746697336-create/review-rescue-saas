import { SUPPORT_EMAIL, SUPPORT_GMAIL_COMPOSE_URL } from "@/lib/site";

export function ContactSupport({
  className,
}: {
  className?: string;
}) {
  return (
    <span className="block">
      <a
        href={SUPPORT_GMAIL_COMPOSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className ??
          "text-xs leading-relaxed text-slate-500 transition hover:text-indigo-600"
        }
      >
        <span>Need help or reporting a bug? Contact Support</span>
      </a>
      <a
        href={SUPPORT_GMAIL_COMPOSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-0.5 block text-[11px] text-slate-400 underline-offset-2 transition hover:text-indigo-600 hover:underline"
      >
        {SUPPORT_EMAIL}
      </a>
    </span>
  );
}
