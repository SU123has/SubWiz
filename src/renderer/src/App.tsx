import { useState, useEffect, useCallback } from 'react'
import { useVideoPlayer } from './hooks/useVideoPlayer'
import { useWhisperAPI } from './hooks/useWhisperAPI'
import VideoPlayer from './components/VideoPlayer'
import SubtitleOverlay from './components/SubtitleOverlay'
import ControlPanel from './components/ControlPanel'
import './App.css'

interface Subtitle {
  start: number
  end: number
  text: string
}

function App(): React.ReactElement {
  const [currentVideoPath, setCurrentVideoPath] = useState<string>('')
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [status, setStatus] = useState<string>('Ready - Select a video to begin')
  const [subtitleFetched, setSubtitleFetched] = useState(0)
  const [nextChunkStart, setNextChunkStart] = useState(0)
  const [isProcessingChunk, setIsProcessingChunk] = useState(false)

  const videoPlayer = useVideoPlayer()
  const whisperAPI = useWhisperAPI()

  // Handle file selection
  const handleSelectVideo = useCallback(async () => {
    const filePath = await window.api.selectVideoFile()
    if (filePath) {
      setCurrentVideoPath(filePath)
      videoPlayer.loadVideo(`file://${filePath}`)
      setStatus(`Loaded: ${window.api.path.basename(filePath)}`)
      setNextChunkStart(0)
      setSubtitleFetched(0)
      setIsProcessingChunk(false)
      // Clear previous subtitles
      setSubtitles([])
    }
  }, [videoPlayer])

  // Handle API connection
  const handleConnectAPI = useCallback(
    async (ngrokUrl: string) => {
      const connected = await whisperAPI.connect(ngrokUrl)
      if (connected) {
        setStatus('Connected to Whisper API ✓')
      } else {
        setStatus('Failed to connect to API ✗')
      }
    },
    [whisperAPI]
  )

  const processChunk = useCallback(async () => {
    if (!currentVideoPath || !whisperAPI.isConnected || isProcessingChunk) return
    if (nextChunkStart >= videoPlayer.duration) {
      return
    }

    setIsProcessingChunk(true)

    try {
      const audioBuffer = await window.api.extractAudioChunk(currentVideoPath, nextChunkStart, 20)
      const result = await whisperAPI.translateAudio(audioBuffer, nextChunkStart)

      if (result.success) {
        setSubtitles((prev) => [
          ...prev,
          ...result.segments.map((seg) => ({
            start: seg.start + nextChunkStart,
            end: seg.end + nextChunkStart,
            text: seg.text
          }))
        ])
        setSubtitleFetched(nextChunkStart)
        setNextChunkStart((prev) => prev + 20) // advance to next chunk
      } else {
        console.error('Translation failed:', result.error)
      }
    } catch (error) {
      console.error('Chunk processing error:', error)
    } finally {
      setIsProcessingChunk(false)
    }
  }, [currentVideoPath, whisperAPI, nextChunkStart, isProcessingChunk, videoPlayer.duration])

  // Real-time subtitle processing
  useEffect(() => {
    if (!isProcessingChunk) {
      processChunk()
    }
  }, [processChunk, isProcessingChunk])

  // Find current subtitle
  const currentSubtitle = subtitles.find(
    (sub) => videoPlayer.currentTime >= sub.start && videoPlayer.currentTime <= sub.end
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time Subtitle Translator</h1>
        <ControlPanel
          onSelectVideo={handleSelectVideo}
          onConnectAPI={handleConnectAPI}
          isAPIConnected={whisperAPI.isConnected}
          isTranslating={whisperAPI.isTranslating}
          subtitleFetched={subtitleFetched}
          totalDuration={videoPlayer.duration}
        />
      </header>

      <main className="app-main">
        <div className="video-container">
          <VideoPlayer
            videoRef={videoPlayer.videoRef}
            isLoaded={videoPlayer.isLoaded}
            error={videoPlayer.error}
          />

          <SubtitleOverlay subtitle={currentSubtitle?.text || ''} isVisible={!!currentSubtitle} />
        </div>

        <div className="status-bar">
          <span>{status}</span>
          <br />
          <span>
            {videoPlayer.isLoaded &&
              `${Math.floor(videoPlayer.currentTime)}s / ${Math.floor(videoPlayer.duration)}s`}
          </span>
        </div>
      </main>
    </div>
  )
}

export default App
