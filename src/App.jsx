// App.jsx
"use client"

import React, { useEffect, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import Layout from "./components/Layout"
import Gallery from "./pages/Gallery"
import AddPublication from "./pages/AddPublication"
import Auth from "./pages/Auth"
import PublicationList from "./pages/PublicationList"
import EditPublication from "./pages/EditPublication"
import ProtectedRoute from "./components/ProtectedRoute"
import { PageTransitionProvider } from "./context/PageTransitionContext"
import { useAuth } from "./hooks/useAuth"
import "./styles/custom.css"
import Header from "./components/Header"
import Footer from "./components/Footer"

const HomePage = () => {
  const { user } = useAuth()
  const userName = user?.name || "User"
  
  return (
    <Layout currentPage="home" userName={userName}>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary mb-6">Welcome to BPS Provinsi Gorontalo</h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          Selamat datang di sistem informasi Badan Pusat Statistik Provinsi Gorontalo. Akses data statistik
          terpercaya untuk pembangunan daerah yang berkelanjutan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-bps-accent rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-bps-blue mb-3">Publikasi Terbaru</h3>
            <p className="text-secondary">Akses publikasi statistik terkini dari BPS Gorontalo</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-700 mb-3">Data Statistik</h3>
            <p className="text-secondary">Temukan data statistik lengkap untuk berbagai sektor</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-purple-700 mb-3">Galeri Kegiatan</h3>
            <p className="text-secondary">Dokumentasi kegiatan dan program BPS Gorontalo</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function AppContent() {
  const location = useLocation()
  const { user, isInitialized } = useAuth()

  // Header dan Footer tidak muncul di halaman login/auth
  const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/auth"

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Redirect ke login jika belum login dan bukan di halaman auth
  if (!user && !hideHeaderFooter) {
    return <Navigate to="/login" replace />
  }

  return (
    <PageTransitionProvider>
      <div className="bg-gray-100 min-h-screen font-sans">
        {/* Header hanya muncul jika bukan halaman auth */}
        {!hideHeaderFooter && <Header />}
        
        <main className={hideHeaderFooter ? "" : "p-4 sm:p-6 lg:p-8"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route
              path="/publications"
              element={
                <ProtectedRoute>
                  <PublicationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/publications/add"
              element={
                <ProtectedRoute>
                  <AddPublication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/publications/edit/:id"
              element={
                <ProtectedRoute>
                  <EditPublication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tambah-publikasi"
              element={
                <ProtectedRoute>
                  <AddPublication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daftar-publikasi"
              element={
                <ProtectedRoute>
                  <PublicationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-publication/:id?"
              element={
                <ProtectedRoute>
                  <EditPublication />
                </ProtectedRoute>
              }
            />
            
            {/* Other Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/galeri-kegiatan" element={<Gallery />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer hanya muncul jika bukan halaman auth */}
        {!hideHeaderFooter && <Footer />}
      </div>
    </PageTransitionProvider>
  )
}

function App() {
  return <AppContent />
}

export default App