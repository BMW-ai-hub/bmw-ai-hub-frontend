interface BmwLogoProps {
  className?: string;
}

/** BMW roundel, kept as vector artwork so it stays crisp at every size. */
export function BmwLogo({ className = 'h-9 w-9' }: BmwLogoProps) {
  return (
    <img
      src="/assets/bmw-logo.png"
      alt="BMW"
      className={className}
      draggable={false}
    />
  );
}
