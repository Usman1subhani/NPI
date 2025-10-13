"use client";

import * as React from "react";
// import dummyLeadsRows from '@/components/dashboard/Leads/dummyleadsrows';
// import type { Customer } from '@/components/dashboard/Projects/project-table';
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
// import { useEffect } from 'react';
import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
// import type { Metadata } from 'next';

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import toast from "react-hot-toast";
import io from "socket.io-client";
// import Stack from '@mui/material/Stack';
import * as XLSX from "xlsx";

import { useUser } from "@/hooks/use-user";
// import { dummyLeads } from '@/components/dashboard/Leads/dummyleadsrows';
// import { config } from '@/config';
// import { LeadsFilters } from '@/components/dashboard/Leads/leads-filters';
import { Customer, LeadsTable } from "@/components/dashboard/Leads/leads-table";

const socket = io("https://gofernets.run.place",{
  path: "/unipullar/socket.io",
  transports: ["websocket", "polling"], // optional but good
});

export default function Page(): React.JSX.Element {
	const router = useRouter();
	//
	// const paginatedCustomers = applyPagination(customers, page, rowsPerPage);
	const [leads, setLeads] = React.useState<Customer[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [pages, setPages] = React.useState(0);
	const [rowsPerPages, setRowsPerPages] = React.useState(10); // You can adjust this
	const { checkSession } = useUser();

	// Filter leads when search term changes
	const exportToCSV = () => {
		const csv = Papa.unparse(leads);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "leads.csv";
		a.click();
		URL.revokeObjectURL(url);
	};
	//  const exportToCSV = () => {
	//     const csvRows = [
	//     [
	//       "ID",
	//       "Project Name",
	//       "Name",
	//       "Email",
	//       "Address",
	//       "Category",
	//       "Phone",
	//       "City",
	//       "Google Url",
	//       "Website",
	//       "Rating",
	//       "Stars",
	//       "Reviews",
	//       "About",
	//       "Facebook",
	//       "LinkedIn",
	//       "Instagram",
	//       "Youtube",
	//       "Logo",
	//       "Images",
	//     ],
	//     ...leads.map((lead) => [
	//       lead.placeId,
	//       lead.storeName,
	//       lead.email,
	//       lead.address,
	//       lead.category,
	//       lead.phone,
	//       lead.city,
	//       lead.googleUrl,
	//       lead.bizWebsite,
	//       lead.ratingText,
	//       lead.stars,
	//       lead.numberOfReviews,
	//       lead.about,
	//       lead.facebook || "N/A",
	//       lead.linkedIn || "N/A",
	//       lead.instagram || "N/A",
	//       lead.youtube || "N/A",
	//       lead.logoUrl || "N/A",
	//       lead.images || "N/A",
	//     ]),
	//   ];

	//   const csvContent = `data:text/csv;charset=utf-8,${csvRows
	//     .map((row) => row.join(","))
	//     .join("\n")}`;
	//   const link = document.createElement("a");
	//   link.href = encodeURI(csvContent);
	//   link.download = "leads.csv";
	//   link.click();
	// };

	// const exportToExcel = () => {
	// 	const worksheet = XLSX.utils.json_to_sheet(leads);
	// 	const workbook = XLSX.utils.book_new();
	// 	XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
	// 	XLSX.writeFile(workbook, "leads.xlsx");
	// };
	const exportToExcel = () => {
		const ws = XLSX.utils.json_to_sheet(leads);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Leads");
		XLSX.writeFile(wb, "leads.xlsx");
	};

	// const exportToPDF = () => {
	// 	const doc = new jsPDF();

	// 	if (leads.length === 0) return;

	// 	// Get base columns (excluding nested object)
	// 	const baseColumns = Object.keys(leads[0]).filter((col) => col !== "socialLinks");

	// 	// Flattened socialLinks keys (if present)
	// 	const socialLinkKeys = leads[0].socialLinks
	// 		? Object.keys(leads[0].socialLinks)
	// 		: ["facebook", "linkedin", "instagram", "youtube"];

	// 	// Prepare headers
	// 	const headers = [
	// 		...baseColumns.map((col) => ({ content: col })),
	// 		...socialLinkKeys.map((key) => ({ content: `socialLinks.${key}` })),
	// 	];

	// 	// Prepare row data
	// 	const rows = leads.map((lead) => {
	// 		const flatRow = [];

	// 		// Add base fields
	// 		for (const key of baseColumns) {
	// 			const value = lead[key];

	// 			if (value && typeof value === "object") {
	// 				flatRow.push(Object.values(value).join(", "));
	// 			} else {
	// 				flatRow.push(value ?? "");
	// 			}
	// 		}

	// 		// Add socialLinks fields
	// 		for (const key of socialLinkKeys) {
	// 		const linkValue = lead.socialLinks?.[key as keyof typeof lead.socialLinks] ?? "";
	// 			flatRow.push(linkValue);
	// 		}

	// 		return flatRow;
	// 	});

	// 	autoTable(doc, {
	// 		head: [headers],
	// 		body: rows,
	// 		styles: { fontSize: 8 }, // optional for better fit
	// 	});

	// 	doc.save("leads.pdf");
	// };
	const exportToPDF = () => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		let yPosition = 20;

		leads.forEach((lead, index) => {
			doc.text(`Lead #${index + 1}`, 20, yPosition);
			yPosition += 10;

			doc.setFontSize(12);
			doc.text(`Store Name: ${lead.storeName || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Email: ${lead.email || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Address: ${lead.address || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`City: ${lead.city || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Category: ${lead.category || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Phone: ${lead.phone || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Google URL: ${lead.googleUrl || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Website: ${lead.bizWebsite || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Rating: ${lead.ratingText || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Stars: ${lead.stars || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`LogoUrl: ${lead.logoUrl || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Images: ${lead.images || "N/A"}`, 20, yPosition);
			yPosition += 10;
			doc.text(`Reviews: ${lead.numberOfReviews || "N/A"}`, 20, yPosition);
			yPosition += 20; // Add space between leads

			if (yPosition > 280) {
				doc.addPage();
				yPosition = 20;
			}
		});

		doc.save("leads.pdf");
	};
	const user = JSON.parse(localStorage.getItem("user") || "{}");

	React.useEffect(() => {
		if (!user.email) return;

		const token = localStorage.getItem("auth-token");
		if (!token) {
			console.error("No auth token found");
			setLoading(false);
			router.replace("/auth/sign-in");
			return;
		}

		let isMounted = true;

		const fetchLeads = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allLeads`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await res.json();

				if (data?.msg === "Token Expired. Please log in again.") {
					toast.error("Session expired. Please login again.");
					localStorage.removeItem("auth-token");
					await checkSession?.();
					router.refresh();
					if (isMounted) setLoading(false);
					return;
				}

				if (!res.ok) {
					if (isMounted) setLoading(false);
					return;
				}

				if (isMounted) {
					setLeads(data.data);
					setLoading(false);
				}

				socket.emit("joinVendor", user.email);
			} catch (err) {
				console.error("Failed to fetch leads:", err);
				if (isMounted) setLoading(false);
			}
		};

		fetchLeads();

		// Socket listener
		socket.on("lead", (newLead: Customer) => {
			console.log("📢 New lead received:", newLead);
			setLeads((prevLeads) => [newLead, ...prevLeads]);
		});

		// Cleanup
		return () => {
			isMounted = false;
			socket.off("lead");
		};
	}, [router, user.email, checkSession]);

	const paginatedProjects = React.useMemo(() => {
		const filtered = !searchTerm.trim()
			? leads
			: leads.filter((lead) =>
				Object.values(lead).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
			);
		if (rowsPerPages === -1) return filtered;
		return filtered.slice(pages * rowsPerPages, pages * rowsPerPages + rowsPerPages);
	}, [searchTerm, leads, pages, rowsPerPages]);
	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4" sx={{ color: "#525f7f" }}>
						All Leads
					</Typography>
				</Stack>
			</Stack>
			{/* <LeadsFilters leads={leads} /> */}
			<Card sx={{ p: 2 }}>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
					<OutlinedInput
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						fullWidth
						placeholder="Search by Category"
						startAdornment={
							<InputAdornment position="start">
								<MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
							</InputAdornment>
						}
						sx={{ maxWidth: "400px" }}
					/>

					<Button
						onClick={exportToCSV}
						className="sm:flex"
						variant="contained"
						sx={{ ml: 2, backgroundColor: "#0fb9d8" }}
					>
						Export To CSV
					</Button>
					<Button onClick={exportToPDF} variant="contained" sx={{ ml: 2, backgroundColor: "#0fb9d8" }}>
						Export To Pdf
					</Button>

					<Button onClick={exportToExcel} variant="contained" sx={{ ml: 2, backgroundColor: "#0fb9d8" }}>
						Export To Excel
					</Button>
				</Stack>
			</Card>
			{loading ? (
				<div className="dots-loader">
					<span></span>
					<span></span>
					<span></span>
				</div>
			) : !Array.isArray(leads) || leads.length === 0 ? (
				<Typography variant="subtitle1" sx={{ textAlign: "center", mt: 4 }}>
					No data found
				</Typography>
			) : (
				<LeadsTable
					count={leads.length}
					page={pages}
					rows={paginatedProjects}
					rowsPerPage={rowsPerPages}
					onPageChange={(_, newPage) => setPages(newPage)}
					rowsPerPageOptions={[10, 25, 50, 100, 200, { label: "All", value: -1 }]}
					onRowsPerPageChange={(e) => {
						setRowsPerPages(parseInt(e.target.value, 10));
						setPages(0); // reset to page 0 when page size changes
					}}
					loading={loading}
				/>
			)}
		</Stack>
	);
}

// function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
//   return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
// }
