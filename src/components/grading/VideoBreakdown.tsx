import { forwardRef } from 'react';
import { MOCK_VIDEO_TIMELINE } from '../../mockData';
import { Tag } from '../ui/Chip';
import { Panel, PanelHeader } from '../ui/Panel';
import { IconAlert, IconCheck, IconVideo } from '../ui/icons';

const stamp = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

/** Ref lets the "View video breakdown" action scroll straight to the timeline. */
export const VideoBreakdown = forwardRef<HTMLDivElement>(function VideoBreakdown(_props, ref) {
  return (
    <div ref={ref}>
      <Panel flush>
        <PanelHeader
          title="Video breakdown"
          icon={<IconVideo size={17} />}
          meta={`${MOCK_VIDEO_TIMELINE.length} chapters`}
        />
        <ol className="divide-y divide-line">
          {MOCK_VIDEO_TIMELINE.map((chapter) => (
            <li key={chapter.title} className="flex gap-5 px-5 py-4">
              <div className="w-[6.5rem] shrink-0">
                <p className="tnum pt-0.5 font-display text-cell font-bold text-ink-400">
                  {stamp(chapter.start_seconds)}–{stamp(chapter.end_seconds)}
                </p>
              </div>
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                  chapter.meets_expectation ? 'bg-pass-wash text-pass' : 'bg-warn-wash text-warn'
                }`}
              >
                {chapter.meets_expectation ? <IconCheck size={11} /> : <IconAlert size={11} />}
              </span>
              <div className="min-w-0 flex-1 border-l border-line pl-5">
                <p className="font-bold text-ink">{chapter.title}</p>
                <p className="mt-1 text-cell leading-relaxed text-ink-500">{chapter.description}</p>
                {chapter.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chapter.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
});
