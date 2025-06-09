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
import DoneIcon from '@mui/icons-material/Done';
import { approveWithdrawal, fetchPendingWithdrawals,rejectWithdrawal } from "../../services/withdrawalServices"; // Import deleteUser service
import { usePendingWithdrawalsStore } from "../../store/withdrawStore";
import { SelectChangeEvent } from "@mui/material/Select";
import { useProfileStore } from "../../store/profileStore";
import { DeleteForever } from "@mui/icons-material";

const WithdrawalRequestList = () => {
  const { pendingWithdrawals, setPendingWithdrawals } = usePendingWithdrawalsStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status,setStatus] = useState<string | null>(null);
  const { profile, loading } = useProfileStore();

  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: [
      "pendingWithdrawals",
      { page, limit, search, sortBy, sortOrder, status },
    ],
    queryFn: () =>
      fetchPendingWithdrawals({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status
      }),
  });

  

  useEffect(() => {
    if (data) {
      setPendingWithdrawals(data.pendingWithdrawals);
    }
  }, [data, setPendingWithdrawals]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch pending withdrawals");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleApproveWithdrawal = async (userId: number, username:string) => {
    try {
      await approveWithdrawal(userId);
      
      setSuccessState(`Withdrawal Aprroved for ${username}'s  Request Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.message || "Failed to Approve Withdrawal Request"); 
      setOpenSnackbar(true);
    }
  };

  const handleRejectWithdrawal = async (userId: number, username:string) => {
    try {
      await rejectWithdrawal(userId);
      
      setSuccessState(`Withdrawal Rejected for ${username}'s  Request Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.message || "Failed to Reject Withdrawal Request"); 
      setOpenSnackbar(true);
    }
  };

  const memoizedPendingWithdrawals = useMemo(() => {
    return pendingWithdrawals.map((pendingWithdrawal) => ({
      id: pendingWithdrawal.id,
      username: pendingWithdrawal.user.username,
      phoneNumber: pendingWithdrawal.user.phoneNumber,
      wallet: pendingWithdrawal.user.wallet,
      amount: pendingWithdrawal.amount,
      accountNumber: pendingWithdrawal.accountNumber,
      bankCode: pendingWithdrawal.bankCode,
      status: pendingWithdrawal.status,
      createdAt: new Date(pendingWithdrawal.createdAt).toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
      }),
    }));
  }, [pendingWithdrawals]);

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

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setStatus(value === "" ? null : value);
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
                <MenuItem value="createdAt">Request Date</MenuItem>
                <MenuItem value="username">Username</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                <MenuItem value="phoneNumber">Phone Number</MenuItem>
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
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={status === null ? "" : status}
                          onChange={handleStatusChange}
                          label="Status"
                        >
                          <MenuItem value="">
                            <em>All</em>
                          </MenuItem>
                          <MenuItem value="PENDING">Pending</MenuItem>
                          <MenuItem value="APPROVED">Approved</MenuItem>
                          <MenuItem value="REJECTED">Rejected</MenuItem>
                        </Select>
                      </FormControl>
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
              <TableCell>Amount</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Account Number</TableCell>
              <TableCell>Bank Code</TableCell>
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
          {pendingWithdrawals.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Withdrawal Requests Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedPendingWithdrawals.map((pendingWithdrawal) => (
              <React.Fragment key={pendingWithdrawal.id}>
                <TableRow key={pendingWithdrawal.id}>
                  <TableCell>{pendingWithdrawal.id}</TableCell>
                  <TableCell>{pendingWithdrawal.username}</TableCell>
                  <TableCell>{pendingWithdrawal.phoneNumber}</TableCell>
                  <TableCell>{pendingWithdrawal.wallet}</TableCell>
                  <TableCell>{pendingWithdrawal.amount}</TableCell>
                  <TableCell>{pendingWithdrawal.createdAt}</TableCell>
                  <TableCell>{pendingWithdrawal.status}</TableCell>
                  <TableCell>{pendingWithdrawal.accountNumber}</TableCell>
                  <TableCell>{pendingWithdrawal.bankCode}</TableCell>
                  {/* Conditionally render the Delete button */}
                  {profile?.role === "ADMIN" && pendingWithdrawal.status === "PENDING" && (
                    <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleApproveWithdrawal(Number(pendingWithdrawal.id), pendingWithdrawal.username)}
                        startIcon={<DoneIcon />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRejectWithdrawal(Number(pendingWithdrawal.id), pendingWithdrawal.username)}
                        startIcon={<DeleteForever />}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                  
                  )}
                </TableRow>
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

export default WithdrawalRequestList;
