import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: 'Business Sign Up'
};

export default function Page(): React.JSX.Element {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">
        Business Sign Up
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Coming soon...
      </Typography>
    </Box>
  );
}
