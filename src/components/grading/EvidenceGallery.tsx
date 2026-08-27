import { MOCK_EVIDENCE } from '../../mockData';
import { Panel, PanelHeader } from '../ui/Panel';
import { IconImage } from '../ui/icons';

const stamp = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

interface Props {
  /** Mock only for now — wiring a real player means seeking to this timestamp instead. */
  onSelect?: (seconds: number) => void;
}

export function EvidenceGallery({ onSelect }: Props) {
  return (
    <Panel flush>
      <PanelHeader
        title="Evidence"
        icon={<IconImage size={17} />}
        meta={`${MOCK_EVIDENCE.length} stills from the video`}
      />
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {MOCK_EVIDENCE.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect?.(item.timestamp_seconds)}
            className="group relative aspect-[4/3] overflow-hidden bg-paper text-left"
          >
            <img
              src={item.image}
              alt={item.label}
              className="size-full object-cover transition-transform duration-[200ms] ease-swift group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-8">
              <p className="text-cell font-bold text-paper">{item.label}</p>
              <p className="tnum mt-0.5 text-micro font-semibold text-paper/70">
                {stamp(item.timestamp_seconds)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
