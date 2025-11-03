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
	IconButton,
	Menu
} from "@mui/material";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, List, ListItem, ListItemText,ListItemButton
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
import { Loader } from "@/components/core/loader";

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
	const formatDateString = (date: Dayjs | null) =>
		date ? date.format("YYYY-MM-DD") : "";

	const [startDate, setStartDate] = useState<Dayjs | null>(dayjs(monday));
	const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(sunday));

	const [searchTerm, setSearchTerm] = useState("");
	const [stateFilter, setStateFilter] = useState("");
	const [cityFilter, setCityFilter] = useState("");
	const [orgFilter, setOrgFilter] = useState("");

	// Fetch data from backend
const fetchAllFiltered = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data/export-csv`, {
    params: {
      startDate: startDate ? formatDateString(startDate) : "",
      endDate: endDate ? formatDateString(endDate) : "",
    },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: "blob",
  });

  // ✅ Convert CSV blob → text
  const csvText = await res.data.text();

  // ✅ Split into rows
  const lines = csvText.split("\n").filter(Boolean);
  const header = lines[0].split(",");

  // ✅ Find which column is "phone"
  const phoneIndex = header.findIndex((col: any) => col.trim().toLowerCase() === "phone");

  if (phoneIndex === -1) {
    console.error("⚠️ Phone column not found in CSV.");
    return [];
  }

  // ✅ Return list of phone numbers
  return lines.slice(1).map((line : any) => line.split(",")[phoneIndex]?.trim()).filter(Boolean);
};


	const loadData = async () => {
		setLoading(true);
		try {
			const res = await fetchNpiData({
				startDate: startDate ? formatDateString(startDate) : "", // only send if selected
				endDate: endDate ? formatDateString(endDate) : "",       // only send if selected
				page: page + 1,
				limit: rowsPerPage,
			});
			setRows(res.data || []);
			setTotalRows(res.total || res.data.length);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};


	// --- update useEffect to load data only if start date exists ---
	useEffect(() => {
		loadData(); // always load initially and on change
	}, [page, rowsPerPage, startDate, endDate]);


	// --- update loadData() to skip when no start date selected ---

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
			if (startDate && row.updatedAt) {
				dateMatch = !dayjs(row.updatedAt).isBefore(startDate, "day");
			}
			if (endDate && row.updatedAt) {
				dateMatch = dateMatch && !dayjs(row.updatedAt).isAfter(endDate, "day");
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
		setStartDate(null);
		setEndDate(null);
		setRows([]); // clear data
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

						<Button
  variant="contained"
  startIcon={<ChatCenteredText size={18} />}
  sx={{
    backgroundColor: '#161950',
    minWidth: 120,
    '&:hover': { backgroundColor: '#004080' },
  }}
  onClick={(e) => setAnchorEl(e.currentTarget)}
>
  Message
</Button>

<Menu
  anchorEl={anchorEl}
  open={openMenu}
  onClose={() => setAnchorEl(null)}
>
<MenuItem
  onClick={async () => {
    setAnchorEl(null);

    const allPhones = await fetchAllFiltered();
    console.log("Total phones found:", allPhones.length);

    const numbers = allPhones.join(",");

    window.location.href = `/dashboard/messaging?to=${encodeURIComponent(numbers)}`;
  }}
>
  Message All (Filtered Data)
</MenuItem>



  <MenuItem
    onClick={() => {
      setAnchorEl(null);
      const pageNumbers = filteredRows
        .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
        .map(r => r.phone)
        .filter(Boolean)
        .join(',');
      window.location.href = `/dashboard/messaging?to=${encodeURIComponent(pageNumbers)}`;
    }}
  >
    Message Current Page Only
  </MenuItem>

  <MenuItem
    onClick={() => {
      setAnchorEl(null);
      setSelectDialogOpen(true);
    }}
  >
    Select Specific Records
  </MenuItem>
</Menu>

<Dialog
  open={selectDialogOpen}
  onClose={() => setSelectDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Select Numbers to Message</DialogTitle>
  <DialogContent dividers>
    <List>
      {filteredRows
        .filter(row => row.phone) // only include rows with a phone number
        .map((row, i) => {
          const phone = row.phone!.toString(); // safe because we filtered
          return (
            <ListItem key={i} disablePadding>
              <ListItemButton
                onClick={() => {
                  setSelectedNumbers(prev =>
                    prev.includes(phone)
                      ? prev.filter(num => num !== phone)
                      : [...prev, phone]
                  );
                }}
              >
                <Checkbox checked={selectedNumbers.includes(phone)} />
                <ListItemText primary={phone} />
              </ListItemButton>
            </ListItem>
          );
        })}
    </List>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setSelectDialogOpen(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={() => {
        const nums = selectedNumbers.join(",");
        window.location.href = `/dashboard/messaging?to=${encodeURIComponent(nums)}`;
      }}
      disabled={selectedNumbers.length === 0}
    >
      Continue
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
												size: 'small',
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
												size: 'small',
												sx: { width: 150 },
											},
										}}
									/>
								</Stack>
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
			{loading ? (
				<Loader />
			) : (
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
				/>
			)}
		</Stack>
	);
}