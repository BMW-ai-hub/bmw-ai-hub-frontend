import type { Inspection } from '../../types';
import { PHOTOS } from '../../mockData';

interface Props {
  inspection: Inspection;
  actions?: React.ReactNode;
}

export function InspectionHero({ inspection, actions }: Props) {
  const vinTail = inspection.vehicle.vin.slice(-4);

  return (
    <div className="relative flex min-h-[168px] flex-col justify-end overflow-hidden rounded-lg">
      <img
        src={inspection.thumbnail ?? PHOTOS.technicianInspecting}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/5" />

      <div className="relative flex flex-wrap items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <h1 className="font-display text-title text-balance text-paper">
            {inspection.vehicle.year} BMW {inspection.vehicle.model}
          </h1>
          <p className="mt-1.5 text-lead font-semibold text-paper/80">
            {inspection.service_type} · VIN ending {vinTail}
          </p>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-3 rounded-md bg-paper/95 px-3.5 py-2.5 shadow-[0_1px_2px_rgb(10_10_10/0.15)]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
