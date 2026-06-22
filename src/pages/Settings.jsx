import { useStore } from '../store/StoreContext.jsx'
import { palette, ACCENT_OPTIONS } from '../store/data.js'

export default function Settings() {
  const { db, setSetting, resetData } = useStore()
  const C = palette(db.settings.accent)
  const auto = db.settings.autoAdvance

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '20px 26px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Auto-advance stages</div>
          <div style={{ fontSize: 12.5, color: '#8a94a4', marginTop: 2 }}>Move to the next step automatically when a job finishes.</div>
        </div>
        <div onClick={() => setSetting('autoAdvance', !auto)} style={{ flex: 'none', width: 44, height: 24, borderRadius: 13, background: auto ? C.primary : '#cdd3de', position: 'relative', cursor: 'pointer', transition: 'background .15s' }}>
          <div style={{ position: 'absolute', top: 2, left: auto ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '24px 26px', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Accent color</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {ACCENT_OPTIONS.map((col) => (
            <div key={col} onClick={() => setSetting('accent', col)} style={{ width: 34, height: 34, borderRadius: 9, background: col, cursor: 'pointer', border: '3px solid ' + (db.settings.accent === col ? col : '#fff'), boxShadow: '0 0 0 1px #e6e9f0' }} />
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #f0d2d2', borderRadius: 14, padding: '20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#16202e' }}>Reset workspace</div>
          <div style={{ fontSize: 12.5, color: '#8a94a4', marginTop: 2 }}>Delete all runs and restore the sample data.</div>
        </div>
        <div onClick={resetData} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid #f0d2d2', color: '#cc4040', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reset data</div>
      </div>
    </div>
  )
}
