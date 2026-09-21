const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('scard',{
 start:o=>ipcRenderer.invoke('scrape:start',o), stop:()=>ipcRenderer.send('scrape:stop'),
 openChrome:m=>ipcRenderer.invoke('chrome:open',m), chromeStatus:m=>ipcRenderer.invoke('chrome:status',m),
 saveJSON:()=>ipcRenderer.invoke('export:json'), saveExcel:()=>ipcRenderer.invoke('export:xlsx'),
 upload:()=>ipcRenderer.invoke('upload:now'), settingsGet:()=>ipcRenderer.invoke('settings:get'),
 settingsSet:s=>ipcRenderer.invoke('settings:set',s), apiTest:s=>ipcRenderer.invoke('api:test',s),
 onLog:f=>ipcRenderer.on('log',(_,x)=>f(x)), onProgress:f=>ipcRenderer.on('progress',(_,x)=>f(x)),
 onProduct:f=>ipcRenderer.on('product',(_,x)=>f(x)), onSummary:f=>ipcRenderer.on('summary',(_,x)=>f(x))
});