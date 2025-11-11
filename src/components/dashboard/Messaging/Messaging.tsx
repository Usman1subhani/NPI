"use client";

import React, { useEffect, useRef, useState } from "react";
import { sendMessageAPI } from "@/app/dashboard/messaging/client";
import {
	Alert,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { any } from "zod";
import SessionsTable from "./SessionsTable";

export default function Messaging() {
	// keep raw numbers normalized in state (format to API-accepted '1XXXXXXXXXX')
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	// Scroll automatically to bottom when new chip added
	

	// Normalize and dedupe initial numbers coming from the dashboard (e.g. "337-427-8230")

	// useEffect(() => {
	// 	const stored = sessionStorage.getItem("messageNumbers");
	// 	if (stored) {
	// 		const storedNumbers: any[] = JSON.parse(stored);
	// 		console.log(storedNumbers[0]["phone"]);y

	// 		const formattedNumbers = storedNumbers.map((num) => ({ phone: num["phone"].toString(), npi: num.npi })); // digits only
	// 		setNumbers(formattedNumbers);
	// 	}
	// }, []);

	// decalre empty array any type

	// Inside your component
	
	//  - displayNumbers.length;

	//! ---------------------- Validation Functions ----------------------
	// ✅ Format to xxxxxxxxxx (without +)
	

	// Example: fake landline prefixes


	//! -----------------------------------------------------------------
	
	
	//! ---------------------- Sending Messages ----------------------
	

	
	return (
		<>
		  <Typography variant="h4" sx={{ mb: 2 }}>Messaging</Typography>
	       <SessionsTable />

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
