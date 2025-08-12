const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  shoot: (urls) => ipcRenderer.invoke('shoot', urls),
  openScreens: () => ipcRenderer.invoke('openScreens'),
  openLogs: () => ipcRenderer.invoke('openLogs'),
  checkUpdates: () => ipcRenderer.invoke('checkUpdates'),
  importUrls: () => ipcRenderer.invoke('importUrls'),
  importFromPath: (p) => ipcRenderer.invoke('importFromPath', p),
  exportUrls: (text) => ipcRenderer.invoke('exportUrls', text),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
  onProgress: (callback) => {
    const listener = (_evt, data) => callback(data);
    ipcRenderer.on('progress', listener);
    return () => ipcRenderer.removeListener('progress', listener);
  }
});
