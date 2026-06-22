import { useStore } from '../store/StoreContext.jsx'
import { IconPlus } from './icons.jsx'

// Topbar + centered scroll container shared by the non-run views (Dashboard,
// Runs, Datasets, Models, Settings).
export default function PageLayout({ title, sub, children }) {
  const { createRun } = useStore()
  return (
    <>
      <header style={{ flex: 'none', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fff', borderBottom: '1px solid #e6e9f0' }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: -0.3 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#8a94a4', marginTop: 1 }}>{sub}</div>
        </div>
        <div onClick={createRun} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, cursor: 'pointer', background: '#2563c9', color: '#fff', fontWeight: 600, fontSize: 13 }}>
          <IconPlus size={15} /> New run
        </div>
      </header>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '30px 36px 36px' }}>
          {children}
        </div>
      </div>
    </>
  )
}
