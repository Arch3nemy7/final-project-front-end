import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Microscope } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/',          label: 'Overview'  },
  { to: '/generator', label: 'Generator' },
  { to: '/results',   label: 'Results'   },
  { to: '/methods',   label: 'Methods'   },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Microscope className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              Bacteri<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Badge */}
          <div className="hidden md:flex items-center gap-3">
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              StyleGAN2-ADA
            </span>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-gray-950/95 px-4 pb-4 pt-2">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'block px-3 py-2.5 rounded-lg text-sm font-medium my-0.5 transition-colors',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
