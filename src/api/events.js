// Server-Sent Events subscription. Opens the run's event stream and invokes
// onEvent(parsedMessage) for each JSON event. Returns the EventSource so the
// caller can close it. Keep-alive comment lines (": ping") carry no data and
// are ignored by the browser, so onmessage only fires for real events.
import { API_BASE } from './client.js'

export function openEvents(runId, onEvent) {
  const es = new EventSource(API_BASE + '/api/runs/' + runId + '/events')
  es.onmessage = (e) => {
    if (!e.data) return
    try { onEvent(JSON.parse(e.data)) } catch { /* ignore malformed frame */ }
  }
  es.onerror = () => { /* the browser reconnects automatically; non-fatal */ }
  return es
}
