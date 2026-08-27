import { useEffect, useRef, useState } from 'react';
import { IconKebab } from './icons';

export interface RowAction {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
}

/**
 * Per-row overflow menu. Native `<dialog>`/popover would be heavier than this
 * needs to be, so it handles its own outside-click and Escape dismissal.
 */
export function RowMenu({ actions, label }: { actions: RowAction[]; label: string }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative flex justify-end">
      <button
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
        className={`inline-flex size-8 items-center justify-center rounded-md transition-colors duration-[120ms] ${
          open ? 'bg-ink text-paper' : 'text-ink-400 hover:bg-well hover:text-ink'
        }`}
      >
        <IconKebab size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="rise absolute top-9 right-0 z-20 min-w-44 overflow-hidden rounded-md border border-line bg-paper py-1 shadow-[var(--lift-overlay)]"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                action.onSelect();
              }}
              className={`block w-full px-3.5 py-2 text-left text-cell font-semibold transition-colors hover:bg-well ${
                action.tone === 'danger' ? 'text-fail' : 'text-ink-800'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
