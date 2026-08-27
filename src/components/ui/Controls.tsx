import { IconChevronDown, IconSearch } from './icons';

/* ── Segmented control ───────────────────────────────────────────────
   Grey track, white knob. The house style's primary mode-switcher.       */

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
}: SegmentedProps<T>) {
  const pad = size === 'sm' ? 'h-8 px-3 text-cell' : 'h-9 px-4 text-body';

  // A pill track that wraps looks broken, so it scrolls instead once the
  // options no longer fit. `.scroll-x` marks the overflow as intentional.
  return (
    <div className="scroll-x -mx-1 max-w-full px-1">
      <div role="tablist" aria-label={label} className="inline-flex rounded-full bg-well p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors duration-[120ms] ease-swift ${pad} ${
                active
                  ? 'bg-paper text-ink shadow-[0_1px_2px_rgb(10_10_10/0.12)]'
                  : 'text-ink-500 hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Text input ──────────────────────────────────────────────────────── */

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Leading adornment, e.g. a currency mark. */
  lead?: React.ReactNode;
  /** Trailing adornment, e.g. a unit. */
  trail?: React.ReactNode;
  alignRight?: boolean;
  invalid?: boolean;
}

export function TextField({
  lead,
  trail,
  alignRight = false,
  invalid = false,
  className = '',
  ...rest
}: TextFieldProps) {
  return (
    <div
      className={`well flex h-11 items-center gap-2 px-3.5 ${
        invalid ? '!border-fail !bg-fail-wash' : ''
      } ${className}`}
    >
      {lead && <span className="shrink-0 text-body font-semibold text-ink-400">{lead}</span>}
      <input
        {...rest}
        aria-invalid={invalid || undefined}
        className={`tnum min-w-0 flex-1 bg-transparent text-body font-semibold outline-none ${
          alignRight ? 'text-right' : ''
        }`}
      />
      {trail && <span className="shrink-0 text-body font-semibold text-ink-400">{trail}</span>}
    </div>
  );
}

/* ── Select ──────────────────────────────────────────────────────────── */

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function SelectField({ children, className = '', ...rest }: SelectFieldProps) {
  return (
    <div className={`well relative flex h-11 items-center ${className}`}>
      <select
        {...rest}
        className="w-full appearance-none bg-transparent py-0 pr-9 pl-3.5 text-body font-semibold outline-none"
      >
        {children}
      </select>
      <IconChevronDown size={15} className="pointer-events-none absolute right-3 text-ink-500" />
    </div>
  );
}

/* ── Search ──────────────────────────────────────────────────────────── */

interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function SearchField({ label, className = '', ...rest }: SearchFieldProps) {
  return (
    <div className={`well flex h-10 items-center gap-2 px-3 ${className}`}>
      <IconSearch size={15} className="shrink-0 text-ink-400" />
      <input
        type="search"
        aria-label={label}
        placeholder="Search…"
        {...rest}
        className="min-w-0 flex-1 bg-transparent text-cell font-medium outline-none [&::-webkit-search-cancel-button]:hidden"
      />
    </div>
  );
}

/* ── Labelled field wrapper ──────────────────────────────────────────── */

export function Labelled({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-cell font-bold text-ink-600">
        {label}
      </label>
      {children}
      {hint && <p className="text-cell text-ink-400">{hint}</p>}
    </div>
  );
}

/* ── Switch ──────────────────────────────────────────────────────────── */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-[160ms] ease-swift ${
        checked ? 'bg-ink' : 'bg-well-deep'
      }`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-paper shadow-[0_1px_2px_rgb(10_10_10/0.2)] transition-[left] duration-[160ms] ease-swift ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}
