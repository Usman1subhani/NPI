"use client";
import * as React from "react";
import { Stack, Typography, Box } from "@mui/material";
import { PropertiesCard } from "@/components/dashboard/google-users/google-users-card";
import { PropertiesFilters } from "@/components/dashboard/google-users/google-users-filters";
import { useGoogleUsers } from "./api";

export default function Page() {
  const { loading, error } = useGoogleUsers();

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 5, color: "red" }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );

  return (
    <Stack spacing={3}>
      <PropertiesFilters />
      <PropertiesCard />
    </Stack>
  );
}
