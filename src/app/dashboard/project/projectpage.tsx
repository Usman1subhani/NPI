'use client';
import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
// import { dummyRows } from "@/components/dashboard/Projects/dummyprojectsrows";
// import { ProjectFilters } from "@/components/dashboard/Projects/project-filters";
import { Customer, ProjectTable } from "@/components/dashboard/Projects/project-table";

// import type { Customer } from '@/components/dashboard/Projects/project-table';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUser } from '@/hooks/use-user';
import { Card } from "@mui/material";
import {OutlinedInput} from "@mui/material";
import {InputAdornment} from "@mui/material";
import {MagnifyingGlassIcon} from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
export default function Page(): React.JSX.Element {

    const router = useRouter();
	const page = 0;
	const rowsPerPage = 5;

	//  const paginatedCustomers = applyPagination(ProjectTable, page, rowsPerPage);
 const [projects, setprojects] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
   const [searchTerm, setSearchTerm] = React.useState('');
   const [pages, setPages] = React.useState(0);
   const [rowsPerPages, setRowsPerPages] = React.useState(10); // You can adjust this
   
const { checkSession } = useUser();

   React.useEffect(() => {
	const fetchData = async () => {
	  // Replace this with your real API call
	  const token = localStorage.getItem("auth-token");
	  const user = JSON.parse(localStorage.getItem("user") || "{}");
	  console.log(!user?.email);
	  if (!token || !user?.email) {
		console.error('No auth token found');
		setLoading(false);
		await checkSession?.();
		router.refresh();
		return;
	  }
	  try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${user.email}`, {
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
		const data = await res.json();

		// Check for token expiry message
		if (data?.msg === 'Token Expired. Please log in again.') {
		  toast.error('Session expired. Please login again.');
		  localStorage.removeItem('auth-token');
		  await checkSession?.();
		  router.refresh();
		  setLoading(false);
		  return;
		}

		if (!res.ok) {
		  setLoading(false);
		  return;
		}

		setprojects(data);
		setLoading(false);
	  } catch (err) {
		console.error('Failed to fetch leads:', err);
		setLoading(false);
	  }
	};

	fetchData();
  }, [router]);



const paginatedProjects = React.useMemo(() => {
  const filtered = !searchTerm.trim()
    ? projects
    : projects.filter((project) =>
        Object.values(project).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  if (rowsPerPages === -1) return filtered;
  return filtered.slice(pages * rowsPerPages, pages * rowsPerPages + rowsPerPages);
}, [searchTerm, projects, pages, rowsPerPages]);
 const handleCancel = async (projectId: string) => {
    const token = localStorage.getItem("auth-token");
    if (!projectId) {
      toast.error("Invalid project ID");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/cancel-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        toast.error('Failed to cancel project');
        return;
      }

      toast.success('Project cancelled');
      setprojects(prev =>
        prev.map(project =>
          project.projectId === projectId
            ? { ...project, status: 'Cancelled' }
            : project
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };
	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography sx={{color:"#525f7f"}} variant="h4">Projects</Typography>
				</Stack>
				<div>
					<Button
					sx={{color:"white", backgroundColor:"#0fb9d8"}}
					onClick={() => router.push('/dashboard/project/addproject')}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>
			{/* <ProjectFilters /> */}
			 <Card sx={{ p: 2 }}>
				  <OutlinedInput
					 value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
					fullWidth
					placeholder="Search Projects"
					startAdornment={
					  <InputAdornment position="start">
						<MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
					  </InputAdornment>
					}
					sx={{ maxWidth: '500px' }}
				  />
				</Card>
			  {loading ? (
			  <div className="dots-loader">
				<span></span>
				<span></span>
				<span></span>
			  </div>
			  )  : !Array.isArray(projects) || projects.length === 0 ? (
			  <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 4 }}>
				No data found
			  </Typography>
			) : (
		   <ProjectTable
  rows={paginatedProjects}
  count={projects.length}
  page={pages}
  rowsPerPage={rowsPerPages}
  onPageChange={(_, newPage) => setPages(newPage)}
  rowsPerPageOptions={[10, 25, 50, 100, 200, { label: 'All', value: -1 }]}
  onRowsPerPageChange={(e) => {
    setRowsPerPages(parseInt(e.target.value, 10));
    setPages(0); // reset to page 0 when page size changes
  }}
        onCancel={handleCancel}
      />

			)}
		</Stack>
	);
}

// function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
//   return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
// }
