import { contextBridge, ipcRenderer } from 'electron'
import path from 'path'

// Custom APIs for renderer
const api = {
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),

  onUpdateProgress: (callback: (event, data) => void) => {
    ipcRenderer.on('update-progress', callback)
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },

  path: {
    join: (...paths: string[]) => path.join(...paths),
    basename: (filepath: string) => path.basename(filepath)
  },

  extractAudioChunk: (videoPath: string, startTime: number, duration: number) =>
    ipcRenderer.invoke('extract-audio-chunk', { videoPath, startTime, duration })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
