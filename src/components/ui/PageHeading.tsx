import { CountBadge } from './Chip';

interface PageHeadingProps {
  title: string;
  /** Rendered as an ink pill beside the title, matching the house style. */
  count?: number;
  description?: string;
  actions?: React.ReactNode;
  /** `display` for page owners, `title` for sections stacked on one page. */
  level?: 'display' | 'title';
}

export function PageHeading({
  title,
  count,
  description,
  actions,
  level = 'display',
}: PageHeadingProps) {
  const Tag = level === 'display' ? 'h1' : 'h2';

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <Tag
          className={`flex items-center gap-3 ${
            level === 'display' ? 'text-display' : 'text-title'
          }`}
        >
          <span className="min-w-0 break-words">{title}</span>
          {count != null && <CountBadge value={count} />}
        </Tag>
        {description && (
          <p className="mt-2 text-lead font-semibold text-ink-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 pb-1">{actions}</div>
      )}
    </div>
  );
}

/** Thin vertical rule used to group toolbar clusters, as in the reference. */
export function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-line" />;
}
