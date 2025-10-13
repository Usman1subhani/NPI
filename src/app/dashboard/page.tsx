import * as React from 'react';
import type { Metadata } from 'next';
// import Grid from '@mui/material/Grid';
// import dayjs from 'dayjs';

import { config } from '@/config';
import  Page from '@/app/dashboard/dashboard/page';
export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function  DashboardPage(): React.JSX.Element {
 
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Page />
    </React.Suspense>
  );
}
