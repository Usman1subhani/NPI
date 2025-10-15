"use client";

import * as React from "react";
import { Box, Tooltip, TextField, Button, IconButton, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import Card from "@mui/material/Card";
// import Checkbox from '@mui/material/Checkbox';
import Divider from "@mui/material/Divider";
// import CircularProgress from '@mui/material/CircularProgress';
// import DotLoader from 'react-spinners/DotLoader';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
// import Avatar from '@mui/material/Avatar';
// import Box from '@mui/material/Box';
// import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';

// import dayjs from 'dayjs';
// import { useSelection } from '@/hooks/use-selection';
// import { Url } from 'next/dist/shared/lib/router/router';

function noop(): void {
	// do nothing
}
export interface NpiRegistry {
	npi: string; // Primary ID
	enumerationType?: string;
	firstName?: string;
	lastName?: string;
	orgName?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	phone?: string;
	taxonomy?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
	enumerationDate?: string | Date;
}

interface DashboardTableProps {
	count?: number;
	page?: number;
	rows?: NpiRegistry[];
	rowsPerPage?: number;
	onPageChange: (_: any, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	rowsPerPageOptions?: Array<number | { label: string; value: number }>;
	loading?: boolean;
}

export function DashboardTable({
	count = 0,
	rows = [],
	page = 0,
	rowsPerPage = 0,
	onPageChange,
	onRowsPerPageChange,
	rowsPerPageOptions = [10, 25, 50, 100],
	loading = false,
}: DashboardTableProps): React.JSX.Element {
	// Unique values for filters
	const states = React.useMemo(() => Array.from(new Set(rows.map(r => r.state).filter(Boolean))), [rows]);
	const cities = React.useMemo(() => Array.from(new Set(rows.map(r => r.city).filter(Boolean))), [rows]);
	const orgs = React.useMemo(() => Array.from(new Set(rows.map(r => r.orgName).filter(Boolean))), [rows]);

	// Filter state
	const [searchTerm, setSearchTerm] = React.useState("");
	const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(null);
	const [stateFilter, setStateFilter] = React.useState("");
	const [cityFilter, setCityFilter] = React.useState("");
	const [orgFilter, setOrgFilter] = React.useState("");

	// Filter rows
	const filteredRows = React.useMemo(() => {
		return rows.filter(row => {
			const searchLower = searchTerm.toLowerCase();
			const firstNameMatch = row.firstName?.toLowerCase().includes(searchLower);
			const lastNameMatch = row.lastName?.toLowerCase().includes(searchLower);
			const stateMatch = !stateFilter || row.state === stateFilter;
			const cityMatch = !cityFilter || row.city === cityFilter;
			const orgMatch = !orgFilter || row.orgName === orgFilter;
			// Date filter: filter by createdAt
			const dateMatch = !selectedDate || (row.createdAt && dayjs(row.createdAt).isSame(selectedDate, 'day'));
			return (!searchTerm || firstNameMatch || lastNameMatch) && stateMatch && cityMatch && orgMatch && dateMatch;
		});
	}, [rows, searchTerm, stateFilter, cityFilter, orgFilter, selectedDate]);

	// Export CSV
	const handleExport = () => {
		// TODO: Implement CSV export logic
		console.log("Export to CSV clicked");
	};

	return (
		<Box sx={{ transform: 'scale(1)', transformOrigin: 'top left', width: '100%' }}>
			<Card sx={{ width: '100%' }}>
				<TableContainer
					component={Paper}
					sx={{
						maxHeight: '160vh', // smaller height
						maxWidth: '100%',
						overflow: 'auto',
						boxShadow: 'none',
					}}
				>
					<Table sx={{ minWidth: 700 }} stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>#</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>NPI</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Enumeration Type</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>First Name</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Last Name</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Organization</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>City</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>State</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Postal Code</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>Phone</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1 }}>Taxonomy</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Created At</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Updated At</TableCell>
								<TableCell sx={{ backgroundColor: '#161950', color: 'white', fontSize: 13, fontWeight: 700, py: 1, whiteSpace: 'nowrap' }}>Enumeration Date</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredRows && filteredRows.length > 0 ? (
								filteredRows.map((row, index) => (
									<TableRow hover key={row.npi} sx={{ fontSize: 13 }}>
										<TableCell sx={{ fontSize: 13 }}>{index + 1}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.npi}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.enumerationType || "N/A"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.firstName || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.lastName || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>
											{row.orgName ? (
												<Tooltip title={row.orgName}>
													<Typography variant="body2" noWrap sx={{ maxWidth: 120, fontSize: 13 }}>
														{row.orgName.length > 30 ? row.orgName.slice(0, 30) + "..." : row.orgName}
													</Typography>
												</Tooltip>
											) : (
												"No Organization Name"
											)}
										</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.city || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.state || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.postalCode || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{row.phone || "-"}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>
											{row.taxonomy ? (
												<Tooltip title={row.taxonomy}>
													<Typography variant="body2" noWrap sx={{ maxWidth: 120, fontSize: 13 }}>
														{row.taxonomy.length > 30 ? row.taxonomy.slice(0, 30) + "..." : row.taxonomy}
													</Typography>
												</Tooltip>
											) : (
												"No Taxonomy"
											)}
										</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{new Date(row.createdAt ?? "").toLocaleDateString()}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{new Date(row.updatedAt ?? "").toLocaleDateString()}</TableCell>
										<TableCell sx={{ fontSize: 13 }}>{new Date(row.enumerationDate ?? "").toLocaleDateString()}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={14} align="center" sx={{ fontSize: 13 }}>
										No data found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<Divider />
				<Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
					<TablePagination
						component="div"
						count={filteredRows.length}
						page={page ?? 0}
						onPageChange={onPageChange}
						rowsPerPage={rowsPerPage ?? 10}
						onRowsPerPageChange={onRowsPerPageChange}
						rowsPerPageOptions={rowsPerPageOptions}
						sx={{
							'.MuiTablePagination-select': {
								borderRadius: 1,
								mr: 1,
								fontSize: 13,
								color: '#161950',
							},
							'.MuiTablePagination-displayedRows': {
								mr: 2,
								fontSize: 13,
								color: '#161950',
							},
							'.MuiTablePagination-actions': {
								color: '#161950',
							},
						}}
					/>
				</Box>
			</Card>
		</Box>
	);
}
