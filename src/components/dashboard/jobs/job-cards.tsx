'use client';

import * as React from 'react';
// import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
import TablePagination from '@mui/material/TablePagination';
import Divider from '@mui/material/Divider';
// import Checkbox from '@mui/material/Checkbox';
// import Divider from '@mui/material/Divider';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormGroup from '@mui/material/FormGroup';
// import Grid from '@mui/material/Grid';
// import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import TableSortLabel from '@mui/material/TableSortLabel';
// import TextField from '@mui/material/TextField';
// import { visuallyHidden } from '@mui/utils';
// import { useRouter } from 'next/navigation';
import { Box } from '@mui/system';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';
// import Avatar from '@mui/material/Avatar';

export interface Jobs {
  source: string;          // e.g., 'Indeed', 'LinkedIn'
  title: string;           // job title
  company?: string;        // optional
  location?: string;       // optional
  link: string;            // required
  salary?: string;         // optional
  postedDate?: Date;       // optional
  scrapedAt?: Date;
}

interface JobsTableProps {
  count: number;
  page?: number;
  rows: Jobs[];
  rowsPerPage?: number;
  onPageChange: (_: any, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: Array<number | { label: string; value: number }>;
  onCancel?: (_id: string) => void;
}

export function JobsCards({
  rows,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}: JobsTableProps): React.JSX.Element {
  return (
    // <form
    //   onSubmit={(event) => {
    //     event.preventDefault();
    //   }}
    // >
    //   <Card>
    //     <CardHeader subheader="Manage the notifications" title="Notifications" />
    //     <Divider />
    //     <CardContent>
    //       <Grid container spacing={6} wrap="wrap">
    //         <Grid
    //           size={{
    //             md: 4,
    //             sm: 6,
    //             xs: 12,
    //           }}
    //         >
    //           <Stack spacing={1}>
    //             <Typography variant="h6">Email</Typography>
    //             <FormGroup>
    //               <FormControlLabel control={<Checkbox defaultChecked />} label="Product updates" />
    //               <FormControlLabel control={<Checkbox />} label="Security updates" />
    //             </FormGroup>
    //           </Stack>
    //         </Grid>
    //         <Grid
    //           size={{
    //             md: 4,
    //             sm: 6,
    //             xs: 12,
    //           }}
    //         >
    //           <Stack spacing={1}>
    //             <Typography variant="h6">Phone</Typography>
    //             <FormGroup>
    //               <FormControlLabel control={<Checkbox defaultChecked />} label="Email" />
    //               <FormControlLabel control={<Checkbox />} label="Security updates" />
    //             </FormGroup>
    //           </Stack>
    //         </Grid>
    //       </Grid>
    //     </CardContent>
    //     <Divider />
    //     <CardActions sx={{ justifyContent: 'flex-end' }}>
    //       <Button variant="contained">Save changes</Button>
    //     </CardActions>
    //   </Card>
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }} >Source</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Company</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Location</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Salary</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Posted Date</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Scrape Date</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ color: "#525f7f", fontWeight: "bold" }}>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.source}</TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.title}</TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.company ?? '-'}</TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.location ?? '-'}</TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.salary ?? '-'}</TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                  {row.postedDate
                    ? new Date(row.postedDate).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                  {row.scrapedAt
                    ? new Date(row.scrapedAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                  <Button
                    sx={{
                      color: 'white',
                      borderColor: '#0fb9d8',
                      backgroundColor: '#0fb9d8',
                      '&:hover': {
                        backgroundColor: '0fb9d8', // light transparent background on hover
                        borderColor: '#0da5c0',
                        color: "black"
                      },
                    }}
                    size="small"
                    variant="outlined"
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count ?? 0}
        page={page ?? 0}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage ?? 10}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </Card>
  );
}
