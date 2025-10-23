"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PropertiesCard } from "@/components/dashboard/google-users/google-users-card";
import { PropertiesFilters } from "@/components/dashboard/google-users/google-users-filters";
import { useGoogleUsers } from "./api"; // 👈 import hook

export default function Page(): React.JSX.Element {
  const { users, loading, error } = useGoogleUsers();

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

  // ✅ Transform backend users to your UI format
  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.profile || "",
    status: u.approved ? ("Approved" as const) : ("Pending" as const),
  }));

  return (
    <Stack spacing={3}>
      <PropertiesFilters />

      <PropertiesCard
        count={formattedUsers.length}
        page={0}
        rows={formattedUsers}
        rowsPerPage={5}
      />

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination count={3} size="small" />
      </Box>
    </Stack>
  );
}
