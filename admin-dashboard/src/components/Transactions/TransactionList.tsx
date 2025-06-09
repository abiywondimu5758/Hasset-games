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
} from "@mui/material";
import {
  fetchTransactions,
  fetchTransactionById,
} from "../../services/transactionServices"; // Import deleteUser service
import { useTransactionStore } from "../../store/transactionStore";
import { SelectChangeEvent } from "@mui/material/Select";
import { useProfileStore } from "../../store/profileStore";
import TransactionDetails from "./TransactionDetails";

const TransactionList = () => {
  const { transactions, setTransactions } = useTransactionStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);

  const { loading } = useProfileStore();

  const { isPending, isError, error, data } = useQuery({
    queryKey: [
      "transactions",
      { page, limit, search, sortBy, sortOrder, status, startDate, endDate },
    ],
    queryFn: () =>
      fetchTransactions({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
        startDate,
        endDate,
      }),
  });

  const {
    isPending: isTransactionDetailsLoading,
    isError: isTransactionDetialsError,
    error: transactionDetialsError,
    data: transactionDetails,
    refetch: transactionDetailsRefetch,
  } = useQuery({
    queryKey: ["transactionsDetails", selectedTransactionId],
    queryFn: () =>
      selectedTransactionId
        ? fetchTransactionById(selectedTransactionId)
        : Promise.resolve(null),
    enabled: !!selectedTransactionId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });
  const handleRowClick = async (TransactionId: number) => {
    if (selectedTransactionId === TransactionId) {
      setSelectedTransactionId(null); // Close dropdown if clicked again
    } else {
      await transactionDetailsRefetch();
      setSelectedTransactionId(TransactionId);
    }
  };

  useEffect(() => {
    if (data) {
      setTransactions(data.transactions);
    }
  }, [data, setTransactions]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch Transactions");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const memoizedTransactions = useMemo(() => {
    return transactions.map((transaction) => ({
      id: transaction.id,
      username: transaction.username,
      TransactionDate: new Date(transaction.created_at).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // Set to true for 12-hour format
        }
      ),
      TransactionUpdateDate: new Date(transaction.updated_at).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // Set to true for 12-hour format
        }
      ),
      amount: transaction.amount,
      status: transaction.status,
      mobile: transaction.mobile,
      reference: transaction.reference,
      txRef: transaction.tx_ref,
      walletUpdated: transaction.userWalletUpdated,
      event: transaction.event,
      currency: transaction.currency,
    }));
  }, [transactions]);

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
    setStatus(value === "" ? null : value === "active" ? "active" : "ended");
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
              label="Search type"
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
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="created_at">Created At</MenuItem>
                <MenuItem value="status">status</MenuItem>
                <MenuItem value="amount">amount</MenuItem>
                <MenuItem value="reference">Reference</MenuItem>
                <MenuItem value="tx_ref">Tx Reference</MenuItem>
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
                value={status === null ? "" : status.toString()}
                onChange={handleStatusChange}
                label="Verified"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="ended">Ended</MenuItem>
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
              <TableCell>Mobile</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Tx Reference</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Wallet Updated</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Transaction Date</TableCell>
              <TableCell>Transaction Update Date</TableCell>
              <TableCell>Event</TableCell>
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}
          {transactions.length === 0 && !isPending && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Transactions Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedTransactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <TableRow
                  key={transaction.id}
                  onClick={() => handleRowClick(transaction.id)}
                >
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.mobile}</TableCell>
                  <TableCell>{transaction.username}</TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell>{transaction.txRef}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                    {transaction.walletUpdated ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>{transaction.TransactionDate}</TableCell>
                  <TableCell>{transaction.TransactionUpdateDate}</TableCell>
                  <TableCell>{transaction.event}</TableCell>
                </TableRow>
                {selectedTransactionId === transaction.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isTransactionDetailsLoading ? (
                        <CircularProgress />
                      ) : isTransactionDetialsError ? (
                        <p>Error: {transactionDetialsError.message}</p>
                      ) : transactionDetails ? (
                        <TransactionDetails
                        txRef = {transactionDetails.tx_ref}
                          onClose={() => setSelectedTransactionId(null)} // Close user details
                          isLoading={isTransactionDetailsLoading}
                          transactionDetails={transactionDetails}
                        />
                      ) : (
                        <p>No transaction details found</p>
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
    </>
  );
};

export default TransactionList;
