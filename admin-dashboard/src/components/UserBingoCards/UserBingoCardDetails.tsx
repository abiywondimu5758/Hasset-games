import React from 'react';
import { UserBingoCardDetailsProps } from '../../types';
import { Grid, Typography,  Button, CircularProgress, Box } from '@mui/material';

const UserBingoCardDetails: React.FC<UserBingoCardDetailsProps> = ({

  userBingoCardDetails,
  isLoading,
  onClose,
}) => {
  const handleCancel = () => {
    onClose(); // Close the details view
  };

  if (isLoading) {
    return (
      <Box>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!userBingoCardDetails) {
    return (
      <Box>
        <Typography variant="body1">No game details available.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Bingo Card Details</Typography>
      
      {/* User Information */}
      <Typography variant="h6">User Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">User ID: {userBingoCardDetails.user.id}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Username: {userBingoCardDetails.user.username}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Phone Number: {userBingoCardDetails.user.phoneNumber}</Typography>
        </Grid>
      </Grid>

      {/* Game Information */}
      <Typography variant="h6" style={{ marginTop: '16px' }}>Game Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">Game ID: {userBingoCardDetails.game.id}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Stake ID: {userBingoCardDetails.game.stakeId}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Active: {userBingoCardDetails.game.active ? 'Yes' : 'No'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Has Ended: {userBingoCardDetails.game.hasEnded ? 'Yes' : 'No'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Created At: {userBingoCardDetails.game.createdAt}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Possible Win: {userBingoCardDetails.game.possibleWin}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Winners ID: {userBingoCardDetails.game.declaredWinners.length > 0 && userBingoCardDetails.game.declaredWinners.map((winner)=> (winner)).join(',')}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            Drawn Numbers: {userBingoCardDetails.game.drawnNumbers.join(', ')}
          </Typography>
        </Grid>
      </Grid>

      {/* Card Information */}
      <Typography variant="h6" style={{ marginTop: '16px' }}>Card Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">Card ID: {userBingoCardDetails.cardId}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Created At: {userBingoCardDetails.createdAt}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Marked Numbers: {userBingoCardDetails.markedNumbers}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">AutoPlay: {userBingoCardDetails.autoPlay ? 'Yes' : 'No'}</Typography>
        </Grid>
      </Grid>

      <Button variant="contained" color="secondary" style={{ marginTop: '16px' }} onClick={handleCancel}>
        Close
      </Button>
    </Box>
  );
};

export default UserBingoCardDetails;
