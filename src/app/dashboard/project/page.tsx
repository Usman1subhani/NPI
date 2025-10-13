import { Metadata } from 'next';
import React from 'react';
import { config } from '@/config';
import ProjectPage from './projectpage';
export const metadata: Metadata = {
  title: `Projects | Dashboard | ${config.site.name}`,
};

export default function Page() {
  return <ProjectPage />;
}
