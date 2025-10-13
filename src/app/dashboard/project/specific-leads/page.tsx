"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// import { Card } from "@mui/material";
import {
	Box,
	Button,
	Card,
	Divider,
	InputAdornment,
	OutlinedInput,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { FaFacebook, FaInstagram, FaLinkedin, FaRegStar, FaStar, FaStarHalfAlt, FaYoutube } from "react-icons/fa"; // at the top
import * as XLSX from "xlsx";
import io from "socket.io-client";

// Define Customer type here or import properly
import { Customer } from "@/components/dashboard/Leads/leads-table";

export default function Page() {
	const hasFetchedRef = React.useRef(false);
	const searchParams = useSearchParams();
	const businessCategory = searchParams.get("category");

	const [specificleads, setspecificLeads] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10); // You can adjust this

	// socket setup inside useEffect
	useEffect(() => {
		if (!businessCategory || hasFetchedRef.current) return;
		hasFetchedRef.current = true;

		const socket = io("https://gofernets.run.place",{
  path: "/unipullar/socket.io",
  transports: ["websocket", "polling"], // optional but good
});

		socket.emit("join_lead", businessCategory);

		// fetch initial leads
		const fetchLeads = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/specific-lead/${encodeURIComponent(businessCategory)}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
						},
					}
				);

				const data = await res.json();
				if (!res.ok || !data.success) {
					toast.error(`Failed to fetch leads for ${businessCategory}`);
					setspecificLeads([]);
				} else {
					setspecificLeads(Array.isArray(data.data) ? data.data : []);
				}
			} catch (error) {
				toast.error("Error fetching leads");
			} finally {
				setLoading(false);
			}
		};

		fetchLeads();

		// live updates
		socket.on("lead_details", (lead) => {
			console.log("Live update for my lead:", lead);
			if (Array.isArray(lead)) {
				setspecificLeads(lead);
			} else if (lead && typeof lead === "object") {
				setspecificLeads((prev) => {
					return [...prev, lead];
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [businessCategory]);

	// search filter
	const filteredLeads = React.useMemo(() => {
		if (!searchTerm.trim()) return specificleads;
		return specificleads.filter((lead) =>
			Object.values(lead).some((value) =>
				String(value).toLowerCase().includes(searchTerm.toLowerCase())
			)
		);
	}, [searchTerm, specificleads]);

	// pagination
	const paginatedLeads = React.useMemo(() => {
		if (rowsPerPage === -1) return filteredLeads;
		return filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [filteredLeads, page, rowsPerPage]);


	const handleBack = () => {
		window.history.back();
	};

	const exportToCSV = () => {
		const csv = Papa.unparse(filteredLeads);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "leads.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

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
		const ws = XLSX.utils.json_to_sheet(filteredLeads);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Leads");
		XLSX.writeFile(wb, "leads.xlsx");
	};

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

		filteredLeads.forEach((lead, index) => {
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

	const renderStars = (rating: number) => {
		const stars = [];

		for (let i = 1; i <= 5; i++) {
			if (rating >= i) {
				stars.push(<FaStar key={i} color="rgba(40, 39, 39, 0.87)" size={16} />);
			} else if (rating >= i - 0.5) {
				stars.push(<FaStarHalfAlt key={i} color="rgba(40, 39, 39, 0.87)" size={16} />);
			} else {
				stars.push(<FaRegStar key={i} color="rgba(40, 39, 39, 0.87)" size={16} />);
			}
		}

		return stars;
	};
	let index = 1;
	return (
		<Card>
			<div style={{ padding: 20, display: "flex", alignItems: "center" }}>
				<Button variant="outlined" onClick={handleBack}>
					Back to Projects
				</Button>
				<Typography variant="h6" style={{ margin: "auto" }}>
					Leads for <strong>{businessCategory}</strong>
				</Typography>
			</div>
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

					<Button onClick={exportToCSV} className="sm:flex" variant="contained" sx={{ ml: 2, backgroundColor: "#0fb9d8" }}>
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
			<Divider />
			{loading ? (
				<Typography sx={{ p: 2 }}>Loading...</Typography>
			) : (
				<>
					<TableContainer
						component={Paper}
						sx={{
							maxHeight: "50vh", // Set your desired height here
							overflow: "auto",
						}}
					>
						<Table sx={{ minWidth: 800 }}>
							<TableHead>
								<TableRow>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>City</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>ID</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Name</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Email</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Location</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }} >Category</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Search Category</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Phone</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Google Map</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Ratings</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Stars</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Reviews</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>About</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Website</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Facebook</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>LinkedIn</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Instagram</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>YouTube</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Logo</TableCell>
									<TableCell sx={{ color: "#525f7f", fontSize: "16px", fontWeight: "bold" }}>Image</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{paginatedLeads.map((lead) => (
									<TableRow hover key={index}>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.city}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{index++}</TableCell>

										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.storeName ? (
												<Tooltip title={lead.storeName}>
													<Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
														{lead.storeName.length > 50 ? lead.address.slice(0, 50) + "..." : lead.storeName}
													</Typography>
												</Tooltip>
											) : (
												"No Address"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.email ? lead.email : "No Email"}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.address ? (
												<Tooltip title={lead.address}>
													<Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
														{lead.address.length > 50 ? lead.address.slice(0, 50) + "..." : lead.address}
													</Typography>
												</Tooltip>
											) : (
												"No Address"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.category ? lead.category : "No Category"}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.projectCategory ? lead.projectCategory : "No Project Category"}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.phone ? (
												<a
													style={{ color: "rgba(40, 39, 39, 0.87)", textDecoration: "none" }}
													href={`tel:${lead.phone}`}
												>
													{lead.phone}
												</a>
											) : (
												"No Phone"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.googleUrl ? (
												<a href={lead.googleUrl} target="_blank" rel="noopener noreferrer">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="30"
														height="30"
														fill="rgba(40, 39, 39, 0.87)"
														className="bi bi-geo-alt-fill"
														viewBox="0 0 16 16"
													>
														<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
													</svg>
												</a>
											) : (
												"No Image"
											)}
										</TableCell>

										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.ratingText}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													width: "100%", // ensure full width for centering
												}}
											>
												{renderStars(Number(lead.stars))}
											</Box>
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>{lead.numberOfReviews}</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.about ? (
												<Tooltip title={lead.about}>
													<Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
														{lead.about.length > 50 ? lead.about.slice(0, 50) + "..." : lead.about}
													</Typography>
												</Tooltip>
											) : (
												"No About"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{" "}
											{lead.bizWebsite ? (
												<Tooltip title={lead.bizWebsite}>
													<a href={lead.bizWebsite} target="_blank" rel="noopener noreferrer">
														<Box
															component="img"
															src={`https://www.google.com/s2/favicons?sz=64&domain_url=${lead.bizWebsite}`}
															alt="Website Logo"
															sx={{ width: 24, height: 24, fontSize: "40px" }}
														/>
													</a>
												</Tooltip>
											) : (
												"No Website"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.socialLinks?.facebook ? (
												<a href={lead.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
													<FaFacebook color="rgba(40, 39, 39, 0.87)" size={30} />
												</a>
											) : (
												"No Image"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.socialLinks?.linkedin ? (
												<a href={lead.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
													<FaLinkedin color="rgba(40, 39, 39, 0.87)" size={30} />
												</a>
											) : (
												"No Image"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.socialLinks?.instagram ? (
												<a href={lead.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
													<FaInstagram color="rgba(40, 39, 39, 0.87)" size={30} />
												</a>
											) : (
												"No Image"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.socialLinks?.youtube ? (
												<a href={lead.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
													<FaYoutube color="rgba(40, 39, 39, 0.87)" size={30} />
												</a>
											) : (
												"No Image"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.logoUrl ? (
												<Tooltip title={lead.logoUrl}>
													<a href={lead.logoUrl} target="_blank" rel="noopener noreferrer">
														<Box
															component="img"
															src={`https://www.google.com/s2/favicons?sz=64&domain_url=${lead.logoUrl}`}
															alt="logo"
															sx={{ width: 24, height: 24 }}
														/>
													</a>
												</Tooltip>
											) : (
												"No Logo"
											)}
										</TableCell>
										<TableCell sx={{ color: "#525f7f", fontSize: "16px" }}>
											{lead.imageUrl ? (
												<Tooltip title={lead.imageUrl}>
													<a href={lead.imageUrl} target="_blank" rel="noopener noreferrer">
														<Box
															component="img"
															src={`https://www.google.com/s2/favicons?sz=64&domain_url=${lead.imageUrl}`}
															alt="Image"
															sx={{ width: 24, height: 24 }}
														/>
													</a>
												</Tooltip>
											) : (
												"No Image"
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					<TablePagination
						component="div"
						count={filteredLeads.length}
						page={page}
						onPageChange={(_, newPage) => setPage(newPage)}
						rowsPerPage={rowsPerPage}
						rowsPerPageOptions={[10, 25, 50, 100, 200, { label: "All", value: -1 }]}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
					/>
				</>
			)}
		</Card>
	);
}
