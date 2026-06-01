import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'

// Pages publiques
import Home from './pages/public/Home'
import Events from './pages/public/Events'
import Suggestions from './pages/public/Suggestions'
import Gallery from './pages/public/Gallery'
import Contact from './pages/public/Contact'

// Pages admin
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminGallery from './pages/admin/AdminGallery'
import AdminEvents from './pages/admin/AdminEvents'
import AdminMessages from './pages/admin/AdminMessages'
import AdminPartners from './pages/admin/AdminPartners'

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F2]">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/evenements" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/suggestions" element={<PublicLayout><Suggestions /></PublicLayout>} />
        <Route path="/galerie" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Connexion admin */}
        <Route path="/admin/login" element={<Login />} />

        {/* Pages admin protégées */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/galerie" element={<AdminRoute><AdminGallery /></AdminRoute>} />
        <Route path="/admin/evenements" element={<AdminRoute><AdminEvents /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
        <Route path="/admin/partenaires" element={<AdminRoute><AdminPartners /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
              <h1 className="text-[#1E3A8A] text-8xl tracking-widest mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>404</h1>
              <p className="text-[#4A5580] text-xl mb-8">Cette page n'existe pas.</p>
              <a href="/" className="bg-[#1E3A8A] text-white px-6 py-3 rounded-lg hover:bg-[#2B52C8] transition-colors cursor-pointer">
                Retour à l'accueil
              </a>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
