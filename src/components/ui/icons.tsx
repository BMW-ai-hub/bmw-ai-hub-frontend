/**
 * Single stroke-icon set. One geometry, one weight, one viewBox — mixed icon
 * sets are the fastest way to make a product look assembled rather than designed.
 */
interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function glyph(path: React.ReactNode, defaultStroke = 1.75) {
  return function Glyph({ size = 18, className, strokeWidth }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth ?? defaultStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        {path}
      </svg>
    );
  };
}

export const IconInspections = glyph(
  <>
    <path d="M9 4.5H7A2 2 0 0 0 5 6.5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-13a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="2.5" width="6" height="4" rx="1" />
    <path d="M8.5 11.5h7M8.5 15.5h4.5" />
  </>,
);

export const IconAnalytics = glyph(
  <>
    <path d="M3.5 3.5v17h17" />
    <path d="M7 16l3.5-4.5 3 2.5L20 7" />
  </>,
);

/** Sliders rather than a cog — reads unambiguously at rail size. */
export const IconSettings = glyph(
  <>
    <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h10M18 17h2" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="16" cy="17" r="2" />
  </>,
);

export const IconDocument = glyph(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </>,
);

export const IconSupport = glyph(
  <>
    <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
    <path d="M9 10h6M9 13h3" />
  </>,
);

export const IconSearch = glyph(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </>,
);

export const IconFilter = glyph(<path d="M3.5 5h17l-6.5 8v6l-4-2.5V13z" />, 1.5);

export const IconKebab = glyph(
  <>
    <circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
  </>,
);

export const IconChevronRight = glyph(<path d="m9 5 7 7-7 7" />, 2);
export const IconChevronLeft = glyph(<path d="m15 5-7 7 7 7" />, 2);
export const IconChevronDown = glyph(<path d="m5 9 7 7 7-7" />, 2);
export const IconChevronsRight = glyph(<path d="m6 5 7 7-7 7M13 5l7 7-7 7" />, 2);

export const IconUpload = glyph(
  <>
    <path d="M12 15.5V4.5" />
    <path d="m7.5 9 4.5-4.5L16.5 9" />
    <path d="M4 15v3.5A2 2 0 0 0 6 20.5h12a2 2 0 0 0 2-2V15" />
  </>,
);

export const IconVideo = glyph(
  <>
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="m15.5 11 6-3.5v9L15.5 13z" />
  </>,
);

export const IconCheck = glyph(<path d="m4.5 12.5 5 5 10-11" />, 2.25);
export const IconClose = glyph(<path d="M18 6 6 18M6 6l12 12" />, 2.25);
export const IconPlus = glyph(<path d="M12 5v14M5 12h14" />, 2);

export const IconAlert = glyph(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.4v.1" />
  </>,
  1.9,
);

export const IconInfo = glyph(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </>,
  1.9,
);

export const IconSend = glyph(
  <>
    <path d="M21.5 2.5 11 13" />
    <path d="M21.5 2.5 15 21.5 11 13 2.5 9z" />
  </>,
);

export const IconTeam = glyph(
  <>
    <path d="M16.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.2a3.7 3.7 0 0 0-3.7 3.7v1.8" />
    <circle cx="9.5" cy="7.5" r="3.7" />
    <path d="M21.5 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.6M15.5 4a3.7 3.7 0 0 1 0 7.2" />
  </>,
);

export const IconTrend = glyph(<path d="M22 11.5h-3.5L15.5 20 9.5 4l-2.5 7.5H2" />, 1.9);

export const IconLogout = glyph(
  <>
    <path d="M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5" />
    <path d="m16 16.5 4.5-4.5L16 7.5M20.5 12H9.5" />
  </>,
);

export const IconPlay = glyph(<path d="M7.5 5.5v13l11-6.5z" fill="currentColor" stroke="none" />, 0);

export const IconImage = glyph(
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
  </>,
  1.6,
);
