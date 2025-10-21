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
} from "@mui/material";
import { CheckCircle, Trash } from "@phosphor-icons/react";
import ConfirmationPopup from "@/components/dashboard/google-users/confirmationPopup";
import DeletePopup from '@/components/dashboard/google-users/Delete-Popup';
import DeclinePopup from '@/components/dashboard/google-users/Decline-Popup';

export interface User {
  id: string;
  name: string;
  email: string;
  status: "Approved" | "Pending" | "Disapproved";
  avatar: string;
}

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
}

export function PropertiesCard({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: UsersTableProps): React.JSX.Element {
  const [userList, setUserList] = React.useState<User[]>(rows);

  const [openPopup, setOpenPopup] = React.useState(false);
  const [popupType, setPopupType] = React.useState<'confirm' | 'decline' | 'delete' | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleOpenPopup = (type: typeof popupType, user?: User) => {
    setPopupType(type);
    setSelectedUser(user || null);
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setPopupType(null);
    setSelectedUser(null);
  };
  const [userData, setUserData] = React.useState<User[]>(rows);

  const handleConfirm = () => {
    if (selectedUser) {
      setUserData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: 'Approved' } : u
        )
      );
    }
    handleClosePopup();
  };

  const handleDecline = () => {
    if (selectedUser) {
      setUserData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: 'Disapproved' } : u
        )
      );
    }
    handleClosePopup();
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUserData((prev) => prev.filter((u) => u.id !== selectedUser.id));
    }
    handleClosePopup();
  };


  return (
    <Card sx={{ borderRadius: 0, p: 2 }}>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={600} fontSize={14}>#</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600} fontSize={14}>NAME</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600} fontSize={14}>STATUS</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight={600} fontSize={14}>ACTIONS</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.id} hover>
                {/* ID */}
                <TableCell>
                  <Chip label={user.id} size="small" sx={{ fontWeight: 500, fontSize: 13 }} />
                </TableCell>

                {/* Name */}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={user.avatar} alt={user.name} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography fontWeight={600} fontSize={14}>{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        user.status === "Approved"
                          ? "green"
                          : user.status === "Pending"
                            ? "orange"
                            : "red",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {user.status}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {/* Approve or Cancel */}
                    <IconButton
                      onClick={() =>
                        user.status === "Approved"
                          ? handleOpenPopup("decline", user)
                          : handleOpenPopup("confirm", user)
                      }
                      sx={{
                        color: user.status === "Approved" ? "green" : "#757575",
                        backgroundColor:
                          user.status === "Approved" ? "#E8F5E9" : "#E0E0E0",
                        "&:hover": {
                          backgroundColor:
                            user.status === "Approved" ? "#C8E6C9" : "#D6D6D6",
                        },
                      }}
                    >
                      <CheckCircle size={15} />
                    </IconButton>

                    {/* Delete */}
                    <IconButton
                      onClick={() => handleOpenPopup("delete", user)}
                      sx={{
                        color: "red",
                        backgroundColor: "#FFEBEE",
                        "&:hover": { backgroundColor: "#FFCDD2" },
                      }}
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
          message="Are you sure you want to cancel approval for this user?"
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
