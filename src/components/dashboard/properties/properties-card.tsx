import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
// import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import dayjs from 'dayjs';

function noop(): void {
  // do nothing
}

export interface PropertiesCard {
  id: string;
  title: string;
  description: string;
  logo: string;
  installs: number;
  updatedAt: Date;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: PropertiesCard[];
  rowsPerPage?: number;
}

export function PropertiesCard({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CustomersTableProps): React.JSX.Element  {
  return (
<Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
             
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
            
              <TableCell>Description</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>Installs</TableCell>
              <TableCell>Update At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
            

              return (
                <TableRow hover key={row.id} >
                 
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.logo} />
                      <Typography variant="subtitle2">{row.id}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.logo} />
                      <Typography variant="subtitle2">{row.title}</Typography>
                    </Stack>
                  </TableCell>
              
                  <TableCell>
                    <Typography variant="body2">{row.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.logo} />
                      <Typography variant="subtitle2">{row.logo}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{dayjs(row.updatedAt).format('MMM D, YYYY')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
