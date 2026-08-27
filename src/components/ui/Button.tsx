type Variant = 'primary' | 'secondary' | 'quiet' | 'positive' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  // Solid ink is the accent in this system — there is no brand blue button.
  primary:
    'bg-ink text-paper border border-ink hover:bg-ink-800 hover:border-ink-800 active:translate-y-px',
  secondary:
    'bg-paper text-ink border border-ink-300 hover:border-ink hover:bg-zebra active:translate-y-px',
  quiet: 'bg-transparent text-ink-600 border border-transparent hover:bg-well hover:text-ink',
  positive: 'bg-pass text-paper border border-pass hover:brightness-110 active:translate-y-px',
  danger: 'bg-fail text-paper border border-fail hover:brightness-110 active:translate-y-px',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-cell gap-1.5',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-body gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconTrailing?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconTrailing,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;

  return (
    <button
      {...rest}
      disabled={inert}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-[120ms] ease-swift disabled:pointer-events-none disabled:border-line disabled:bg-well disabled:text-ink-400 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <span className="spin size-3.5 rounded-full border-2 border-current/30 border-t-current" />
      ) : (
        icon
      )}
      {children}
      {iconTrailing}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: Size;
  active?: boolean;
}

export function IconButton({
  label,
  size = 'md',
  active = false,
  children,
  className = '',
  ...rest
}: IconButtonProps) {
  const box = size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12' : 'size-10';

  return (
    <button
      {...rest}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-[120ms] ease-swift ${box} ${
        active ? 'bg-ink text-paper' : 'text-ink-500 hover:bg-well hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}
