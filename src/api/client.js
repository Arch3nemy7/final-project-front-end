// REST client for the GramSynth backend.
//
// The base URL comes from the Vite env var VITE_API_BASE (see .env.example).
// When it's empty, LIVE is false and the app runs entirely on its built-in
// simulation — so the prototype still works with no backend at all.

const RAW = import.meta.env.VITE_API_BASE || ''
export const API_BASE = RAW.replace(/\/$/, '')
export const LIVE = !!API_BASE

export async function post(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  if (!res.ok) {
    let detail = ''
    try { const j = await res.json(); if (j && j.detail) detail = ' — ' + j.detail } catch { /* no body */ }
    throw new Error('Request failed (' + res.status + ')' + detail)
  }
  return res.json().catch(() => ({}))
}

export async function del(path) {
  try {
    await fetch(API_BASE + path, { method: 'DELETE' })
  } catch { /* best-effort */ }
}

export async function get(path) {
  const res = await fetch(API_BASE + path)
  if (!res.ok) throw new Error('GET ' + path + ' failed: ' + res.status)
  return res.json()
}

// Backend artifacts come back as "/api/..." paths; the front end runs on a
// different origin, so prefix them with the API base. Other URLs (e.g. the
// front end's own "/figs/..." demo tiles) are returned unchanged.
export const assetUrl = (src) => (src && src.startsWith('/api/')) ? API_BASE + src : src
