import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchPeriods,
  drawWinners,
  assignPrize,
  checkWinners,
} from "../../services/jackpot"; // Add checkWinners import
import { JackpotPeriod, Winner } from "../../types";
import {
  Button,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const WinnersList = () => {
  const [periods, setPeriods] = useState<JackpotPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [winnerAmounts, setWinnerAmounts] = useState<{ [key: number]: number }>(
    {}
  ); // Track amounts for winners
  const [hasWinners, setHasWinners] = useState(false);
  const [allPrizesGiven, setAllPrizesGiven] = useState(false);

  const { data: periodsData } = useQuery({
    queryKey: ["jackpotPeriods"],
    queryFn: fetchPeriods,
  });

  // Query to check if the selected period has winners
  const { data: winnersData, refetch: refetchWinners } = useQuery({
    queryKey: ["winners", selectedPeriod],
    queryFn: () => checkWinners(selectedPeriod), // Add checkWinners function
    enabled: !!selectedPeriod, // Only run the query if a period is selected
  });

  const mutation = useMutation({
    mutationFn: drawWinners,
    onSuccess: () => {
      setSuccessState(`Winners drawn successfully`);
      setOpenSuccessSnackbar(true);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        // Now you can safely access response
        setErrorState(error.response?.data.error || "Failed to draw winners");
      } else {
        setErrorState("An unexpected error occurred");
      }
      setOpenSnackbar(true);
    },
  });

  const assignPrizeMutation = useMutation({
    mutationFn: assignPrize,
    onSuccess: () => {
      setSuccessState("Prizes assigned successfully");
      setOpenSuccessSnackbar(true);
      setWinners([]); // Clear winners if needed
      setWinnerAmounts({}); // Reset amounts
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        // Now you can safely access response
        setErrorState(error.response?.data.error || "Failed to assign prizes");
      } else {
        setErrorState("An unexpected error occurred");
      }
      setOpenSnackbar(true);
    },
  });

  useEffect(() => {
    if (periodsData) {
      setPeriods(periodsData);
    }
  }, [periodsData]);

  useEffect(() => {
    if (winnersData) {
      setHasWinners(winnersData.hasWinners);
      setAllPrizesGiven(winnersData.allPrizesGiven);
      setWinners(winnersData.winners);
    }
  }, [winnersData]);
  useEffect(() => {
    if (selectedPeriod !== null) {
      refetchWinners(); // Automatically fetch winners when a period is selected
    }
  }, [selectedPeriod, refetchWinners]);

  const handleDrawWinners = () => {
    if (selectedPeriod !== null) {
      mutation.mutate(selectedPeriod);
    } else {
      setErrorState("Please select a period");
      setOpenSnackbar(true);
    }
  };

  const handleAmountChange = (rank: number, amount: number) => {
    setWinnerAmounts((prev) => ({ ...prev, [rank]: amount }));
  };

  const handleSavePrizes = () => {
    const prizesToAssign = winners?.map((winner) => ({
      userId: winner.userId,
      bonusPeriodId: winner.bonusPeriodId,
      amount: winnerAmounts[winner.rank] || 0,
      phoneNumber: winner.user.phoneNumber,
    }));
    assignPrizeMutation.mutate(prizesToAssign);
  };
  const handleSavePrizesPredefined = () => {
    const prizesToAssign = winners?.map((winner) => ({
      userId: winner.userId,
      bonusPeriodId: winner.bonusPeriodId,
      amount: Number(winner.amountWon) === 0 ? winnerAmounts[winner.rank] : Number(winner.amountWon),
      phoneNumber: winner.user.phoneNumber,
    }));
    assignPrizeMutation.mutate(prizesToAssign);
  };

  const filteredPeriods = periods.filter(
    (period) => period.id === selectedPeriod
  );

  return (
    <div>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="period-select-label">Select Period</InputLabel>
        <Select
          labelId="period-select-label"
          value={selectedPeriod ?? ""}
          onChange={(e) => setSelectedPeriod(e.target.value as number)}
        >
          {periods?.map((period) => (
            <MenuItem key={period.id} value={period.id}>
              {period.type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {hasWinners ? (
        <></>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleDrawWinners}
          sx={{ mt: 2 }}
          disabled={hasWinners}
        >
          Draw
        </Button>
      )}

      {!allPrizesGiven &&
        hasWinners &&
        filteredPeriods[0].prizeDistribution == "RANDOM" && (
          <div>
            <Typography mb={2}>
              Winners have been drawn. Please allocate prizes below:
            </Typography>
            <h3>Prize Destribution:</h3>
            <Typography mb={2}>
              {filteredPeriods[0].prizeDistribution}
            </Typography>
            <h3>Winners:</h3>

            {winners?.map((winner) => (
              <Grid
                container
                key={winner.id}
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Grid item>
                  <Typography>Phone: {winner.user.phoneNumber}</Typography>
                </Grid>
                <Grid item>
                  <TextField
                    label="Amount"
                    type="number"
                    onChange={(e) =>
                      handleAmountChange(winner.rank, Number(e.target.value))
                    }
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            ))}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSavePrizes}
              sx={{ mt: 2 }}
            >
              Asign Prizes
            </Button>
          </div>
        )}
      {!allPrizesGiven &&
        hasWinners &&
        filteredPeriods[0].prizeDistribution === "PREDEFINED" && (
          <div>
            <Typography mb={2}>
              Winners are listed below. Please allocate prizes below:
            </Typography>
            <h3>Prize Destribution:</h3>
            <Typography mb={2}>
              {filteredPeriods[0].prizeDistribution}
            </Typography>
            <h3>Winners:</h3>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Amount Won</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {winners?.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell>{winner.userId}</TableCell>
                      <TableCell>{winner.rank}</TableCell>
                      <TableCell>{winner.user.username}</TableCell>
                      <TableCell>{winner.user.phoneNumber}</TableCell>
                      <TableCell>{winner.amountWon}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSavePrizesPredefined}
              sx={{ mt: 2 }}
            >
              Asign Prizes
            </Button>
          </div>
        )}
      {!allPrizesGiven &&
        hasWinners &&
        filteredPeriods[0].prizeDistribution === "BOTH" && (
          <div>
            <Typography mb={2}>
              Winners are listed below. Please allocate prizes below:
            </Typography>
            <h3>Prize Destribution:</h3>
            <Typography mb={2}>
              {filteredPeriods[0].prizeDistribution}
            </Typography>
            <h3>Predefined Winners:</h3>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Amount Won</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {winners
                    ?.filter(
                      (winner) =>
                        winner.rank <=
                        (filteredPeriods[0].predefinedWinners ?? 0)
                    )
                    .map((winner) => (
                      <TableRow key={winner.id}>
                        <TableCell>{winner.userId}</TableCell>
                        <TableCell>{winner.rank}</TableCell>
                        <TableCell>{winner.user.username}</TableCell>
                        <TableCell>{winner.user.phoneNumber}</TableCell>
                        <TableCell>{winner.amountWon}</TableCell>
                      </TableRow>
                    ))}
                  
                </TableBody>
              </Table>
            </TableContainer>
            <h3>Jackpot Winners:</h3>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Amount Won</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  
                  {winners
                    ?.filter(
                      (winner) =>
                        winner.rank >
                        (filteredPeriods[0].predefinedWinners ?? 0)
                    )
                    .map((winner) => (
                      <TableRow key={winner.id}>
                        <TableCell>{winner.userId}</TableCell>
                        <TableCell>{winner.rank}</TableCell>
                        <TableCell>{winner.user.username}</TableCell>
                        <TableCell>{winner.user.phoneNumber}</TableCell>
                        <TableCell>
                          {" "}
                          <TextField
                            label="Amount"
                            type="number"
                            onChange={(e) =>
                              handleAmountChange(
                                winner.rank,
                                Number(e.target.value)
                              )
                            }
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSavePrizesPredefined}
              sx={{ mt: 2 }}
            >
              Asign Prizes
            </Button>
          </div>
        )}
      {allPrizesGiven && hasWinners && (
        <Typography mb={2} mt={2}>
          Winners have been drawn and prizes have been distributed! See below
          for further information.
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Rank</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Amount Won</TableCell>
                  <TableCell>Prize Given</TableCell>
                  <TableCell>Prize Given Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {winners?.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell>{winner.userId}</TableCell>
                    <TableCell>{winner.rank}</TableCell>
                    <TableCell>{winner.user.username}</TableCell>
                    <TableCell>{winner.user.phoneNumber}</TableCell>
                    <TableCell>{winner.amountWon}</TableCell>
                    <TableCell>{winner.prizeGiven ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {new Date(winner.prizeGivenDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Typography>
      )}

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
    </div>
  );
};

export default WinnersList;
