import { useRef, useState } from 'react';
import type { Config } from '../../types';
import { getVideo, uploadVideo } from '../../api';
import { Button } from '../ui/Button';
import { Notice, Panel } from '../ui/Panel';
import { IconCheck, IconUpload } from '../ui/icons';

type Stage = 'idle' | 'uploading' | 'processing' | 'done';

interface Props {
  inspectionId: string;
  serviceType: string;
  config: Config;
  /** Changes the panel's framing when a graded attempt already exists. */
  hasPreviousAttempt: boolean;
  onGraded: (videoId: string) => void;
}

export function UploadPanel({
  inspectionId,
  serviceType,
  config,
  hasPreviousAttempt,
  onGraded,
}: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const select = (candidate: File) => {
    if (!candidate.type.startsWith('video/') && !/\.(mp4|mov|avi)$/i.test(candidate.name)) {
      setError('Unsupported file. Upload an MP4, MOV, or AVI.');
      return;
    }
    if (candidate.size > config.max_upload_bytes) {
      setError(`File exceeds the ${config.max_upload_mb} MB limit.`);
      return;
    }
    setError('');
    setFile(candidate);
  };

  const start = async () => {
    if (!file) return;
    setStage('uploading');
    try {
      const accepted = await uploadVideo(inspectionId, file, serviceType);
      setStage('processing');

      const poll = async () => {
        const video = await getVideo(accepted.id);
        if (video.status === 'graded') {
          setStage('done');
          onGraded(video.id);
          return;
        }
        if (video.status === 'failed') {
          setStage('idle');
          setError(video.grading_error ?? 'Video grading failed.');
          return;
        }
        window.setTimeout(
          () =>
            void poll().catch((cause) => {
              setStage('idle');
              setError(cause instanceof Error ? cause.message : 'Grading failed');
            }),
          2000,
        );
      };

      await poll();
    } catch (cause) {
      setStage('idle');
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    }
  };

  return (
    <Panel className="p-5">
      <p className="eyebrow mb-4">
        {hasPreviousAttempt ? 'Re-record walkaround' : 'Upload walkaround video'}
      </p>

      {stage === 'idle' && (
        <>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const dropped = event.dataTransfer.files[0];
              if (dropped) select(dropped);
            }}
            className={`flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors duration-[120ms] ease-swift ${
              dragOver ? 'border-ink bg-well' : 'border-line-strong bg-zebra hover:border-ink-300'
            }`}
          >
            <span className="text-ink">
              <IconUpload size={28} />
            </span>
            <span className="font-display text-heading">
              {file ? file.name : 'Drop a video, or browse'}
            </span>
            <span className="text-cell font-medium text-ink-400">
              MP4, MOV or AVI · up to {config.max_upload_mb} MB
            </span>
            <input
              ref={input}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
              className="hidden"
              onChange={(event) => {
                const chosen = event.target.files?.[0];
                if (chosen) select(chosen);
              }}
            />
          </button>

          {error && (
            <div className="mt-4">
              <Notice tone="fail">{error}</Notice>
            </div>
          )}

          {file && !error && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="tnum min-w-0 truncate text-cell font-semibold text-ink-500">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setError('');
                  }}
                >
                  Clear
                </Button>
                <Button variant="primary" size="sm" onClick={start}>
                  Upload &amp; grade
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {stage === 'uploading' && (
        <div className="py-12">
          <p className="font-display text-heading">Uploading…</p>
          <p className="mt-1 text-cell font-medium text-ink-400">
            Keep this tab open until the transfer completes.
          </p>
          {/* Indeterminate: the upload transport reports no progress events. */}
          <div className="sweep relative mt-5 h-1 overflow-hidden rounded-full bg-well-deep" />
        </div>
      )}

      {stage === 'processing' && (
        <div className="flex flex-col items-center gap-5 py-14 text-center">
          <span className="spin size-10 rounded-full border-2 border-well-deep border-t-ink" />
          <div>
            <p className="font-display text-heading">Grading in progress</p>
            <p className="mt-1 text-cell font-medium text-ink-400">
              Transcribing the walkaround and scoring it against the BMW rubric.
            </p>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-pass-wash py-14 text-center">
          <span className="text-pass">
            <IconCheck size={26} />
          </span>
          <p className="font-display text-heading text-pass">Graded — opening results</p>
        </div>
      )}
    </Panel>
  );
}
