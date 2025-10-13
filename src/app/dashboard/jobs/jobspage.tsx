"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
// import type { Metadata } from 'next';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// import { config } from "@/config";
import { useUser } from "@/hooks/use-user";
import { Jobs, JobsCards } from "@/components/dashboard/jobs/job-cards";
import { JobsFilters } from "@/components/dashboard/jobs/jobs-filters";
import { Button } from "@mui/material";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Card } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
// export const metadata = { title: `Settings | Dashboard | ${config.site.name}` } satisfies Metadata;
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("https://gofernets.run.place",{
  path: "/unipullar/socket.io",
  transports: ["websocket", "polling"], // optional but good
});

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const page = 0;
  const rowsPerPage = 5;

  //  const paginatedCustomers = applyPagination(ProjectTable, page, rowsPerPage);
  const [jobs, setjobs] = React.useState<Jobs[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scrapingLoading, setScrapingLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/scraping/get-Jobs`, {
          method: "GET",
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
        // Join vendor room
        socket.emit("joinVendor", user.email);
        // When setting jobs from API response
        setjobs(Array.isArray(data) ? data : []);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for individual jobs as they arrive
    socket.on("job", (job: Jobs) => {
      console.log("new jobs", job)
      setjobs((prev) => [job, ...prev]); // prepend latest
    });

    // Optional: listen for scrape start and complete events
    socket.on("scrape_start", (info) => {
      console.log("Scraping started:", info);
      setScrapingLoading(true);
    });

    socket.on("scrape_complete", (info) => {
      console.log("Scraping complete:", info);
      toast.success(info.message || "Scraping complete")
      setScrapingLoading(false);
    });

    return () => {
      socket.disconnect();
      socket.off('job')
    };
  }, [router]);


  const paginatedJobs = React.useMemo(() => {
    const jobsArray = Array.isArray(jobs) ? jobs : [];

    const filtered = !searchTerm.trim()
      ? jobsArray
      : jobsArray.filter((job) =>
        Object.values(job).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    return filtered.slice(
      pages * rowsPerPages,
      pages * rowsPerPages + rowsPerPages
    );
  }, [searchTerm, jobs, pages, rowsPerPages]);



  const handleAddJobs = async () => {
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
    setScrapingLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/scraping/jobs?jobTitle=${jobTitle}`, {
        method: "POST",
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

      // When setting jobs from API response
      setjobs(Array.isArray(data) ? data : []);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setLoading(false);
    }
  };
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4" sx={{ color: "#525f7f" }}>Jobs</Typography>
        </Stack>
      </Stack>
      {/* <ProjectFilters /> */}
      <Card sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* Search within loaded jobs */}
        <OutlinedInput
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search jobs..."
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{ maxWidth: 300 }}
        />

        {/* Trigger scraping by title */}
        <OutlinedInput
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          placeholder="Scrape by job title..."
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{ maxWidth: 300 }}
        />
        <Button
          sx={{ backgroundColor: "#0fb9d8" }}
          onClick={handleAddJobs}
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
        >
          Scrape Jobs
        </Button>
      </Card>

      {scrapingLoading && <Typography>Processing…</Typography>}
      {loading ? (
        <div className="dots-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : !Array.isArray(jobs) || jobs.length === 0 ? (
        <Typography variant="subtitle1" sx={{ textAlign: "center", mt: 4 }}>
          No data found
        </Typography>
      ) : (
        <JobsCards
          rows={paginatedJobs}
          count={jobs.length}
          page={pages}
          rowsPerPage={rowsPerPages}
          onPageChange={(_, newPage) => setPages(newPage)}
          rowsPerPageOptions={[10, 25, 50, 100, 200, { label: "All", value: -1 }]}
          onRowsPerPageChange={(e) => {
            setRowsPerPages(parseInt(e.target.value, 10));
            setPages(0); // reset to page 0 when page size changes
          }}
        />
      )}
    </Stack>
  );
}
