"use client";
import * as React from "react";
import {
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Pagination,
} from "@mui/material";
import { CheckCircle, Trash } from "@phosphor-icons/react";
import ConfirmationPopup from "@/components/dashboard/google-users/confirmationPopup";
import DeletePopup from "@/components/dashboard/google-users/Delete-Popup";
import DeclinePopup from "@/components/dashboard/google-users/Decline-Popup";
import { useGoogleUsers } from "@/app/dashboard/google-users/api";

export function PropertiesCard() {
  const { users, loading, error, approveUser, disapproveUser, deleteUser } = useGoogleUsers();

  const [openPopup, setOpenPopup] = React.useState(false);
  const [popupType, setPopupType] = React.useState<"confirm" | "decline" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [userData, setUserData] = React.useState(users);

  // ✅ Pagination states
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5;

  React.useEffect(() => {
    setUserData(users);
  }, [users]);

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };

  const handleOpenPopup = (type: typeof popupType, user?: any) => {
    setPopupType(type);
    setSelectedUser(user || null);
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setPopupType(null);
    setSelectedUser(null);
  };

  // ✅ Approve handler
  const handleConfirm = async () => {
    if (selectedUser) {
      try {
        await approveUser(selectedUser.id);
        setUserData((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, approved: true } : u
          )
        );
      } catch (err) {
        console.error("Approval failed", err);
      }
    }
    handleClosePopup();
  };

  // ✅ Disapprove handler
  const handleDecline = async () => {
    if (selectedUser) {
      try {
        await disapproveUser(selectedUser.id);
        setUserData((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, approved: false } : u
          )
        );
      } catch (err) {
        console.error("Disapproval failed", err);
      }
    }
    handleClosePopup();
  };

  // ✅ Delete handler
  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setUserData((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
    handleClosePopup();
  };

  const formattedUsers = userData.map((u) => ({
    id: u.id,
    role: u.role,
    name: u.name,
    email: u.email,
    avatar: u.profile || "",
    status: u.approved ? "Approved" : "Pending",
  }));

  // ✅ Slice data for pagination
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedUsers = formattedUsers.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(formattedUsers.length / rowsPerPage);

  if (loading)
    return <Typography sx={{ mt: 4, textAlign: "center" }}>Loading users...</Typography>;

  if (error)
    return (
      <Typography sx={{ mt: 4, textAlign: "center", color: "red" }}>
        {error}
      </Typography>
    );

  return (
    <Card sx={{ borderRadius: 0, p: 2 }}>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>ROLE</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="center">ACTIONS</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Chip label={user.id} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.avatar} alt={user.name} />
                    <Box>
                      <Typography fontWeight={600}>{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color:
                        user.status === "Approved"
                          ? "green"
                          : "orange",
                      fontWeight: 600,
                    }}
                  >
                    {user.status}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center" spacing={1}>
                    {/* ✅ Check icon */}
                    <IconButton
                      onClick={() =>
                        user.status === "Approved"
                          ? handleOpenPopup("decline", user)
                          : handleOpenPopup("confirm", user)
                      }
                      sx={{
                        color: user.status === "Approved" ? "green" : "#757575",
                      }}
                    >
                      <CheckCircle size={15} />
                    </IconButton>

                    {/* ✅ Delete icon */}
                    <IconButton
                      onClick={() => handleOpenPopup("delete", user)}
                      sx={{ color: "red" }}
                    >
                      <Trash size={15} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* ✅ Pagination below table */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          size="small"
          color="primary"
        />
      </Box>

      {/* ✅ Popups */}
      {popupType === "confirm" && (
        <ConfirmationPopup
          open={openPopup}
          onClose={handleClosePopup}
          onConfirm={handleConfirm}
          message="Are you sure you want to approve this user?"
        />
      )}

      {popupType === "decline" && (
        <DeclinePopup
          open={openPopup}
          onClose={handleClosePopup}
          onConfirm={handleDecline}
          message="Are you sure you want to disapprove this user?"
        />
      )}

      {popupType === "delete" && (
        <DeletePopup
          open={openPopup}
          onClose={handleClosePopup}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this user?"
        />
      )}
    </Card>
  );
}
