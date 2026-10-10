import { useState, useEffect } from 'react'
import { useDemo } from '@/context/DemoContext'

export function useIsMobile() {
  const { settings } = useDemo()
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isWindowMobile = windowWidth < 768
  const isPhonePreview = Boolean(settings.phonePreview) && !isWindowMobile
  const isMobile = isWindowMobile || Boolean(settings.phonePreview)

  return {
    isMobile,
    isPhonePreview,
    isWindowMobile,
    windowWidth,
  }
}
