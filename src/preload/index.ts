// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  compileLaTeX: async (content: string) => {
    return await ipcRenderer.invoke('compile-latex', content);
  }
});

// 添加类型声明
declare global {
  interface Window {
    electronAPI: {
      compileLaTeX: (content: string) => Promise<{
        success: boolean;
        pdfPath?: string;
        error?: string;
      }>;
    };
  }
}
