/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Pagination,
  Typography,
  Button, // Import Button for the delete functionality
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { fetchUsers, fetchUser, deleteUser } from "../../services/userServices"; // Import deleteUser service
import { useUserStore } from "../../store/userStore";
import { SelectChangeEvent } from "@mui/material/Select";
import { useProfileStore } from "../../store/profileStore";
import UserDetails from "./UserDetails";

const UserList = () => {
  const { users, setUsers } = useUserStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("registrationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  // New pagination state for userBingoCards
  const [cardPage, setCardPage] = useState(1);
  const cardLimit = 6;

  const { profile, loading } = useProfileStore();

  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: [
      "users",
      { page, limit, search, sortBy, sortOrder, verified,role, startDate, endDate },
    ],
    queryFn: () =>
      fetchUsers({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        verified,
        role,
        startDate,
        endDate,
      }),
  });

  const {
    isPending: isUserDetailsLoading,
    isError: isUserDetialsError,
    error: userDetialsError,
    data: userDetails,
  } = useQuery({
    queryKey: ["userDetails", selectedUserId, cardPage],
    queryFn: () =>
      selectedUserId
        ? fetchUser(selectedUserId, cardPage, cardLimit)
        : Promise.resolve(null),
    enabled: !!selectedUserId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const handleRowClick = (userId: number) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null); // Close dropdown if clicked again
    } else {
      setSelectedUserId(userId);
    }
  };

  

  useEffect(() => {
    if (data) {
      setUsers(data.users);
    }
  }, [data, setUsers]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch users");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteUser = async (userId: number, username:string) => {
    try {
      await deleteUser(userId);
      
      setSuccessState(`${username} deleted Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete user");
      setOpenSnackbar(true);
    }
  };

  const memoizedUsers = useMemo(() => {
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      wallet: user.wallet,
      referralCode: user.referralCode,
      verified: user.verified,
      role: user.role,
      registrationDate: new Date(user.registrationDate).toLocaleDateString(),
    }));
  }, [users]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value);
  };

  const handleVerifiedChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setVerified(value === "" ? null : value === "true" ? true : false);
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setRole(value === "" ? null : value);
  };

  const handleDateFilterChange =
    (type: "startDate" | "endDate") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "startDate") {
        setStartDate(event.target.value);
      } else {
        setEndDate(event.target.value);
      }
    };

  return (
    <>
      {/* Filter and Sort Controls */}

      <Box mb={2}>
        {loading && (
          <>
            <CircularProgress />
          </>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search Users"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="registrationDate">Registration Date</MenuItem>
                <MenuItem value="username">Username</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                {/* Add more sorting options as needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={handleSortOrderChange}
                label="Sort Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Verified</InputLabel>
              <Select
                value={verified === null ? "" : verified.toString()}
                onChange={handleVerifiedChange}
                label="Verified"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

          </Grid>
          <Grid item xs={12} sm={2}>
          <FormControl fullWidth variant="outlined">
              <InputLabel>Role</InputLabel>
              <Select
                value={role === null ? "" : role}
                onChange={handleRoleChange}
                label="Role"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Start Date"
              type="date"
              variant="outlined"
              onChange={handleDateFilterChange("startDate")}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="End Date"
              type="date"
              variant="outlined"
              onChange={handleDateFilterChange("endDate")}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Referral Code</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Registration Date</TableCell>
              {/* Conditionally render the Delete column header */}
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Users Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedUsers.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow key={user.id} onClick={() => handleRowClick(user.id)}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.wallet}</TableCell>
                  <TableCell>{user.referralCode}</TableCell>
                  <TableCell>{user.verified ? "Yes" : "No"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.registrationDate}</TableCell>
                  {/* Conditionally render the Delete button */}
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteUser(Number(user.id),user.username)}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {selectedUserId === user.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isUserDetailsLoading ? (
                        <CircularProgress />
                      ) : isUserDetialsError ? (
                        <p>Error: {userDetialsError.message}</p>
                      ) : userDetails ? (
                        <UserDetails
                          userId={user.id}
                          onClose={() => setSelectedUserId(null)} // Close user details
                          isLoading={isUserDetailsLoading}
                          userDetails={userDetails}
                          refetch={()=>refetch()}
                          cardPage={cardPage}
                          setCardPage={setCardPage}
                          cardLimit={cardLimit}
                        />
                      ) : (
                        <p>No user details found</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      <Box mt={2} display="flex" justifyContent="center">
      <Pagination
        count={data?.pageInfo?.totalPages || 1} // Use totalPages from data.pageInfo
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {errorState}
        </Alert>
      </Snackbar>
      <Snackbar open={openSuccessSnackbar} autoHideDuration={6000} onClose={() => setOpenSuccessSnackbar(false)}>
        <Alert onClose={() => setOpenSuccessSnackbar(false)} severity="success" sx={{ width: "100%" }}>
          {successState}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserList;
