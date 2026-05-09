const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not just functions
});
contextBridge.exposeInMainWorld('electronApi', {
  onSetCountdownStartTime: (callback) => ipcRenderer.on('set-countdown-start-time', (_event, value) => callback(value)),
  onSetCountdownRemainingTime: (callback) => ipcRenderer.on('set-countdown-remaining-time', (_event, value) => callback(value)),
  onStartCountdown: (callback) => ipcRenderer.on('start-countdown', (_event) => callback()),
  onStopCountdown: (callback) => ipcRenderer.on('stop-countdown', (_event) => callback())
});
