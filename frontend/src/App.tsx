import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header } from './components/layout/Header'
import { Home } from './pages/Home'
import { AsyncioConcurrency } from './pages/AsyncioConcurrency'
import { AnimationPage } from './pages/AnimationPage'
import { PythonStreaming } from './pages/PythonStreaming'
import { StreamingAnimationPage } from './pages/StreamingAnimationPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-bg text-text">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles/python-asyncio" element={<AsyncioConcurrency />} />
            <Route path="/articles/python-asyncio/:step" element={<AnimationPage />} />
            <Route path="/articles/python-streaming" element={<PythonStreaming />} />
            <Route path="/articles/python-streaming/:step" element={<StreamingAnimationPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
