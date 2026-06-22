import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext.jsx'
import { palette, freshLive } from '../store/data.js'
import { statusOf } from '../lib/format.js'
import { IconArrowLeft } from '../components/icons.jsx'
import Stepper from '../components/run/Stepper.jsx'
import FormatStage from '../components/run/FormatStage.jsx'
import TrainStage from '../components/run/TrainStage.jsx'
import GenerateStage from '../components/run/GenerateStage.jsx'
import FidelityStage from '../components/run/FidelityStage.jsx'
import FeasibilityStage from '../components/run/FeasibilityStage.jsx'
import ResultsStage from '../components/run/ResultsStage.jsx'

export default function RunWorkspace() {
  const { id } = useParams()
  const { db, live, gpu, navigate, clearTimers, setLive, goStage, markStageDone, loadResults, syncRun, reattach, startFormat, startTrain, startGen, startFid, startFeas } = useStore()

  // Entering or switching a run resets ephemeral live state, stops any timers
  // from a previously-open run, hydrates persisted results, reconciles stage
  // completion with the server, and re-attaches to a job still running on the
  // backend (so it survives navigating away).
  useEffect(() => {
    clearTimers()
    setLive(freshLive())
    loadResults(id)
    syncRun(id)
    reattach(id)
    return () => clearTimers()
  }, [id, clearTimers, setLive, loadResults, syncRun, reattach])

  const run = db.runs[id]
  if (!run) return <Navigate to="/runs" replace />

  const C = palette(db.settings.accent)
  const p = run.pipe
  const sg = p.stage
  const st = statusOf(p, C)

  // job-state flags
  const fmtRunning = live.fmt === 'running', fmtDone = p.fmtDone && !fmtRunning
  const trainRunning = live.train === 'running', trainDone = p.gnDone && p.gpDone && !trainRunning
  const genRunning = live.gen === 'running', genDone = p.generated && !genRunning
  const fidRunning = live.fid === 'running', fidDone = p.fidDone && !fidRunning
  const feasRunning = live.feas === 'running', feasDone = p.feasDone && !feasRunning

  const goNext = () => goStage(id, Math.min(5, sg + 1))
  const goPrev = () => goStage(id, Math.max(0, sg - 1))

  // primary action-bar state machine (ported from the design footer logic)
  let pLabel = 'Continue', pDis = false, pAct = goNext, hint = ''
  if (sg === 0) {
    if (fmtRunning) { pLabel = 'Formatting…'; pDis = true }
    else if (fmtDone) { pLabel = 'Continue to training →' }
    else { pLabel = 'Format datasets'; pDis = !(p.posFile && p.negFile); pAct = () => startFormat(id); hint = (p.posFile && p.negFile) ? '' : 'Upload both class archives' }
  } else if (sg === 1) {
    if (trainRunning) { pLabel = 'Training…'; pDis = true; hint = 'Generators train sequentially' }
    else if (trainDone) { pLabel = 'Continue →' }
    else { pLabel = 'Start training'; pAct = () => startTrain(id) }
  } else if (sg === 2) {
    if (fidRunning) { pLabel = 'Computing FID…'; pDis = true; hint = 'Scoring every checkpoint' }
    else if (fidDone) { pLabel = 'Continue to generate →' }
    else { pLabel = 'Run fidelity test'; pAct = () => startFid(id); hint = (p.gnDone && p.gpDone) ? '' : 'Train (or import) models first' }
  } else if (sg === 3) {
    if (genRunning) { pLabel = 'Generating…'; pDis = true }
    else if (genDone) { pLabel = 'Continue →' }
    else { pLabel = 'Generate images'; pAct = () => startGen(id) }
  } else if (sg === 4) {
    if (feasRunning) { pLabel = 'Training classifiers…'; pDis = true }
    else if (feasDone) { pLabel = 'View results →'; pAct = () => { markStageDone(id, 5); goNext() } }
    else { pLabel = 'Run feasibility test'; pAct = () => startFeas(id) }
  } else if (sg === 5) {
    pLabel = 'Back to dashboard'; pAct = () => navigate('/')
  }

  const stage = [
    <FormatStage key="0" run={run} C={C} />,
    <TrainStage key="1" run={run} C={C} />,
    <FidelityStage key="2" run={run} C={C} />,
    <GenerateStage key="3" run={run} C={C} />,
    <FeasibilityStage key="4" run={run} C={C} />,
    <ResultsStage key="5" run={run} C={C} />,
  ][sg]

  return (
    <>
      <header style={{ flex: 'none', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fff', borderBottom: '1px solid #e6e9f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div onClick={() => navigate('/runs')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#8a94a4', cursor: 'pointer', fontWeight: 500 }}>
            <IconArrowLeft size={15} /> Runs
          </div>
          <span style={{ color: '#cdd3de' }}>/</span>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{run.name}</div>
          <div style={{ flex: 'none', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: st.bg, color: st.fg }}>{st.label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', border: '1px solid #e6e9f0', borderRadius: 8, background: '#f8fafc' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16916a' }} />
          <span title="Detected from the connected backend" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5b6677', fontWeight: 500 }}>{gpu || 'RTX A2000 · 12GB'}</span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '30px 36px 36px' }}>
          <Stepper pipe={p} C={C} onGo={(i) => goStage(id, i)} />
          {stage}
        </div>
      </div>

      <div style={{ flex: 'none', borderTop: '1px solid #e6e9f0', background: '#fff', padding: '13px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={goPrev} disabled={sg === 0} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, color: '#5b6677', background: 'transparent', border: '1px solid #e6e9f0', borderRadius: 9, padding: '10px 16px', cursor: sg === 0 ? 'default' : 'pointer', opacity: sg === 0 ? 0.4 : 1 }}>
          <IconArrowLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 12.5, color: '#8a94a4' }}>{hint}</span>
          <button onClick={pDis ? undefined : pAct} disabled={pDis} style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: pDis ? '#c7cdd8' : C.primary, border: 'none', borderRadius: 9, padding: '12px 26px', cursor: pDis ? 'not-allowed' : 'pointer', boxShadow: '0 1px 2px rgba(22,32,46,.08)' }}>{pLabel}</button>
        </div>
      </div>
    </>
  )
}
