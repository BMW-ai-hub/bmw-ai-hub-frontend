import { MOCK_VIDEO_OVERVIEW } from '../../mockData';
import { Panel, PanelHeader } from '../ui/Panel';
import { IconDocument } from '../ui/icons';

export function VideoOverview() {
  return (
    <Panel flush>
      <PanelHeader title="Video overview" icon={<IconDocument size={17} />} />
      <p className="max-w-prose px-5 py-4 text-body leading-relaxed text-ink-600">
        {MOCK_VIDEO_OVERVIEW}
      </p>
    </Panel>
  );
}
