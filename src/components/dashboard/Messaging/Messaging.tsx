"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Card,
    Stack,
    TextField,
    Typography,
    Button,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { sendMessageAPI } from "@/app/dashboard/messaging/client";


export default function Messaging({ initialNumbers = [] }: { initialNumbers?: string[] }) {
    // keep raw numbers normalized in state (format to API-accepted '1XXXXXXXXXX')
    const [numbers, setNumbers] = useState<string[]>([]);
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

    // Scroll automatically to bottom when new chip added
    useEffect(() => {
        if (toBoxRef.current) {
            toBoxRef.current.scrollTop = toBoxRef.current.scrollHeight;
        }
    }, [numbers]);

    // Normalize and dedupe initial numbers coming from the dashboard (e.g. "337-427-8230")
    useEffect(() => {
        if (!initialNumbers || initialNumbers.length === 0) return;

        const processed = initialNumbers
            .map((s) => (s || '').toString().trim())
            .filter(Boolean)
            .map((s) => formatNumber(s))
            .filter(Boolean);

        // dedupe
        const unique = Array.from(new Set(processed));

        // set normalized numbers into state
        setNumbers(unique);
    }, [initialNumbers]);

    //! ---------------------- Validation Functions ----------------------
    // ✅ Format to 1xxxxxxxxxx (without +)
    const formatNumber = (num: string) => {
        const digits = num.replace(/\D/g, ""); // remove all non-digits
        if (digits.length === 10) return `1${digits}`;
        if (digits.length === 11 && digits.startsWith("1")) return digits;
        return num;
    };
    // ✅ Validate number is U.S. mobile type (without + prefix)
    const isValidUSNumber = (num: string) => /^1\d{10}$/.test(num);

    // Example: fake landline prefixes
    const isLandline = (num: string) => {
        const areaCode = num.slice(2, 5);
        const landlineCodes = ["212", "213", "305", "408", "512", "617", "703"];
        return landlineCodes.includes(areaCode);
    };
    //! -----------------------------------------------------------------
    const handleAddNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            const formatted = formatNumber(inputValue.trim());
            if (!numbers.includes(formatted)) setNumbers([...numbers, formatted]);
            setInputValue("");
        }
    };
    const handleRemoveNumber = (num: string) => {
        setNumbers(numbers.filter((n) => n !== num));
    };

    //! ---------------------- Sending Messages ----------------------
    const showSnackbar = (
        message: string,
        severity: "success" | "error" | "info" | "warning"
    ) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSend = async () => {
        if (numbers.length === 0 || message.trim() === "") {
            showSnackbar("Please add at least one number and write a message.", "warning");
            return;
        }

        setLoading(true);

        const validNumbers = numbers.filter(isValidUSNumber);
        const invalidNumbers = numbers.filter((n) => !isValidUSNumber(n));
        const nonLandlineNumbers = validNumbers.filter((n) => !isLandline(n));
        const rejected = [...invalidNumbers, ...validNumbers.filter(isLandline)];

        if (nonLandlineNumbers.length === 0) {
            showSnackbar("No valid mobile numbers found!", "error");
            setLoading(false);
            return;
        }

        try {
            const res = await sendMessageAPI(nonLandlineNumbers, message);

            // Show skipped numbers (invalid/landline) as a concise message
            if (rejected.length > 0) {
                const sample = rejected.slice(0, 3).join(', ');
                const more = rejected.length > 3 ? ` and ${rejected.length - 3} more` : '';
                showSnackbar(`Skipped ${rejected.length} invalid/landline number(s)${more ? `: ${sample}${more}` : ''}.`, 'warning');
            }

            // If API returned per-number results, summarize successes and failures concisely
            if (res && res.results && Array.isArray(res.results)) {
                const sent = res.results.filter(r => r.success).map(r => r.number);
                const failed = res.results.filter(r => !r.success).map(r => r.number);

                // Success summary: show count and small sample (not full list)
                if (sent.length > 0) {
                    const sample = sent.slice(0, 3).join(', ');
                    const more = sent.length > 3 ? ` and ${sent.length - 3} more` : '';
                    showSnackbar(`Sent to ${sent.length} number(s)${more ? `: ${sample}${more}` : '.'}`, 'success');
                }

                // Failure summary: if there are failures, show count and small sample. If nothing was sent at all, make this more prominent.
                if (failed.length > 0) {
                    const sample = failed.slice(0, 3).join(', ');
                    const more = failed.length > 3 ? ` and ${failed.length - 3} more` : '';
                    const title = sent.length === 0 ? 'Failed to send to' : 'Failed to send to';
                    showSnackbar(`${title} ${failed.length} number(s)${more ? `: ${sample}${more}` : '.'}`, 'error');
                }
            } else if (res && res.success) {
                showSnackbar('Message(s) sent successfully!', 'success');
            } else {
                showSnackbar('Failed to send messages!', 'error');
            }
        } catch (err) {
            showSnackbar('Error while sending messages!', 'error');
        } finally {
            setLoading(false);
            setMessage('');
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
                            maxHeight: isShrunk ? 60 : "auto", // Auto height when expanded, fixed when shrunk
                            overflowY: isShrunk ? "hidden" : "auto",
                            display: "flex",
                            flexWrap: isShrunk ? "nowrap" : "wrap", // No wrap when shrunk, wrap when expanded
                            alignItems: "center",
                            gap: 1,
                            transition: "max-height 0.4s ease, flex-wrap 0.4s ease",
                            whiteSpace: isShrunk ? "nowrap" : "normal", // Prevent wrapping when shrunk
                            overflowX: isShrunk ? "auto" : "hidden", // Horizontal scroll when shrunk
                        }}
                    >
                        {numbers.map((num) => (
                            <Chip
                                key={num}
                                label={isShrunk ? num.substring(0, 10) + (num.length > 10 ? "..." : "") : num} // Truncate when shrunk
                                onDelete={() => handleRemoveNumber(num)}
                                deleteIcon={
                                    <IconButton size="small">
                                        <X size={14} weight="bold" color="Red" />
                                    </IconButton>
                                }
                                sx={{
                                    backgroundColor: "#161950",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#004080" },
                                    fontSize: isShrunk ? 12 : 14, // Smaller font when shrunk
                                    height: isShrunk ? 28 : 32, // Smaller chip size when shrunk
                                }}
                            />
                        ))}

                        {/* Input Field */}
                        <TextField
                            placeholder="Type number & press Enter"
                            variant="standard"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleAddNumber}
                            onFocus={() => setIsShrunk(false)} // Expand when focused
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
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Card>
    );
}