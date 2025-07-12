"use client"

import { useEffect, useState, useCallback } from "react"

const PageTransition = ({ isTransitioning, direction, phase, duration = 300 }) => {
  const [animationClass, setAnimationClass] = useState("")
  const [contentClass, setContentClass] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const resetAnimation = useCallback(() => {
    setAnimationClass("")
    setContentClass("")
    setIsVisible(false)
  }, [])

  useEffect(() => {
    if (!isTransitioning) {
      resetAnimation()
      return
    }

    setIsVisible(true)

    if (phase === "entering") {
      // Slide in animation
      if (direction === "up") {
        setAnimationClass("animate-slide-up")
        setContentClass("animate-content-slide-up")
      } else {
        setAnimationClass("animate-slide-down")
        setContentClass("animate-content-slide-down")
      }
    } else if (phase === "exiting") {
      // Slide out animation
      if (direction === "up") {
        setAnimationClass("animate-slide-out-up")
        setContentClass("animate-content-fade-out")
      } else {
        setAnimationClass("animate-slide-out-down")
        setContentClass("animate-content-fade-out")
      }
    }
  }, [isTransitioning, direction, phase, resetAnimation])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center transition-all duration-${duration} ${animationClass}`}
      style={{ 
        animationDuration: `${duration}ms`,
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`text-center text-white transition-all duration-${duration} ${contentClass}`}>
        {/* Logo/Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg 
              className="w-8 h-8 text-white animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">
          BPS PROVINSI GORONTALO
        </h1>
        
        {/* Subtitle */}
        <p className="text-blue-100 text-sm md:text-base mb-6 opacity-90">
          Badan Pusat Statistik
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1 mb-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center">
          <div className={`transform transition-transform duration-300 ${direction === 'up' ? 'rotate-0' : 'rotate-180'}`}>
            <svg 
              className="w-6 h-6 text-white/70 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 11l5-5m0 0l5 5m-5-5v12" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOutUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes contentSlideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes contentSlideDown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes contentFadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        .animate-slide-up {
          animation: slideUp ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-down {
          animation: slideDown ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-out-up {
          animation: slideOutUp ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-out-down {
          animation: slideOutDown ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-content-slide-up {
          animation: contentSlideUp ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) 100ms;
        }

        .animate-content-slide-down {
          animation: contentSlideDown ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) 100ms;
        }

        .animate-content-fade-out {
          animation: contentFadeOut ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

export default PageTransition