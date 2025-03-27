import React, { useState, useEffect, useCallback } from 'react';
import { Box, Divider } from '@mui/material';
import Editor from '@monaco-editor/react';

const Layout: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

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
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="latex"
          defaultValue="% 在这里输入 LaTeX 代码"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
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
          p: 2,
          overflow: 'auto',
        }}
      >
        {/* 右侧预览区域 */}
        <Box>预览区域</Box>
      </Box>
    </Box>
  );
};

export default Layout; 