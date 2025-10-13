"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OutlinedInput,
  Button,
  FormControl,
  InputLabel,
  FormHelperText,
  Stack,
} from "@mui/material";
import { authClient } from "@/lib/auth/client";
import { useUser } from '@/hooks/use-user';
export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState("");

  const { checkSession } = useUser();

  useEffect(() => {
    const data = localStorage.getItem("pendingRegisterData");
    if (data) {
      setFormData(JSON.parse(data));
    } else {
      router.push("/auth/sign-up"); // fallback if no data
    }
  }, [router]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      const { error } = await authClient.signUp({
        ...formData,
        phone: Number(formData.phone),
        otp,
      });

      if (error) {
        setError(error);
        return;
      }

      localStorage.removeItem("pendingRegisterData");
       // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
     // Or wherever you want
    } catch (err) {
      console.error(err);
      setError("OTP verification failed.");
    }
  };

  return (
    <Stack spacing={3}>
      <FormControl error={!!error}>
        <InputLabel>Enter OTP</InputLabel>
        <OutlinedInput
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          label="Enter OTP"
          type="text"
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
      <Button onClick={handleVerifyOtp} variant="contained">
        Verify & Register
      </Button>
    </Stack>
  );
}
