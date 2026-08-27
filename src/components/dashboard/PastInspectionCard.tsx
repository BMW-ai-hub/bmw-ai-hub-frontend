import type { Inspection } from '../../types';
import { StatusChip } from '../ui/Chip';
import { Meter } from '../ui/Metrics';
import { IconImage } from '../ui/icons';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

interface Props {
  inspection: Inspection;
  onView: () => void;
  /** First card in the strip — full-bleed photo with the info overlaid, not a separate panel. */
  featured?: boolean;
}

function Photo({ inspection }: { inspection: Inspection }) {
  return inspection.thumbnail ? (
    <img
      src={inspection.thumbnail}
      alt=""
      className="size-full object-cover transition-transform duration-[250ms] ease-swift group-hover:scale-[1.03]"
    />
  ) : (
    <span className="flex size-full items-center justify-center bg-well text-ink-300">
      <IconImage size={22} />
    </span>
  );
}

/** Compact thumbnail card for the "Recent inspections" strip — not a full dashboard tile. */
export function PastInspectionCard({ inspection, onView, featured = false }: Props) {
  if (featured) {
    return (
      <button
        type="button"
        onClick={onView}
        className="group relative flex aspect-[4/5] w-56 shrink-0 flex-col overflow-hidden rounded-lg text-left"
      >
        <Photo inspection={inspection} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusChip status={inspection.status} size="sm" />
        </div>
        <div className="mt-auto p-4">
          <p className="font-display text-heading text-paper">
            {inspection.vehicle.year} {inspection.vehicle.model}
          </p>
          <p className="mt-1 text-cell font-semibold text-paper/75">{inspection.service_type}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="tnum text-micro font-bold tracking-[0.06em] text-paper/60 uppercase">
              {formatDate(inspection.updated_at)}
            </span>
            {inspection.latest_score != null && (
              <span
                className={`tnum font-display text-heading ${
                  inspection.latest_score >= 80 ? 'text-pass' : 'text-fail'
                }`}
              >
                {inspection.latest_score}%
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onView}
      className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-paper text-left transition-colors duration-[150ms] ease-swift hover:border-ink-300"
    >
      <div className="relative h-40 shrink-0 overflow-hidden bg-well">
        <Photo inspection={inspection} />
        <div className="absolute top-2 left-2">
          <StatusChip status={inspection.status} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-bold text-ink">
          {inspection.vehicle.year} {inspection.vehicle.model}
        </p>
        <p className="mt-0.5 truncate text-cell font-medium text-ink-400">
          {inspection.service_type}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="tnum text-micro font-bold tracking-[0.06em] text-ink-400 uppercase">
            {formatDate(inspection.updated_at)}
          </span>
          {inspection.latest_score != null && (
            <Meter value={inspection.latest_score} threshold={80} width={48} showValue />
          )}
        </div>
      </div>
    </button>
  );
}
