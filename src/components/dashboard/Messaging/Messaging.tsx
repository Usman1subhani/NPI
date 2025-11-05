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
	IconButton,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { any } from "zod";

export default function Messaging({ initialNumbers }: { initialNumbers: string[] }) {
	// keep raw numbers normalized in state (format to API-accepted '1XXXXXXXXXX')
	const [numbers, setNumbers] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [message, setMessage] = useState("");
	const [isShrunk, setIsShrunk] = useState(false); // shrink "To" section when composing
	const toBoxRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(false);
	const [displayNumbers, setDisplayNumbers] = useState<string[]>([]);

	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	// Scroll automatically to bottom when new chip added
	useEffect(() => {
		if (toBoxRef.current) {
			toBoxRef.current.scrollTop = toBoxRef.current.scrollHeight;
		}
	}, [numbers]);

	// Normalize and dedupe initial numbers coming from the dashboard (e.g. "337-427-8230")

	useEffect(() => {
    const stored = sessionStorage.getItem("messageNumbers");
    if (stored) {
        const storedNumbers: string[] = JSON.parse(stored);
        const formattedNumbers = storedNumbers
            .map((num) => num.replace(/\D/g, "")) // digits only
        setNumbers(formattedNumbers);
    }
}, []);

// decalre empty array any type

	// Inside your component
	const remainingCount = numbers.length
	//  - displayNumbers.length;

	//! ---------------------- Validation Functions ----------------------
	// ✅ Format to xxxxxxxxxx (without +)
	const formatNumber = (num: string) => {
		return num.replace(/\D/g, ""); // remove dashes, brackets, spaces, etc.
	};

	// Example: fake landline prefixes
	const isLandline = (num: string) => {
		if (num.length < 10) return false;
		const areaCode = num.slice(0, 3); // use first 3 digits
		const landlineCodes = ["212", "213", "305", "408", "512", "617", "703"];
		return landlineCodes.includes(areaCode);
	};

	//! -----------------------------------------------------------------
	const handleAddNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			const formatted = formatNumber(inputValue.trim());
			if (!numbers.includes(formatted) && !isLandline(formatted)){ 
				setDisplayNumbers(displayNumbers.concat(formatted));
				setNumbers([...numbers, formatted]);}
			setInputValue("");
		}
	};
	const handleRemoveNumber = (num: string) => {
		setNumbers(numbers.filter((n) => n !== num));
		setDisplayNumbers(displayNumbers.filter((n) => n !== num));
	};

	//! ---------------------- Sending Messages ----------------------
	const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
		setSnackbar({ open: true, message, severity });
	};

	const handleSend = async () => {
		if (numbers.length === 0 || message.trim() === "") {
			showSnackbar("Please add at least one number and write a message.", "warning");
			return;
		}

		setLoading(true);

		try {
			const res = await sendMessageAPI(numbers, message); // send as whole array

			if (res && res.success) {
				// Backend accepted the batch and will process sequentially — clear UI so user can continue
				setNumbers([]);
				showSnackbar(res.message || "Message(s) sending started", "success");
			} else if (res && res.results) {
				const failed = res.results.filter((r) => !r.success).map((r) => r.number);
				if (failed.length > 0) {
					showSnackbar(`Failed to send to ${failed.join(", ")}`, "error");
				} else {
					setNumbers([]);
					showSnackbar("Message(s) sent successfully!", "success");
				}
			} else {
				showSnackbar(res.error || "Failed to send messages!", "error");
			}
		} catch (err) {
			showSnackbar("Error while sending messages!", "error");
		} finally {
			setLoading(false);
			setMessage("");
			setIsShrunk(false);
		}
	};

	return (
		<Card sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 4 }}>
			<Stack spacing={3}>
				<Typography variant="h5" sx={{ fontWeight: 600 }}>
					Messaging
				</Typography>

				{/* ✅ To Section */}
				{/* ✅ To Section */}
				<Box>
					<Typography variant="subtitle1" sx={{ mb: 1 }}>
						To:
					</Typography>

					<Box
						ref={toBoxRef}
						sx={{
							border: "1px solid #ccc",
							borderRadius: "8px",
							p: 1,
							minHeight: 56,
							maxHeight: isShrunk ? 60 : "auto",
							overflowY: isShrunk ? "hidden" : "auto",
							display: "flex",
							flexWrap: isShrunk ? "nowrap" : "wrap",
							alignItems: "center",
							gap: 1,
							transition: "max-height 0.4s ease, flex-wrap 0.4s ease",
							whiteSpace: isShrunk ? "nowrap" : "normal",
							overflowX: isShrunk ? "auto" : "hidden",
						}}
					>
						{displayNumbers.map((num) => {
							const landline = isLandline(num);
							return (
								<Chip
									key={num}
									label={
										isShrunk
											? num.substring(0, 10) + (num.length > 10 ? "..." : "")
											: landline
												? `${num} (Landline)` // mark landlines
												: num
									}
									onDelete={() => handleRemoveNumber(num)}
									deleteIcon={
										<IconButton size="small">
											<X size={14} weight="bold" color="Red" />
										</IconButton>
									}
									sx={{
										backgroundColor: landline ? "#b71c1c" : "#161950", // red for landline
										color: "white",
										"&:hover": { backgroundColor: landline ? "#8b0000" : "#004080" },
										fontSize: isShrunk ? 12 : 14,
										height: isShrunk ? 28 : 32,
									}}
								/>
							);
						})}

						{remainingCount > 0 && (
							<Chip
								label={`${remainingCount} Phone Numbers Selected`}
								sx={{ backgroundColor: "green", color: "white", fontSize: 12, height: 28 }}
							/>
						)}

						{/* Input Field */}
						<TextField
							placeholder="Add More Numbers & Enter to add"
							variant="standard"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleAddNumber}
							onFocus={() => setIsShrunk(false)}
							sx={{ flexGrow: 1, minWidth: 150, mb: isShrunk ? 0 : 1 }}
						/>
					</Box>
				</Box>

				{/* ✅ Message Text Area */}
				<TextField
					label="Message"
					multiline
					rows={6}
					value={message}
					onChange={(e) => {
						setMessage(e.target.value);
						setIsShrunk(e.target.value.length > 0); // Shrink "To" when typing starts
					}}
					placeholder="Write your message here..."
					fullWidth
				/>

				{/* ✅ Send Button */}
				<Box textAlign="right">
					<Button
						variant="contained"
						sx={{
							backgroundColor: "#161950",
							"&:hover": { backgroundColor: "#004080" },
							width: 120,
						}}
						endIcon={!loading && <PaperPlaneTilt size={18} weight="fill" />}
						onClick={handleSend}
						disabled={loading}
					>
						{loading ? <CircularProgress size={20} color="inherit" /> : "Send"}
					</Button>
				</Box>
			</Stack>
			{/* ✅ Snackbar for feedback */}
			{/* Snackbar */}
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
		</Card>
	);
}
