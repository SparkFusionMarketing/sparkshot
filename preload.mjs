import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('api', {
  shoot: (urls) => ipcRenderer.invoke('shoot', urls),
  openScreens: () => ipcRenderer.invoke('openScreens')
});
