import React, {  useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  SelectChangeEvent,
  Pagination,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  Paper,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query"; // Import useQuery
import { updateBonusPeriod, fetchBonusPeriod } from "../../services/bonusPeriodServices"; // Add fetchBonusPoints
import { BonusPeriodDetailsProps,Point } from "../../types";

const BonusPeriodDetails: React.FC<BonusPeriodDetailsProps> = ({
  bonusPeriodDetails,
  isLoading,
  onClose,
  bonusId,
  refetch,
  pageInfo,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [editDetails, setEditDetails] = useState({
    status: bonusPeriodDetails.status, // Default status
    dateTimeInAMH: bonusPeriodDetails.dateTimeInAMH,
    type:bonusPeriodDetails.type,
    
  });
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [points, setPoints] = useState<Point[]>(bonusPeriodDetails.points); // State for storing points
console.log(bonusPeriodDetails)
  // TanStack Query's mutation for updating the bonus period
  const mutation = useMutation({
    mutationFn: () => updateBonusPeriod(bonusId, editDetails),
    onSuccess: () => {
      setSnackbarMessage("Bonus period updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      refetch();
      onClose(); // Close the dialog
    },
    onError: () => {
      setSnackbarMessage("Failed to update bonus period.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // Fetch points based on the current page
  const {  isLoading: pointsLoading } = useQuery({
    queryKey:["bonusPoints", {currentPage}],
    queryFn:() =>  fetchBonusPeriod(bonusId, currentPage).then((bonusPeriod)=>setPoints(bonusPeriod.bonusPeriod.points)),
    

     }
  );

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setEditDetails({
      ...editDetails,
      status: event.target.value as string,
    });
  };

  const handleSave = async () => {
    await refetch();
    mutation.mutate(); // Trigger the mutation to save the changes
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value); // Update the current page
  };

  if (isLoading || pointsLoading) {
    return (
      <Box>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!bonusPeriodDetails) {
    return (
      <Box>
        <Typography variant="body1">
          No bonus period details available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Bonus Period
      </Typography>

      <Grid container spacing={2}>
      <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Prize Distribution:</strong> {bonusPeriodDetails.prizeDistribution}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Predefined Winners:</strong> {bonusPeriodDetails.predefinedWinners === null? 0: bonusPeriodDetails.predefinedWinners}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Start Date:</strong>{" "}
            {new Date(bonusPeriodDetails.startDate).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>End Date:</strong>{" "}
            {new Date(bonusPeriodDetails.endDate).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Type:</strong> {bonusPeriodDetails.type}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Display Date:</strong> {bonusPeriodDetails.dateTimeInAMH}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Created At:</strong>{" "}
            {new Date(bonusPeriodDetails.createdAt).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Minimum Deposit:</strong>{" "}
            {bonusPeriodDetails.minDeposit}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Minimum Games:</strong>{" "}
            {bonusPeriodDetails.minDeposit}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Allowed:</strong>{" "}
            {bonusPeriodDetails.allowedStakes.join(", ")}
          </Typography>
        </Grid>
      </Grid>

      


      {/* Select for status */}
      <Grid item xs={12} sm={4} mt={2}>
            <TextField
              label="Display Date"
              value={editDetails.dateTimeInAMH}
              onChange={(e) => setEditDetails({ ...editDetails, dateTimeInAMH: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} mt={2}>
            <TextField
              label="Type"
              value={editDetails.type}
              onChange={(e) => setEditDetails({ ...editDetails, type: e.target.value })}
              fullWidth
            />
          </Grid>
      <Box mt={2}>
        <Typography variant="body1"><strong>Status</strong></Typography>
        <Select
          fullWidth
          label="Status"
          value={editDetails.status}
          onChange={handleStatusChange}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="ended">Ended</MenuItem>
        </Select>
      </Box>

      {/* Save and Cancel Buttons */}

      <Box mt={2}>
  <Typography variant="h6" gutterBottom>
    Player Points
  </Typography>
  {points.length > 0 ? (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {bonusPeriodDetails.prizeDistribution === "RANDOM" ? (
              <>
                <TableCell align="left">Username</TableCell>
                <TableCell align="left">Points</TableCell>
                <TableCell align="left">Created At</TableCell>
              </>
            ) : (
              <>
                <TableCell align="left">Rank</TableCell>
                <TableCell align="left">Username</TableCell>
                <TableCell align="left">Points</TableCell>
                <TableCell align="left">Prize Amount</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {bonusPeriodDetails.prizeDistribution === "RANDOM"
            ? points.map((player) => (
                <TableRow key={player.userId}>
                  <TableCell align="left">{player.user.username}</TableCell>
                  <TableCell align="left">{player.points}</TableCell>
                  <TableCell align="left">
                    {new Date(player.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </TableCell>
                </TableRow>
              ))
            : points.map((player, index) => (
                <TableRow key={player.userId}>
                  <TableCell align="left">{index + 1}</TableCell>
                  <TableCell align="left">{player.user.username}</TableCell>
                  <TableCell align="left">{player.points}</TableCell>
                  <TableCell align="left">
                    {bonusPeriodDetails.prizes?.[index]?.amount || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography variant="body1">No points available for this period.</Typography>
  )}
</Box>

    {/* Pagination Component */}
    <Box mt={2}>
        <Pagination
          count={pageInfo.totalPages} // Use totalPages from pageInfo
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Box mt={2} display="flex" justifyContent="flex-end" width="100%">
  <Button
    variant="contained"
    color="primary"
    onClick={handleSave}
    disabled={mutation.isPending} // Disable button during mutation
  >
    {mutation.isPending ? <CircularProgress size={24} /> : "Save"}
  </Button>
  <Button
    variant="outlined"
    color="secondary"
    onClick={onClose}
    sx={{ ml: 2 }}
  >
    Cancel
  </Button>
</Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BonusPeriodDetails;
