import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface LoaderProps {
  fullscreen?: boolean;
}

export function Loader({ fullscreen = false }: LoaderProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: fullscreen ? '100vh' : '100%',
        minHeight: fullscreen ? undefined : 400,
      }}
    >
      <div className="dots-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </Box>
  );
}