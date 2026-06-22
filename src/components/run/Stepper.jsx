import { STAGES } from '../../store/data.js'
import { IconCheck, IconLock } from '../icons.jsx'

// Row of self-contained pill cards (no connector line, per the Andrey feedback).
// A stage is unlocked once the previous one is done.
export default function Stepper({ pipe, C, onGo }) {
  const unlocked = (i) => i === 0 || pipe.done[i - 1]

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
      {STAGES.map((stg, i) => {
        const done = pipe.done[i]
        const active = pipe.stage === i
        const locked = !unlocked(i)
        return (
          <div key={stg.num} onClick={() => { if (unlocked(i)) onGo(i) }} style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 11,
            background: active ? C.primarySoft : (locked ? '#f8fafc' : '#fff'),
            border: '1.5px solid ' + (active ? C.primary : C.line),
            cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.6 : 1,
          }}>
            <div style={{
              flex: 'none', width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600,
              background: done ? C.ok : (active ? C.primary : '#fff'),
              border: '1.5px solid ' + (done ? C.ok : (active ? C.primary : C.line)),
              color: (done || active) ? '#fff' : (locked ? C.faint : C.muted),
            }}>
              {done ? <IconCheck size={13} /> : locked ? <IconLock size={11} /> : stg.num}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: active ? C.primary : (locked ? C.faint : C.ink), lineHeight: 1.15 }}>{stg.title}</div>
          </div>
        )
      })}
    </div>
  )
}
