import React from 'react';
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
import { ReferredUserDetailProps } from "../../types";



const RefDetail: React.FC<ReferredUserDetailProps> = ({
  refDetail,
  isLoading,
  onClose
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

    
      if (!refDetail) {
        return (
          <Box>
            <Typography variant="body1">No refer details available.</Typography>
          </Box>
        );
      }
  return (
    <Box>
      <Grid container spacing={2}>
        {/* Row for referred username and referred phone number */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Referred Username:</Typography>
          <Typography variant="body1">{refDetail.referredUsername}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Referred Phone:</Typography>
          <Typography variant="body1">{refDetail.referredPhone}</Typography>
        </Grid>

        {/* Row for registration date */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Registration Date:</Typography>
          <Typography variant="body1">{new Date(refDetail.registrationDate).toLocaleString()}</Typography>
        </Grid>

        {/* Row for referrer information */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Referrer Username:</Typography>
          <Typography variant="body1">{refDetail.referrer.username}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Referrer Phone Number:</Typography>
          <Typography variant="body1">{refDetail.referrer.phoneNumber}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Refer bonuse awarded:</Typography>
          <Typography variant="body1">{refDetail.bonusAwarded?"Yes":"No"}</Typography>
        </Grid>
      </Grid>
      <Button variant="contained" color="secondary" style={{ marginTop: '16px' }} onClick={handleCancel}>
        Close
      </Button>
    </Box>
  );
}

export default RefDetail;
