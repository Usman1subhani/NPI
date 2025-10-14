import * as React from 'react';
// import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// import { paths } from '@/paths';
// import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '550px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          position: 'relative',
          alignItems: 'center',
          background: 'radial-gradient(50% 50% at 50% 50%, #161950 0%, #161950 100%)',
          color: 'var(--mui-palette-common-white)',
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
          overflow: 'hidden',
        }}
      >
        {/* Grid SVG #1 */}
        <Box
          component="img"
          alt="Grid background 1"
          src="/assets/grid-01.svg"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            // opacity: 0.15,
            objectFit: 'cover',
          }}
        />

        {/* Grid SVG #2 */}
        <Box
          component="img"
          alt="Grid background 2"
          src="/assets/grid-01.svg"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '50%',
            // opacity: 0.15,
            transform: 'rotate(180deg)',
            objectFit: 'cover',
          }}
        />

        {/* Main Logo */}
        <Stack spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              alt="Widgets"
              src="/assets/nppes.png"
              sx={{ height: 'auto', width: '100%', maxWidth: '600px' }}
            />
          </Box>
        </Stack>
      </Box>

    </Box>
  );
}
