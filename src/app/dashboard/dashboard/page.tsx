"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	Button,
	Card,
	Stack,
	TextField,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Chip,
	IconButton
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { X, FileCsv, ChatCenteredText } from "@phosphor-icons/react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import toast from "react-hot-toast";

import { DashboardTable, NpiRegistry } from "@/components/dashboard/dashboard/table";
import { fetchNpiData } from "../../../lib/npi";

export default function NpiPage() {
	const [rows, setRows] = useState<NpiRegistry[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [totalRows, setTotalRows] = useState(0);
	const [loading, setLoading] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const today = new Date();

	// Get the day of the week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
	const dayOfWeek = today.getDay();

	// Calculate the start of the week (Monday)
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	// Format as YYYY-MM-DD
	const formatDateString = (date: Dayjs | null) =>
		date ? date.format("YYYY-MM-DD") : "";

	const [startDate, setStartDate] = useState<Dayjs | null>(dayjs(monday));
	const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(sunday));
	const [searchTerm, setSearchTerm] = useState("");
	const [stateFilter, setStateFilter] = useState("");
	const [cityFilter, setCityFilter] = useState("");
	const [orgFilter, setOrgFilter] = useState("");

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

	// Compute unique options for filters
	const states = useMemo(() => Array.from(new Set(rows.map(r => r.state).filter(Boolean))), [rows]);
	const cities = useMemo(() => Array.from(new Set(rows.map(r => r.city).filter(Boolean))), [rows]);
	const orgs = useMemo(() => Array.from(new Set(rows.map(r => r.orgName).filter(Boolean))), [rows]);

	// Filtering using all controls
	const filteredRows = useMemo(() => {
		return rows.filter(row => {
			// Search by firstName or lastName
			const q = searchTerm.trim().toLowerCase();
			const nameMatch = !q ||
				((row.firstName || '').toLowerCase().includes(q) ||
					(row.lastName || '').toLowerCase().includes(q) ||
					(row.orgName || '').toLowerCase().includes(q) ||
					(row.npi || '').includes(q));

			const stateMatch = !stateFilter || row.state === stateFilter;
			const cityMatch = !cityFilter || row.city === cityFilter;
			const orgMatch = !orgFilter || row.orgName === orgFilter;

			// Date range filter
			let dateMatch = true;
			if (startDate || endDate) {
				const created = row.createdAt ? dayjs(row.createdAt) : null;
				if (created) {
					if (startDate && created.isBefore(startDate, 'day')) dateMatch = false;
					if (endDate && created.isAfter(endDate, 'day')) dateMatch = false;
				} else {
					dateMatch = false;
				}
			}

			return nameMatch && stateMatch && cityMatch && orgMatch && dateMatch;
		});
	}, [rows, searchTerm, stateFilter, cityFilter, orgFilter, startDate, endDate]);

	// Check if any filters are active
	const hasActiveFilters = stateFilter || cityFilter || orgFilter;

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
			setExporting(false);
		}
	};

	const handleApplyFilter = () => {
		if (!startDate && !endDate) {
			toast.error("Please enter start date and end date");
		} else {
			loadData();
			setShowFilters(false); // Hide filters after applying
		}
	};

	const handleClearFilters = () => {
		setSearchTerm("");
		setStateFilter("");
		setCityFilter("");
		setOrgFilter("");
		setStartDate(dayjs(monday));
		setEndDate(dayjs(sunday));
		setShowFilters(false);
	};

	const removeFilter = (filterType: string) => {
		switch (filterType) {
			case 'state':
				setStateFilter("");
				break;
			case 'city':
				setCityFilter("");
				break;
			case 'org':
				setOrgFilter("");
				break;
		}
	};

	return (
		<Stack spacing={2}>
			<Typography variant="h5">NPI Registry Data</Typography>

			{/* Main Controls Card */}
			<Card sx={{ p: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
					{/* Left Side: Search Bar */}
					<TextField
						placeholder="Search by name..."
						size="small"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						sx={{
							minWidth: 200,
							flex: 1,
							maxWidth: 400,
							'& .MuiInputBase-input': { fontSize: '0.875rem' }
						}}
						InputProps={{
							startAdornment: (
								<MagnifyingGlassIcon style={{ marginRight: 8, color: '#666' }} size={16} />
							),
						}}
					/>

					{/* Right Side: Buttons */}
					<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
						{/* Show Filters Button */}
						<Button
							variant="outlined"
							onClick={() => setShowFilters(!showFilters)}
							sx={{
								minWidth: 120,
								borderColor: '#161950',
								color: '#161950',
								'&:hover': {
									borderColor: '#0f1440',
									backgroundColor: 'rgba(22, 25, 80, 0.04)'
								}
							}}
						>
							{showFilters ? 'Hide Filters' : 'Apply Filters'}
						</Button>

						{/* ✅ New Messaging Button */}
						<Button
							variant="contained"
							startIcon={<ChatCenteredText size={18} />}
							sx={{
								backgroundColor: '#161950',
								minWidth: 120,
								'&:hover': { backgroundColor: '#004080' },
							}}
							onClick={() => {
								// Collect all numbers from the current filtered rows
								const numbers = filteredRows
									.map(r => r.phone)
									.filter(Boolean)
									.join(',');

								// Navigate to messaging page with numbers as query
								window.location.href = `/dashboard/messaging?to=${encodeURIComponent(numbers)}`;
							}}
						>
							Message
						</Button>

						{/* Export Button */}
						{exporting ? (
							<CircularProgress size={24} sx={{ color: "#161950" }} />
						) : (
							<Button
								variant="contained"
								startIcon={<FileCsv size={18} />}
								sx={{
									backgroundColor: "#161950",
									minWidth: 140,
									'&:hover': { backgroundColor: "#0f1440" }
								}}
								disabled={exporting}
								onClick={exportToCSV}
							>
								Export to CSV
							</Button>
						)}
					</Box>
				</Box>

				{/* Expandable Filters Section */}
				{showFilters && (
					<Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
						<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
							{/* State Filter */}
							<FormControl size="small" sx={{ minWidth: 120 }}>
								<InputLabel>State</InputLabel>
								<Select
									value={stateFilter}
									label="State"
									onChange={e => setStateFilter(e.target.value)}
								>
									<MenuItem value="">All</MenuItem>
									{states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
								</Select>
							</FormControl>

							{/* City Filter */}
							<FormControl size="small" sx={{ minWidth: 120 }}>
								<InputLabel>City</InputLabel>
								<Select
									value={cityFilter}
									label="City"
									onChange={e => setCityFilter(e.target.value)}
								>
									<MenuItem value="">All</MenuItem>
									{cities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
								</Select>
							</FormControl>

							{/* Organization Filter */}
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel>Organization</InputLabel>
								<Select
									value={orgFilter}
									label="Organization"
									onChange={e => setOrgFilter(e.target.value)}
								>
									<MenuItem value="">All</MenuItem>
									{orgs.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
								</Select>
							</FormControl>

							{/* Date Picker - Single Date Picker */}
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker
									label="Select Date"
									value={startDate}
									onChange={(newValue) => {
										setStartDate(newValue);
										setEndDate(newValue); // Set both to same date for single date selection
									}}
									slotProps={{
										textField: {
											size: 'small',
											sx: { width: 150 }
										}
									}}
								/>
							</LocalizationProvider>

							{/* Clear Filters Button */}
							<Button
								variant="outlined"
								color="error"
								onClick={handleClearFilters}
								sx={{ minWidth: 100 }}
							>
								Clear All
							</Button>
						</Stack>
					</Box>
				)}

				{/* Active Filters Chips */}
				{hasActiveFilters && (
					<Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						{stateFilter && (
							<Chip
								label={`State: ${stateFilter}`}
								onDelete={() => removeFilter('state')}
								deleteIcon={<X size={16} />}
								size="small"
								color="primary"
								variant="outlined"
							/>
						)}
						{cityFilter && (
							<Chip
								label={`City: ${cityFilter}`}
								onDelete={() => removeFilter('city')}
								deleteIcon={<X size={16} />}
								size="small"
								color="primary"
								variant="outlined"
							/>
						)}
						{orgFilter && (
							<Chip
								label={`Organization: ${orgFilter}`}
								onDelete={() => removeFilter('org')}
								deleteIcon={<X size={16} />}
								size="small"
								color="primary"
								variant="outlined"
							/>
						)}
					</Box>
				)}
			</Card>

			{/* Table */}
			<DashboardTable
				count={filteredRows.length}
				page={page}
				rows={filteredRows}
				rowsPerPage={rowsPerPage}
				onPageChange={(_event: unknown, newPage: number) => setPage(newPage)}
				rowsPerPageOptions={[10, 25, 50, 100]}
				onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setRowsPerPage(parseInt(e.target.value, 10));
					setPage(0);
				}}
				loading={loading}
			/>
		</Stack>
	);
}