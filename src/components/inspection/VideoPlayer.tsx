import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IconAlert } from '../ui/icons';

export interface VideoPlayerHandle {
  /** Seeks to a position and resumes playback — what a chapter/timestamp click does. */
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // A src that looks well-formed can still fail at runtime — a deleted
  // file, a network blip, a demo URL that's blocked on this network. That
  // should never be a silently dead black box; show something explicit.
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  useImperativeHandle(ref, () => ({
    seekTo(seconds) {
      const el = videoRef.current;
      if (!el || failed) return;
      el.currentTime = seconds;
      // A timestamp click is a real user gesture, so autoplay is allowed here —
      // still swallow the rejection defensively (e.g. the element isn't ready yet).
      void el.play().catch(() => {});
    },
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-ink">
      {failed ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 px-6 text-center">
          <IconAlert size={22} className="text-paper/60" />
          <p className="text-cell font-semibold text-paper/80">Video unavailable</p>
          <p className="text-micro text-paper/50">
            The file couldn't be loaded — it may have been removed, or this is older data
            recorded before video playback was wired up.
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          controls
          preload="metadata"
          onError={() => setFailed(true)}
          className="aspect-video w-full bg-ink"
        >
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
});
