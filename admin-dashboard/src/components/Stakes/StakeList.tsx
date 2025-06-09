/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Button,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Add as AddIcon } from "@mui/icons-material"; // Import icons
import {
  fetchStakes,
  deleteStake,
  addStake,
} from "../../services/stakeServices"; // Add addStake function
import { useStakeStore } from "../../store/stakeStore";
import { useProfileStore } from "../../store/profileStore";

const StakeList = () => {
  const { stakes, setStakes } = useStakeStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [sortOrder, setSortOrder] = useState("asc");
  const { profile, loading } = useProfileStore();

  const [isAdding, setIsAdding] = useState(false); // Track whether the input field is visible
  const [newStake, setNewStake] = useState<number | null>(null); // For holding the new stake amount

  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: ["stakes", { page, limit, search, sortBy, sortOrder }],
    queryFn: () => fetchStakes({ page, limit, search, sortBy, sortOrder }),
  });
  const mutation = useMutation({
    mutationFn: addStake,
    onSuccess: () => {
      setSuccessState(`Stake added Successfully`);
      setOpenSuccessSnackbar(true);
    },
    onError: () => {
      setErrorState("Failed to add Stakes");
      setOpenSnackbar(true);
    },
  });
  useEffect(() => {
    if (data) {
      setStakes(data.stakes);
    }
  }, [data, setStakes]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch Stakes");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteStake = async (stakeId: number, stakeAmount: string) => {
    try {
      await deleteStake(stakeId);
      setSuccessState(`Stake with ${stakeAmount} birr deleted Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete stake");
      setOpenSnackbar(true);
    }
  };

  const handleSaveStake = async () => {
    if (!newStake) return; // Don't allow empty submissions
    try {
      await mutation.mutateAsync(newStake); // Call the addStake service function
      setIsAdding(false); // Hide the input field after saving
      setNewStake(null); // Clear the input field
      setSuccessState(` stake with amount of ${newStake} Added successfully`);
      setOpenSuccessSnackbar(true);
      await refetch(); // Refetch the list to include the new stake
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to add stake");
      setOpenSnackbar(true);
    }
  };

  const memoizedStakes = useMemo(() => {
    return stakes.map((stake) => ({
      id: stake.id,
      amount: stake.amount,
    }));
  }, [stakes]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <>
      <Box mb={2}>
        {loading && (
          <>
            <CircularProgress />
          </>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search Stakes"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="amount">Amount</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            {" "}
            {/* Add new stake */}
            {profile?.role === "ADMIN" && (
              <Box p={2} mt={1}>
                {!isAdding ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsAdding(true)}
                      disabled={mutation.isPending} // Disable button during mutation
                      startIcon={<AddIcon />}
                    >
                      Add Stake
                    </Button>
                  </>
                ) : (
                  <Box display="flex" alignItems="center">
                    <TextField
                      label="New Stake Amount"
                      value={newStake}
                      onChange={(e) => setNewStake(Number(e.target.value))}
                      type="number"
                      variant="outlined"
                    />
                    <Box ml={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveStake}
                        disabled={mutation.isPending} // Disable button during mutation
                      >
                        {mutation.isPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsAdding(false)}
                        sx={{ ml: 2 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Amount</TableCell>
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}
          {stakes.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Stake Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedStakes.map((stake) => (
              <React.Fragment key={stake.id}>
                <TableRow>
                  <TableCell>{stake.id}</TableCell>
                  <TableCell>{stake.amount}</TableCell>
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          handleDeleteStake(Number(stake.id), stake.amount)
                        }
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={data?.pageInfo?.totalPages || 1} // Use totalPages from data.pageInfo
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorState}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSuccessSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSuccessSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successState}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StakeList;
