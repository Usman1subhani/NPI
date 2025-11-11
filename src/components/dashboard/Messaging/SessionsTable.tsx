"use client";

import React, { useEffect, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	Divider,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
    Typography,
} from "@mui/material";

export default function SessionsTable() {
	const [sessions, setSessions] = useState<any[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });
	const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
		setSnackbar({ open: true, message, severity });
	};
	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/get-all-sessions`)
			.then((res) => res.json())
			.then((data) => {
				if (data.status) {
					setSessions(data.sessions);
				}
			});
	}, []);

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const handleResume = async (sessionId: string) => {
		if (!sessionId) {
			showSnackbar("No active session to resume!", "warning");
			return;
		}

		try {
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/resume-sms`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId: Number(sessionId) }),
			});

			showSnackbar("⛔ SMS sending resumed!", "info");
		} catch (err) {
			showSnackbar("Error resuming SMS sending!", "error");
		}
	};
	const handleStop = async (sessionId: string) => {
		if (!sessionId) {
			showSnackbar("No active session to stop!", "warning");
			return;
		}

		try {
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/stop-sms`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId: Number(sessionId) }),
			});

			showSnackbar("⛔ SMS sending stopped!", "info");
		} catch (err) {
			showSnackbar("Error stopping SMS sending!", "error");
		}
	};

	return (
		<>
			<Card sx={{ width: "100%", mt: 3 }}>
				<TableContainer component={Paper} sx={{ maxHeight: "130vh", overflow: "auto", boxShadow: "none" }}>
					<Table stickyHeader sx={{ minWidth: 700 }}>
						<TableHead>
							<TableRow>
								<TableCell>#</TableCell>
								<TableCell sx={{ textWrap: "nowrap" }}>Campaign ID</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Message</TableCell>
								<TableCell sx={{ textWrap: "nowrap" }}>Created At</TableCell>
								<TableCell sx={{ textWrap: "nowrap" }}>Total Phones</TableCell>
								<TableCell>Sent</TableCell>
								<TableCell>Pending</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{sessions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((session, index) => {
								const totalPhones = session.items.length;
								const sentCount = session.items.filter((i: any) => i.sent).length;
								const pendingCount = totalPhones - sentCount;

								return (
									<TableRow key={session.id} hover>
										<TableCell>{page * rowsPerPage + index + 1}</TableCell>
										<TableCell>{session.id}</TableCell>
										<TableCell>{session.status}</TableCell>
										<TableCell>{session.message || "-"}</TableCell>
										<TableCell sx={{ textWrap: "nowrap" }}>{new Date(session.createdAt).toLocaleString()}</TableCell>
										<TableCell>{totalPhones}</TableCell>
										<TableCell>{sentCount}</TableCell>
										<TableCell>{pendingCount}</TableCell>
										<TableCell sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
											{session.status === "running" && (
												<>
													<Button variant="outlined" sx={{ width: 'fit-content',padding:'10px 10px 10px 10px',lineHeight:1 }} onClick={() => handleStop(session.id)}>
														Stop
													</Button>
													<Button variant="outlined" sx={{ width: 'fit-content',padding:'10px 10px 10px 10px',lineHeight:1 }} onClick={() => handleResume(session.id)}>
														Resume
													</Button>
												</>
											)}
											{session.status === "stopped" && (
												<Button variant="outlined" sx={{ width:"fit-content",padding:'10px 10px 10px 10px',lineHeight:1 }} onClick={() => handleResume(session.id)}>
													Resume
												</Button>
											)}
											{session.status === "completed" && (
												<Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
													Completed
												</Typography>
											)}
										</TableCell>
									</TableRow>
								);
							})}
							{sessions.length === 0 && (
								<TableRow>
									<TableCell colSpan={8} align="center">
										No sessions found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<Divider />
				<Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
					<TablePagination
						component="div"
						count={sessions.length}
						page={page}
						onPageChange={handleChangePage}
						rowsPerPage={rowsPerPage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						rowsPerPageOptions={[5, 10, 25]}
					/>
				</Box>
			</Card>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
