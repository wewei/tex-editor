import React, { useState, useEffect, useCallback } from 'react';
import { Box, Divider, Snackbar, Alert } from '@mui/material';
import Editor from '@monaco-editor/react';
import PDFViewer from './PDFViewer';
import { debounce } from 'lodash';

const defaultContent = `
\\documentclass{article}
\\usepackage{ctex}  % 支持中文
\\usepackage[utf8]{inputenc}  % UTF-8编码
\\usepackage[T1]{fontenc}     % 字体编码

\\begin{document}
Hello, world! 你好，世界！
\\end{document}
`

const Layout: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newRatio = Math.min(Math.max(e.clientX / windowWidth, 0.2), 0.8);
      setSplitRatio(newRatio);
    }
  }, [isDragging, windowWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const compileTeX = useCallback(async (content: string) => {
    try {
      setIsCompiling(true);
      const result = await window.electronAPI.compileLaTeX(content);
      
      if (result.success && result.pdfPath) {
        setPdfUrl(result.pdfPath);
        setError(null);
      } else {
        setError(result.error || '编译失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '编译过程出错');
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // 使用 debounce 包装编译函数
  const debouncedCompile = useCallback(
    debounce((content: string) => compileTeX(content), 3000),
    [compileTeX]
  );

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value) {
      debouncedCompile(value);
    }
  }, [debouncedCompile]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: `${splitRatio * 100}%`,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="latex"
          defaultValue={defaultContent}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
          onChange={handleEditorChange}
        />
        {isCompiling && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'info.main',
              color: 'info.contrastText',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontSize: 14,
            }}
          >
            正在编译...
          </Box>
        )}
      </Box>

      <Divider
        orientation="vertical"
        sx={{
          width: '6px',
          cursor: 'col-resize',
          m: 0,
          border: 'none',
          bgcolor: (theme) => theme.palette.divider,
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: (theme) => theme.palette.action.hover,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '20px',
            bgcolor: (theme) => theme.palette.text.secondary,
            borderRadius: '1px',
          },
          ...(isDragging && {
            bgcolor: (theme) => theme.palette.primary.main,
          }),
        }}
        onMouseDown={handleMouseDown}
      />

      <Box
        sx={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <PDFViewer pdfUrl={pdfUrl} />
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout; 