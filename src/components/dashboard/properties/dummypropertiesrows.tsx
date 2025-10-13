'use client';

import * as React from 'react';
import { PropertiesCard } from './properties-card'; // adjust the path as needed

export const dummyRows = [
  {
    id: '1',
   
    title: 'John Doe',
    description: 'A sample project description',
    logo: 'https://i.pravatar.cc/40?img=1',
    installs: 100,
    updatedAt: new Date(),
  },
  {
    id: '2',
    logo: 'https://i.pravatar.cc/40?img=2',
    title: 'Jane Smith',
    description: 'A sample project description',
    installs: 200,
    updatedAt: new Date(),
  },
  {
    id: '3',
    logo: 'https://i.pravatar.cc/40?img=3',
    title: 'Ali Khan',
    description: 'A sample project description',
    installs: 300,
    updatedAt: new Date(),
  },
];

export default function DummyTablePage() {
  return (
    <div style={{ padding: 20 }}>
      <PropertiesCard count={dummyRows.length} page={0}  rows={dummyRows} rowsPerPage={5} />
    </div>
  );
}
