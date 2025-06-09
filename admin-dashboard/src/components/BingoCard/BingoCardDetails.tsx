import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BingoCardDetailProps } from "../../types";
import { updateBingoCard } from "../../services/bingoCardServices"; // Import your update function

const BingoCardDetails: React.FC<BingoCardDetailProps> = ({
  bingoCardDetails,
  isLoading,
  onClose,
  refetch
}) => {
  const queryClient = useQueryClient();
  const [updatedNumbers, setUpdatedNumbers] = useState(bingoCardDetails.numbers);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // TanStack Query's mutation for updating the bingo card
  const mutation = useMutation({
    mutationFn: (updatedCard: { numbers: string }) => {
      if (bingoCardDetails?.id) {
        return updateBingoCard(bingoCardDetails.id, updatedCard); // Update your bingo card service call
      }
      throw new Error("Bingo card ID is undefined");
    },
    onSuccess: () => {
      if (bingoCardDetails?.id) {
        queryClient.invalidateQueries({
          queryKey: ["bingoCard", bingoCardDetails.id], // Invalidate the query to refetch the bingo card details
        });
      }
      setSnackbarMessage("Bingo card updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true); 
      refetch()
    },
    onError: () => {
      setSnackbarMessage("Failed to update bingo card.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true); // Open the snackbar
    },
  });

  const handleSave = async () => {
    try {
        await mutation.mutateAsync({ numbers: updatedNumbers });
        await refetch(); // Ensure refetch is called as a function
        onClose();
      } catch (error) {
        setSnackbarMessage(`Failed to update bingo card, ${error}`);
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

  if (!bingoCardDetails) {
    return (
      <Box>
        <Typography variant="body1">No card details available.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bingo Card Details
      </Typography>

      <Typography variant="body1">
        <strong>Card ID:</strong> {bingoCardDetails.id}
      </Typography>

      <TextField
        label="Numbers"
        variant="outlined"
        fullWidth
        value={updatedNumbers}
        onChange={(e) => setUpdatedNumbers(e.target.value)}
        margin="normal"
      />

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

export default BingoCardDetails;
