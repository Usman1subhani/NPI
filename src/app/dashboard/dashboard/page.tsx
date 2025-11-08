"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Card,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Menu,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ChatCenteredText, FileCsv, X } from "@phosphor-icons/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import toast from "react-hot-toast";

import { Loader } from "@/components/core/loader";
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
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);

	const [selectDialogOpen, setSelectDialogOpen] = useState(false);
	const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

	const today = new Date();

	// Get the day of the week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
	const dayOfWeek = today.getDay();

	// Calculate the start of the week (Monday)
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	// Format as YYYY-MM-DD
	const formatDateString = (date: Dayjs | null) => (date ? date.format("YYYY-MM-DD") : "");

	const [startDate, setStartDate] = useState<Dayjs | null>(dayjs(monday));
	const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(sunday));

	const [searchTerm, setSearchTerm] = useState("");
	const [stateFilter, setStateFilter] = useState("");
	const [cityFilter, setCityFilter] = useState("");
	const [orgFilter, setOrgFilter] = useState("");

	// Fetch data from backend
	const fetchAllFilteredphone = async () => {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

		const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/filter-data`, {
			params: {
				startDate: startDate ? formatDateString(startDate) : "",
				endDate: endDate ? formatDateString(endDate) : "",
				state: stateFilter,
				city: cityFilter,
				organization: orgFilter,
			},
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		return res.data;

		// ✅ Split into rows
	};

	const fetchAllFilteredRows = async () => {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

		const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/filter-data`, {
			params: {
				startDate: startDate ? formatDateString(startDate) : "",
				endDate: endDate ? formatDateString(endDate) : "",
				state: stateFilter,
				city: cityFilter,
				organization: orgFilter,
			},
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});

		// Convert CSV blob → text
		return res.data;
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const anyFilterActive = stateFilter || cityFilter || orgFilter;

			let data: NpiRegistry[] = [];
			let total = 0;

			if (anyFilterActive) {
				// Fetch all matching rows for frontend pagination
				const allRows = await fetchAllFilteredRows();
				// Apply search & filter locally
				data = allRows.filter((row: any) => {
					const q = searchTerm.trim().toLowerCase();
					const nameMatch =
						!q ||
						(row.firstName || "").toLowerCase().includes(q) ||
						(row.lastName || "").toLowerCase().includes(q) ||
						(row.orgName || "").toLowerCase().includes(q) ||
						(row.npi || "").includes(q);

					const stateMatch = !stateFilter || row.state === stateFilter;
					const cityMatch = !cityFilter || row.city === cityFilter;
					const orgMatch = !orgFilter || row.orgName === orgFilter;

					let dateMatch = true;
					if (startDate && row.updatedAt) dateMatch = !dayjs(row.updatedAt).isBefore(startDate, "day");
					if (endDate && row.updatedAt) dateMatch = dateMatch && !dayjs(row.updatedAt).isAfter(endDate, "day");

					return nameMatch && stateMatch && cityMatch && orgMatch && dateMatch;
				});

				total = data.length; // total = filtered length
				// Slice for pagination
				data = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
			} else {
				// Backend pagination
				const res = await fetchNpiData({
					startDate: startDate ? formatDateString(startDate) : "",
					endDate: endDate ? formatDateString(endDate) : "",
					page: page + 1,
					limit: rowsPerPage,
				});
				data = res.data || [];
				total = res.total || 0;
			}

			setRows(data);
			setTotalRows(total);
		} catch (err) {
			console.error(err);
			toast.error("Failed to fetch data.");
		} finally {
			setLoading(false);
		}
	};

	// --- update useEffect to load data only if start date exists ---
	useEffect(() => {
		loadData(); // always load initially and on change
	}, [page, rowsPerPage, startDate, endDate, stateFilter, cityFilter, orgFilter, searchTerm]);

	// --- update loadData() to skip when no start date selected ---

	// Compute unique options for filters
	const states = useMemo(() => Array.from(new Set(rows.map((r) => r.state).filter(Boolean))), [rows]);
	const cities = useMemo(() => Array.from(new Set(rows.map((r) => r.city).filter(Boolean))), [rows]);
	const orgs = useMemo(() => Array.from(new Set(rows.map((r) => r.orgName).filter(Boolean))), [rows]);

	// Filtering using all controls
	// Filtering using all controls
	const filteredRows = useMemo(() => {
		const result = rows.filter((row) => {
			const q = searchTerm.trim().toLowerCase();
			const nameMatch =
				!q ||
				(row.firstName || "").toLowerCase().includes(q) ||
				(row.lastName || "").toLowerCase().includes(q) ||
				(row.orgName || "").toLowerCase().includes(q) ||
				(row.npi || "").includes(q);

			const stateMatch = !stateFilter || row.state === stateFilter;
			const cityMatch = !cityFilter || row.city === cityFilter;
			const orgMatch = !orgFilter || row.orgName === orgFilter;

			// Date range filter
			let dateMatch = true;
			if (startDate && row.updatedAt) {
				dateMatch = !dayjs(row.updatedAt).isBefore(startDate, "day");
			}
			if (endDate && row.updatedAt) {
				dateMatch = dateMatch && !dayjs(row.updatedAt).isAfter(endDate, "day");
			}

			return nameMatch && stateMatch && cityMatch && orgMatch && dateMatch;
		});
		return result;
	}, [rows, searchTerm, stateFilter, cityFilter, orgFilter, startDate, endDate]);

	// Slice rows for pagination
	const paginatedRows = useMemo(() => {
		const start = page * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredRows.slice(start, end);
	}, [filteredRows, page, rowsPerPage]);

	// Total rows should reflect filtered data
	const displayTotalRows = filteredRows.length;

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
	const seen = new Set<string>();
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

		// Reset to current week
		const today = new Date();
		const dayOfWeek = today.getDay();
		const monday = new Date(today);
		monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);

		setStartDate(dayjs(monday));
		setEndDate(dayjs(sunday));

		setRows([]); // optional, loadData will fetch
		setShowFilters(false);
		setPage(0); // reset to first page
	};

	const removeFilter = (filterType: string) => {
		switch (filterType) {
			case "state":
				setStateFilter("");
				break;
			case "city":
				setCityFilter("");
				break;
			case "org":
				setOrgFilter("");
				break;
		}
	};
	const isLandline = (num: string) => {
		if (num.length < 10) return false;
		const areaCode = num.slice(0, 3); // use first 3 digits
		const landlineCodes = ["212", "213", "305", "408", "512", "617", "703"];
		return landlineCodes.includes(areaCode);
	};

	return (
		<Stack spacing={2}>
			<Typography variant="h5">NPI Registry Data</Typography>
			<Box
				sx={{
					height: "calc(100vh - 150px)", // adjust based on your header/nav height
					overflowY: "auto",
					position: "relative",
					px: 2, // optional padding
				}}
			>
				{/* Main Controls Card */}
				<Card sx={{ p: 2, position: "sticky", top: 0, zIndex: 2 }}>
					<Box
						sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}
					>
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
								"& .MuiInputBase-input": { fontSize: "0.875rem" },
							}}
							InputProps={{
								startAdornment: <MagnifyingGlassIcon style={{ marginRight: 8, color: "#666" }} size={16} />,
							}}
						/>

						{/* Right Side: Buttons */}
						<Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
							{/* Show Filters Button */}
							<Button
								variant="outlined"
								onClick={() => setShowFilters(!showFilters)}
								sx={{
									minWidth: 120,
									borderColor: "#161950",
									color: "#161950",
									"&:hover": {
										borderColor: "#0f1440",
										backgroundColor: "rgba(22, 25, 80, 0.04)",
									},
								}}
							>
								{showFilters ? "Hide Filters" : "Apply Filters"}
							</Button>

							<Button
								variant="contained"
								startIcon={<ChatCenteredText size={18} />}
								sx={{
									backgroundColor: "#161950",
									minWidth: 120,
									"&:hover": { backgroundColor: "#004080" },
								}}
								onClick={async () => {
									try {
										const allPhones = await fetchAllFilteredphone();
										console.log("Total phones found:", allPhones.length);
										// Save numbers in sessionStorage
										const validPhones = allPhones.filter((r: any) => r.messageSent != true).map((r: any) => ({phone:r.phone,npi:r.npi})).filter((r: any) => r.phone != null);
										sessionStorage.setItem("messageNumbers", JSON.stringify(validPhones));
										if(validPhones.length == 0){
											alert("No valid phone numbers found to send message.");
										}else{
										window.location.href = `/dashboard/messaging?total=${validPhones.length}`;

										}
										// Redirect to messaging with total count
									} catch (err) {
										console.error("Error fetching phones:", err);
									}
								}}
							>
								Send Message
							</Button>

							<Dialog open={selectDialogOpen} onClose={() => setSelectDialogOpen(false)} maxWidth="sm" fullWidth>
								<DialogTitle>Select Numbers to Message</DialogTitle>
								<DialogContent dividers>
									<List>
										{filteredRows
											.filter((row) => row.phone) // only include rows with a phone number
											.map((row, i) => {
												const phone = row.phone!.toString().replace(/\D/g, ""); // remove dashes, spaces, etc.

												// Skip landlines, invalid numbers, or duplicates
												if (isLandline(phone) || phone.length < 10 || seen.has(phone)) return null;

												seen.add(phone); // mark as seen

												if (isLandline(phone) || phone.length < 10 || phone.indexOf(phone)) return null; // skip landlines
												return (
													<ListItem key={i} disablePadding>
														<ListItemButton
															onClick={() => {
																setSelectedNumbers((prev) =>
																	prev.includes(phone) ? prev.filter((num) => num !== phone) : [...prev, phone]
																);
															}}
														>
															<Checkbox checked={selectedNumbers.includes(phone)} />
															<ListItemText primary={phone} />
														</ListItemButton>
													</ListItem>
												);
											})
											.filter(Boolean)}
									</List>
								</DialogContent>

								<DialogActions>
									<Button onClick={() => setSelectDialogOpen(false)}>Cancel</Button>
									<Button
										variant="contained"
										onClick={() => {
											// Save selected numbers to sessionStorage
											sessionStorage.setItem("messageNumbers", JSON.stringify(selectedNumbers));

											// Redirect with total count
											window.location.href = `/dashboard/messaging?total=${selectedNumbers.length}`;
										}}
										disabled={selectedNumbers.length === 0}
									>
										Continue ({selectedNumbers.length})
									</Button>
								</DialogActions>
							</Dialog>

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
										"&:hover": { backgroundColor: "#0f1440" },
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
						<Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
							<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
								{/* State Filter */}
								<FormControl size="small" sx={{ minWidth: 120 }}>
									<InputLabel>State</InputLabel>
									<Select value={stateFilter} label="State" onChange={(e) => setStateFilter(e.target.value)}>
										<MenuItem value="">All</MenuItem>
										{states.map((s) => (
											<MenuItem key={s} value={s}>
												{s}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* City Filter */}
								<FormControl size="small" sx={{ minWidth: 120 }}>
									<InputLabel>City</InputLabel>
									<Select value={cityFilter} label="City" onChange={(e) => setCityFilter(e.target.value)}>
										<MenuItem value="">All</MenuItem>
										{cities.map((c) => (
											<MenuItem key={c} value={c}>
												{c}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* Organization Filter */}
								<FormControl size="small" sx={{ minWidth: 140 }}>
									<InputLabel>Organization</InputLabel>
									<Select value={orgFilter} label="Organization" onChange={(e) => setOrgFilter(e.target.value)}>
										<MenuItem value="">All</MenuItem>
										{orgs.map((o) => (
											<MenuItem key={o} value={o}>
												{o}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* Date Picker - Single Date Picker */}
								{/* Date Range Pickers */}
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
										{/* Start Date Picker */}
										<DatePicker
											label="Start Date"
											value={startDate}
											onChange={(newValue) => {
												setStartDate(newValue);
												if (!endDate || (newValue && endDate.isBefore(newValue))) {
													// if end date is before new start, reset it
													setEndDate(null);
												}
											}}
											slotProps={{
												textField: {
													size: "small",
													sx: { width: 150 },
												},
											}}
										/>

										{/* End Date Picker */}
										<DatePicker
											label="End Date"
											value={endDate}
											onChange={(newValue) => setEndDate(newValue)}
											disabled={!startDate} // only active after start date selected
											minDate={startDate || undefined}
											slotProps={{
												textField: {
													size: "small",
													sx: { width: 150 },
												},
											}}
										/>
									</Stack>
								</LocalizationProvider>

								{/* Clear Filters Button */}
								<Button variant="outlined" color="error" onClick={handleClearFilters} sx={{ minWidth: 100 }}>
									Clear All
								</Button>
							</Stack>
						</Box>
					)}

					{/* Active Filters Chips */}
					{hasActiveFilters && (
						<Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
							{stateFilter && (
								<Chip
									label={`State: ${stateFilter}`}
									onDelete={() => removeFilter("state")}
									deleteIcon={<X size={16} />}
									size="small"
									color="primary"
									variant="outlined"
								/>
							)}
							{cityFilter && (
								<Chip
									label={`City: ${cityFilter}`}
									onDelete={() => removeFilter("city")}
									deleteIcon={<X size={16} />}
									size="small"
									color="primary"
									variant="outlined"
								/>
							)}
							{orgFilter && (
								<Chip
									label={`Organization: ${orgFilter}`}
									onDelete={() => removeFilter("org")}
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
				{loading ? (
					<Loader />
				) : (
					<DashboardTable
						count={totalRows}
						page={page}
						rows={rows} // already sliced
						rowsPerPage={rowsPerPage}
						onPageChange={(_, newPage) => setPage(newPage)}
						rowsPerPageOptions={[10, 25, 50, 100]}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
					/>
				)}
			</Box>
		</Stack>
	);
}
