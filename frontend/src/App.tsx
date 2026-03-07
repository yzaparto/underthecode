import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Home } from './pages/Home'
import { AsyncioConcurrency } from './pages/AsyncioConcurrency'
import { AnimationPage } from './pages/AnimationPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/python-asyncio" element={<AsyncioConcurrency />} />
          <Route path="/articles/python-asyncio/:step" element={<AnimationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
