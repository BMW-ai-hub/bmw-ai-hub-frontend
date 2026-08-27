import { PHOTOS } from '../../mockData';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** First name only — the workspace greeting doesn't need the full account name. */
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

const HIGHLIGHTS = ['Assigned today', 'Walk-around ready', 'Customer communication'];

/** Semi-transparent glass chip for sitting directly on the photo — the plain `Tag` component's light-grey fill doesn't read against a dark overlay. */
function HeroChip({ children }: { children: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-sm border border-paper/25 bg-paper/15 px-2 text-micro font-bold tracking-[0.08em] text-paper uppercase backdrop-blur-[2px]">
      {children}
    </span>
  );
}

export function DashboardHero({ name }: { name: string }) {
  return (
    <div className="relative flex min-h-[380px] flex-col justify-center overflow-hidden rounded-lg border border-line sm:min-h-[420px] lg:min-h-[460px]">
      <img
        src={PHOTOS.workshopWide}
        alt="Technicians working on vehicles in a bright, modern service bay"
        className="absolute inset-0 size-full object-cover object-center"
      />
      {/* Left-to-right darkening so the text stays legible while the workshop detail on the right stays visible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.6) 32%, rgba(10,10,10,0.25) 60%, rgba(10,10,10,0.04) 85%)',
        }}
      />

      <div className="relative max-w-xl px-6 py-10 sm:px-10 lg:px-12">
        <p className="text-micro font-bold tracking-[0.11em] text-paper/70 uppercase">
          Technician workspace
        </p>
        <h1 className="mt-3 font-display text-display text-balance text-paper">
          {greeting()}, {firstName(name)}
        </h1>
        <p className="mt-4 font-display text-heading font-bold text-paper">
          Document clearly. Explain confidently.
        </p>
        <p className="mt-3 max-w-md text-body leading-relaxed text-paper/80">
          Review assigned inspections, capture technician walk-arounds, and send customers clear
          evidence of vehicle condition.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {HIGHLIGHTS.map((item) => (
            <HeroChip key={item}>{item}</HeroChip>
          ))}
        </div>
      </div>
    </div>
  );
}
