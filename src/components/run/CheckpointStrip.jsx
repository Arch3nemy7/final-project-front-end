import { assetUrl } from '../../api/client.js'
import { toTick } from '../../lib/format.js'
import { useLightbox } from '../Lightbox.jsx'

// A horizontal strip of one sample grid per checkpoint, in ascending tick order.
// Used by the Training and Fidelity stages so quality evolution is visible across
// the whole run. Click any thumbnail to view it fullscreen.
export default function CheckpointStrip({ title, accent, samples }) {
  const openLightbox = useLightbox()
  if (!samples || !samples.length) return null
  const sorted = [...samples].sort((a, b) => a.kimg - b.kimg)
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginBottom: 8 }}>{title} · {sorted.length} checkpoints</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
        {sorted.map((s) => (
          <div key={s.kimg} style={{ flex: 'none', textAlign: 'center' }}>
            <img src={assetUrl(s.url)} alt={'tick ' + toTick(s.kimg)} width={96} height={96}
              onClick={() => openLightbox(assetUrl(s.url))}
              style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, border: '1px solid #e6e9f0', display: 'block', cursor: 'zoom-in' }} />
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#8a94a4', marginTop: 4 }}>tick {toTick(s.kimg)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
