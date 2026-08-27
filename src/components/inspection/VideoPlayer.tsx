import { forwardRef, useImperativeHandle, useRef } from 'react';

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

  useImperativeHandle(ref, () => ({
    seekTo(seconds) {
      const el = videoRef.current;
      if (!el) return;
      el.currentTime = seconds;
      // A timestamp click is a real user gesture, so autoplay is allowed here —
      // still swallow the rejection defensively (e.g. the element isn't ready yet).
      void el.play().catch(() => {});
    },
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-ink">
      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        className="aspect-video w-full bg-ink"
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
});
