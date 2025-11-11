import { useEffect, useRef, useState } from "react";
import { sendMessageAPI } from "@/app/dashboard/messaging/client";
import {
	Alert,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Snackbar,
	TextField,
	Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";

export default function MessagingDialog({
	open,
	setOpen,
	numbers,
	setNumbers,
	// displayNumbers,
	// setDisplayNumbers,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	numbers: any[];
	setNumbers: (numbers: any[]) => void;
	// displayNumbers: string[];
	// setDisplayNumbers: (numbers: string[]) => void;
}) {
	const [inputValue, setInputValue] = useState("");
	const [message, setMessage] = useState("");
	const [isShrunk, setIsShrunk] = useState(false); // shrink "To" section when composing
	const toBoxRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });
	useEffect(() => {
		console.log("mounted");
		if (toBoxRef.current) {
			toBoxRef.current.scrollTop = toBoxRef.current.scrollHeight;
		}
	}, [numbers]);
	useEffect(() => {
		const formattedNumbers = numbers.map((num) => ({ phone: num["phone"].toString(), npi: num.npi })); // digits only
		setNumbers(formattedNumbers);
	}, []);

	const remainingCount = numbers.length;
	const formatNumber = (num: string) => {
		return num.replace(/\D/g, ""); // remove dashes, brackets, spaces, etc.
	};
	const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
		setSnackbar({ open: true, message, severity });
	};

	const isLandline = (num: string) => {
		if (num.length < 10) return false;
		const areaCode = num.slice(0, 3); // use first 3 digits
		const landlineCodes = ["212", "213", "305", "408", "512", "617", "703"];
		return landlineCodes.includes(areaCode);
	};
	const handleAddNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			const formatted = formatNumber(inputValue.trim());
			if (!numbers.filter((n) => n.phone === formatted).length && !isLandline(formatted)) {
				// setDisplayNumbers(displayNumbers.concat(formatted));
				setNumbers([...numbers, { phone: formatted }]);
			}
			setInputValue("");
		}
	};
	// const handleRemoveNumber = (num: string) => {
	// 	setNumbers(numbers.filter((n) => n.phone !== num));
	// 	setDisplayNumbers(displayNumbers.filter((n) => n !== num));
	// };

	const handleSend = async () => {
		if (numbers.length === 0 || message.trim() === "") {
			showSnackbar("Please add at least one number and write a message.", "warning");
			return;
		}

		setLoading(true);

		try {
			const res = await sendMessageAPI(numbers, message); // send as whole array

			if (res && res.success && res.results) {
				setNumbers([]);
				showSnackbar(res.message || "Message(s) sending started", "success");
				setOpen(false);
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
		<>
			<Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
				<DialogTitle>Messaging</DialogTitle>
				<DialogContent>
					<Card sx={{ p: 3 }}>
						<Stack spacing={3}>
							<Typography variant="h5" sx={{ fontWeight: 600 }}>
								Messaging
							</Typography>

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
									{remainingCount > 0 && (
										<Chip
											label={`${remainingCount} Phone Numbers Selected`}
											sx={{ backgroundColor: "green", color: "white", fontSize: 12, height: 28 }}
										/>
									)}
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

							<TextField
								label="Message"
								multiline
								rows={6}
								value={message}
								onChange={(e) => {
									setMessage(e.target.value);
									setIsShrunk(e.target.value.length > 0);
								}}
								placeholder="Write your message here..."
								fullWidth
							/>

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
					</Card>
				</DialogContent>
			</Dialog>
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
