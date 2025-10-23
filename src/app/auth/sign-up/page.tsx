import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';

export const metadata = { title: `Sign up | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
          <Typography>
            Registration is temporarily unavailable. Please try again later.
          </Typography>
        </Box>
      </GuestGuard>
    </Layout>
  );
}
