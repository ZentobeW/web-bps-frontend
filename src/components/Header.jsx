"use client"

import { useState, useEffect, useRef } from "react"
import { usePageTransition } from "../context/PageTransitionContext"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const navItems = [
  { id: "publications", label: "Daftar Publikasi", path: "/publications" },
  { id: "add", label: "Tambah Publikasi", path: "/publications/add" },
]

function BpsLogo() {
  return (
    <img
      src="https://res.cloudinary.com/djcm0swgo/image/upload/v1751775675/bps-logo_1_ldppzk.png"
      alt="BPS Logo"
      className="h-12 w-12"
    />
  )
}

const Header = ({ currentPage = "home" }) => {
  // PANGGIL SEMUA HOOK DI ATAS - ALWAYS CALL HOOKS FIRST
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const { slideUp, slideDown } = usePageTransition()
  const location = useLocation()
  const { user, logoutAction, loading } = useAuth()

  // Get userName directly from AuthContext user object
  const userName = user?.name || "User"

  // CONDITIONAL LOGIC AFTER ALL HOOKS
  const shouldHideHeader = location.pathname === "/login" || location.pathname === "/auth"

  const handleNavigation = (e, href, page, direction = "up") => {
    if (currentPage === page || href === "#") return
    e.preventDefault()
    if (direction === "up") {
      slideUp(href)
    } else {
      slideDown(href)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutAction()
      // Navigation akan ditangani oleh routing guard atau parent component
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleMobileMenu = (e) => {
    e.stopPropagation()
    setIsMobileMenuOpen(!isMobileMenuOpen)
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : ""
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
        document.body.style.overflow = ""
      }
    }

    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        document.body.style.overflow = ""
      }
    }

    document.addEventListener("click", handleClickOutside)
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      window.removeEventListener("resize", handleResize)
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  // Debug log to track user changes
  useEffect(() => {
    console.log("Header - User changed:", user)
  }, [user])

  // RETURN NULL AFTER ALL HOOKS HAVE BEEN CALLED
  if (shouldHideHeader) {
    return null
  }

  return (
    <>
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => {
          setIsMobileMenuOpen(false)
          document.body.style.overflow = ""
        }}
      />

      <header ref={headerRef} className="fixed top-0 left-0 right-0 h-20 bg-gradient-header z-50 shadow-header">
        <div className="flex items-center justify-between h-full px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Logo Container */}
          <div className="flex items-center">
            <div className="relative w-14 h-14 mr-4 rounded-xl overflow-hidden bg-white shadow-logo flex items-center justify-center">
              <BpsLogo />
              <div className="absolute w-full h-full bg-gradient-radial animate-pulse-custom z-0"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-poppins font-bold text-lg md:text-xl lg:text-2xl m-0 tracking-wide text-shadow leading-tight">
                BPS PROVINSI GORONTALO
              </h1>
              <span className="text-white text-opacity-90 text-xs font-medium tracking-widest hidden md:block">
                Badan Pusat Statistik
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden w-12 h-12 relative cursor-pointer z-50 text-white bg-transparent border-none rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 focus-ring ${
              isMobileMenuOpen ? "hamburger-active" : ""
            }`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="flex flex-col justify-center items-center space-y-1">
              <span className="hamburger-line block w-6 h-0.5 bg-white rounded-full"></span>
              <span className="hamburger-line block w-6 h-0.5 bg-white rounded-full"></span>
              <span className="hamburger-line block w-6 h-0.5 bg-white rounded-full"></span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex h-full items-center">
            <ul className="flex h-full m-0 p-0 list-none items-center">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.id === "add" && location.pathname.startsWith("/publications/add")) ||
                  (item.id === "publications" && location.pathname === "/publications")
                
                return (
                  <li key={item.id} className="h-full flex items-center">
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 border border-transparent cursor-pointer ${
                        isActive
                          ? "bg-white text-sky-900 shadow-md font-bold"
                          : "text-sky-100 hover:bg-sky-700 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
              
              {/* Logout Button */}
              <li className="h-full flex items-center">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-3 py-2 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer shadow-sm"
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </li>
              
              {/* User Info */}
              <li className="h-full flex items-center">
                <div className="user-section flex flex-col items-end">
                  <span className="user-welcome">Welcome,</span>
                  <span className="user-name" title={`Current user: ${userName}`}>
                    {userName}
                  </span>
                </div>
              </li>
            </ul>
          </nav>

          {/* Mobile Navigation */}
          <nav className={`mobile-menu md:hidden ${isMobileMenuOpen ? "active" : ""}`}>
            <div className="px-6 pb-4">
              <div className="user-section flex flex-col items-center text-center">
                <span className="user-welcome">Welcome,</span>
                <span className="user-name" title={`Current user: ${userName}`}>
                  {userName}
                </span>
              </div>
            </div>

            <ul className="flex flex-col m-0 p-0 list-none">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.id === "add" && location.pathname.startsWith("/publications/add")) ||
                  (item.id === "publications" && location.pathname === "/publications")
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        document.body.style.overflow = ""
                      }}
                      className={`mobile-nav-link flex items-center justify-between px-8 py-4 text-white no-underline font-inter font-medium text-base ${
                        isActive ? "active" : ""
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* Mobile Logout Button */}
              <li className="mt-4 px-8">
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                    document.body.style.overflow = ""
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg bg-red-500 bg-opacity-20 text-red-200 font-inter font-medium text-base transition-all duration-300 border-none cursor-pointer hover:bg-red-500 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Header