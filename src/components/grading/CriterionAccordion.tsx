import { useState } from 'react';
import type { CriterionScore } from '../../types';
import { CRITERION_DETAILS } from '../../mockData';
import { Tag } from '../ui/Chip';
import { Meter } from '../ui/Metrics';
import { IconCheck, IconChevronDown, IconClose } from '../ui/icons';

interface Props {
  criterion: CriterionScore;
  index: number;
  threshold: number;
}

export function CriterionAccordion({ criterion, index, threshold }: Props) {
  // Trust the grader's own verdict when it supplied one; only fall back to the
  // score comparison when `passed` is null. Deriving it purely from the score
  // made the rows disagree with the "n of m passed" count in the header.
  const passing = criterion.passed ?? criterion.score >= threshold;
  const detail = CRITERION_DETAILS[criterion.key];
  const [open, setOpen] = useState(false);
  const panelId = `criterion-detail-${criterion.key}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full flex-wrap items-start gap-x-4 gap-y-3 px-5 py-4 text-left transition-colors duration-[120ms] ease-swift hover:bg-zebra"
      >
        <span className="tnum w-7 shrink-0 pt-0.5 font-display text-cell font-bold text-ink-300">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
            passing ? 'bg-pass-wash text-pass' : 'bg-fail-wash text-fail'
          }`}
        >
          {passing ? <IconCheck size={11} /> : <IconClose size={11} />}
        </span>

        <span className="min-w-0 flex-1 pt-0.5 font-bold text-ink sm:min-w-[14rem]">
          {criterion.display_name}
        </span>

        <span className="flex shrink-0 items-center gap-3 pt-0.5">
          <Meter value={criterion.score} threshold={threshold} width={72} showValue={false} />
          <span
            className={`tnum w-11 text-right font-display text-cell font-bold ${
              passing ? 'text-pass' : 'text-fail'
            }`}
          >
            {criterion.score}%
          </span>
        </span>

        <span
          className={`mt-1 shrink-0 text-ink-300 transition-transform duration-200 ease-swift ${
            open ? 'rotate-180' : ''
          }`}
        >
          <IconChevronDown size={16} />
        </span>
      </button>

      {open && (
        <div id={panelId} className="rise space-y-3 border-t border-line bg-zebra px-5 py-4 sm:pl-16">
          {criterion.guidance && (
            <div>
              <p className="eyebrow">Why this score</p>
              <p className="mt-1.5 max-w-prose text-cell leading-relaxed text-ink-600">
                {criterion.guidance}
              </p>
            </div>
          )}
          {detail?.to_reach_100 && (
            <div>
              <p className="eyebrow">To reach 100%</p>
              <p className="mt-1.5 max-w-prose text-cell leading-relaxed text-ink-600">
                {detail.to_reach_100}
              </p>
            </div>
          )}
          {detail?.evidence && detail.evidence.length > 0 && (
            <div>
              <p className="eyebrow">Video evidence</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {detail.evidence.map((stamp) => (
                  <Tag key={stamp}>{stamp}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
