/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { fetchBingoCards, deleteBingoCard, fetchBingoCard, deleteAllBingoCards, generateBingoCards, regenerateBingoCards } from "../../services/bingoCardServices";
import { useBingoCardStore } from "../../store/BingoCardStore";
import { useProfileStore } from "../../store/profileStore";
import BingoCardDetails from "./BingoCardDetails";

const BingoCardList = () => {
  const { bingoCards, setBingoCards } = useBingoCardStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const { profile, loading } = useProfileStore();


  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: ["bingoCards", { page, limit, search, sortBy, sortOrder}],
    queryFn: () => fetchBingoCards({ page, limit, search, sortBy, sortOrder}),
  });

  const {
    isPending: isBingoCardDetailsLoading,
    isError: isBingoCardDetialsError,
    error: bingoCardDetialsError,
    data: bingoCardDetails,
  } = useQuery({
    queryKey: ["bingCardDetails", selectedCardId],
    queryFn: () =>
      selectedCardId ? fetchBingoCard(selectedCardId) : Promise.resolve(null),
    enabled: !!selectedCardId, // Only fetch when a card ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const generateMutation = useMutation({
    mutationFn: generateBingoCards,
    onSuccess:()=>{
      setSuccessState("200 Bingo Cards Generated Successfully");
      setOpenSuccessSnackbar(true);
    },
    onError:()=>{
      setErrorState("Error while Generating Cards");
      setOpenSnackbar(true);
  }})

  const regenerateMutation = useMutation({
    mutationFn: regenerateBingoCards,
    onSuccess:()=>{
      setSuccessState("Bingo Cards Regenerated Successfully");
      setOpenSuccessSnackbar(true);
    },
    onError:()=>{
      setErrorState("Error while regenerating Cards");
      setOpenSnackbar(true);
  }})

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllBingoCards,
    onSuccess:()=>{
      setSuccessState("All Bingo Cards deleted Successfully");
      setOpenSuccessSnackbar(true);
    },
    onError:()=>{
      setErrorState("Error while deleting Bingo Cards");
      setOpenSnackbar(true);
  }})
  

  const handleRowClick = (cardId: number) => {
    if (selectedCardId === cardId) {
      setSelectedCardId(null); 
    } else {
      setSelectedCardId(cardId);
    }
  };

  useEffect(() => {
    if (data) {
      setBingoCards(data.bingoCards);
    }
  }, [data, setBingoCards]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch bingo Cards");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteBingoCard(cardId);
      setSuccessState("Bingo Card deleted Successfully");
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete Card");
      setOpenSnackbar(true);
    }
  };

  const handleGenerateCards = async () =>{
    await generateMutation.mutateAsync();
    refetch();
  }
  const handleRegenerateCards = async () =>{
    await regenerateMutation.mutateAsync();
    refetch();
  }
  const handleDeleteAllCards = async () =>{
    await deleteAllMutation.mutateAsync();
    refetch();
  }

  const memoizedCards = useMemo(() => {
    return bingoCards.map((card) => ({
      id: card.id,
      numbers: card.numbers,
    }));
  }, [bingoCards]);

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
                <MenuItem value="id">ID</MenuItem>
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
          {profile?.role === "ADMIN" && (
              <Box p={2} mt={1}>
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleGenerateCards()}
                      disabled={generateMutation.isPending} // Disable button during mutation
                      startIcon={<DeleteForeverIcon />}
                    >
                      {generateMutation.isPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Generate cards"
                        )}
                      
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRegenerateCards()}
                      disabled={regenerateMutation.isPending} // Disable button during mutation
                      startIcon={<DeleteForeverIcon />}
                    >
                      {regenerateMutation.isPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Regenerate cards"
                        )}
                      
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleDeleteAllCards()}
                      disabled={deleteAllMutation.isPending} // Disable button during mutation
                      startIcon={<DeleteForeverIcon />}
                    >
                      {deleteAllMutation.isPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Delete All Cards"
                        )}
                      
                    </Button>
                  </>
                </Box>)}
        </Grid>
        
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Numbers</TableCell>
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}          {bingoCards.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Bingo Cards Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedCards.map((card) => (
              <React.Fragment key={card.id}>
                <TableRow onClick={() => handleRowClick(card.id)}>
                  <TableCell>{card.id}</TableCell>
                  <TableCell>{card.numbers}</TableCell>
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteCard(Number(card.id))}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {selectedCardId === card.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isBingoCardDetailsLoading ? (
                        <CircularProgress />
                      ) : isBingoCardDetialsError ? (
                        <p>Error: {bingoCardDetialsError.message}</p>
                      ) : bingoCardDetails ? (
                        <BingoCardDetails
                          cardId={card.id}
                          onClose={() => setSelectedCardId(null)} // Close user details
                          isLoading={isBingoCardDetailsLoading}
                          bingoCardDetails={bingoCardDetails.data}
                          refetch={()=>refetch()}
                        />
                      ) : (
                        <p>No bingo Card details found</p>
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

export default BingoCardList;







