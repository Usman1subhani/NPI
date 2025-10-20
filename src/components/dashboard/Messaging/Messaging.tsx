"use client";
import React, { useState } from "react";
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
import { PaperPlaneTilt, X } from "@phosphor-icons/react"; // ✅ Phosphor icons

export default function Messaging() {
  const [numbers, setNumbers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");

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
    // later this will call the API from client.tsx
    setMessage("");
  };

  return (
    <Card sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Messaging
        </Typography>

        {/* Recipients */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            To:
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            gap={1}
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              p: 1,
              minHeight: 56,
            }}
          >
            {numbers.map((num) => (
              <Chip
                key={num}
                label={num}
                onDelete={() => handleRemoveNumber(num)}
                deleteIcon={
                  <IconButton size="small">
                    <X size={14} weight="bold" />
                  </IconButton>
                }
                color="primary"
                sx={{ m: 0.5 }}
              />
            ))}
            <TextField
              placeholder="Type number & press Enter"
              variant="standard"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddNumber}
              sx={{ flexGrow: 1, minWidth: 150 }}
            />
          </Stack>
        </Box>

        {/* Message Box */}
        <TextField
          label="Message"
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          fullWidth
        />

        {/* Send Button */}
        <Box textAlign="right">
          <Button
            variant="contained"
            color="primary"
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
