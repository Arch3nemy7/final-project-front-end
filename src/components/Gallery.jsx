// Port of the design's galleryGrid(): an 8-column grid of square synthetic-image
// tiles, each with a class-coloured bottom rule. Click a tile to view fullscreen.
import { assetUrl } from '../api/client.js'
import { useLightbox } from './Lightbox.jsx'

export default function Gallery({ items }) {
  const openLightbox = useLightbox()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '9px' }}>
      {items.map((g, i) => (
        <div key={g.key || i} onClick={() => openLightbox(assetUrl(g.src))}
          style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e6e9f0', cursor: 'zoom-in' }}>
          <img src={assetUrl(g.src)} alt="" style={{ width: '100%', display: 'block', aspectRatio: '1', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '3px', background: g.ring }} />
        </div>
      ))}
    </div>
  )
}
