import React from 'react'

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isLoaded: boolean
  error: string | null
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoRef, error }) => {
  return (
    <div className="video-player">
      {error ? (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          className="video-element"
          style={{ width: '100%', height: '100%' }}
        >
          <track kind="subtitles" srcLang="en" label="Translated" default />
        </video>
      )}
    </div>
  )
}

export default VideoPlayer
