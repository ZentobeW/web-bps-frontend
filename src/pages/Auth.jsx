"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import  useAuth  from '../hooks/useAuth'
import { useNavigate } from "react-router-dom"

const Auth = () => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "", remember: false })
  const [registerData, setRegisterData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })
  const [loginMessage, setLoginMessage] = useState("")
  const [registerMessages, setRegisterMessages] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  // Refs for GSAP animations
  const cardContainerRef = useRef(null)
  const logoRef = useRef(null)
  const floatingElementsRef = useRef([])
  const navigate = useNavigate()
  const { loginAction, error, registerAction } = useAuth()

  // Check URL parameters for initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    if (tab === "register") {
      setIsFlipped(true)
    }

    // Clean URL
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
  }, [])

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline()

    // Initial setup
    gsap.set(cardContainerRef.current, { scale: 0.9, opacity: 0 })
    gsap.set(".form-group", { x: -20, opacity: 0 })
    gsap.set(".auth-button", { y: 15, opacity: 0 })
    gsap.set(".auth-switch", { y: 10, opacity: 0 })

    // Entrance animation sequence
    tl.to(cardContainerRef.current, {
      duration: 0.8,
      scale: 1,
      opacity: 1,
      ease: "power2.out",
    })
      .to(
        ".form-group",
        {
          duration: 0.5,
          x: 0,
          opacity: 1,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.4",
      )
      .to(
        ".auth-button",
        {
          duration: 0.5,
          y: 0,
          opacity: 1,
          ease: "power2.out",
        },
        "-=0.2",
      )
      .to(
        ".auth-switch",
        {
          duration: 0.4,
          y: 0,
          opacity: 1,
          ease: "power2.out",
        },
        "-=0.1",
      )

    // Logo floating animation
    gsap.to(logoRef.current, {
      duration: 4,
      y: -6,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    // Floating elements animation
    gsap.to(floatingElementsRef.current, {
      duration: 8,
      y: -12,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      stagger: 1.2,
    })
  }, [isFlipped])

  // Handle card flip animations
  const flipToRegister = () => {
    setIsFlipped(true)
    gsap.fromTo(
      ".register-form .form-group",
      { x: 30, opacity: 0 },
      {
        duration: 0.5,
        x: 0,
        opacity: 1,
        stagger: 0.06,
        delay: 0.4,
        ease: "power2.out",
      },
    )
  }

  const flipToLogin = () => {
    setIsFlipped(false)
    gsap.fromTo(
      ".login-form .form-group",
      { x: -30, opacity: 0 },
      {
        duration: 0.5,
        x: 0,
        opacity: 1,
        stagger: 0.06,
        delay: 0.4,
        ease: "power2.out",
      },
    )
  }

  // Handle input focus animations
  const handleInputFocus = (e) => {
    gsap.to(e.target.parentElement, {
      duration: 0.3,
      scale: 1.02,
      ease: "power2.out",
    })
  }

  const handleInputBlur = (e) => {
    gsap.to(e.target.parentElement, {
      duration: 0.3,
      scale: 1,
      ease: "power2.out",
    })
  }

  // Handle ripple effect
  const handleRipple = (e) => {
    const button = e.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.className = "absolute rounded-full bg-white/30 animate-ping pointer-events-none"

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoginLoading(true)
    setLoginMessage("")

    if (!loginData.username || !loginData.password) {
      setLoginMessage("Username dan password harus diisi!")
      setIsLoginLoading(false)
      return
    }

    try {
      await loginAction(loginData.username, loginData.password)
      setSuccessMessage("Login berhasil! Mengalihkan...")
      setTimeout(() => {
        navigate("/publications")
      }, 1000)
    } catch (err) {
      setLoginMessage(err.message || "Login gagal")
    } finally {
      setIsLoginLoading(false)
    }
  }

  // Handle register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setIsRegisterLoading(true)
    setRegisterMessages([])

    const errors = []
    if (registerData.password !== registerData.confirmPassword) {
      errors.push("Password dan konfirmasi password tidak cocok")
    }
    if (registerData.password.length < 8) {
      errors.push("Password minimal 8 karakter")
    }
    if (!registerData.terms) {
      errors.push("Anda harus menyetujui syarat dan ketentuan")
    }

    if (errors.length > 0) {
      setRegisterMessages(errors)
      setIsRegisterLoading(false)
      return
    }

    try {
      await registerAction(registerData.username, registerData.email, registerData.password)
      setSuccessMessage("Registrasi berhasil! Silakan login.")
      setTimeout(() => {
        flipToLogin()
      }, 1500)
    } catch {
      setRegisterMessages(["Terjadi kesalahan. Silakan coba lagi."])
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <div>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Circles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              ref={(el) => (floatingElementsRef.current[i] = el)}
              className={`absolute rounded-full bg-white/8 backdrop-blur-sm border border-white/10 animate-pulse ${
                i === 0
                  ? "w-20 h-20 top-10 left-10 animate-bounce"
                  : i === 1
                    ? "w-32 h-32 top-32 right-20"
                    : i === 2
                      ? "w-16 h-16 bottom-20 left-20"
                      : i === 3
                        ? "w-24 h-24 bottom-40 right-40"
                        : "w-36 h-36 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              }`}
              style={{
                animationDelay: `${i * 1000}ms`,
                animationDuration: i === 0 ? "2s" : "3s",
              }}
            />
          ))}

          {/* Geometric Shapes */}
          <div
            className="absolute top-20 left-16 w-0 h-0 animate-spin"
            style={{
              borderLeft: "25px solid transparent",
              borderRight: "25px solid transparent",
              borderBottom: "43px solid rgba(255, 255, 255, 0.05)",
              animationDuration: "30s",
            }}
          />
          <div
            className="absolute bottom-32 right-20 w-0 h-0 animate-spin"
            style={{
              borderLeft: "20px solid transparent",
              borderRight: "20px solid transparent",
              borderTop: "35px solid rgba(255, 255, 255, 0.05)",
              animationDuration: "25s",
              animationDelay: "10s",
            }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-0 h-0 animate-spin"
            style={{
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: "26px solid rgba(255, 255, 255, 0.05)",
              animationDuration: "20s",
              animationDelay: "5s",
            }}
          />

          {/* Animated Dots */}
          <div className="absolute top-20 right-10 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping" />
          <div className="absolute bottom-32 left-16 w-3 h-3 bg-cyan-300/40 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-20 w-1 h-1 bg-white/60 rounded-full animate-bounce" />
        </div>

        {/* Main Auth Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div ref={cardContainerRef} className="w-full max-w-md">
            <div
              className={`relative w-full transition-transform duration-700 ${isFlipped ? "transform" : ""}`}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* LOGIN SIDE */}
              <div className={`${isFlipped ? "hidden" : "block"}`}>
                <div className="bg-white/96 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                    style={{
                      background: "linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4, #3b82f6, #1e40af)",
                      backgroundSize: "300% 100%",
                    }}
                  />

                  {/* Header */}
                  <div className="text-center p-8 pb-6">
                    <div
                      ref={logoRef}
                      className="w-20 h-20 mx-auto mb-4 rounded-full p-3 shadow-lg relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                      }}
                    >
                      <img
                        src="/assets/images.png"
                        alt="Logo BPS Gorontalo"
                        className="w-full h-full object-contain relative z-10"
                      />
                      <div
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                        }}
                      />
                    </div>
                    <h1
                      className="text-2xl font-bold mb-2"
                      style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      BPS Gorontalo
                    </h1>
                    <p className="text-gray-600 text-sm font-medium">Sistem Informasi Statistik</p>
                  </div>

                  {/* Body */}
                  <div className="px-8 pb-8">
                    {/* Error dari context */}
                    {error && (
                      <div className="mb-6 p-4 text-white rounded-xl text-sm font-medium shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        }}>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLoginSubmit} className="login-form space-y-6">
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Masukkan username Anda"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Masukkan password Anda"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={loginData.remember}
                            onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                          />
                          <span className="text-gray-600 font-medium">Ingat saya</span>
                        </label>
                        <a href="#" className="text-blue-700 hover:text-blue-800 font-medium transition-colors">
                          Lupa password?
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoginLoading}
                        onClick={handleRipple}
                        className="auth-button w-full text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide focus:ring-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                          background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                          boxShadow: "0 10px 25px rgba(30, 64, 175, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow = "0 15px 35px rgba(30, 64, 175, 0.4)"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow = "0 10px 25px rgba(30, 64, 175, 0.3)"
                        }}
                      >
                        {isLoginLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Memproses...
                          </div>
                        ) : (
                          "Masuk"
                        )}
                      </button>
                    </form>
                                        {/* Demo Account Section */}
                    <div className="mt-6 p-4 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-blue-800 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Akun Demo
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Gratis
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                            </svg>
                            <span className="text-gray-700 font-medium">Email:</span>
                          </div>
                          <span className="text-blue-700 font-mono text-xs bg-blue-50 px-2 py-1 rounded select-all">
                            admin@example.com
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9Z" />
                            </svg>
                            <span className="text-gray-700 font-medium">Password:</span>
                          </div>
                          <span className="text-blue-700 font-mono text-xs bg-blue-50 px-2 py-1 rounded select-all">
                            password
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setLoginData({ username: "admin@example.com", password: "password", remember: false })
                        }}
                        className="w-full mt-3 text-blue-700 border border-blue-200 bg-white/80 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Gunakan Akun Demo
                      </button>
                    </div>

                    {/* Switch to Register */}
                    <div className="auth-switch text-center mt-6 pt-6 border-t border-blue-700/10">
                      <p className="text-gray-600 text-sm mb-3 font-medium">Belum memiliki akun?</p>
                      <button
                        type="button"
                        onClick={flipToRegister}
                        className="w-full border-2 border-blue-700 text-blue-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                          background: "linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "linear-gradient(135deg, #1e40af, #3b82f6)"
                          e.target.style.color = "white"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))"
                          e.target.style.color = "#1d4ed8"
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Daftar Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* REGISTER SIDE */}
              <div
                className={`${isFlipped ? "block" : "hidden"}`}
                style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
              >
                <div className="bg-white/96 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                    style={{
                      background: "linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4, #3b82f6, #1e40af)",
                      backgroundSize: "300% 100%",
                    }}
                  />

                  {/* Header */}
                  <div className="text-center p-8 pb-6">
                    <div
                      className="w-20 h-20 mx-auto mb-4 rounded-full p-3 shadow-lg relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                      }}
                    >
                      <img
                        src="/assets/images.png"
                        alt="Logo BPS Gorontalo"
                        className="w-full h-full object-contain relative z-10"
                      />
                      <div
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                        }}
                      />
                    </div>
                    <h1
                      className="text-2xl font-bold mb-2"
                      style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Daftar Akun
                    </h1>
                    <p className="text-gray-600 text-sm font-medium">Bergabung dengan BPS Gorontalo</p>
                  </div>

                  {/* Body */}
                  <div
                    className="px-8 pb-8 max-h-96 overflow-y-auto"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#1e40af #e5e7eb" }}
                  >
                    {/* Messages */}
                    {registerMessages.length > 0 && (
                      <div
                        className="mb-6 p-4 text-white rounded-xl text-sm font-medium shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        }}
                      >
                        {registerMessages.map((message, index) => (
                          <div key={index}>• {message}</div>
                        ))}
                      </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleRegisterSubmit} className="register-form space-y-4">
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={registerData.fullname}
                            onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Masukkan nama lengkap Anda"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Pilih username unik"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="contoh@email.com"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Minimal 8 karakter"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4"
                            style={{
                              borderColor: "rgba(30, 64, 175, 0.2)",
                              backgroundColor: "rgba(30, 64, 175, 0.05)",
                            }}
                            onFocus={(e) => {
                              handleInputFocus(e)
                              e.target.style.borderColor = "#1e40af"
                              e.target.style.backgroundColor = "white"
                              e.target.style.boxShadow =
                                "0 10px 25px rgba(30, 64, 175, 0.2), 0 0 0 4px rgba(30, 64, 175, 0.1)"
                            }}
                            onBlur={(e) => {
                              handleInputBlur(e)
                              e.target.style.borderColor = "rgba(30, 64, 175, 0.2)"
                              e.target.style.backgroundColor = "rgba(30, 64, 175, 0.05)"
                              e.target.style.boxShadow = "none"
                            }}
                            placeholder="Ulangi password Anda"
                            required
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 transition-all duration-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="flex items-start cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={registerData.terms}
                            onChange={(e) => setRegisterData({ ...registerData, terms: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 mr-3"
                            required
                          />
                          <span className="text-gray-600 font-medium">
                            Saya setuju dengan{" "}
                            <a href="#" className="text-blue-700 hover:text-blue-800 font-semibold">
                              Syarat & Ketentuan
                            </a>
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegisterLoading}
                        onClick={handleRipple}
                        className="auth-button w-full text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide focus:ring-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                          background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                          boxShadow: "0 10px 25px rgba(30, 64, 175, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow = "0 15px 35px rgba(30, 64, 175, 0.4)"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow = "0 10px 25px rgba(30, 64, 175, 0.3)"
                        }}
                      >
                        {isRegisterLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Memproses...
                          </div>
                        ) : (
                          "Daftar Akun"
                        )}
                      </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="auth-switch text-center mt-6 pt-6 border-t border-blue-700/10">
                      <p className="text-gray-600 text-sm mb-3 font-medium">Sudah memiliki akun?</p>
                      <button
                        type="button"
                        onClick={flipToLogin}
                        className="w-full border-2 border-blue-700 text-blue-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                          background: "linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "linear-gradient(135deg, #1e40af, #3b82f6)"
                          e.target.style.color = "white"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))"
                          e.target.style.color = "#1d4ed8"
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
                        </svg>
                        Masuk Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

export default Auth
