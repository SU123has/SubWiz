import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectVideoFile: () => string
      onUpdateProgress: (callback: (event, data) => void) => void
      removeAllListeners: (channel: string) => void
      path: {
        join: string
        basename: (filepath: string) => void
      }
      extractAudioChunk: (
        videoPath: string,
        startTime: number,
        duration: number
      ) => Promise<ArrayBuffer>
    }
  }
}
