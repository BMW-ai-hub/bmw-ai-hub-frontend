import { useState } from 'react';
import type { User } from '../types';
import { BmwLogo } from './BmwLogo';
import { Avatar } from './ui/Chip';
import {
  IconAnalytics,
  IconChevronRight,
  IconChevronsRight,
  IconDocument,
  IconInspections,
  IconLogout,
  IconSettings,
  IconSupport,
} from './ui/icons';

export interface Crumb {
  label: string;
  onClick?: () => void;
}

interface AppShellProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  breadcrumb?: Crumb[];
  children: React.ReactNode;
}

const ROLE_LABELS: Record<User['role'], string> = {
  technician: 'Technician',
  manager: 'Manager',
  admin: 'Administrator',
};

const NAV = [
  { key: 'dashboard', label: 'Inspections', Icon: IconInspections, roles: ['technician', 'manager', 'admin'] },
  { key: 'analytics', label: 'Analytics', Icon: IconAnalytics, roles: ['technician', 'manager', 'admin'] },
  { key: 'settings', label: 'Settings', Icon: IconSettings, roles: ['admin'] },
] as const satisfies readonly {
  key: string;
  label: string;
  Icon: (props: { size?: number }) => React.ReactElement;
  roles: readonly User['role'][];
}[];

const SUPPORT = [
  { key: 'guide', label: 'Rubric guide', Icon: IconDocument },
  { key: 'contact', label: 'Contact support', Icon: IconSupport },
] as const;

function BrandMark({ open, dealership }: { open: boolean; dealership: string }) {
  return (
    <div className={`flex ${open ? 'items-center gap-3' : 'justify-center'}`}>
      <BmwLogo className="h-10 w-10 shrink-0" />
      {open && (
        <span className="text-micro font-semibold tracking-[0.06em] text-ink-400">
          {dealership}
        </span>
      )}
    </div>
  );
}

export function AppShell({
  user,
  currentPage,
  onNavigate,
  onLogout,
  breadcrumb,
  children,
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => (item.roles as readonly string[]).includes(user.role));

  return (
    <div className="flex h-full bg-canvas">
      {/* ── Rail ───────────────────────────────────────────────────── */}
      <aside
        style={{ width: open ? 'var(--rail-width-open)' : 'var(--rail-width)' }}
        className="flex shrink-0 flex-col border-r border-line bg-paper transition-[width] duration-200 ease-swift"
      >
        <div
          style={{ height: 'var(--topbar-height)' }}
          className={`flex shrink-0 items-center border-b border-line ${open ? 'px-5' : 'justify-center px-2'}`}
        >
          <BrandMark open={open} dealership={user.dealership} />
        </div>

        <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
          {items.map(({ key, label, Icon }) => {
            const active = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                title={open ? undefined : label}
                className={`flex h-11 items-center gap-3 rounded-md text-body font-semibold transition-colors duration-[120ms] ease-swift ${
                  open ? 'px-3' : 'justify-center'
                } ${active ? 'bg-well text-ink' : 'text-ink-500 hover:bg-zebra hover:text-ink'}`}
              >
                <span className="shrink-0">
                  <Icon size={19} />
                </span>
                {open && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <p className={`eyebrow mb-2 ${open ? 'px-3' : 'text-center'}`}>
            {open ? 'Support' : 'Help'}
          </p>
          {SUPPORT.map(({ key, label, Icon }) => (
            <button
              key={key}
              title={open ? undefined : label}
              className={`flex h-10 w-full items-center gap-3 rounded-md text-cell font-semibold text-ink-500 transition-colors hover:bg-zebra hover:text-ink ${
                open ? 'px-3' : 'justify-center'
              }`}
            >
              <span className="shrink-0">
                <Icon size={18} />
              </span>
              {open && <span className="truncate">{label}</span>}
            </button>
          ))}
        </div>

        <div className="border-t border-line p-3">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            title={open ? 'Collapse navigation' : 'Expand navigation'}
            className={`flex h-10 w-full items-center gap-3 rounded-md text-cell font-semibold text-ink-400 transition-colors hover:bg-zebra hover:text-ink ${
              open ? 'px-3' : 'justify-center'
            }`}
          >
            <span className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <IconChevronsRight size={17} />
            </span>
            {open && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main column ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          style={{ height: 'var(--topbar-height)' }}
          className="flex shrink-0 items-center gap-4 border-b border-line bg-paper px-[var(--gutter)]"
        >
          <p className="min-w-0 truncate text-lead">
            <span className="font-medium text-ink-400">Dealer:&nbsp;</span>
            <span className="font-bold text-ink">{user.dealership}</span>
          </p>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden text-cell font-bold text-ink-500 sm:inline">
              {ROLE_LABELS[user.role]}
            </span>
            <Avatar name={user.name} size={36} />
            <button
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex size-9 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-well hover:text-ink"
            >
              <IconLogout size={18} />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="px-[var(--gutter)] py-8">
            {breadcrumb && breadcrumb.length > 1 && (
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5">
                {breadcrumb.map((crumb, index) => {
                  const last = index === breadcrumb.length - 1;
                  return (
                    <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                      {index > 0 && (
                        <span aria-hidden="true" className="text-ink-300">
                          <IconChevronRight size={13} />
                        </span>
                      )}
                      {crumb.onClick && !last ? (
                        <button
                          onClick={crumb.onClick}
                          className="text-micro font-bold tracking-[0.09em] text-ink-400 uppercase transition-colors hover:text-ink"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span
                          aria-current={last ? 'page' : undefined}
                          className="text-micro font-bold tracking-[0.09em] text-ink uppercase"
                        >
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </nav>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
