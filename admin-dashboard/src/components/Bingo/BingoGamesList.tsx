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
import { fetchBingoGames, deleteBingoGame, fetchBingoGame } from "../../services/bingoGameServices";
import { useBingoGameStore } from "../../store/bingoGameStore";
import { useProfileStore } from "../../store/profileStore";
import BingoGameDetails from "./BingoGameDetails";

const BingoGameList = () => {
  const { bingoGames, setBingoGames } = useBingoGameStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [hasEnded, setHasEnded] = useState<boolean | null>(null); // State for hasEnded filter
  const [active, setActive] = useState<boolean | null>(null); // State for active filter
  const [startDate, setStartDate] = useState<string | null>(null); // State for start date filter
  const [endDate, setEndDate] = useState<string | null>(null); // State for end date filter
  const { profile, loading } = useProfileStore();


  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: ["bingoGames", { page, limit, search, sortBy, sortOrder, hasEnded, active, startDate, endDate }],
    queryFn: () => fetchBingoGames({ page, limit, search, sortBy, sortOrder, hasEnded, active, startDate, endDate }),
  });

  const {
    isPending: isBingoGameDetailsLoading,
    isError: isBingoGameDetialsError,
    error: bingoGameDetialsError,
    data: bingoGameDetails,
  } = useQuery({
    queryKey: ["bingGameDetails", selectedGameId],
    queryFn: () =>
      selectedGameId ? fetchBingoGame(selectedGameId) : Promise.resolve(null),
    enabled: !!selectedGameId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const handleRowClick = (gameId: number) => {
    if (selectedGameId === gameId) {
      setSelectedGameId(null); 
    } else {
      setSelectedGameId(gameId);
    }
  };

  useEffect(() => {
    if (data) {
      setBingoGames(data.bingoGames);
    }
  }, [data, setBingoGames]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch bingo games");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteGame = async (gameId: number) => {
    try {
      await deleteBingoGame(gameId);
      setSuccessState("Bingo Game deleted Successfully");
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete game");
      setOpenSnackbar(true);
    }
  };

  const memoizedGames = useMemo(() => {
    return bingoGames.map((game) => ({
      id: game.id,
      createdAt: new Date(game.createdAt).toLocaleDateString(),
      gameStakeAmount: game.stake.amount,
      possibleWin: game.possibleWin,
      active: game.active ? "Yes" : "No",
      hasEnded: game.hasEnded ? "Yes" : "No",
      players: game.players.length,
      winners: game.declaredWinners || "N/A", // Add winner information
    }));
  }, [bingoGames]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // console.log(bingoGames[1].declaredWinners, "gerqwe")

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
              label="Search Games"
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
                <MenuItem value="createdAt">Creation Date</MenuItem>
                <MenuItem value="stakeId">Stake Amount</MenuItem>
                <MenuItem value="possibleWin">Possible Win</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="hasEnded">Ended</MenuItem>
                <MenuItem value="declaredWinners">Winners</MenuItem> {/* Added winner sorting */}
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
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Has Ended</InputLabel>
              <Select value={hasEnded ?? ""} onChange={(e) => setHasEnded(e.target.value === "" ? null : e.target.value === "true")}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Active</InputLabel>
              <Select value={active ?? ""} onChange={(e) => setActive(e.target.value === "" ? null : e.target.value === "true")}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
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
              <TableCell>Creation Date</TableCell>
              <TableCell>Stake Amount</TableCell>
              <TableCell>Possible Win</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Has Ended</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Winners</TableCell> {/* Added Winner column */}
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}          {bingoGames.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Bingo Games Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedGames.map((game) => (
              <React.Fragment key={game.id}>
                <TableRow onClick={() => handleRowClick(game.id)}>
                  <TableCell>{game.id}</TableCell>
                  <TableCell>{game.createdAt}</TableCell>
                  <TableCell>{game.gameStakeAmount}</TableCell>
                  <TableCell>{game.possibleWin}</TableCell>
                  <TableCell>{game.active}</TableCell>
                  <TableCell>{game.hasEnded}</TableCell>
                  <TableCell>{game.players}</TableCell>
                  <TableCell>{game.winners.length > 0 && game.winners.map((winner)=>winner).join(',')}
                  </TableCell> {/* Displaying winner */}
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteGame(Number(game.id))}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {selectedGameId === game.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isBingoGameDetailsLoading ? (
                        <CircularProgress />
                      ) : isBingoGameDetialsError ? (
                        <p>Error: {bingoGameDetialsError.message}</p>
                      ) : bingoGameDetails ? (
                        <BingoGameDetails
                          gameId={game.id}
                          onClose={() => setSelectedGameId(null)} // Close user details
                          isLoading={isBingoGameDetailsLoading}
                          bingoGameDetails={bingoGameDetails.data}
                          refetch={()=>refetch()}
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

export default BingoGameList;
