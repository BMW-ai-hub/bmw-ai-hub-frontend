import { useEffect, useState } from 'react';
import type { Inspection, User } from '../types';
import { getInspection } from '../api';
import { AppShell } from '../components/AppShell';
import { GradingBreakdown } from '../components/inspection/GradingBreakdown';
import { Button } from '../components/ui/Button';
import { EmptyState, Panel } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconChevronLeft } from '../components/ui/icons';

interface Props {
  user: User;
  inspectionId: string;
  videoId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onBackToInspection: () => void;
  onSendSuccess: () => void;
}

/** Standalone grading screen — reached from the Attempts tab to view a
 * specific past attempt. The current attempt now shows this same content
 * (via GradingBreakdown) embedded directly in the inspection page instead,
 * so this page no longer owns the score/threshold/criteria logic itself. */
export default function GradingResult({
  user,
  inspectionId,
  videoId,
  onNavigate,
  onLogout,
  onBackToInspection,
  onSendSuccess,
}: Props) {
  const [inspection, setInspection] = useState<Inspection>();
  const [error, setError] = useState('');

  useEffect(() => {
    getInspection(inspectionId)
      .then(setInspection)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load inspection'));
  }, [inspectionId]);

  const crumbs = [
    { label: 'Inspections', onClick: () => onNavigate('dashboard') },
    {
      label: inspection ? `${inspection.vehicle.year} ${inspection.vehicle.model}` : 'Vehicle',
      onClick: onBackToInspection,
    },
    { label: 'Grading result' },
  ];

  return (
    <AppShell
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={crumbs}
    >
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PageHeading
          title={inspection ? `${inspection.vehicle.year} BMW ${inspection.vehicle.model}` : 'Vehicle'}
          description={inspection?.service_type}
          actions={
            <Button
              variant="secondary"
              size="md"
              icon={<IconChevronLeft size={16} />}
              onClick={onBackToInspection}
            >
              Back to inspection
            </Button>
          }
        />

        {inspection ? (
          <GradingBreakdown
            inspectionId={inspectionId}
            videoId={videoId}
            onNavigate={onNavigate}
            onSendSuccess={onSendSuccess}
            onReupload={onBackToInspection}
          />
        ) : (
          <Panel>
            <EmptyState title={error ? 'Inspection unavailable' : 'Loading…'} hint={error || undefined} />
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
