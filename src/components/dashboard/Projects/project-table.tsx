'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client'
// import { useSelection } from '@/hooks/use-selection';
const backendURL=`${process.env.NEXT_PUBLIC_BACKEND_URL}`;
const socket = io("https://gofernets.run.place",{
  path: "/unipullar/socket.io",
  transports: ["websocket", "polling"], // optional but good
});
function noop(): void {
  // do nothing
}

export interface Customer {
  _id: string;
  projectId: string;
  avatar: string;
  projectName: string;
  city: string;
  businessCategory: string;
  status: 'Running' | 'Finished' | string;
}

interface CustomersTableProps {
  count: number;
  page?: number;
  rows: Customer[];
  rowsPerPage?: number;
  onPageChange: (_: any, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: Array<number | { label: string; value: number }>;
  onCancel?: (_id: string) => void;
}

export function ProjectTable({
  rows,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  onCancel = () => { }
}: CustomersTableProps): React.JSX.Element {
  // const rowIds = React.useMemo(() => {
  //   return rows.map((customer) => customer.id);
  // }, [rows]);
  const [isPause, setIsPause] = React.useState(false);
  const [tableRows, setTableRows] = React.useState<Customer[]>(rows);

  const router = useRouter();
  const handleViewLeads = async (row: Customer) => {
    router.push(`/dashboard/project/specific-leads?category=${encodeURIComponent(row.businessCategory)}`);
  };

  const handlePause = (projectId: string) => {
    socket.emit("pauseTask", projectId)
    socket.emit("pauseQueue");
    setIsPause(true)
  }

  const handleResume = (projectId: string, id: string) => {
    socket.emit("resumeTask", projectId, id)
    socket.emit("resumeQueue");
    setIsPause(false)
  }

  const handleCancel = (projectId: string) => {
    socket.emit("cancelTaskFromQueue", projectId)
    onCancel?.(projectId)
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");

  const [totalLeadsMap, setTotalLeadsMap] = React.useState<Record<string, number>>({});
  const joinedProjectsRef = React.useRef<Set<string>>(new Set());


  React.useEffect(() => {
    console.log("Backend URl",backendURL);
    if (!rows || rows.length === 0) {
      // Clear localStorage
      localStorage.removeItem("projects");
      // Leave all joined socket rooms
      joinedProjectsRef.current.forEach((roomKey) => {
        const [vendorId, projectCategory] = roomKey.split("_");
        socket.emit("leave_project", { vendorId, projectCategory });
        console.log(`Left room: ${roomKey}`);
      });
      joinedProjectsRef.current.clear();
    }
  }, [rows]);

  React.useEffect(() => {
    projects.forEach((p: any) => {
      if (p.vendorId === user?.email) {
        const roomKey = `${p.vendorId}_${p.projectCategory}`;

        if (!joinedProjectsRef.current.has(roomKey)) {
          socket.emit("join_project", {
            vendorId: p.vendorId,
            projectCategory: p.projectCategory,
          });
          joinedProjectsRef.current.add(roomKey);
          console.log(`Joined room: ${roomKey}`);
        }
      }
    });

    socket.on("total_lead", ({ projectCategory, count }) => {
      console.log(`Updated count for ${projectCategory}: ${count}`);
      setTotalLeadsMap((prev) => ({
        ...prev,
        [projectCategory]: count,
      }));
    });

    return () => {
      socket.off("total_lead");
    };
  }, [projects]);

  React.useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  React.useEffect(() => {
    function handleStatusUpdate({ projectId, status }: { projectId: string; status: string }) {
      setTableRows((prevRows) =>
        prevRows.map((row) =>
          row.projectId === projectId ? { ...row, status } : row
        )
      );
    }
    socket.on("projectStatusUpdate", handleStatusUpdate);
    return () => {
      socket.off("projectStatusUpdate", handleStatusUpdate);
    };
  }, []);
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow >

              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Name</TableCell>

              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>City</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>businessCategory</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Total Leads</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ color: "#525f7f", fontWeight: "bold" }}>

            {tableRows.map((row) => {
              return (
                <TableRow hover key={row._id} >

                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.avatar} />
                      <Typography variant="subtitle2">{row.projectName}</Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                    {row.city}
                  </TableCell>
                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.businessCategory}</TableCell>
                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{totalLeadsMap[row.businessCategory] ?? 0}</TableCell>
                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{row.status}</TableCell>
                  <TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
                    {row.status === 'Running' ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
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
                          onClick={() => handleViewLeads(row)}
                        >
                          View Leads
                        </Button>
                        <Button
                          variant="outlined"
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
                          onClick={() => handleCancel(row.projectId)}
                        >
                          Cancel
                        </Button>

                        {isPause ? <Button
                          variant="outlined"
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
                          onClick={() => handleResume(row.projectId, row._id)}
                        >
                          Resume
                        </Button> : <Button
                          variant="outlined"
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
                          onClick={() => handlePause(row.projectId)}
                        >
                          Pause
                        </Button>}
                      </>
                    ) : row.status === 'Finished' ? (
                      <Button
                        variant="contained"
                        size="small"
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
                        onClick={() => handleViewLeads(row)}
                      >
                        View Leads
                      </Button>
                    ) : row.status === 'Cancelled' ? (
                      <Typography sx={{ color: "#0fb9d8" }} variant="body2">
                        Cancelled
                      </Typography>
                    ) : (
                      '-'
                    )}

                  </TableCell>
                </TableRow>
              );
            })}
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
