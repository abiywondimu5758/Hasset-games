import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Paper,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { verifyTransaction } from "../../services/transactionServices";
import { TransactionDetailsProps } from "../../types";

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  txRef,
  transactionDetails,
  isLoading,
}) => {


  const {
    data: verificationData,
    isLoading: isVerifying,
    error: verifyError,
    refetch,
  } = useQuery({
    queryKey: ["verifyTransaction", txRef],
    queryFn: () => verifyTransaction(txRef!),
    enabled: false,
  });


  const handleVerify = () => {
      refetch();
    
  };

  if (isLoading) {
    return (
      <Box>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!transactionDetails) {
    return (
      <Box>
        <Typography variant="body1">
          No transaction details available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
      Transaction Details
      </Typography>

      <Grid container spacing={3}>
      <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Amount:</strong> {transactionDetails.amount}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Wallet Updated:</strong> {transactionDetails.userWalletUpdated? "Yes" : "No"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Reference:</strong> {transactionDetails.reference}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Tx Reference:</strong> {transactionDetails.tx_ref}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Phone Number:</strong> {transactionDetails.mobile}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Username:</strong>{" "}
            {transactionDetails.username}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Currency:</strong> {transactionDetails.currency}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Status:</strong> {transactionDetails.status}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Charge:</strong> {transactionDetails.charge}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Transaction Date:</strong>{" "}
            {new Date(transactionDetails.created_at).toLocaleString("en-US", {
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
            <strong>Transaction Update Date:</strong>{" "}
            {new Date(transactionDetails.updated_at).toLocaleString("en-US", {
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
            <strong>Payment Method:</strong> {transactionDetails.payment_method}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Mode:</strong> {transactionDetails.mode}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Type:</strong> {transactionDetails.type}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Payment Reason:</strong> {transactionDetails.customization.title}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Payment Reason Details:</strong> {transactionDetails.customization.description}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Failure Reason:</strong> {transactionDetails.failure_reason === null? "None" : transactionDetails.failure_reason}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Failure Reason:</strong> {transactionDetails.failure_reason === null? "None" : transactionDetails.failure_reason}
          </Typography>
        </Grid>

        
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={handleVerify}
        disabled={isVerifying}
        
      >
        {isVerifying ? "Verifying..." : "Verify Payment"}
      </Button>

      {verificationData && (
        <Box mt={2} >
          <Typography variant="h6">Verification Result:</Typography>
          <Typography variant="body1">
            {verificationData.data === null ? "The Tx reference is invalid" : (<Paper >
            <Typography><strong>Status:</strong> {verificationData.data.status}</Typography>
            <Typography><strong>Phone Number:</strong> {verificationData.data.phone_number}</Typography>
            <Typography><strong>Amount:</strong> {verificationData.data.amount}</Typography>
            <Typography><strong>Reference:</strong> {verificationData.data.reference}</Typography>
            <Typography><strong>Tx Reference:</strong> {verificationData.data.tx_ref}</Typography>
            </Paper>)}
          </Typography>
        </Box>
      )}

      {verifyError && (
        <Box mt={2}>
          <Typography variant="body1" color="error">
            Error verifying payment: {verifyError.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TransactionDetails;
