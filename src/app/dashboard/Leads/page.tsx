import { Metadata } from 'next';
import React from 'react';
import { config } from '@/config';
import LeadsPage from './leadspage';
export const metadata: Metadata = {
  title: `Leads | Dashboard | ${config.site.name}`,
};

export default function Page() {
  return <LeadsPage />;
}
