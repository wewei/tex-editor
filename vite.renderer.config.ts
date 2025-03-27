import { defineConfig } from 'vite';
import { join, resolve } from 'path';
import fs from 'fs';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
  plugins: [
    {
      name: 'serve-pdf-worker',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/pdf.worker.min.js') {
            const workerPath = resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
            res.writeHead(200, {
              'Content-Type': 'application/javascript'
            });
            // 直接使用 fs 读取文件并发送
            fs.createReadStream(workerPath).pipe(res);
          } else {
            next();
          }
        });
      },
      // 生产环境仍然需要复制文件
      closeBundle: async () => {
        try {
          const fs = await import('fs/promises');
          const workerPath = resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
          const outDir = '.vite/build';
          
          await fs.mkdir(outDir, { recursive: true });
          const destPath = join(outDir, 'pdf.worker.min.js');
          
          await fs.copyFile(workerPath, destPath);
          console.log('PDF worker copied successfully');
        } catch (error) {
          console.error('Failed to copy PDF worker:', error);
        }
      }
    }
  ]
});
