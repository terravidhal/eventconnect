import { Routes, Route } from 'react-router-dom'
import LandingPage from './landing/LandingPage'

function AboutPage() {
  return <div className="space-y-2"><h2 className="text-2xl font-semibold">À propos</h2></div>
}

function ContactPage() {
  return <div className="space-y-2"><h2 className="text-2xl font-semibold">Contact</h2></div>
}

export default function HomePageRoutes() {
  return (
    <Routes>
      <Route path="" element={<LandingPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
    </Routes>
  )
} 