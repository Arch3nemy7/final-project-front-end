// Inline SVG icons ported from the GramSynth design (exact paths / stroke widths).
// All use stroke="currentColor" so colour comes from the parent's CSS color.
function Svg({ size = 18, sw = 2, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  )
}

export const IconDashboard = (p) => (
  <Svg sw={2} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </Svg>
)

export const IconRuns = (p) => (
  <Svg sw={2} {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Svg>
)

export const IconDatasets = (p) => (
  <Svg sw={2} {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Svg>
)

export const IconModels = (p) => (
  <Svg sw={2} {...p}><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></Svg>
)

export const IconSettings = (p) => (
  <Svg sw={2} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg sw={2.4} {...p}><path d="M12 5v14M5 12h14" /></Svg>
)

export const IconArrowLeft = (p) => (
  <Svg sw={2.2} {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
)

export const IconTrash = (p) => (
  <Svg sw={2} {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>
)

export const IconDownload = (p) => (
  <Svg sw={2} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></Svg>
)

export const IconCheck = (p) => (
  <Svg sw={3} {...p}><polyline points="20 6 9 17 4 12" /></Svg>
)

export const IconLock = (p) => (
  <Svg sw={2.2} {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
)

export const IconSpinner = (p) => (
  <Svg sw={3} {...p}><path d="M21 12a9 9 0 1 1-6.2-8.5" /></Svg>
)

export const IconChevronDown = (p) => (
  <Svg sw={2.4} {...p}><polyline points="6 9 12 15 18 9" /></Svg>
)

export const IconUpload = (p) => (
  <Svg sw={1.6} {...p}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></Svg>
)

export const IconFileArchive = (p) => (
  <Svg sw={1.8} {...p}><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" /></Svg>
)

export const IconCheckCircle = (p) => (
  <Svg sw={2.2} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Svg>
)

export const IconAlertTriangle = (p) => (
  <Svg sw={2.2} {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
)
