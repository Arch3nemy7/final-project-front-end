import { useStore } from '../../store/StoreContext.jsx'
import { resultsOf } from '../../lib/results.js'
import F1Chart from '../charts/F1Chart.jsx'
import LineChart from '../charts/LineChart.jsx'
import { IconAlertTriangle } from '../icons.jsx'
import { Eyebrow, H1, Lead, JobBar, RerunButton } from './parts.jsx'

const COLS = '1.4fr 1fr 1fr 1fr 1fr'

// Scenario colours/labels shared with F1Chart's legend (kept consistent).
const SCEN_COLORS = ['#1f3a8a', '#2f6bd8', '#6aa0e0', '#9ab8e0']
const SCEN_LABELS = ['I · 100/0', 'II · 75/25', 'III · 50/50', 'IV · 25/75']

// Per-epoch training-loss curves: one chart per architecture, four scenario lines.
function LossSection({ losses, archs }) {
  let maxY = 0, maxE = 0
  losses.forEach((arch) => arch.forEach((cv) => {
    maxE = Math.max(maxE, cv.length)
    cv.forEach((v) => { if (v != null) maxY = Math.max(maxY, v) })
  }))
  const yMax = Math.max(0.1, Math.ceil(maxY * 11) / 10)   // +10% headroom, 0.1 grid
  const xMax = Math.max(1, maxE)
  const xTicks = Array.from({ length: maxE }, (_, i) => i + 1)
  return (
    <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Training loss per epoch</div>
        <div style={{ display: 'flex', gap: 13, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", flexWrap: 'wrap' }}>
          {SCEN_LABELS.map((L, i) => (<span key={i} style={{ color: SCEN_COLORS[i] }}>● {L}</span>))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#8a94a4', marginBottom: 14 }}>
        Mean cross-entropy loss over the training set per epoch, for each architecture under the four real/synthetic compositions.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {losses.map((arch, gi) => (
          <div key={gi}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#16202e', marginBottom: 4 }}>{archs[gi] || ('Model ' + (gi + 1))}</div>
            <LineChart w={360} h={170} xMax={xMax} xTicks={xTicks} yMax={yMax} yMin={0} yLabel="loss  (x: epoch)"
              series={arch.map((cv, si) => ({ points: cv.map((y, i) => (y == null ? null : { x: i + 1, y })).filter(Boolean), color: SCEN_COLORS[si] }))}
              yFmt={(v) => v.toFixed(2)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function buildRows(C, archs, data) {
  return data.map((rowVals, gi) => {
    const arch = archs[gi] || ('Model ' + (gi + 1))
    const baseV = rowVals[0]
    const cells = rowVals.map((v, bi) => {
      const collapse = v < 0.5
      let delta = '', col = C.ink, bg = 'transparent'
      if (bi === 0) { delta = 'baseline'; bg = C.line2 }
      else if (collapse) { delta = 'collapse'; col = C.danger; bg = C.dangerSoft }
      else {
        const d = v - baseV
        delta = (d >= 0 ? '+' : '') + (d * 100).toFixed(2) + '%'
        col = d >= 0 ? C.ok : C.muted
        bg = d >= 0 ? C.okSoft : 'transparent'
      }
      return { v: v.toFixed(4), delta, col, bg }
    })
    return { arch, cells }
  })
}

const Chip = ({ roman, label }) => (
  <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#5b6677' }}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: '#16202e' }}>{roman}</span> {label}
  </div>
)

const fieldStyle = { width: '100%', padding: '9px 11px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 13, fontFamily: "'IBM Plex Mono',monospace" }

export default function FeasibilityStage({ run, C }) {
  const { live, cancelFeas, startFeas, patchPipe } = useStore()
  const p = run.pipe
  const feasRunning = live.feas === 'running'
  const feasDone = p.feasDone && !feasRunning
  const R = resultsOf(run)
  const rows = buildRows(C, R.feasArchs, R.feasRows)
  const fe = p.feasData || { real: '', test: '' }
  const setFe = (k, v) => patchPipe(run.id, { feasData: { ...fe, [k]: v } })

  return (
    <div>
      <Eyebrow>STEP 05 · TEST 2 · FEASIBILITY</Eyebrow>
      <H1>Feasibility test — 5 CNNs × 4 scenarios</H1>
      <Lead maxWidth={740}>
        Train five classifiers on four fixed-total compositions and compare macro-F1 on an isolated real test split. Synthetic data is feasible if F1 stays at or above baseline.
      </Lead>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <Chip roman="I" label="100/0 · baseline" />
        <Chip roman="II" label="75/25" />
        <Chip roman="III" label="50/50" />
        <Chip roman="IV" label="25/75" />
        <div style={{ background: '#f8fafc', border: '1px solid #eef1f6', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#8a94a4' }}>Adam · lr 1e-3 · batch 32 · ImageNet pretrained</div>
      </div>

      {/* dataset config (shown when idle) */}
      {!feasRunning && !feasDone && (
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Real datasets for the classifier study</div>
          <div style={{ fontSize: 12, color: '#8a94a4', marginBottom: 16 }}>
            Each is a folder with <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>gram_negative/</span> and <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>gram_positive/</span> subfolders of crops. The synthetic crops are taken from <strong>this run's Generate output</strong>. Leave a field blank to use the server's default dataset.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Real training crops</span>
              <input value={fe.real} onChange={(e) => setFe('real', e.target.value)} placeholder="D:\…\real" style={fieldStyle} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Isolated real test split</span>
              <input value={fe.test} onChange={(e) => setFe('test', e.target.value)} placeholder="D:\…\test" style={fieldStyle} />
            </label>
          </div>
          <div style={{ fontSize: 12.5, color: '#8a94a4', marginTop: 16 }}>
            Click <strong>Run feasibility test</strong> below to train all 5 architectures across the 4 scenarios. The test split must be <strong>held out</strong> from training for the macro-F1 to be meaningful.
          </div>
          {live.feasError && (
            <div style={{ marginTop: 14, background: '#fbeaea', border: '1px solid #f0d2d2', borderRadius: 10, padding: '12px 15px', fontSize: 13, color: '#cc4040' }}>
              Feasibility test stopped: {live.feasError}
            </div>
          )}
        </div>
      )}

      {feasRunning && (
        <JobBar title={live.feasStep} pct={live.feasPct} onCancel={cancelFeas} />
      )}

      {feasDone && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, background: '#f8fafc', borderBottom: '1px solid #e6e9f0', fontSize: 11, fontWeight: 600, color: '#8a94a4', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <div style={{ padding: '11px 16px' }}>Architecture</div>
              <div style={{ padding: '11px 12px', textAlign: 'center' }}>I · 100/0</div>
              <div style={{ padding: '11px 12px', textAlign: 'center' }}>II · 75/25</div>
              <div style={{ padding: '11px 12px', textAlign: 'center' }}>III · 50/50</div>
              <div style={{ padding: '11px 12px', textAlign: 'center' }}>IV · 25/75</div>
            </div>
            {rows.map((row) => (
              <div key={row.arch} style={{ display: 'grid', gridTemplateColumns: COLS, borderBottom: '1px solid #f2f4f8', alignItems: 'center' }}>
                <div style={{ padding: '13px 16px', fontWeight: 600, fontSize: 13.5 }}>{row.arch}</div>
                {row.cells.map((c, i) => (
                  <div key={i} style={{ padding: '10px 12px', textAlign: 'center', background: c.bg }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 600 }}>{c.v}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600, color: c.col, marginTop: 1 }}>{c.delta}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Macro-F1 by architecture &amp; scenario</div>
            <F1Chart rows={R.feasRows} archs={R.feasArchs} />
          </div>

          {R.feasLosses.length > 0 && <LossSection losses={R.feasLosses} archs={R.feasArchs} />}

          <div style={{ background: '#f8fafc', border: '1px solid #e6e9f0', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <span style={{ color: '#b9831a', flex: 'none', marginTop: 1 }}><IconAlertTriangle size={20} /></span>
            <div style={{ fontSize: 13.5, color: '#5b6677', lineHeight: 1.55 }}>
              Each cell shows macro-F1 on the held-out real test split; the delta is relative to the 100%-real baseline (scenario I). A <strong>‡</strong> marks a collapsed run (F1 &lt; 0.5). Synthetic augmentation is feasible where the augmented scenarios stay at or above baseline.
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <RerunButton label="↻ Re-run feasibility test" onClick={() => startFeas(run.id)} />
          </div>
        </div>
      )}
    </div>
  )
}
