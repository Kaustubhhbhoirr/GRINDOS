const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProblems: () => ipcRenderer.invoke('get-problems'),
  saveProblems: (problems) => ipcRenderer.invoke('save-problems', problems),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
