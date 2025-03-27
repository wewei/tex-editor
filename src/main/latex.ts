import { app, ipcMain } from 'electron';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';  // 需要先安装: npm install iconv-lite

const TEMP_DIR = path.join(app.getPath('temp'), 'tex-editor');

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('创建临时目录失败:', error);
  }
}

async function compileLaTeX(content: string): Promise<{ success: boolean; pdfPath?: string; error?: string }> {
  await ensureTempDir();
  
  const timestamp = Date.now();
  const texFile = path.join(TEMP_DIR, `document_${timestamp}.tex`);
  const pdfFileName = `document_${timestamp}.pdf`;
  const pdfFile = path.join(TEMP_DIR, pdfFileName);

  try {
    await writeFile(texFile, content, { encoding: 'utf8' });

    return new Promise((resolve) => {
      // Windows 下使用 cmd 执行命令，并设置代码页
      const command = process.platform === 'win32' 
        ? `chcp 65001 && pdflatex -interaction=nonstopmode -output-directory="${TEMP_DIR}" "${texFile}"`
        : `pdflatex -interaction=nonstopmode -output-directory="${TEMP_DIR}" "${texFile}"`;

      exec(
        command,
        {
          encoding: 'buffer',  // 使用 buffer 而不是字符串
          maxBuffer: 1024 * 1024
        },
        (error, stdout, stderr) => {
          // 处理输出编码
          const decodeBuffer = (buffer: Buffer) => {
            // Windows 下使用 GBK 解码
            if (process.platform === 'win32') {
              return iconv.decode(buffer, 'gbk');
            }
            // 其他系统使用 UTF-8
            return buffer.toString('utf8');
          };

          if (error) {
            const errorMsg = stderr.length ? decodeBuffer(stderr) : decodeBuffer(stdout);
            resolve({
              success: false,
              error: errorMsg || '编译失败'
            });
          } else {
            resolve({
              success: true,
              pdfPath: `asset://${pdfFileName}`
            });
          }
        }
      );
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 注册 IPC 处理器
ipcMain.handle('compile-latex', async (_, content: string) => {
  return await compileLaTeX(content);
}); 