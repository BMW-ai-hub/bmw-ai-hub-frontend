const STEPS = [
  { title: 'Show it', detail: 'Keep the relevant component visible.' },
  { title: 'Measure it', detail: 'Show measurements or evidence clearly.' },
  { title: 'Explain it', detail: "Briefly explain the finding and the customer's impact." },
];

/** Reminder row, not a checklist the app tracks — nothing here is enforced server-side. */
export function BeforeYouRecord() {
  return (
    <div className="rounded-lg border border-line bg-zebra">
      <p className="eyebrow px-5 pt-4">Before you record</p>
      <ol className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 pt-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="tnum shrink-0 font-display text-cell font-bold text-ink-300">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-cell font-bold text-ink">{step.title}</p>
              <p className="mt-0.5 text-cell leading-relaxed text-ink-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
