import { resultsOf, FID_BENCH } from '../../lib/results.js'
import { toTick, toTickCurve, fidYMax } from '../../lib/format.js'
import LineChart from '../charts/LineChart.jsx'
import F1Chart from '../charts/F1Chart.jsx'
import Gallery from '../Gallery.jsx'
import { IconDownload } from '../icons.jsx'
import { Eyebrow, H1, Lead } from './parts.jsx'

const StatCard = ({ label, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 13, padding: '16px 18px' }}>
    <div style={{ fontSize: 11, color: '#8a94a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    {children}
  </div>
)

const dash = (v) => (v == null ? '—' : v)

// Build a CSV from the real results and trigger a download.
function exportCsv(run, R) {
  const rows = [['metric', 'value']]
  rows.push(['best_fid_gram_negative', dash(R.gnBest)], ['best_fid_gram_negative_tick', dash(toTick(R.gnTick))])
  rows.push(['best_fid_gram_positive', dash(R.gpBest)], ['best_fid_gram_positive_tick', dash(toTick(R.gpTick))])
  rows.push(['top_classifier', dash(R.top)], ['top_classifier_f1', dash(R.topF1)])
  if (R.feasRows.length) {
    rows.push([])
    rows.push(['architecture', 'I_100_0', 'II_75_25', 'III_50_50', 'IV_25_75'])
    R.feasRows.forEach((r, i) => rows.push([R.feasArchs[i] || ('Model ' + (i + 1)), ...r]))
  }
  const csv = rows.map((r) => r.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url; a.download = (run.name || 'run').replace(/\s+/g, '_') + '_metrics.csv'
  a.click(); URL.revokeObjectURL(url)
}

export default function ResultsStage({ run, C }) {
  const R = resultsOf(run)
  const rGallery = (R.gallery || []).slice(0, 8).map((g, i) => ({ src: g.src, key: 'r' + i, ring: g.cls === 'pos' ? C.pos : C.neg }))

  // Data-derived verdict (no fabricated text).
  const faithful = R.fidGN != null && R.fidGP != null && R.fidGN < FID_BENCH.gn && R.fidGP < FID_BENCH.gp
  const feasible = R.feasRows.some((r) => r.slice(1).some((v) => v >= r[0]))
  const verdict = R.fidGN == null && !R.feasRows.length ? 'Run in progress'
    : faithful ? (feasible ? 'Faithful and feasible' : 'Faithful, not yet feasible')
      : (feasible ? 'Feasible' : 'See metrics')

  return (
    <div>
      <Eyebrow>STEP 05 · RESULTS</Eyebrow>
      <H1>Run summary &amp; findings</H1>
      <Lead maxWidth={680}>Everything from this pipeline run, in one place.</Lead>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Best FID · Gram−">
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 600, color: '#d23f7d', marginTop: 6 }}>{dash(R.gnBest)}</div>
          <div style={{ fontSize: 11, color: '#8a94a4' }}>tick {dash(toTick(R.gnTick))}</div>
        </StatCard>
        <StatCard label="Best FID · Gram+">
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 600, color: '#6d4bd1', marginTop: 6 }}>{dash(R.gpBest)}</div>
          <div style={{ fontSize: 11, color: '#8a94a4' }}>tick {dash(toTick(R.gpTick))}</div>
        </StatCard>
        <StatCard label="Top classifier">
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, marginTop: 8 }}>{dash(R.top)}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8a94a4' }}>F1 {dash(R.topF1)} baseline</div>
        </StatCard>
        <div style={{ background: '#16202e', borderRadius: 13, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: '#9aa6bb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Verdict</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 8, lineHeight: 1.2 }}>{verdict}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>FID convergence</div>
          {R.curveGN.length > 0 ? (
            <LineChart w={620} h={240} xMax={toTick(parseInt(run.pipe.cfg.ticks, 10) || 1000)} yMax={fidYMax(R.curveGN, R.curveGP)} yLabel="FID  (x: tick)"
              series={[{ points: toTickCurve(R.curveGN), color: C.neg }, { points: toTickCurve(R.curveGP), color: C.pos }]}
              benchmarks={[{ y: 10.78, color: '#9aa3b2', label: 'GN bench 10.78' }, { y: 21.17, color: '#c2c8d2', label: 'GP bench 21.17' }]}
              yFmt={(v) => v.toFixed(0)} />
          ) : (
            <div style={{ color: '#8a94a4', fontSize: 13, padding: '24px 0' }}>No FID metrics logged for this run.</div>
          )}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Macro-F1 by scenario</div>
          {R.feasRows.length > 0 ? <F1Chart rows={R.feasRows} archs={R.feasArchs} />
            : <div style={{ color: '#8a94a4', fontSize: 13, padding: '24px 0' }}>Run the feasibility test to populate this.</div>}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Generated samples</div>
        {rGallery.length > 0 ? <Gallery items={rGallery} />
          : <div style={{ color: '#8a94a4', fontSize: 13 }}>No images generated yet.</div>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => exportCsv(run, R)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563c9', border: 'none', borderRadius: 9, padding: '11px 18px', cursor: 'pointer' }}>
          <IconDownload size={15} /> Export metrics (CSV)
        </button>
      </div>
    </div>
  )
}
