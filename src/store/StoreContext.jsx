import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadDb, saveDb, seedDb, newId, defaultPipe, freshLive,
} from './data.js'
import { LIVE, post, del, get } from '../api/client.js'
import { openEvents } from '../api/events.js'

const StoreContext = createContext(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(loadDb)
  const [live, setLive] = useState(freshLive)
  const [gpu, setGpu] = useState(null)
  const navigate = useNavigate()

  // Latest committed db, readable from timer callbacks without stale closures.
  const dbRef = useRef(db)
  dbRef.current = db
  const timers = useRef({})
  // Live mode (VITE_API_BASE set): the open SSE stream + the run it belongs to.
  const esRef = useRef(null)
  const streamRunId = useRef(null)

  // Persist the initial (possibly migrated/seeded) db once on mount.
  const persistedOnce = useRef(false)
  if (!persistedOnce.current) { persistedOnce.current = true; saveDb(db) }

  // Stable action set. Reads go through dbRef; writes through functional updates.
  const actions = useMemo(() => {
    const clone = (d) => JSON.parse(JSON.stringify(d))
    const commit = (updater) => setDb((prev) => {
      const next = updater(clone(prev))
      if (!next) return prev
      saveDb(next)
      return next
    })
    const updateLive = (patch) => setLive((prev) => ({
      ...prev, ...(typeof patch === 'function' ? patch(prev) : patch),
    }))

    const autoAdv = () => !!(dbRef.current.settings && dbRef.current.settings.autoAdvance)
    const closeStream = () => { if (esRef.current) { esRef.current.close(); esRef.current = null } }
    const clearTimers = () => {
      Object.values(timers.current).forEach(clearInterval); timers.current = {}
      closeStream()
    }

    // Open an SSE stream for a run and route its events through `onEvent`.
    const liveStream = (id, onEvent) => {
      closeStream()
      streamRunId.current = id
      esRef.current = openEvents(id, onEvent)
    }
    // Cancel the live job behind the current stream and reset the given slice.
    const liveCancel = (resetPatch) => {
      const rid = streamRunId.current
      if (rid) post(`/api/runs/${rid}/cancel`).catch(() => {})
      closeStream()
      updateLive(resetPatch)
    }

    // Merge backend-computed results into a run (persisted in the run record).
    const patchResults = (id, partial) => commit((d) => {
      const r = d.runs[id]; if (!r) return null
      r.pipe.results = { ...(r.pipe.results || {}), ...partial }
      // keep the formatted crop counts visible everywhere they're already read
      if (partial.format) {
        if (r.pipe.posFile && partial.format.cropsPos != null) r.pipe.posFile.count = partial.format.cropsPos
        if (r.pipe.negFile && partial.format.cropsNeg != null) r.pipe.negFile.count = partial.format.cropsNeg
      }
      r.updatedAt = Date.now(); return d
    })

    // Load any persisted results when (re)opening a run in live mode.
    const loadResults = (id) => {
      if (!LIVE) return
      get(`/api/runs/${id}/results`).then((res) => {
        if (res && Object.keys(res).length) patchResults(id, res)
      }).catch(() => {})
    }

    // Reconcile a run's stage-completion flags with the server copy when opening
    // it. Monotonic: only advances (OR of done-flags, max of stage) so it can
    // never revert live local progress — it just lets a run the server marks
    // complete (e.g. seeded/imported) show as complete in a browser that still
    // holds an earlier local copy. Results themselves come from loadResults.
    const syncRun = (id) => {
      if (!LIVE) return
      get(`/api/runs/${id}`).then((sr) => {
        const sp = sr && sr.pipe
        if (!sp || !sp.done) return
        commit((d) => {
          const local = d.runs[id]
          if (!local) return null
          const lp = local.pipe, ld = lp.done || []
          lp.done = sp.done.map((v, i) => !!v || !!ld[i])
          lp.stage = Math.max(lp.stage || 0, sp.stage || 0)
          ;['fmtDone', 'gnDone', 'gpDone', 'fidDone', 'generated', 'feasDone'].forEach((k) => { lp[k] = !!lp[k] || !!sp[k] })
          local.updatedAt = Date.now()
          return d
        })
      }).catch(() => {})
    }

    // Add (or refresh) a run from a server payload into the local store.
    const adopt = (sr) => commit((d) => {
      if (!sr || !sr.id) return null
      d.runs[sr.id] = {
        id: sr.id, name: sr.name || 'Imported run', dataset: sr.dataset || '—',
        createdAt: Date.parse(sr.createdAt) || Date.now(),
        updatedAt: Date.parse(sr.updatedAt) || Date.now(),
        pipe: (sr.pipe && sr.pipe.done) ? sr.pipe : defaultPipe(),
      }
      if (!d.order.includes(sr.id)) d.order.unshift(sr.id)
      return d
    })

    // Import two already-trained model directories (paths on the server) as a
    // completed run, then open it. Returns a promise.
    const importModels = (gn, gp, name) => {
      if (!LIVE) return Promise.reject(new Error('Connect a backend first'))
      return post('/api/import', { gn, gp, name }).then((run) => {
        adopt(run)
        if (run && run.id) navigate('/run/' + run.id)
        return run
      })
    }

    // In live mode, pull server-side runs (e.g. imported trained models) and
    // adopt any the local store doesn't already have. One-way: never clobbers
    // local progress.
    const adoptServerRuns = () => {
      if (!LIVE) return
      get('/api/runs').then((list) => {
        if (!Array.isArray(list) || !list.length) return
        commit((d) => {
          let changed = false
          list.forEach((sr) => {
            if (sr && sr.id && !d.runs[sr.id]) {
              d.runs[sr.id] = {
                id: sr.id, name: sr.name || 'Imported run', dataset: sr.dataset || '—',
                createdAt: Date.parse(sr.createdAt) || Date.now(),
                updatedAt: Date.parse(sr.updatedAt) || Date.now(),
                pipe: (sr.pipe && sr.pipe.done) ? sr.pipe : defaultPipe(),
              }
              d.order.unshift(sr.id)
              changed = true
            }
          })
          return changed ? d : null
        })
      }).catch(() => {})
    }

    // ----- db mutations -----
    const patchPipe = (id, patch) => commit((d) => {
      const r = d.runs[id]; if (!r) return null
      Object.assign(r.pipe, patch); r.updatedAt = Date.now(); return d
    })
    const setCfg = (id, k, v) => commit((d) => {
      const r = d.runs[id]; if (!r) return null
      r.pipe.cfg[k] = v; r.updatedAt = Date.now(); return d
    })
    const markStageDone = (id, i) => commit((d) => {
      const r = d.runs[id]; if (!r) return null
      r.pipe.done[i] = true; r.updatedAt = Date.now(); return d
    })
    const goStage = (id, i) => patchPipe(id, { stage: i })
    const maybeAdvance = (id, completed) => {
      if (autoAdv()) setTimeout(() => goStage(id, Math.min(5, completed + 1)), 900)
    }

    const createRun = () => {
      const id = newId()
      const name = 'New run ' + (dbRef.current.order.length + 1)
      const pipe = defaultPipe()
      commit((d) => {
        d.runs[id] = { id, name, dataset: '—', createdAt: Date.now(), updatedAt: Date.now(), pipe }
        d.order.unshift(id)
        return d
      })
      if (LIVE) post('/api/runs', { id, name, dataset: '—', config: pipe.cfg }).catch(() => {})
      navigate('/run/' + id)
    }
    const deleteRun = (id) => {
      commit((d) => { delete d.runs[id]; d.order = d.order.filter((x) => x !== id); return d })
      if (LIVE) del(`/api/runs/${id}`)
    }
    const setSetting = (k, v) => commit((d) => { d.settings[k] = v; return d })
    const resetData = () => {
      clearTimers()
      const fresh = seedDb()
      saveDb(fresh)
      setDb(fresh)
      setLive(freshLive())
      navigate('/')
    }

    // ----- jobs (backend-driven; a connected backend is required) -----
    // One handler for every job kind, so both starting a job and re-attaching to
    // an already-running one (after navigating away) share the same logic.
    const STAGE_IDX = { format: 0, train: 1, fidelity: 2, generate: 3, feasibility: 4 }
    const onStageEvent = (id, kind, ev) => {
      if (ev.type === 'result') { patchResults(id, { [ev.key]: ev.value }); return }
      if (ev.type === 'sample') {
        if (kind === 'fidelity') {
          // one sample grid per checkpoint — accumulate the whole series
          updateLive((s) => {
            const key = ev.class === 'gn' ? 'fidSamplesGN' : 'fidSamplesGP'
            return { [key]: s[key].concat([{ kimg: ev.kimg, url: ev.url }]) }
          })
        } else {
          // training: keep the latest grid + accumulate the per-checkpoint series
          updateLive((s) => {
            const latest = ev.class === 'gn' ? { sampleGN: { url: ev.url, kimg: ev.kimg } } : { sampleGP: { url: ev.url, kimg: ev.kimg } }
            const key = ev.class === 'gn' ? 'trainSamplesGN' : 'trainSamplesGP'
            return { ...latest, [key]: s[key].concat([{ kimg: ev.kimg, url: ev.url }]) }
          })
        }
        return
      }
      if (ev.type === 'tick') {
        updateLive((s) => {
          const next = {
            kimg: ev.kimg, trainClass: ev.class,
            stats: { tick: ev.tick, kimg: ev.kimg, augment: ev.augment, secPerTick: ev.secPerTick, secPerKimg: ev.secPerKimg, totalSec: ev.totalSec, gpumem: ev.gpumem, cpumem: ev.cpumem },
          }
          if (ev.augment != null) { const ak = ev.class === 'gn' ? 'augGN' : 'augGP'; next[ak] = s[ak].concat([{ x: ev.kimg, y: ev.augment }]) }
          return next
        })
        return
      }
      if (ev.type === 'fid') {
        updateLive((s) => { const k = ev.class === 'gn' ? 'fidGN' : 'fidGP'; return { [k]: s[k].concat([{ x: ev.x, y: ev.y }]) } })
        return
      }
      if (ev.type === 'class_done') {
        if (kind === 'train' && ev.class === 'gn') { patchPipe(id, { gnDone: true }); updateLive({ trainClass: 'gp', kimg: 0, stats: null }) }
        return
      }
      if (ev.type === 'progress') {
        if (kind === 'format') updateLive({ fmtPct: ev.pct })
        else if (kind === 'generate') updateLive(ev.phase ? { genPct: ev.pct, genPhase: ev.phase } : { genPct: ev.pct })
        else if (kind === 'fidelity') updateLive(ev.step ? { fidPct: ev.pct, fidStep: ev.step } : { fidPct: ev.pct })
        else if (kind === 'feasibility') updateLive(ev.step ? { feasPct: ev.pct, feasStep: ev.step } : { feasPct: ev.pct })
        return
      }
      if (ev.type === 'done') {
        closeStream()
        if (kind === 'format') { updateLive({ fmt: 'idle', fmtPct: 0 }); patchPipe(id, { fmtDone: true }) }
        else if (kind === 'train') { updateLive({ train: 'idle' }); patchPipe(id, { gnDone: true, gpDone: true }) }
        else if (kind === 'fidelity') { updateLive({ fid: 'idle', fidStep: '' }); patchPipe(id, { fidDone: true }) }
        else if (kind === 'generate') { updateLive({ gen: 'idle', genPct: 1 }); patchPipe(id, { generated: true }) }
        else if (kind === 'feasibility') { updateLive({ feas: 'idle', feasStep: '' }); patchPipe(id, { feasDone: true }) }
        markStageDone(id, STAGE_IDX[kind]); maybeAdvance(id, STAGE_IDX[kind])
        return
      }
      if (ev.type === 'error' || ev.type === 'cancelled') {
        closeStream()
        const errMsg = ev.type === 'error' ? (ev.message || 'Job failed') : ''
        if (kind === 'format') updateLive({ fmt: 'idle', fmtPct: 0 })
        else if (kind === 'train') updateLive({ train: 'idle' })
        else if (kind === 'fidelity') updateLive({ fid: 'idle', fidPct: 0, fidStep: '', fidError: errMsg })
        else if (kind === 'generate') updateLive({ gen: 'idle', genPct: 0, genPhase: '' })
        else if (kind === 'feasibility') updateLive({ feas: 'idle', feasPct: 0, feasStep: '', feasError: errMsg })
      }
    }

    const startFormat = (id) => {
      if (!LIVE) return
      const r = dbRef.current.runs[id]
      updateLive({ fmt: 'running', fmtPct: 0 })
      post(`/api/runs/${id}/format/start`, {
        pos: r && r.pipe.posFile && r.pipe.posFile.name,
        neg: r && r.pipe.negFile && r.pipe.negFile.name,
        res: (r && parseInt(r.pipe.cfg.res, 10)) || 256,
      }).catch(() => {})
      liveStream(id, (ev) => onStageEvent(id, 'format', ev))
    }
    const cancelFormat = () => liveCancel({ fmt: 'idle', fmtPct: 0 })

    const startTrain = (id) => {
      if (!LIVE) return
      const r = dbRef.current.runs[id]
      updateLive({ train: 'running', trainClass: 'gn', kimg: 0, stats: null, augGN: [], augGP: [], sampleGN: null, sampleGP: null, trainSamplesGN: [], trainSamplesGP: [] })
      patchPipe(id, { gnDone: false, gpDone: false })
      post(`/api/runs/${id}/train/start`, { config: (r && r.pipe.cfg) || {} }).catch(() => {})
      liveStream(id, (ev) => onStageEvent(id, 'train', ev))
    }
    const cancelTrain = () => liveCancel({ train: 'idle', kimg: 0 })

    // Fidelity = per-checkpoint FID sweep (finds best checkpoint; no image gen).
    const startFid = (id) => {
      if (!LIVE) return
      const fd = (dbRef.current.runs[id] && dbRef.current.runs[id].pipe.fidData) || {}
      updateLive({ fid: 'running', fidPct: 0, fidStep: 'Starting FID sweep…', fidError: '', fidGN: [], fidGP: [], fidSamplesGN: [], fidSamplesGP: [] })
      post(`/api/runs/${id}/fidelity/start`, { num: parseInt(fd.num, 10) || 5000, gn: fd.gn || null, gp: fd.gp || null })
        .catch((e) => updateLive({ fid: 'idle', fidError: String(e.message || e) }))
      liveStream(id, (ev) => onStageEvent(id, 'fidelity', ev))
    }
    const cancelFid = () => liveCancel({ fid: 'idle', fidPct: 0, fidStep: '' })

    const startGen = (id) => {
      if (!LIVE) return
      const r = dbRef.current.runs[id]
      updateLive({ gen: 'running', genPct: 0, genPhase: 'Gram-positive' })
      post(`/api/runs/${id}/generate/start`, { n: (r && parseInt(r.pipe.genN, 10)) || 5000 }).catch(() => {})
      liveStream(id, (ev) => onStageEvent(id, 'generate', ev))
    }
    const cancelGen = () => liveCancel({ gen: 'idle', genPct: 0, genPhase: '' })

    const startFeas = (id) => {
      if (!LIVE) return
      const fe = (dbRef.current.runs[id] && dbRef.current.runs[id].pipe.feasData) || {}
      updateLive({ feas: 'running', feasPct: 0, feasStep: 'Starting feasibility study…', feasError: '' })
      post(`/api/runs/${id}/feasibility/start`, { real: fe.real || null, test: fe.test || null })
        .catch((e) => updateLive({ feas: 'idle', feasError: String(e.message || e) }))
      liveStream(id, (ev) => onStageEvent(id, 'feasibility', ev))
    }
    const cancelFeas = () => liveCancel({ feas: 'idle', feasPct: 0, feasStep: '' })

    // Re-attach to a job that is still running on the backend (e.g. after the
    // user navigated to the dashboard and came back). The broker replays history
    // so the chart/progress rebuild from the start.
    const reattach = (id) => {
      if (!LIVE) return
      get(`/api/runs/${id}/status`).then((s) => {
        const kind = s && s.running && s.kind
        if (!kind) return
        if (kind === 'format') updateLive({ fmt: 'running' })
        else if (kind === 'train') updateLive({ train: 'running', kimg: 0, stats: null, augGN: [], augGP: [], trainSamplesGN: [], trainSamplesGP: [] })
        else if (kind === 'fidelity') updateLive({ fid: 'running', fidStep: 'Reconnecting…', fidGN: [], fidGP: [], fidSamplesGN: [], fidSamplesGP: [] })
        else if (kind === 'generate') updateLive({ gen: 'running' })
        else if (kind === 'feasibility') updateLive({ feas: 'running' })
        liveStream(id, (ev) => onStageEvent(id, kind, ev))
      }).catch(() => {})
    }

    return {
      navigate,
      setLive: updateLive,
      clearTimers,
      patchPipe, setCfg, markStageDone, goStage, loadResults, syncRun, adoptServerRuns, importModels, reattach,
      createRun, deleteRun, setSetting, resetData,
      startFormat, cancelFormat,
      startTrain, cancelTrain,
      startGen, cancelGen,
      startFid, cancelFid,
      startFeas, cancelFeas,
    }
  }, [navigate])

  // On load in live mode: adopt server-side runs (imported models) + detect GPU.
  useEffect(() => {
    if (!LIVE) return
    actions.adoptServerRuns()
    get('/api/gpu').then((g) => setGpu(g && g.name)).catch(() => {})
  }, [actions])

  const value = useMemo(() => ({ db, live, gpu, ...actions }), [db, live, gpu, actions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
