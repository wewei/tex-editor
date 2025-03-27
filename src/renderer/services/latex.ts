import { ipcRenderer } from 'electron';

export interface CompileResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
}

export const compileLaTeX = async (content: string): Promise<CompileResult> => {
  try {
    // 通过 IPC 调用主进程来处理编译
    const result = await ipcRenderer.invoke('compile-latex', content);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '编译失败'
    };
  }
}; 