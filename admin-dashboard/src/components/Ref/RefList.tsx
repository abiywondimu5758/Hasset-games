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
  Button,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { fetchReferredUsers, deleteReferredUser, fetchReferredUser } from "../../services/refServices";
import { useReferredUserStore } from "../../store/refStore";
import { useProfileStore } from "../../store/profileStore";
import RefDetail from "./RefDetail";

const ReferralList = () => {
  const { referredUsers, setReferredUsers } = useReferredUserStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("registrationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedReferralId, setSelectedReferralId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null); // State for start date filter
  const [endDate, setEndDate] = useState<string | null>(null); // State for end date filter
  const { profile, loading } = useProfileStore();


  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: ["referrals", { page, limit, search, sortBy, sortOrder, startDate, endDate }],
    queryFn: () => fetchReferredUsers({ page, limit, search, sortBy, sortOrder,  startDate, endDate }),
  });

  const {
    isPending: isRefDetailLoading,
    isError: isRefDetailError,
    error: refDetailError,
    data: refDetail,
  } = useQuery({
    queryKey: ["referralDetails", selectedReferralId],
    queryFn: () =>
      selectedReferralId ? fetchReferredUser(selectedReferralId) : Promise.resolve(null),
    enabled: !!selectedReferralId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const handleRowClick = (referralId: number) => {
    if (selectedReferralId === referralId) {
      setSelectedReferralId(null); 
    } else {
      setSelectedReferralId(referralId);
    }
  };

  useEffect(() => {
    if (data) {
      setReferredUsers(data.referredUsers);
    }
  }, [data, setReferredUsers]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch Referrals");
      setOpenSnackbar(true);
    }
  }, [isError, error]);
  const handleDeleteUser= async (referralId: number, username: string) => {
    try {
      await deleteReferredUser(referralId);
      
      setSuccessState(`Refferal info for ${username}  deleted Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete Referred User");
      setOpenSnackbar(true);
    }
  };

  const memoizedReferrals = useMemo(() => {
    return referredUsers.map((user) => ({
      id: user.id,
      registrationDate: new Date(user.registrationDate).toLocaleDateString(),
      referredUsername: user.referredUsername,
      referredPhoneNumber: user.referredPhone,
      referrerUsername: user.referrer.username,
      referrerPhoneNumber: user.referrer.phoneNumber,
      bonusAwarded: user.bonusAwarded,
    }));
  }, [referredUsers]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
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
              label="Search Users"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="registrationDate">Registration Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort Order</InputLabel>
              <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>


        </Grid>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              value={startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              type="date"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              value={endDate ?? ""}
              onChange={(e) => setEndDate(e.target.value)}
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
              <TableCell>Registrtaion Date</TableCell>
              <TableCell>Referrer's Username</TableCell>
              <TableCell>Referrer's Phone Number</TableCell>
              <TableCell>Bonus Awarded</TableCell>
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}          {referredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Referred User Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedReferrals.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow onClick={() => handleRowClick(user.id)}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.referredUsername}</TableCell>
                  <TableCell>{user.referredPhoneNumber}</TableCell>
                  <TableCell>{user.registrationDate}</TableCell>
                  <TableCell>{user.referrerUsername}</TableCell>
                  <TableCell>{user.referrerPhoneNumber}</TableCell>
                  <TableCell>{user.bonusAwarded? "Yes":"No"}</TableCell>
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteUser(Number(user.id), user?.referredUsername)}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {selectedReferralId === user.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isRefDetailLoading ? (
                        <CircularProgress />
                      ) : isRefDetailError ? (
                        <p>Error: {refDetailError.message}</p>
                      ) : refDetail ? (
                        <RefDetail
                          userId={user.id}
                          onClose={() => setSelectedReferralId(null)} // Close user details
                          isLoading={isRefDetailLoading}
                          refDetail={refDetail?.data}
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
      <Pagination
        count={data?.pageInfo?.totalPages || 1} // Use totalPages from data.pageInfo
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: "100%" }}>
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

export default ReferralList;
