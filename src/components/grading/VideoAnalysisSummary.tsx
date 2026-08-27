import { MOCK_VIDEO_ANALYSIS } from '../../mockData';
import { Button } from '../ui/Button';
import { DefinitionList, DefinitionRow } from '../ui/Panel';

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

interface Props {
  overallScore: number;
  passing: boolean;
  onViewBreakdown: () => void;
}

export function VideoAnalysisSummary({ overallScore, passing, onViewBreakdown }: Props) {
  const { duration_seconds, analysis_status, strengths, areas_to_improve } = MOCK_VIDEO_ANALYSIS;

  return (
    <div className="flex h-full flex-col">
      <DefinitionList>
        <DefinitionRow label="Duration" value={formatDuration(duration_seconds)} />
        <DefinitionRow label="Analysis" value={analysis_status} />
        <DefinitionRow
          label="Overall score"
          value={<span className={passing ? 'text-pass' : 'text-fail'}>{overallScore}%</span>}
          emphasis
        />
        <DefinitionRow label="Strengths" value={strengths} />
        <DefinitionRow label="Areas to improve" value={areas_to_improve} />
      </DefinitionList>
      <Button
        variant="quiet"
        size="sm"
        className="mt-4 w-full justify-center"
        onClick={onViewBreakdown}
      >
        View video breakdown
      </Button>
    </div>
  );
}
