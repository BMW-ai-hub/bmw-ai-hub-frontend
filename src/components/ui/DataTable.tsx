import { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconFilter } from './icons';
import { RowMenu, type RowAction } from './RowMenu';

export interface Column<T> {
  key: string;
  header: string;
  /** Fixed track width in px; omit to let the column flex. */
  width?: number;
  align?: 'left' | 'right';
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Text the column's own search box matches against. Defaults to no filter. */
  filterValue?: (row: T) => string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** Free-text query from the page toolbar, matched across all filterValues. */
  query?: string;
  /** Renders the per-column search row from the reference tables. */
  filterRow?: boolean;
  paginate?: boolean;
  defaultPageSize?: number;
  /** Leading media cell — thumbnail column in the reference. */
  leading?: { header: React.ReactNode; render: (row: T) => React.ReactNode };
  rowActions?: (row: T) => RowAction[];
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  /** Minimum table width; drives horizontal overflow. */
  minWidth?: number;
}

const PAGE_SIZES = [10, 25, 50] as const;

function SortGlyph({ state }: { state: 'asc' | 'desc' | null }) {
  return (
    <svg
      width="9"
      height="12"
      viewBox="0 0 9 12"
      aria-hidden="true"
      className={`shrink-0 transition-opacity ${state ? 'opacity-100' : 'opacity-30'}`}
    >
      <path
        d="M4.5 0.5 7.5 4.2H1.5z"
        fill="currentColor"
        opacity={state === 'desc' ? 0.25 : 1}
      />
      <path
        d="M4.5 11.5 1.5 7.8h6z"
        fill="currentColor"
        opacity={state === 'asc' ? 0.25 : 1}
      />
    </svg>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  query = '',
  filterRow = false,
  paginate = false,
  defaultPageSize = 10,
  leading,
  rowActions,
  onRowClick,
  empty,
  minWidth,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [page, setPage] = useState(0);

  const searchable = useMemo(() => columns.filter((column) => column.filterValue), [columns]);

  const processed = useMemo(() => {
    let list = [...rows];

    const trimmed = query.trim().toLowerCase();
    if (trimmed && searchable.length > 0) {
      list = list.filter((row) =>
        searchable.some((column) => column.filterValue!(row).toLowerCase().includes(trimmed)),
      );
    }

    for (const [key, term] of Object.entries(columnFilters)) {
      const needle = term.trim().toLowerCase();
      if (!needle) continue;
      const column = columns.find((candidate) => candidate.key === key);
      if (!column?.filterValue) continue;
      list = list.filter((row) => column.filterValue!(row).toLowerCase().includes(needle));
    }

    if (sort) {
      const column = columns.find((candidate) => candidate.key === sort.key);
      if (column?.sortValue) {
        const direction = sort.dir === 'asc' ? 1 : -1;
        list.sort((a, b) => {
          const left = column.sortValue!(a);
          const right = column.sortValue!(b);
          if (left < right) return -direction;
          if (left > right) return direction;
          return 0;
        });
      }
    }

    return list;
  }, [rows, query, searchable, columnFilters, columns, sort]);

  const total = processed.length;
  const pageCount = paginate ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible = paginate
    ? processed.slice(safePage * pageSize, safePage * pageSize + pageSize)
    : processed;

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: 'desc' };
      return current.dir === 'desc' ? { key, dir: 'asc' } : null;
    });
  };

  const spanCount = columns.length + (leading ? 1 : 0) + (rowActions ? 1 : 0);
  const cellPad = 'px-5 py-4';

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-paper">
      <div className="scroll-x">
        {/* table-fixed makes the colgroup widths authoritative; with auto
            layout, nowrap cell content (emails, VINs) forces the table wider
            than its container and the trailing columns get clipped. */}
        <table className="w-full table-fixed border-collapse" style={{ minWidth }}>
          <colgroup>
            {leading && <col style={{ width: 68 }} />}
            {columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
            {rowActions && <col style={{ width: 56 }} />}
          </colgroup>

          <thead>
            <tr className="border-b border-line">
              {leading && (
                <th scope="col" className={`${cellPad} text-left text-ink-300`}>
                  {leading.header}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort?.key === column.key
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={`${cellPad} text-cell font-bold whitespace-nowrap text-ink ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.sortValue ? (
                    <button
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-1.5 transition-colors hover:text-ink-600 ${
                        column.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {column.header}
                      <SortGlyph state={sort?.key === column.key ? sort.dir : null} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {rowActions && <th scope="col" className={cellPad} />}
            </tr>

            {filterRow && (
              <tr className="border-b border-line">
                {leading && <td className="px-4 py-2.5" />}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2.5 align-middle">
                    {column.filterValue ? (
                      <div className="flex items-center gap-1.5">
                        <div className="well flex h-9 min-w-0 flex-1 items-center px-3">
                          <input
                            type="search"
                            aria-label={`Filter by ${column.header}`}
                            placeholder="Search…"
                            value={columnFilters[column.key] ?? ''}
                            onChange={(event) => {
                              setPage(0);
                              setColumnFilters((current) => ({
                                ...current,
                                [column.key]: event.target.value,
                              }));
                            }}
                            className="min-w-0 flex-1 bg-transparent text-cell font-medium outline-none [&::-webkit-search-cancel-button]:hidden"
                          />
                        </div>
                        <span
                          aria-hidden="true"
                          className={`shrink-0 transition-colors ${
                            columnFilters[column.key]?.trim() ? 'text-ink' : 'text-ink-300'
                          }`}
                        >
                          <IconFilter size={16} />
                        </span>
                      </div>
                    ) : null}
                  </td>
                ))}
                {rowActions && <td className="px-4 py-2.5" />}
              </tr>
            )}
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={spanCount}>{empty}</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === 'Enter') onRowClick(row);
                        }
                      : undefined
                  }
                  className={`border-b border-line last:border-b-0 transition-colors duration-[120ms] ${
                    onRowClick ? 'cursor-pointer hover:bg-zebra' : ''
                  }`}
                >
                  {leading && <td className={cellPad}>{leading.render(row)}</td>}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${cellPad} align-middle text-body ${
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className={cellPad}>
                      <RowMenu label="Row actions" actions={rowActions(row)} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginate && total > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t border-line px-4 py-3">
          <label className="flex items-center gap-2 text-cell font-bold text-ink-600">
            Rows per page
            <span className="well relative inline-flex h-8 items-center">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(0);
                }}
                className="tnum appearance-none bg-transparent py-0 pr-7 pl-2.5 font-bold text-ink outline-none"
              >
                {PAGE_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={13}
                className="pointer-events-none absolute right-2 text-ink-500"
              />
            </span>
          </label>

          <span className="tnum text-cell font-bold text-ink-600">
            {safePage * pageSize + 1}–{Math.min(total, (safePage + 1) * pageSize)} of {total}
          </span>

          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="inline-flex size-8 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-well hover:text-ink disabled:pointer-events-none disabled:text-ink-300"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              aria-label="Next page"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              className="inline-flex size-8 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-well hover:text-ink disabled:pointer-events-none disabled:text-ink-300"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
