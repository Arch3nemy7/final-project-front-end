import { useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext.jsx'
import { palette } from '../store/data.js'
import {
  IconDashboard, IconRuns, IconDatasets, IconModels, IconSettings, IconPlus,
} from './icons.jsx'

export default function Sidebar() {
  const { db, navigate, createRun } = useStore()
  const { pathname } = useLocation()
  const C = palette(db.settings.accent)

  // 'runs' is active for both the list and an individual run workspace.
  const view = pathname === '/' ? 'dashboard'
    : pathname.startsWith('/run') ? 'runs'
      : pathname.replace(/^\//, '').split('/')[0]

  const navStyle = (v) => {
    const active = view === v
    return { bg: active ? C.primarySoft : 'transparent', fg: active ? C.primary : C.muted }
  }

  const item = (v, label, Icon, to, extra) => {
    const s = navStyle(v)
    return (
      <div onClick={() => navigate(to)} style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9,
        cursor: 'pointer', marginBottom: 2, background: s.bg, color: s.fg, fontWeight: 600, fontSize: 13.5,
      }}>
        <Icon size={17} /> {label}
        {extra != null && (
          <span style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: s.fg, opacity: 0.7 }}>
            {extra}
          </span>
        )}
      </div>
    )
  }

  const set = navStyle('settings')

  return (
    <aside style={{ flex: 'none', width: 236, background: '#fff', borderRight: '1px solid #e6e9f0', display: 'flex', flexDirection: 'column' }}>
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '18px 20px', cursor: 'pointer', borderBottom: '1px solid #eef1f6' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#16202e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: '#fff', fontSize: 15, letterSpacing: -1 }}>G/</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>GramSynth</div>
          <div style={{ fontSize: 10.5, color: '#8a94a4', fontWeight: 500 }}>Augmentation studio</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '14px 12px' }}>
        <div style={{ padding: '6px 10px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', color: '#8a94a4', textTransform: 'uppercase' }}>Workspace</div>
        {item('dashboard', 'Dashboard', IconDashboard, '/')}
        {item('runs', 'Runs', IconRuns, '/runs', db.order.length)}
        {item('datasets', 'Datasets', IconDatasets, '/datasets')}
        {item('models', 'Models', IconModels, '/models')}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #eef1f6' }}>
        <div onClick={() => navigate('/settings')} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
          marginBottom: 10, background: set.bg, color: set.fg, fontWeight: 600, fontSize: 13.5,
        }}>
          <IconSettings size={17} /> Settings
        </div>
        <div onClick={createRun} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, borderRadius: 9,
          cursor: 'pointer', background: '#2563c9', color: '#fff', fontWeight: 600, fontSize: 13.5, boxShadow: '0 1px 2px rgba(22,32,46,.1)',
        }}>
          <IconPlus size={16} /> New run
        </div>
      </div>
    </aside>
  )
}
