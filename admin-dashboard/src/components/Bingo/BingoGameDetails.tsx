import React, { useState } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BingoGameDetailsProps } from "../../types";
import { updateBingoGame } from "../../services/bingoGameServices"; // Import your update function
import { SelectChangeEvent } from "@mui/material/Select";

const BingoGameDetails: React.FC<BingoGameDetailsProps> = ({
  bingoGameDetails,
  isLoading,
  onClose,
  refetch
}) => {
  const queryClient = useQueryClient();
  const [editDetails, setEditDetails] = useState({
    active: bingoGameDetails?.active || false,
    hasEnded: bingoGameDetails?.hasEnded || false,
  });

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // TanStack Query's mutation for editing the bingo game
  const mutation = useMutation({
    mutationFn: (updatedGame: typeof editDetails) => {
      if (bingoGameDetails?.id) {
        return updateBingoGame(bingoGameDetails.id, updatedGame); // Update your bingo game service call
      }
      throw new Error("Bingo game ID is undefined");
    },
    onSuccess: () => {
      if (bingoGameDetails?.id) {
        queryClient.invalidateQueries({
          queryKey: ["bingoGame", bingoGameDetails.id], // Invalidate the query to refetch the bingo game details
        });
      }
      setSnackbarMessage("Game details saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true); // Open the snackbar
      refetch()
    },
    onError: (error) => {
      setSnackbarMessage(`Failed to save game details.  ${error?.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true); // Open the snackbar
    },
  });
  

  const handleSelectChange = (e: SelectChangeEvent<string>, field: "active" | "hasEnded") => {
    setEditDetails({
      ...editDetails,
      [field]: e.target.value === "true", // Convert string to boolean
    });
  };

  const handleSave = async () => {
    try{
    mutation.mutate(editDetails); // Trigger the mutation to save changes
    await refetch(); // Ensure refetch is called as a function
    onClose();
  } catch (error) {
    setSnackbarMessage(`Failed to update bingo game, ${error}`);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
  };

  const handleCancel = () => {
    onClose(); // Close the details view
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!bingoGameDetails) {
    return (
      <Box>
        <Typography variant="body1">No game details available.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bingo Game Details
      </Typography>

      {/* Editable fields with equal partitioning */}
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Game Id:</strong> {bingoGameDetails.id}
          </Typography>
          <Typography variant="body1">
            <strong>Game Date:</strong> {new Date(bingoGameDetails.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>Players:</strong> {bingoGameDetails._count.players}
          </Typography>
          <Select
            fullWidth
            value={editDetails.active.toString()}
            onChange={(e) => handleSelectChange(e, "active")}
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
          <Select
            fullWidth
            value={editDetails.hasEnded.toString()}
            onChange={(e) => handleSelectChange(e, "hasEnded")}
          >
            <MenuItem value="true">Has Ended</MenuItem>
            <MenuItem value="false">Not Ended</MenuItem>
          </Select>
        </Grid>

        {/* Right Column */}
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Stake Id:</strong> {bingoGameDetails.stakeId}
          </Typography>
          <Typography variant="body1">
            <strong>Stake Amount:</strong> {bingoGameDetails.stake.amount}
          </Typography>
          <Typography variant="body1">
            <strong>Countdown Start:</strong> {new Date(bingoGameDetails.countdownStart).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>Countdown End:</strong> {new Date(bingoGameDetails.countdownEnd).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>Possible Win:</strong> {bingoGameDetails.possibleWin}
          </Typography>
          <Typography variant="body1">
            <strong>Winners ID:</strong> {bingoGameDetails.declaredWinners.length > 0 && bingoGameDetails.declaredWinners.map((winner)=> (winner)).join(',')}
          </Typography>
          <Typography variant="body1">
            <strong>Drawn Numbers:</strong> {bingoGameDetails.drawnNumbers.join(", ")}
          </Typography>
          <Typography variant="body1">
            <strong>Players:</strong>
            <ul>
              {bingoGameDetails.players.map((player) => (
                <li key={player.userId}>
                  <Typography variant="body2">
                    User ID: {player.userId}, Card ID: {player.cardId}, Auto Play: {player.autoPlay ? "Yes" : "No"}, Marked Number: {player.markedNumbers}
                  </Typography>
                </li>
              ))}
            </ul>
          </Typography>
          

        </Grid>
      </Grid>

      {/* Save and Cancel Buttons */}
      <Box mt={2}>
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
          onClick={handleCancel}
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
      </Box>

      {/* Snackbar for notifications */}
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

export default BingoGameDetails;
