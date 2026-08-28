import { useEffect, useRef, useState } from 'react';
import type { Config } from '../../types';
import { getVideo, uploadVideo } from '../../api';
import { Button } from '../ui/Button';
import { Notice, Panel } from '../ui/Panel';
import { IconCheck, IconDocument, IconUpload } from '../ui/icons';

type Stage = 'idle' | 'uploading' | 'processing' | 'done';

const mb = (bytes: number) => bytes / 1024 / 1024;

/** Analysis pipeline steps shown while the graded status is still
 * "processing". The real service doesn't expose per-step progress, so this
 * advances on a timer as a plausible read of what's actually happening
 * (upload → transcript → visual pass → rubric scoring) — capped one step
 * short of the end so it never claims completion before the poll confirms
 * `graded`. */
const ANALYSIS_STEPS = [
  'Video uploaded',
  'Audio transcription',
  'Visual inspection analysis',
  'BMW guideline assessment',
  'Final quality score',
] as const;

const STEP_INTERVAL_MS = 3200;

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
  const [uploaded, setUploaded] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const input = useRef<HTMLInputElement>(null);

  // Steps the analysis checklist has moved past while still on 'processing'.
  useEffect(() => {
    if (stage !== 'processing') return;
    setActiveStep(1);
    const timer = window.setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, ANALYSIS_STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [stage]);

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
    setUploaded(0);
    try {
      const accepted = await uploadVideo(inspectionId, file, serviceType, (loaded) => setUploaded(loaded));
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => input.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                input.current?.click();
              }
            }}
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
            className={`flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-[120ms] ease-swift ${
              dragOver ? 'border-ink bg-well' : 'border-line-strong bg-zebra hover:border-ink-300 hover:bg-well/60'
            }`}
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-paper text-ink shadow-[0_1px_2px_rgba(20,20,22,0.06)]">
              <IconUpload size={24} />
            </span>
            <p className="mt-5 max-w-xs font-display text-heading">
              {file ? file.name : 'Record or upload the technician walkaround video'}
            </p>
            <p className="mt-2 text-cell font-medium text-ink-400">
              Quality verification will begin automatically.
            </p>
            {!file && (
              <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-body font-bold text-paper">
                <IconUpload size={15} />
                Upload video
              </span>
            )}
            <p className="mt-5 text-micro font-bold tracking-[0.09em] text-ink-300 uppercase">
              MP4, MOV or AVI · up to {config.max_upload_mb} MB
            </p>
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
          </div>

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

      {stage === 'uploading' && (() => {
        const total = file?.size ?? 0;
        const percent = total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0;
        return (
          <div className="py-8">
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-well text-ink">
                <IconUpload size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-heading">Uploading video</p>
                  <span className="tnum font-display text-heading text-ink">{percent}%</span>
                </div>
              </div>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-well-deep">
              <div
                className="h-full rounded-full bg-ink transition-[width] duration-200 ease-swift"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="tnum mt-3 text-cell font-semibold text-ink-400">
              {mb(uploaded).toFixed(0)} MB of {mb(total).toFixed(0)} MB
            </p>
            <p className="mt-4 text-cell font-medium text-ink-400">
              Keep this tab open until the transfer completes.
            </p>
          </div>
        );
      })()}

      {stage === 'processing' && (
        <div className="py-8">
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-well text-ink">
              <IconDocument size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-heading">Quality assessment in progress</p>
              <p className="mt-0.5 text-cell font-medium text-ink-400">
                Grounding the walkaround against the BMW inspection rubric.
              </p>
            </div>
          </div>
          <ol className="mt-6 space-y-3.5 border-t border-line pt-6">
            {ANALYSIS_STEPS.map((step, index) => {
              const done = index < activeStep;
              const active = index === activeStep;
              return (
                <li key={step} className="flex items-center gap-3">
                  {done ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pass-wash text-pass">
                      <IconCheck size={12} />
                    </span>
                  ) : active ? (
                    <span className="relative flex size-5 shrink-0 items-center justify-center">
                      <span className="absolute size-5 animate-ping rounded-full bg-ink/15" />
                      <span className="relative size-2.5 rounded-full bg-ink" />
                    </span>
                  ) : (
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <span className="size-2.5 rounded-full border-2 border-line-strong" />
                    </span>
                  )}
                  <span
                    className={`text-cell font-semibold ${
                      done ? 'text-ink-400' : active ? 'text-ink' : 'text-ink-300'
                    }`}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
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
