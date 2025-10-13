"use client";

import * as React from "react";
import { Box, Tooltip } from "@mui/material";
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
import { FaFacebook, FaInstagram, FaLinkedin, FaRegStar, FaStar, FaStarHalfAlt, FaYoutube } from "react-icons/fa"; // at the top

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
	//   const rowIds = React.useMemo(() => {
	//     return rows.map((customer) => customer.id);
	//   }, [rows]);

	let index = 1;

	return (
		<Card>
				<TableContainer
					component={Paper}
					sx={{
						maxHeight: '75vh', // increased height to show more rows
						overflow: 'auto',
					}}
			>
				<Table sx={{ minWidth: "800px" }} stickyHeader>
					<TableHead  >
						<TableRow >
							<TableCell sx={{ backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" }}>#</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" }}>NPI</TableCell>
							<TableCell sx={{ backgroundColor: "#0fb9d8 !important",color: "white !important", fontSize: "16px", fontWeight: "bold",whiteSpace: "nowrap" }}>Enumeration Type</TableCell>
							<TableCell sx={{ backgroundColor: "#0fb9d8 !important",color: "white !important", fontSize: "16px", fontWeight: "bold" ,whiteSpace: "nowrap"}}>First Name</TableCell>
							<TableCell sx={{ backgroundColor: "#0fb9d8 !important",color: "white !important", fontSize: "16px", fontWeight: "bold",whiteSpace: "nowrap" }}>Last Name</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" ,whiteSpace: "nowrap"}}>Organization</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" }}>City</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" }}>State</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" ,whiteSpace: "nowrap"}}>Postal Code</TableCell>
							<TableCell sx={{ backgroundColor: "#0fb9d8 !important",color: "white !important", fontSize: "16px", fontWeight: "bold" }}>Phone</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold" }}>Taxonomy</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold",whiteSpace: "nowrap" }}>Created At</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold",whiteSpace: "nowrap" }}>Updated At</TableCell>
							<TableCell sx={{backgroundColor: "#0fb9d8 !important", color: "white !important", fontSize: "16px", fontWeight: "bold",whiteSpace: "nowrap" }}>Enumeration Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows && rows.length > 0 ? (
							rows.map((row, index) => (
								<TableRow hover key={row.npi}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>{row.npi}</TableCell>
									<TableCell>{row.enumerationType || "N/A"}</TableCell>
									<TableCell>{row.firstName || "-"}</TableCell>
									<TableCell>{row.lastName || "-"}</TableCell>
									<TableCell>{row.orgName ? (
											<Tooltip title={row.orgName}>
												<Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
													{row.orgName.length > 50 ? row.orgName.slice(0, 50) + "..." : row.orgName}
												</Typography>
											</Tooltip>
										) : (
											"No Organization Name"
										)}</TableCell>
									<TableCell>{row.city || "-"}</TableCell>
									<TableCell>{row.state || "-"}</TableCell>
									<TableCell>{row.postalCode || "-"}</TableCell>
									<TableCell>{row.phone || "-"}</TableCell>
									<TableCell>
										{row.taxonomy ? (
											<Tooltip title={row.taxonomy}>
												<Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
													{row.taxonomy.length > 50 ? row.taxonomy.slice(0, 50) + "..." : row.taxonomy}
												</Typography>
											</Tooltip>
										) : (
											"No Taxonomy"
										)}
									</TableCell>

									<TableCell>{new Date(row.createdAt ?? "").toLocaleDateString()}</TableCell>
									<TableCell>{new Date(row.updatedAt ?? "").toLocaleDateString()}</TableCell>
									<TableCell>{new Date(row.enumerationDate ?? "").toLocaleDateString()}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={13} align="center">
									No data found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
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
