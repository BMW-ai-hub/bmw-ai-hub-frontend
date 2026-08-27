import { IconInfo } from '../ui/icons';

/** Deliberately understated — this is fine print, not a warning. */
export function RubricNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-line border-l-2 border-l-info/50 bg-well/60 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-info/70">
        <IconInfo size={16} />
      </span>
      <p className="text-cell leading-relaxed text-ink-500">{children}</p>
    </div>
  );
}
