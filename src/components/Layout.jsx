"use client"

import { useEffect, useCallback, useMemo } from "react"
import Header from "./Header"
import PageTransition from "./PageTransition"
import { usePageTransition } from "../context/PageTransitionContext"

const Layout = ({ 
  children, 
  currentPage = "home", 
  onLogout, 
  userName = "Admin",
  transitionTheme = "blue",
  showTransitionLogo = true,
  customTransitionContent = null,
  pageTitle = null
}) => {
  const { 
    isTransitioning, 
    direction, 
    phase, 
    progress, 
    slideUp, 
    isNavigating 
  } = usePageTransition()

  // Memoize page configurations for better performance
  const pageConfig = useMemo(() => {
    const configs = {
      home: { title: "Dashboard", theme: "blue" },
      data: { title: "Data Statistik", theme: "green" },
      reports: { title: "Laporan", theme: "purple" },
      settings: { title: "Pengaturan", theme: "gradient" },
      profile: { title: "Profil", theme: "blue" }
    }
    return configs[currentPage] || { title: pageTitle || "BPS Gorontalo", theme: transitionTheme }
  }, [currentPage, pageTitle, transitionTheme])

  // Enhanced logout handler with better user feedback
  const handleLogout = useCallback(async () => {
    try {
      // Show transition immediately for better UX
      await slideUp('/auth', {
        duration: 800,
        onStart: () => {
          // Optional: Show logout message
          console.log('Logging out...')
        },
        onComplete: () => {
          // Clear authentication data after transition starts
          try {
            localStorage.removeItem('authToken')
            sessionStorage.clear()
          } catch (error) {
            console.warn('Storage cleanup failed:', error)
          }
          
          // Perform logout callback
          if (onLogout) {
            onLogout()
          }
        }
      })
    } catch (error) {
      console.error('Logout transition failed:', error)
      // Fallback: direct logout without transition
      if (onLogout) {
        onLogout()
      }
    }
  }, [slideUp, onLogout])

  // Enhanced footer positioning with better performance
  const fixFooterDisplay = useCallback(() => {
    const body = document.body
    const html = document.documentElement
    const footer = document.querySelector("footer")

    if (!footer) return

    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    )
    const viewportHeight = window.innerHeight

    if (docHeight <= viewportHeight) {
      body.style.minHeight = "100vh"
      body.style.display = "flex"
      body.style.flexDirection = "column"
    } else {
      body.style.minHeight = ""
      body.style.display = ""
      body.style.flexDirection = ""
    }
  }, [])

  // Footer positioning with optimized event handling
  useEffect(() => {
    fixFooterDisplay()

    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(window.resizeTimeout)
      window.resizeTimeout = setTimeout(fixFooterDisplay, 100)
    }

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        clearTimeout(window.wheelTimeout)
        window.wheelTimeout = setTimeout(fixFooterDisplay, 100)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("wheel", handleWheel, { passive: true })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("wheel", handleWheel)
      clearTimeout(window.resizeTimeout)
      clearTimeout(window.wheelTimeout)
    }
  }, [fixFooterDisplay])

  // Update document title based on current page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${pageConfig.title} - BPS Provinsi Gorontalo`
    }
  }, [pageConfig.title])

  // Disable scrolling during transitions
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isTransitioning) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }, [isTransitioning])

  return (
    <div className={`min-h-screen flex flex-col font-inter bg-bps-blue-bg pt-20 transition-all duration-300 ${
      isTransitioning ? 'select-none' : ''
    }`}>
      {/* Enhanced Header with transition state */}
      <Header 
        currentPage={currentPage} 
        onLogout={handleLogout} 
        userName={userName}
        isNavigating={isNavigating}
        className={`transition-all duration-300 ${isTransitioning ? 'pointer-events-none' : ''}`}
      />
      
      {/* Main Content with enhanced animations */}
      <main className={`flex-1 p-6 lg:p-8 mx-auto max-w-7xl w-full relative z-10 transition-all duration-500 ${
        isTransitioning ? 'opacity-90 scale-[0.98]' : 'opacity-100 scale-100'
      }`}>
        <div className={`bg-white rounded-2xl shadow-card p-6 lg:p-8 min-h-96 transition-all duration-300 ${
          isTransitioning ? 'pointer-events-none' : ''
        }`}>
          {children}
        </div>
      </main>
      
      {/* Enhanced Page Transition */}
      <PageTransition 
        isTransitioning={isTransitioning} 
        direction={direction} 
        phase={phase} 
        progress={progress}
        duration={600}
        theme={pageConfig.theme}
        showLogo={showTransitionLogo}
        showProgress={true}
        showDirectionIndicator={true}
        customContent={customTransitionContent}
      />

      {/* Loading States Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        /* Smooth transitions for all interactive elements */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Prevent text selection during transitions */
        .select-none {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </div>
  )
}

export default Layout