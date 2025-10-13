'use client';
import * as React from 'react';
// import type { Metadata } from 'next';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
// import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
// import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import { PropertiesCard } from '@/components/dashboard/properties/properties-card';
import { PropertiesFilters } from '@/components/dashboard/properties/properties-filters';
import { dummyRows } from '@/components/dashboard/properties/dummypropertiesrows';

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Properties</Typography>
         
        </Stack>
       
      </Stack>
      <PropertiesFilters />
   
          <PropertiesCard count={dummyRows.length} page={0} rows={dummyRows} rowsPerPage={5} />
        
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination count={3} size="small" />
      </Box>
    </Stack>
  );
}
