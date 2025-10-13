import { Metadata } from 'next';
import React from 'react';
import { config } from '@/config';
import  Propertiespage from './propertiespage';
export const metadata: Metadata = {
  title: `Projects | Dashboard | ${config.site.name}`,
};

export default function Page() {
  return <Propertiespage />;
}
