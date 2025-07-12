"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export const usePageTransition = (defaultOptions = {}) => {
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    direction: "up",
    phase: "idle",
    progress: 0,
  })

  const timeoutRefs = useRef([])
  const isNavigatingRef = useRef(false)

  const {
    duration = 600,
    preload = true,
    showOverlay = true,
    overlayColor = "#000000",
    overlayOpacity = 0.3,
    showProgressBar = true,
    progressBarColor = "#3b82f6",
  } = defaultOptions

  const cleanup = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  const startTransition = useCallback((callback, options = {}) => {
    if (isNavigatingRef.current) {
      return Promise.reject(new Error("Transition already in progress"))
    }

    const transitionOptions = { ...defaultOptions, ...options }
    const {
      duration: transitionDuration = duration,
      direction = "up",
      onStart,
      onComplete,
      onError
    } = transitionOptions

    return new Promise((resolve, reject) => {
      try {
        isNavigatingRef.current = true
        cleanup()

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
          setTransitionState(prev => ({ ...prev, progress: currentProgress }))
          if (currentProgress >= 40) {
            clearInterval(progressInterval)
          }
        }, 16)

        const timeout1 = setTimeout(() => {
          setTransitionState(prev => ({ ...prev, progress: 50 }))
          
          setTimeout(() => {
            if (callback) callback()
          }, 50)
        }, transitionDuration * 0.4)
        timeoutRefs.current.push(timeout1)

        const timeout2 = setTimeout(() => {
          setTransitionState(prev => ({
            ...prev,
            phase: "exiting",
            progress: 70,
          }))
        }, transitionDuration * 0.5)
        timeoutRefs.current.push(timeout2)

        const timeout3 = setTimeout(() => {
          setTransitionState(prev => ({ ...prev, progress: 100 }))
          
          setTimeout(() => {
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
        }, transitionDuration)
        timeoutRefs.current.push(timeout3)

      } catch (error) {
        isNavigatingRef.current = false
        onError?.(error)
        reject(error)
      }
    })
  }, [defaultOptions, duration, cleanup])

  const navigateWithTransition = useCallback((href, options = {}) => {
    const { preload: shouldPreload = preload, ...restOptions } = options

    if (shouldPreload && typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    }

    return startTransition(() => {
      if (typeof window !== 'undefined') {
        if (window.next && window.next.router) {
          window.next.router.push(href)
        } else {
          window.location.href = href
        }
      }
    }, restOptions)
  }, [startTransition, preload])

  const slideUp = useCallback((href, options) => {
    return navigateWithTransition(href, { ...options, direction: "up" })
  }, [navigateWithTransition])

  const slideDown = useCallback((href, options) => {
    return navigateWithTransition(href, { ...options, direction: "down" })
  }, [navigateWithTransition])

  const slideLeft = useCallback((href, options) => {
    return navigateWithTransition(href, { ...options, direction: "left" })
  }, [navigateWithTransition])

  const slideRight = useCallback((href, options) => {
    return navigateWithTransition(href, { ...options, direction: "right" })
  }, [navigateWithTransition])

  const cancelTransition = useCallback(() => {
    if (isNavigatingRef.current) {
      cleanup()
      isNavigatingRef.current = false
      
      setTransitionState({
        isTransitioning: false,
        direction: "up",
        phase: "idle",
        progress: 0,
      })
    }
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      isNavigatingRef.current = false
    }
  }, [cleanup])

  // Built-in overlay component
  const TransitionOverlay = () => {
    if (!showOverlay || !transitionState.isTransitioning) return null

    const getTransformStyle = () => {
      const transforms = {
        up: transitionState.phase === "entering" ? "translateY(100%)" : "translateY(-100%)",
        down: transitionState.phase === "entering" ? "translateY(-100%)" : "translateY(100%)",
        left: transitionState.phase === "entering" ? "translateX(100%)" : "translateX(-100%)",
        right: transitionState.phase === "entering" ? "translateX(-100%)" : "translateX(100%)",
      }

      return {
        transform: transforms[transitionState.direction] || "translate(0, 0)",
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
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm opacity-75">Loading...</p>
          </div>
        </div>

        {showProgressBar && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden z-50">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${transitionState.progress}%`,
                backgroundColor: progressBarColor,
                boxShadow: `0 0 10px ${progressBarColor}`,
              }}
            />
          </div>
        )}
      </>
    )
  }

  return {
    ...transitionState,
    isNavigating: isNavigatingRef.current,
    startTransition,
    navigateWithTransition,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    cancelTransition,
    TransitionOverlay, // Built-in overlay component
  }
}