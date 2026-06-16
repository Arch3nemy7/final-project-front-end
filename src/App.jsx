import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Generator from './pages/Generator.jsx'
import Results from './pages/Results.jsx'
import Methods from './pages/Methods.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/results"   element={<Results />} />
            <Route path="/methods"   element={<Methods />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
