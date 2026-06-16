import { Microscope } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <Microscope className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Bacteri<span className="text-indigo-400">AI</span>
            </span>
          </div>

          <p className="text-center text-xs text-gray-500 leading-relaxed">
            Final Project — Department of Informatics Engineering (D4)<br />
            Electronic Engineering Polytechnic Institute of Surabaya (EEPIS), 2025
          </p>

          <p className="text-xs text-gray-600">
            Andrey Pratama Gunawan
          </p>
        </div>
      </div>
    </footer>
  )
}
