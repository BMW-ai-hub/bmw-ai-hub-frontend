import { useState } from 'react';
import { PHOTOS } from '../../mockData';
import { IconPlay } from '../ui/icons';

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

interface Props {
  durationSeconds: number;
  /** Falls back to a generic technician shot only if this inspection has no thumbnail of its own. */
  posterSrc?: string;
}

/**
 * Frontend-only player shell — there's no real video source or player
 * dependency in this project yet. Shows a realistic poster frame (temporary
 * stock photo, see IMAGE_CREDITS.md) with a play affordance and duration
 * badge. Swapping in a real <video> element later just means rendering it
 * here instead of the <img>.
 */
export function VideoPlayerCard({ durationSeconds, posterSrc }: Props) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
      <img
        src={posterSrc ?? PHOTOS.technicianInspecting}
        alt="Walkaround video preview frame"
        className="size-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />

      <button
        type="button"
        onClick={() => setRequested(true)}
        aria-label="Play walkaround video"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-paper/95 text-ink transition-transform duration-200 ease-swift hover:scale-105">
          <IconPlay size={24} />
        </span>
      </button>

      <span className="tnum absolute right-3 bottom-3 rounded-sm bg-ink/80 px-2 py-1 text-micro font-bold text-paper">
        {formatDuration(durationSeconds)}
      </span>

      {requested && (
        <div className="absolute inset-x-0 bottom-0 bg-ink/85 px-3 py-2 text-center text-micro font-semibold text-paper/80">
          Playback preview only — wire up a real source to play this video.
        </div>
      )}
    </div>
  );
}
