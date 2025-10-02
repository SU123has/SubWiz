import React from 'react'

interface SubtitleOverlayProps {
  subtitle: string
  isVisible: boolean
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ subtitle, isVisible }) => {
  if (!isVisible || !subtitle) return null

  return <div className="subtitle-overlay">{subtitle}</div>
}

export default SubtitleOverlay
