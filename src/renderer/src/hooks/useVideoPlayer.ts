import { useState, useRef, useEffect, useCallback } from 'react'

interface VideoState {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  error: string | null
}

interface UseVideoPlayerReturn extends VideoState {
  videoRef: React.RefObject<HTMLVideoElement | null>
  play: () => void
  pause: () => void
  seek: (time: number) => void
  loadVideo: (src: string) => void
}

export const useVideoPlayer = (): UseVideoPlayerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    error: null
  })

  // Update current time periodically
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = (): void => {
      setState((prev) => ({ ...prev, currentTime: video.currentTime }))
    }

    const handleLoadedMetadata = (): void => {
      setState((prev) => ({
        ...prev,
        duration: video.duration,
        isLoaded: true,
        error: null
      }))
    }

    const handleError = (): void => {
      setState((prev) => ({
        ...prev,
        error: 'Failed to load video',
        isLoaded: false
      }))
    }

    const handlePlay = (): void => setState((prev) => ({ ...prev, isPlaying: true }))
    const handlePause = (): void => setState((prev) => ({ ...prev, isPlaying: false }))

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  const play = useCallback(() => {
    videoRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  const loadVideo = useCallback((src: string) => {
    if (videoRef.current) {
      videoRef.current.src = src
      setState((prev) => ({ ...prev, isLoaded: false, error: null }))
    }
  }, [])

  return {
    ...state,
    videoRef,
    play,
    pause,
    seek,
    loadVideo
  }
}
