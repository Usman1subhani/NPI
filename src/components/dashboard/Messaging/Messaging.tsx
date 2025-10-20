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
} from "@mui/material";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";

export default function Messaging({ initialNumbers = [] }: { initialNumbers?: string[] }) {
    const [numbers, setNumbers] = useState<string[]>(initialNumbers);
    const [inputValue, setInputValue] = useState("");
    const [message, setMessage] = useState("");
    const [isShrunk, setIsShrunk] = useState(false); // shrink "To" section when composing
    const toBoxRef = useRef<HTMLDivElement>(null);

    // Scroll automatically to bottom when new chip added
    useEffect(() => {
        if (toBoxRef.current) {
            toBoxRef.current.scrollTop = toBoxRef.current.scrollHeight;
        }
    }, [numbers]);

    const handleAddNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            if (!numbers.includes(inputValue.trim())) {
                setNumbers([...numbers, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const handleRemoveNumber = (num: string) => {
        setNumbers(numbers.filter((n) => n !== num));
    };

    const handleSend = () => {
        if (numbers.length === 0 || message.trim() === "") {
            alert("Please add at least one number and write a message.");
            return;
        }
        console.log("📤 Sending message to:", numbers, "Message:", message);
        setMessage("");
        setIsShrunk(false);
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
                        }}
                        endIcon={<PaperPlaneTilt size={18} weight="fill" />}
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </Box>
            </Stack>
        </Card>
    );
}