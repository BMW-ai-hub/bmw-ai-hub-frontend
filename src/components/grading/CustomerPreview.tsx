import { MOCK_CUSTOMER_PREVIEW, PHOTOS } from '../../mockData';
import { Panel, PanelHeader } from '../ui/Panel';
import { IconPlay, IconSend } from '../ui/icons';

/** Original mobile-preview treatment — not a copy of any vendor's phone mockup. */
export function CustomerPreview() {
  return (
    <Panel flush>
      <PanelHeader title="What the customer will see" icon={<IconSend size={16} />} />
      <div className="grid grid-cols-1 gap-8 p-6 sm:grid-cols-[172px_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto w-[168px] rounded-[1.5rem] border-[5px] border-ink bg-paper p-2.5 shadow-[0_1px_2px_rgb(10_10_10/0.1)]">
          <div className="flex items-center justify-between px-0.5 pb-2.5">
            <span className="font-display text-[0.5rem] leading-none font-extrabold tracking-[0.18em] text-ink">
              BMW
            </span>
            <span className="size-1.5 rounded-full bg-pass" />
          </div>

          <div className="relative mb-1.5 aspect-video overflow-hidden rounded-md bg-ink">
            <img
              src={PHOTOS.mobileRecording}
              alt=""
              className="size-full object-cover opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-6 items-center justify-center rounded-full bg-paper/95 text-ink">
                <IconPlay size={10} />
              </span>
            </span>
          </div>

          <div className="space-y-1.5">
            {MOCK_CUSTOMER_PREVIEW.map((item) => (
              <div key={item.label} className="rounded-md bg-well px-2 py-2">
                <p className="text-[0.5rem] leading-tight font-bold text-ink">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ul className="space-y-4">
          {MOCK_CUSTOMER_PREVIEW.map((item) => (
            <li key={item.label} className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-300" />
              <div className="min-w-0">
                <p className="text-cell font-bold text-ink">{item.label}</p>
                <p className="mt-0.5 text-cell leading-relaxed text-ink-500">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
