// src/App.REFACTORED.jsx
// ⚡ IMPROVED VERSION WITH BETTER STRUCTURE

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

// Custom Hooks
import { usePortfolio } from './hooks/usePortfolio';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import PortfolioSection from './components/sections/PortfolioSection';
import ServicesSection from './components/sections/ServicesSection';
import ContactSection from './components/sections/ContactSection';
import AdminPanel from './components/admin/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';

// Utils
import { calculateTransportCost } from './utils/transportCalculator';
import { sendWhatsAppBooking } from './utils/whatsappFormatter';

// Styles
import './styles/animations.css';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default function ArusDigitalPortfolio() {
  // Auth State
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');

  // Portfolio Hook
  const {
    portfolioItems,
    loading: portfolioLoading,
    error: portfolioError,
    addPortfolioItem,
    deletePortfolioItem,
    searchPortfolio,
    filterByCategory
  } = usePortfolio(db, appId, user);

  // Booking State
  const [bookingData, setBookingData] = useState({
    service: 'Starter Stream',
    category: 'Esports Tournament',
    location: '',
    transportCost: null,
    transportInfo: null,
    hours: '',
    date: '',
    additionalNotes: ''
  });

  // Portfolio Filter/Search
  const [portfolioFilter, setPortfolioFilter] = useState('All');
  const [portfolioSearch, setPortfolioSearch] = useState('');

  // --- EFFECTS ---

  // Initialize Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth Error:', error);
        toast.error('Authentication failed');
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---

  // Admin Authentication
  const handleAdminLogin = (password) => {
    // TODO: Move this to environment variable
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'habibganteng';
    
    if (password === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      toast.success('Login Berhasil! Selamat datang Admin.');
      return true;
    } else {
      toast.error('Password Salah!');
      return false;
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    toast.success('Logout berhasil');
  };

  const handleAdminTrigger = () => {
    if (isAdminMode) {
      handleAdminLogout();
    } else {
      setShowAdminLogin(true);
    }
  };

  // Portfolio Management
  const handleAddPortfolio = async (itemData) => {
    try {
      await addPortfolioItem(itemData);
      toast.success('Portfolio Event Berhasil Ditambahkan!');
      return true;
    } catch (error) {
      toast.error('Gagal menambahkan portfolio');
      console.error(error);
      return false;
    }
  };

  const handleDeletePortfolio = async (itemId, itemTitle) => {
    if (!window.confirm(`Hapus "${itemTitle}" dari portfolio?`)) {
      return;
    }

    try {
      await deletePortfolioItem(itemId);
      toast.success('Portfolio berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus portfolio');
      console.error(error);
    }
  };

  // Booking Management
  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate transport when location changes
    if (field === 'location' && value.length > 2) {
      const transportInfo = calculateTransportCost(value);
      if (transportInfo) {
        setBookingData(prev => ({
          ...prev,
          transportCost: transportInfo.cost,
          transportInfo: transportInfo
        }));
      }
    }
  };

  const handleBookingSubmit = () => {
    // Validation
    if (!bookingData.location || !bookingData.date || !bookingData.hours) {
      toast.error('Mohon lengkapi data booking (Lokasi, Tanggal, Durasi)');
      return;
    }

    // Send to WhatsApp
    sendWhatsAppBooking(bookingData);
    
    toast.success('Membuka WhatsApp...');
  };

  // Get filtered/searched portfolio
  const getDisplayedPortfolio = () => {
    let items = portfolioItems;
    
    // Apply category filter
    if (portfolioFilter !== 'All') {
      items = filterByCategory(portfolioFilter);
    }
    
    // Apply search
    if (portfolioSearch) {
      items = searchPortfolio(portfolioSearch);
    }
    
    return items;
  };

  // --- RENDER ---

  const renderCurrentPage = () => {
    const pageProps = {
      setCurrentPage,
      portfolioItems: getDisplayedPortfolio(),
      portfolioLoading,
      portfolioError,
      portfolioFilter,
      setPortfolioFilter,
      portfolioSearch,
      setPortfolioSearch,
      isAdminMode,
      onDeletePortfolio: handleDeletePortfolio,
      bookingData,
      onBookingChange: handleBookingChange,
      onBookingSubmit: handleBookingSubmit
    };

    switch (currentPage) {
      case 'home':
        return <HeroSection {...pageProps} />;
      case 'about':
        return <AboutSection {...pageProps} />;
      case 'portfolio':
        return <PortfolioSection {...pageProps} />;
      case 'services':
        return <ServicesSection {...pageProps} />;
      case 'contact':
        return <ContactSection {...pageProps} />;
      default:
        return <HeroSection {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-white overflow-hidden flex flex-col font-space">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1f35',
            color: '#fff',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          },
          success: {
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Global Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
          .font-space { font-family: 'Space Grotesk', sans-serif; }
        `}
      </style>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent"></div>
      </div>

      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer
        onAdminTrigger={handleAdminTrigger}
        isAdminMode={isAdminMode}
      />

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Admin Panel */}
      {isAdminMode && (
        <AdminPanel
          onAddPortfolio={handleAddPortfolio}
          onClose={handleAdminLogout}
        />
      )}
    </div>
  );
}
