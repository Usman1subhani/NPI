import { Metadata } from 'next';
import React from 'react';
import { config } from '@/config';
import JobsPage from './jobspage';
export const metadata: Metadata = {
  title: `Jobs | Dashboard | ${config.site.name}`,
};

export default function Page() {
  return <JobsPage />;
}
