import { useState, useCallback } from 'react'

interface WhisperSegment {
  id: number
  start: number
  end: number
  text: string
}

interface WhisperResponse {
  success: boolean
  segments: WhisperSegment[]
  detected_language?: string
  error?: string
}

interface UseWhisperAPIReturn {
  isConnected: boolean
  isTranslating: boolean
  connect: (ngrokUrl: string) => Promise<boolean>
  translateAudio: (audioBuffer: ArrayBuffer, startTime: number) => Promise<WhisperResponse>
  testConnection: () => Promise<boolean>
}

export const useWhisperAPI = (): UseWhisperAPIReturn => {
  const [ngrokUrl, setNgrokUrl] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!ngrokUrl) return false

    try {
      const response = await fetch(`${ngrokUrl}/health`)
      const data = await response.json()
      return data.status === 'healthy'
    } catch {
      return false
    }
  }, [ngrokUrl])

  const connect = useCallback(async (url: string): Promise<boolean> => {
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
    console.log('Health URL:', `${cleanUrl}/health`)
    setNgrokUrl(cleanUrl)

    try {
      const response = await fetch(`${cleanUrl}/health`, {
        headers: {
          'ngrok-skip-browser-warning': '1' // arbitrary value
        }
      })
      console.log('Status:', response.status, response.statusText)

      const text = await response.text()
      console.log('Raw response body:', text)

      // Only parse JSON if status is OK
      if (!response.ok) {
        console.error('Non-OK HTTP status:', response.status)
        setIsConnected(false)
        return false
      }

      // Attempt JSON parse
      let data: any
      try {
        data = JSON.parse(text)
      } catch (err) {
        console.error('JSON parse error:', err)
        setIsConnected(false)
        return false
      }

      console.log('Parsed JSON:', data)
      if (data.status === 'healthy') {
        setIsConnected(true)
        return true
      }
      return false
    } catch (err) {
      console.error('Fetch error:', err)
      setIsConnected(false)
      return false
    }
  }, [])

  const translateAudio = useCallback(
    async (audioBuffer: ArrayBuffer, startTime: number): Promise<WhisperResponse> => {
      if (!isConnected) {
        throw new Error('Not connected to Whisper API')
      }

      setIsTranslating(true)

      try {
        const formData = new FormData()
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
        formData.append('audio', audioBlob, `chunk_${startTime}.wav`)
        formData.append('start_time', startTime.toString())

        const response = await fetch(`${ngrokUrl}/translate`, {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        return result
      } catch (error) {
        return {
          success: false,
          segments: [],
          error: error instanceof Error ? error.message : 'Translation failed'
        }
      } finally {
        setIsTranslating(false)
      }
    },
    [ngrokUrl, isConnected]
  )

  return {
    isConnected,
    isTranslating,
    connect,
    translateAudio,
    testConnection
  }
}
