// Small shared building blocks for the run-workspace stage panels.

export const Eyebrow = ({ children }) => (
  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600, color: '#2563c9', letterSpacing: '.08em' }}>{children}</div>
)

export const H1 = ({ children }) => (
  <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, margin: '8px 0 10px', letterSpacing: '-.5px' }}>{children}</h1>
)

export const Lead = ({ children, maxWidth = 680 }) => (
  <p style={{ fontSize: 14.5, color: '#5b6677', lineHeight: 1.6, maxWidth, margin: '0 0 22px' }}>{children}</p>
)

// 34×18 pill switch used by the advanced training toggles.
export const MiniToggle = ({ on, C }) => (
  <div style={{ width: 34, height: 18, borderRadius: 10, background: on ? C.primary : '#cdd3de', position: 'relative' }}>
    <div style={{ position: 'absolute', top: 2, left: on ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
  </div>
)

// A determinate progress bar with title, cancel link, and percentage (used by
// Format/Generate/Fidelity/Feasibility while a job runs).
export const JobBar = ({ title, pct, onCancel }) => (
  <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '20px 22px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onCancel} style={{ fontSize: 12, fontWeight: 600, color: '#cc4040', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Cancel</button>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: '#2563c9' }}>{Math.round(pct * 100)}%</div>
      </div>
    </div>
    <div style={{ height: 8, borderRadius: 5, background: '#eef1f6', overflow: 'hidden' }}>
      <div style={{ height: '100%', background: '#2563c9', borderRadius: 5, width: (pct * 100) + '%', transition: 'width .2s' }} />
    </div>
  </div>
)

// Outlined "↻ …" re-run button shown on a completed job.
export const RerunButton = ({ label, onClick }) => (
  <button onClick={onClick} style={{ fontSize: 13, fontWeight: 600, color: '#2563c9', background: '#fff', border: '1px solid #cfe0f7', borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}>
    {label}
  </button>
)
