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
import { fetchUserBingoCards, deleteUserBingoCard,fetchUserBingoCard } from "../../services/userBingoCardServices";
import { useUserBingoCardStore } from "../../store/userBingoCardStore";
import { useProfileStore } from "../../store/profileStore";
import UserBingoCardDetails from "./UserBingoCardDetails";
// import BingoGameDetails from "./BingoGameDetails";

const UserBingoCardList = () => {
  const { userBingoCards, setUserBingoCards } = useUserBingoCardStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUserBingoCardId, setSelectedUserBingoCardId] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState<boolean | null>(null); // State for auto play filter
  const [startDate, setStartDate] = useState<string | null>(null); // State for start date filter
  const [endDate, setEndDate] = useState<string | null>(null); // State for end date filter
  const { profile, loading } = useProfileStore();
  const [UserCardId, setUserCardId] = useState<{userId:number|null, gameId:number|null}>({userId:null, gameId:null})


  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: ["userBingoCards", { page, limit, search, sortBy, sortOrder, autoPlay, startDate, endDate }],
    queryFn: () => fetchUserBingoCards({ page, limit, search, sortBy, sortOrder, autoPlay, startDate, endDate }),
  });

  const {
    isPending: isUserBingoCardDetailsLoading,
    isError: isUserBingoCardDetialsError,
    error: userBingoCardDetialsError,
    data: userBingoCardDetails,
  } = useQuery({
    queryKey: ["userBingoCardDetails", selectedUserBingoCardId],
    queryFn: () =>
        selectedUserBingoCardId ? fetchUserBingoCard(UserCardId?.userId,UserCardId?.gameId) : Promise.resolve(null),
    enabled: !!selectedUserBingoCardId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const handleRowClick = ( userId: number,gameId: number) => {
    if (selectedUserBingoCardId === String(userId)+String(gameId)) {
        setSelectedUserBingoCardId(null); 
        setUserCardId({userId:null,gameId:null})
    } else {
        setSelectedUserBingoCardId(String(userId)+String(gameId));
        setUserCardId({userId,gameId})
    }
  };

  useEffect(() => {
    if (data) {
      setUserBingoCards(data.userBingoCards);
    }
  }, [data, setUserBingoCards]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch user bingo cards");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteCard = async (userId:number, gameId: number, cardId:number) => {
    try {
      await deleteUserBingoCard(userId,gameId,cardId);
      
      setSuccessState(`User bingo card with id of ${String(userId)+String(gameId)+String(cardId)} deleted Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete user bingo card");
      setOpenSnackbar(true);
    }
  };

  const memoizedCards = useMemo(() => {
    return userBingoCards.map((card) => ({
      userId: card.userId,
      username: card.user.username,
      createdAt: new Date(card.createdAt).toLocaleDateString(),
      gameId: card.gameId,
      cardId: card.cardId,
      markedNumbers: card.markedNumbers,
      autoplay: card.autoPlay ? "Yes" : "No",
      active: card.game.active ? "Yes" : "No",
      hasEnded: card.game.hasEnded ? "Yes" : "No",
      possibleWin: card.game.possibleWin,
      winners: card.game.declaredWinners || "N/A", // Add winner information
    }));
  }, [userBingoCards]);

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
              label="Search Cards"
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
                <MenuItem value="userId">User</MenuItem>
                <MenuItem value="cardId">Card</MenuItem>
                <MenuItem value="autoPlay">AutoPlay</MenuItem>
                <MenuItem value="gameId">Game</MenuItem>
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
              <InputLabel>AutoPlay</InputLabel>
              <Select value={autoPlay ?? ""} onChange={(e) => setAutoPlay(e.target.value === "" ? null : e.target.value === "true")}>
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
              <TableCell>Card ID</TableCell>
              <TableCell>Game ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Game Active</TableCell>
              <TableCell>Game Has Ended</TableCell>
              <TableCell>Autoplay</TableCell>
              <TableCell>Possible Win</TableCell>
              <TableCell>Marked Numbers</TableCell>
              <TableCell>Winner</TableCell> {/* Added Winner column */}
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}          {userBingoCards.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No User Bingo Cards Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedCards.map((card, index) => (
              <React.Fragment key={index}>
                <TableRow onClick={() => handleRowClick(card.userId,card.gameId)}>
                  <TableCell>{card.cardId}</TableCell>
                  <TableCell>{card.gameId}</TableCell>
                  <TableCell>{card.username}</TableCell>
                  <TableCell>{card.createdAt}</TableCell>
                  <TableCell>{card.active}</TableCell>
                  <TableCell>{card.hasEnded}</TableCell>
                  <TableCell>{card.autoplay}</TableCell>
                  <TableCell>{card.possibleWin}</TableCell>
                  <TableCell>{card.markedNumbers}</TableCell>
                  <TableCell>{card.winners.length > 0 && card.winners.map((winner)=>(winner)).join(',')}</TableCell>
                  
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteCard(Number(card.userId),Number(card.gameId),Number(card.cardId))}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                 {selectedUserBingoCardId === String(card.userId)+String(card.gameId) && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isUserBingoCardDetailsLoading ? (
                        <CircularProgress />
                      ) : isUserBingoCardDetialsError ? (
                        <p>Error: {userBingoCardDetialsError.message}</p>
                      ) : userBingoCardDetails ? (
                        <UserBingoCardDetails
                          userId={card.userId}
                          gameId={card.gameId}
                          onClose={() => setSelectedUserBingoCardId(null)} // Close user details
                          isLoading={isUserBingoCardDetailsLoading}
                          userBingoCardDetails={userBingoCardDetails?.data}
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

export default UserBingoCardList;
