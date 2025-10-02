import React, { useState } from 'react'

interface ControlPanelProps {
  onSelectVideo: () => void
  onConnectAPI: (url: string) => void
  isAPIConnected: boolean
  isTranslating: boolean
  subtitleFetched: number
  totalDuration: number
  exportToSRT: () => void
  currentVideoPath: string
  isConnected: boolean
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSelectVideo,
  onConnectAPI,
  isAPIConnected,
  isTranslating,
  subtitleFetched,
  totalDuration,
  exportToSRT,
  currentVideoPath,
  isConnected
}) => {
  const [ngrokUrl, setNgrokUrl] = useState('')

  const handleConnect = (): void => {
    if (ngrokUrl.trim()) {
      onConnectAPI(ngrokUrl.trim())
    }
  }
  console.log(currentVideoPath, subtitleFetched, totalDuration)

  return (
    <div className="control-panel">
      <button onClick={onSelectVideo}>Select Video File</button>

      <input
        type="text"
        value={ngrokUrl}
        onChange={(e) => setNgrokUrl(e.target.value)}
        placeholder="Enter your Colab ngrok URL"
        className="ngrok-input"
      />

      <button
        onClick={handleConnect}
        disabled={!ngrokUrl.trim()}
        className={isAPIConnected ? 'connected' : ''}
      >
        {isAPIConnected ? 'Connected ✓' : 'Connect to API'}
      </button>

      {isTranslating && (
        <span className="translating-indicator">
          {Math.floor((subtitleFetched / totalDuration) * 100)}% fetched
        </span>
      )}
      {currentVideoPath && isConnected && !isTranslating && (
        <button onClick={exportToSRT}>Download SRT file</button>
      )}
    </div>
  )
}

export default ControlPanel
