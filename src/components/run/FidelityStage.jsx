import { useState } from 'react'
import { useStore } from '../../store/StoreContext.jsx'
import { resultsOf, pctBelow, FID_BENCH } from '../../lib/results.js'
import { toTick, toTickCurve, fidYMax } from '../../lib/format.js'
import LineChart from '../charts/LineChart.jsx'
import CheckpointStrip from './CheckpointStrip.jsx'
import { IconCheckCircle } from '../icons.jsx'
import { Eyebrow, H1, Lead, JobBar, RerunButton } from './parts.jsx'

function ResultCard({ accent, inkColor, name, tick, value, bench }) {
  const pass = value != null && value < bench
  return (
    <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: 20, borderLeft: '3px solid ' + accent }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: inkColor }}>{name}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8a94a4', marginTop: 2 }}>best @ tick {tick != null ? tick : '—'}</div>
        </div>
        {value != null && (
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: pass ? '#16916a' : '#cc4040', background: pass ? '#e6f5ee' : '#fbeaea', padding: '4px 9px', borderRadius: 6 }}>{pass ? 'PASS' : 'FAIL'}</div>
        )}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 40, fontWeight: 600, color: accent, margin: '8px 0 4px' }}>{value != null ? value : '—'}</div>
      <div style={{ fontSize: 12, color: '#5b6677' }}>{pctBelow(value, bench)}</div>
    </div>
  )
}

const fieldStyle = { width: '100%', padding: '9px 11px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 13, fontFamily: "'IBM Plex Mono',monospace" }

export default function FidelityStage({ run, C }) {
  const { live, patchPipe, cancelFid } = useStore()
  const p = run.pipe
  const fidRunning = live.fid === 'running'
  const fidDone = p.fidDone && !fidRunning
  const R = resultsOf(run)
  const total = parseInt(p.cfg.ticks, 10) || 1000
  const fd = p.fidData || { gn: '', gp: '', num: '5000' }
  const setFd = (k, v) => patchPipe(run.id, { fidData: { ...fd, [k]: v } })
  // The dataset carries over from the Format step; the manual paths are an
  // optional override, hidden by default (or shown if one was already set).
  const [showOverride, setShowOverride] = useState(!!(fd.gn || fd.gp))

  // While a fresh sweep is running, show only its live points — don't fall back
  // to the training/seeded curve (that's what made results "appear" instantly).
  const gnCurve = live.fidGN.length ? live.fidGN : (fidRunning ? [] : R.curveGN)
  const gpCurve = live.fidGP.length ? live.fidGP : (fidRunning ? [] : R.curveGP)
  // Per-checkpoint previews reuse the training snapshot grids — the FID test
  // itself generates nothing (it samples the generator internally).
  const gnSamples = live.trainSamplesGN.length ? live.trainSamplesGN : R.trainSamplesGN
  const gpSamples = live.trainSamplesGP.length ? live.trainSamplesGP : R.trainSamplesGP
  const sampleStrips = (
    <>
      <CheckpointStrip title="Gram-negative samples" accent="#a82a60" samples={gnSamples} />
      <CheckpointStrip title="Gram-positive samples" accent="#4a31a3" samples={gpSamples} />
    </>
  )
  const convergenceChart = (
    <LineChart w={620} h={240} xMax={toTick(total)} yMax={fidYMax(gnCurve, gpCurve)} yLabel="FID  (x: tick)"
      series={[{ points: toTickCurve(gnCurve), color: C.neg }, { points: toTickCurve(gpCurve), color: C.pos }]}
      benchmarks={[{ y: 10.78, color: '#9aa3b2', label: 'GN bench 10.78' }, { y: 21.17, color: '#c2c8d2', label: 'GP bench 21.17' }]}
      yFmt={(v) => v.toFixed(0)} />
  )

  return (
    <div>
      <Eyebrow>STEP 03 · TEST 1 · FIDELITY</Eyebrow>
      <H1>Fidelity test — find the best checkpoint by FID</H1>
      <Lead maxWidth={760}>
        Every saved checkpoint is scored with StyleGAN2-ADA's official <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>fid50k_full</span> metric — 50,000 generated images vs the <strong>entire real dataset</strong>, with no truncation and no fixed seed. The generator is sampled internally (no images are written to disk), so no images are generated up front. The lowest-FID checkpoint per class is selected for the next step. Benchmark for good medical synthesis (Woodland et al.): <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>10.78 / 21.17</span>.
      </Lead>

      {/* config (shown when idle) */}
      {!fidRunning && !fidDone && (
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Real dataset to score against</div>
          <div style={{ fontSize: 12.5, color: '#5b6677', marginBottom: 14 }}>
            Uses the dataset from the <strong>Format</strong> step automatically — you don't need to enter it again.
          </div>
          <div onClick={() => setShowOverride((v) => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#2563c9' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{showOverride ? '▾' : '▸'}</span> Score against a different dataset (optional)
          </div>
          {showOverride && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#8a94a4', marginBottom: 12 }}>Folder or .zip of real crops at the model's resolution (e.g. 256²). Leave blank to keep using the Format dataset.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.negInk, marginBottom: 6 }}>Gram-negative real crops</span>
                  <input value={fd.gn} onChange={(e) => setFd('gn', e.target.value)} placeholder="D:\…\gram_negative" style={fieldStyle} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.posInk, marginBottom: 6 }}>Gram-positive real crops</span>
                  <input value={fd.gp} onChange={(e) => setFd('gp', e.target.value)} placeholder="D:\…\gram_positive" style={fieldStyle} />
                </label>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12.5, color: '#8a94a4', marginTop: 16 }}>
            Click <strong>Run fidelity test</strong> below to score every checkpoint at <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>fid50k_full</span>. Each checkpoint generates 50,000 images, so this is slow on a small GPU — results stream in per checkpoint and the best-so-far updates live, so you can cancel once it has converged.
          </div>
          {live.fidError && (
            <div style={{ marginTop: 14, background: '#fbeaea', border: '1px solid #f0d2d2', borderRadius: 10, padding: '12px 15px', fontSize: 13, color: '#cc4040' }}>
              Fidelity test stopped: {live.fidError}
            </div>
          )}
        </div>
      )}

      {/* running */}
      {fidRunning && (
        <div>
          <JobBar title={live.fidStep || 'Scoring checkpoints…'} pct={live.fidPct} onCancel={cancelFid} />
          <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>FID convergence (per checkpoint)</div>
              <div style={{ display: 'flex', gap: 13, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>
                <span style={{ color: '#d23f7d' }}>● Gram−</span><span style={{ color: '#6d4bd1' }}>● Gram+</span>
              </div>
            </div>
            {convergenceChart}
            {sampleStrips}
          </div>
        </div>
      )}

      {/* done */}
      {fidDone && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <ResultCard accent="#d23f7d" inkColor="#a82a60" name="Gram-negative" tick={toTick(R.fidGNtick)} value={R.fidGN} bench={FID_BENCH.gn} />
            <ResultCard accent="#6d4bd1" inkColor="#4a31a3" name="Gram-positive" tick={toTick(R.fidGPtick)} value={R.fidGP} bench={FID_BENCH.gp} />
          </div>

          {R.curveGN.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>FID convergence (per checkpoint)</div>
              {convergenceChart}
              {sampleStrips}
            </div>
          )}

          <div style={{ background: '#e6f5ee', border: '1px solid #b7e2cd', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <span style={{ color: '#16916a', flex: 'none', marginTop: 1 }}><IconCheckCircle size={20} /></span>
            <div style={{ fontSize: 13.5, color: '#0f5f45', lineHeight: 1.55 }}>
              Best checkpoint selected per class (lowest FID). The feasibility test synthesizes its augmentation crops from these. Continue to the feasibility study.
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <RerunButton label="↻ Re-run fidelity test" onClick={() => patchPipe(run.id, { fidDone: false })} />
          </div>
        </div>
      )}
    </div>
  )
}
