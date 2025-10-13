"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, InputAdornment, OutlinedInput, Stack, TextField, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// date-fns
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import Papa from "papaparse";
import toast from "react-hot-toast";

import { DashboardTable, NpiRegistry } from "@/components/dashboard/dashboard/table";

import { fetchNpiData } from "../../../lib/npi";

export default function NpiPage() {
	const [rows, setRows] = useState<NpiRegistry[]>([]);
	const [page, setPage] = useState(0); // zero-indexed for table
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [totalRows, setTotalRows] = useState(0);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [exporting, setExporting] = useState(false);
	const today = new Date();

	// Get the day of the week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
	const dayOfWeek = today.getDay();

	// Calculate the start of the week (Monday)
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Adjust so Monday is start
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6); // End of week

	// Format as YYYY-MM-DD
	const formatDateString = (date: Dayjs | null) =>
  date ? date.format("YYYY-MM-DD") : "";


	const [startDate, setStartDate] = useState<Dayjs | null>(dayjs(monday));
	const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(sunday));

	// Fetch data from backend
	const loadData = async () => {
		setLoading(true);
		try {
			const res = await fetchNpiData({
				startDate: formatDateString(startDate),
				endDate: formatDateString(endDate),
				page: page + 1,
				limit: rowsPerPage,
			});
			setRows(res.data || []);
			console.log(res.data);
			setTotalRows(res.total || res.data.length);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [page, rowsPerPage]);

	// Filtering
	const filteredRows = useMemo(() => {
		if (!searchTerm.trim()) return rows;
		return rows.filter((row) =>
			Object.values(row).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
		);
	}, [rows, searchTerm]);

	// Export functions
	const exportToCSV = async () => {
		try {
			const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
			setExporting(true);
			const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/export-csv`, {
				params: {
					startDate: startDate,
					endDate: endDate,
				},
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				responseType: "blob",
			});

			const data = res.data;

			const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "npi-data.csv";
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
		} finally {
			setExporting(false); // Stop loader
		}
		// { data, total, page, totalPages }
	};
	const handleapplyFilter = () => {
		if (!startDate && !endDate) {
			toast.error("Please enter start date and end date");
		} else {
			loadData();
		}
	};
	return (
		<Stack spacing={3} p={3}>
			<Typography variant="h4">NPI Registry Data</Typography>

			<Card sx={{ p: 2 }}>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Start Date"
							value={startDate}
							onChange={(newValue) => setStartDate(newValue)}
							 enableAccessibleFieldDOMStructure={false}
							slots={{ textField: TextField }}
							slotProps={{ textField: { sx: { width: 180 } } }}
						/>
						<DatePicker
							label="End Date"
							value={endDate}
							onChange={(newValue) => setEndDate(newValue)}
							 enableAccessibleFieldDOMStructure={false}
							slots={{ textField: TextField }}
							slotProps={{ textField: { sx: { width: 180 } } }}
						/>
					</LocalizationProvider>

					{/* Apply Filter Button */}
					<Button variant="contained" sx={{ backgroundColor: "#0fb9d8" }} onClick={() => handleapplyFilter()}>
						Apply Filter
					</Button>

					{exporting ? (
						<CircularProgress
							size={24}
							sx={{
								color: "blue",
								textAlign: "center",
							}}
						/>
					) : (
						<Button sx={{ backgroundColor: "#0fb9d8" }} disabled={exporting} variant="contained" onClick={exportToCSV}>
							Export to CSV
						</Button>
					)}
				</Stack>
			</Card>

			<DashboardTable
				count={totalRows}
				page={page}
				rows={filteredRows}
				rowsPerPage={rowsPerPage}
				onPageChange={(_, newPage) => setPage(newPage)}
				rowsPerPageOptions={[10, 25, 50, 100]}
				onRowsPerPageChange={(e) => {
					setRowsPerPage(parseInt(e.target.value, 10));
					setPage(0);
				}}
				loading={loading}
			/>
		</Stack>
	);
}
