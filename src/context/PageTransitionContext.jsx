"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

const PageTransitionContext = createContext()

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider")
  }
  return context
}

// Built-in overlay component
const TransitionOverlay = ({ 
  showProgressBar = true, 
  progressBarColor = "#3b82f6",
  overlayColor = "#000000",
  overlayOpacity = 0.3,
  customLoader = null 
}) => {
  const { isTransitioning, direction, phase, progress } = usePageTransition()

  if (!isTransitioning) return null

  const getTransformStyle = () => {
    const transforms = {
      up: phase === "entering" ? "translateY(100%)" : "translateY(-100%)",
      down: phase === "entering" ? "translateY(-100%)" : "translateY(100%)",
      left: phase === "entering" ? "translateX(100%)" : "translateX(-100%)",
      right: phase === "entering" ? "translateX(-100%)" : "translateX(100%)",
    }

    return {
      transform: transforms[direction] || "translate(0, 0)",
      transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
          ...getTransformStyle(),
        }}
      >
        {customLoader || (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm opacity-75">Loading...</p>
          </div>
        )}
      </div>

      {showProgressBar && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden z-50">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: progressBarColor,
              boxShadow: `0 0 10px ${progressBarColor}`,
            }}
          />
        </div>
      )}
    </>
  )
}

export const PageTransitionProvider = ({ children, overlayProps = {} }) => {
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    direction: "up",
    phase: "idle",
    progress: 0,
  })

  const timeoutRefs = useRef([])
  const isNavigatingRef = useRef(false)

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  const addTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(callback, delay)
    timeoutRefs.current.push(timeoutId)
    return timeoutId
  }, [])

  const updateProgress = useCallback((progress) => {
    setTransitionState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  const navigateWithTransition = useCallback((href, direction = "up", options = {}) => {
    if (isNavigatingRef.current) {
      return Promise.reject(new Error("Navigation already in progress"))
    }

    const { duration = 600, preload = true, onStart, onComplete, onError } = options

    return new Promise((resolve, reject) => {
      try {
        isNavigatingRef.current = true
        clearTimeouts()

        if (preload && typeof document !== 'undefined') {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = href
          document.head.appendChild(link)
        }

        onStart?.()

        setTransitionState({
          isTransitioning: true,
          direction,
          phase: "entering",
          progress: 0,
        })

        // Animate progress smoothly
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          currentProgress += 2
          updateProgress(currentProgress)
          if (currentProgress >= 40) {
            clearInterval(progressInterval)
          }
        }, 16)

        addTimeout(() => {
          updateProgress(50)
          
          if (typeof window !== 'undefined') {
            if (window.next && window.next.router) {
              window.next.router.push(href)
            } else {
              window.location.href = href
            }
          }
        }, duration * 0.4)

        addTimeout(() => {
          setTransitionState(prev => ({ ...prev, phase: "exiting" }))
          updateProgress(70)
        }, duration * 0.5)

        addTimeout(() => {
          updateProgress(100)
          
          addTimeout(() => {
            setTransitionState({
              isTransitioning: false,
              direction: "up",
              phase: "idle",
              progress: 0,
            })
            
            isNavigatingRef.current = false
            onComplete?.()
            resolve()
          }, 100)
        }, duration)

      } catch (error) {
        isNavigatingRef.current = false
        onError?.(error)
        reject(error)
      }
    })
  }, [clearTimeouts, addTimeout, updateProgress])

  const slideUp = useCallback((href, options) => {
    return navigateWithTransition(href, "up", options)
  }, [navigateWithTransition])

  const slideDown = useCallback((href, options) => {
    return navigateWithTransition(href, "down", options)
  }, [navigateWithTransition])

  const slideLeft = useCallback((href, options) => {
    return navigateWithTransition(href, "left", options)
  }, [navigateWithTransition])

  const slideRight = useCallback((href, options) => {
    return navigateWithTransition(href, "right", options)
  }, [navigateWithTransition])

  const cancelTransition = useCallback(() => {
    if (isNavigatingRef.current) {
      clearTimeouts()
      isNavigatingRef.current = false
      
      setTransitionState({
        isTransitioning: false,
        direction: "up",
        phase: "idle",
        progress: 0,
      })
    }
  }, [clearTimeouts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
      isNavigatingRef.current = false
    }
  }, [clearTimeouts])

  return (
    <PageTransitionContext.Provider
      value={{
        ...transitionState,
        navigateWithTransition,
        slideUp,
        slideDown,
        slideLeft,
        slideRight,
        cancelTransition,
        isNavigating: isNavigatingRef.current,
      }}
    >
      {children}
      <TransitionOverlay {...overlayProps} />
    </PageTransitionContext.Provider>
  )
}