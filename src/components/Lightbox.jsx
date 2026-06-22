import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Simple app-wide fullscreen image viewer. Any image can call openLightbox(src)
// to show it enlarged on a dark backdrop; click anywhere or press Esc to close.
const Ctx = createContext(() => {})

export function useLightbox() {
  return useContext(Ctx)
}

export function LightboxProvider({ children }) {
  const [src, setSrc] = useState(null)
  const open = useCallback((s) => setSrc(s), [])
  const close = useCallback(() => setSrc(null), [])

  useEffect(() => {
    if (!src) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, close])

  return (
    <Ctx.Provider value={open}>
      {children}
      {src && (
        <div onClick={close} style={{
          position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,12,20,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, cursor: 'zoom-out',
        }}>
          <img src={src} alt="" style={{ maxWidth: '95vw', maxHeight: '92vh', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
          <button onClick={close} style={{
            position: 'fixed', top: 18, right: 22, width: 38, height: 38, borderRadius: 19, border: 'none',
            background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>
      )}
    </Ctx.Provider>
  )
}
