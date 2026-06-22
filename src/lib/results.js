// Normalised view of a run's REAL results (from the backend, persisted in
// pipe.results). No fabricated fallbacks: anything not yet computed is null/
// empty so the UI can show "—" or an empty state instead of fake numbers.
import { F1_ARCHS } from '../store/data.js'

// Fidelity-test benchmarks (Woodland et al.), per Gram class — fixed references.
export const FID_BENCH = { gn: 10.78, gp: 21.17 }

export function pctBelow(value, bench) {
  if (value == null || !bench) return ''
  return (((bench - value) / bench) * 100).toFixed(1) + '% below the ' + bench + ' benchmark'
}

export function resultsOf(run) {
  const r = (run && run.pipe && run.pipe.results) || {}
  const train = r.train || {}, gn = train.gn || {}, gp = train.gp || {}
  const feas = r.feasibility || {}, fid = r.fidelity || {}, gen = r.generate || {}, fmt = r.format || {}
  const n = (v) => (v == null ? null : v)

  return {
    real: !!(run && run.pipe && run.pipe.results),
    // best FID per generator + the kimg it was reached at
    gnBest: n(gn.bestFid), gpBest: n(gp.bestFid),
    gnTick: n(gn.bestTick), gpTick: n(gp.bestTick),
    // per-class training duration (kimg) — may differ between gn and gp
    gnDur: n(gn.durKimg), gpDur: n(gp.durKimg),
    // convergence curves (empty until the trainer logs FID metrics)
    curveGN: train.curveGN && train.curveGN.length ? train.curveGN : [],
    curveGP: train.curveGP && train.curveGP.length ? train.curveGP : [],
    // real checkpoint-sample grid per class (streamed live, or imported)
    trainSampleGN: gn.sample || null, trainSampleGP: gp.sample || null,
    // per-checkpoint training sample grids (imported fakes*.png), one per snapshot
    trainSamplesGN: train.trainSamplesGN && train.trainSamplesGN.length ? train.trainSamplesGN : [],
    trainSamplesGP: train.trainSamplesGP && train.trainSamplesGP.length ? train.trainSamplesGP : [],
    // per-checkpoint sample grids from the fidelity sweep (one image per checkpoint)
    fidSamplesGN: train.fidSamplesGN && train.fidSamplesGN.length ? train.fidSamplesGN : [],
    fidSamplesGP: train.fidSamplesGP && train.fidSamplesGP.length ? train.fidSamplesGP : [],
    // fidelity test (Scenario A) per class — falls back to the measured best FID
    fidGN: fid.gn != null ? fid.gn : n(gn.bestFid),
    fidGP: fid.gp != null ? fid.gp : n(gp.bestFid),
    fidGNtick: fid.gnTick != null ? fid.gnTick : n(gn.bestTick),
    fidGPtick: fid.gpTick != null ? fid.gpTick : n(gp.bestTick),
    // feasibility F1 table
    feasRows: feas.rows && feas.rows.length ? feas.rows : [],
    feasArchs: feas.archs && feas.archs.length ? feas.archs : F1_ARCHS,
    top: feas.top || null, topF1: feas.topF1 != null ? feas.topF1 : null,
    // generated gallery (array of {src,cls}) — null when nothing generated yet
    gallery: gen.gallery && gen.gallery.length ? gen.gallery : null,
    genTotal: gen.total != null ? gen.total : null,
    // formatted crop counts
    cropsPos: fmt.cropsPos != null ? fmt.cropsPos : null,
    cropsNeg: fmt.cropsNeg != null ? fmt.cropsNeg : null,
  }
}
