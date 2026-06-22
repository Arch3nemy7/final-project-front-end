import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import { LightboxProvider } from './components/Lightbox.jsx'
import PageLayout from './components/PageLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Runs from './pages/Runs.jsx'
import Datasets from './pages/Datasets.jsx'
import Models from './pages/Models.jsx'
import Settings from './pages/Settings.jsx'
import RunWorkspace from './pages/RunWorkspace.jsx'

export default function App() {
  return (
    <LightboxProvider>
    <div style={{ height: '100vh', width: '100%', background: '#f3f5f9', color: '#16202e', fontFamily: "'IBM Plex Sans',system-ui,sans-serif", overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<PageLayout title="Dashboard" sub="Your augmentation pipelines at a glance"><Dashboard /></PageLayout>} />
            <Route path="/runs" element={<PageLayout title="Runs" sub="All pipeline runs"><Runs /></PageLayout>} />
            <Route path="/datasets" element={<PageLayout title="Datasets" sub="Formatted training datasets"><Datasets /></PageLayout>} />
            <Route path="/models" element={<PageLayout title="Models" sub="Trained StyleGAN2-ADA checkpoints"><Models /></PageLayout>} />
            <Route path="/settings" element={<PageLayout title="Settings" sub="Workspace preferences"><Settings /></PageLayout>} />
            <Route path="/run/:id" element={<RunWorkspace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
    </LightboxProvider>
  )
}
