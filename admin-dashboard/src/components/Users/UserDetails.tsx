import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  Snackbar,
  Pagination,
  Card,
  CardContent,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserDetailsProps } from "../../types";
import { updateUser } from "../../services/userServices";
import { SelectChangeEvent } from "@mui/material/Select";

const UserDetails: React.FC<UserDetailsProps> = ({
  userDetails,
  isLoading,
  onClose,
  refetch,
  cardPage,
  setCardPage,
  cardLimit,
}) => {
  const queryClient = useQueryClient();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [editDetails, setEditDetails] = useState({
    username: userDetails?.user?.username || "",
    phoneNumber: userDetails?.user?.phoneNumber || "",
    wallet: Number(userDetails?.user?.wallet) || null,
    role: userDetails?.user?.role || "USER", // Default role
    referralBonus: Number(userDetails?.user?.referralBonus) || 0,
  });

//   const [isEditing, setIsEditing] = useState(false);
console.log("user afhasda",userDetails?.user)
  // TanStack Query's mutation for editing the user
  const mutation = useMutation({
    mutationFn: (updatedUser: typeof editDetails) =>
      updateUser(userDetails?.user?.id, updatedUser), // Use the editUser function from services
    onSuccess: () => {
      if (userDetails?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["user", userDetails.user?.id], // Use queryKey object with a defined id
        });
      } // Invalidate the query to refetch the user details
      
      setSnackbarMessage("user updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true); 
      refetch()
    },
    onError: (data) => {
        console.log()
        setSnackbarOpen(true);
        setSnackbarMessage((data as any)?.response?.data?.error ? (data as any).response.data.error : "Failed to update User details.");
        setSnackbarSeverity("error");
         // Open the snackbar
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditDetails({
      ...editDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setEditDetails({
      ...editDetails,
      role: e.target.value as string,
    });
  };

  const handleSave = async () => {
    try {
      await mutation.mutateAsync(editDetails);
      await refetch();
      onClose();
    } catch (error: any) {
      setSnackbarMessage(error?.response?.data?.error || "Failed to update user details.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    // setIsEditing(false);
    onClose();
  };

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

  if (!userDetails) {
    return (
      <Box>
        <Typography variant="body1">No user details available.</Typography>
      </Box>
    );
  }

  // Debug: log the structure of userDetails to check bingo cards format


  // Updated extraction using the actual structure:
  const bingoCardsData = userDetails.userBingoCards || [];
  const pageInfo = userDetails.pageInfo || { currentPage: 1, totalPages: 1, totalUserBingoCards: bingoCardsData.length, cardLimit: cardLimit };

  return (
    <Box sx={{ p: 3, borderRadius: "8px" }}>
      <Typography variant="h5" gutterBottom>
        Edit User Details
      </Typography>

      {/* Editable fields */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={editDetails.username}
            onChange={handleInputChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={editDetails.phoneNumber}
            onChange={handleInputChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Wallet"
            name="wallet"
            value={editDetails.wallet}
            onChange={handleInputChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={6}>
          <Select
            fullWidth
            label="Role"
            name="role"
            value={editDetails.role}
            onChange={(e) => handleRoleChange(e)}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="STAFF">Staff</MenuItem>
            <MenuItem value="USER">User</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {/* Non-editable fields displayed as Typography */}
      <Typography variant="body1" mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <strong>Referral Code:</strong> {userDetails.user.referralCode}
          </Grid>

          <Grid item xs={6}>
          <TextField
            fullWidth
            label="Referral Bonus"
            name="referralBonus"
            value={editDetails.referralBonus}
            onChange={handleInputChange}
            margin="normal"
          />
        </Grid>
          <Grid item xs={6}>
            <strong>Referred Count:</strong> {userDetails.user.referredCount}
          </Grid>
          <Grid item xs={6}>
            <strong>Registration Date:</strong>{" "}
            {new Date(userDetails.user.registrationDate).toLocaleString()}
          </Grid>
          <Grid item xs={6}>
            <strong>Verified:</strong> {userDetails.user.verified ? "Yes" : "No"}
          </Grid>
          <Grid item xs={6}>
            <strong>OTP:</strong> {userDetails.user.otp}
          </Grid>
          
          <Grid item xs={6}>
            <strong>Total Deposit:</strong> {userDetails.user.totalDeposit}
          </Grid>
        </Grid>
      </Typography>

      <Typography variant="body1" mt={2}>
      <Typography variant="h4" tabIndex={0} mb={2}>User Stats</Typography>
      <Grid container spacing={2}>

          
          <Grid item xs={6}>
            <strong>Total Games Played:</strong> {userDetails.user.statistics.gamesPlayed}
          </Grid>
          <Grid item xs={6}>
            <strong>Total Games Won:</strong> {userDetails.user.statistics.gamesWon}
          </Grid>
          <Grid item xs={6}>
            <strong>Total Games Lost:</strong> {userDetails.user.statistics.gamesLost}
          </Grid>
          <Grid item xs={6}>
            <strong>Total amountWon:</strong> {userDetails.user.statistics.amountWon}
          </Grid>
          <Grid item xs={6}>
            <strong>Stats last updated at:</strong>{" "}
            {new Date(userDetails.user.statistics.updatedAt).toLocaleString()}
          </Grid>
          
        </Grid>
      </Typography>

      {/* Display User Bingo Cards */}
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          User Bingo Cards:
        </Typography>
        {bingoCardsData.length > 0 ? (
          <Grid container spacing={2}>
        {bingoCardsData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Game ID: {card.gameId}
            </Typography>
            <Typography variant="body2">
              <strong>Card ID:</strong> {card.cardId}
            </Typography>
            <Typography variant="body2">
              <strong>Marked Numbers:</strong> {card.markedNumbers}
            </Typography>
            <Typography variant="body2">
              <strong>Auto Play:</strong> {card.autoPlay ? "Yes" : "No"}
            </Typography>
          </CardContent>
            </Card>
          </Grid>
        ))}
          </Grid>
        ) : (
          <Typography variant="body2">No Bingo Cards available.</Typography>
        )}
        {pageInfo.totalPages > 1 && (
          <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={pageInfo.totalPages}
          page={cardPage}
          onChange={(_event, value) => setCardPage(value)}
          color="primary"
        />
          </Box>
        )}
      </Box>

      {/* Save and Cancel Buttons */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          aria-label="Save user details"
          disabled={mutation.isPending} // Disable button during mutation
        >
          {mutation.isPending ? <CircularProgress size={24} /> : "Save"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          aria-label="Cancel editing"
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
      </Box>
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

export default UserDetails;
