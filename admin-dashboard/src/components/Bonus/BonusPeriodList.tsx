/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Typography,
  Button, // Import Button for the delete functionality
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { fetchBonusPeriods, fetchBonusPeriod, deleteBonusPeriod, addBonusPeriod } from "../../services/bonusPeriodServices"; // Import deleteUser service
import { useBonusPeriodStore } from "../../store/bonusPeriodStore";
import { SelectChangeEvent } from "@mui/material/Select";
import { useProfileStore } from "../../store/profileStore";
import BonusPeriodDetails from "./BonusPeriodDetials";
import { AddBonusPeriod, Prize  } from "../../types";
import { fetchStakes } from "../../services/stakeServices";



const BonusPeriodList = () => {
  const { bonusPeriods, setBonusPeriods } = useBonusPeriodStore();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [errorState, setErrorState] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedBonusPeriodId, setSelectedBonusPeriodId] = useState<number | null>(null);
  const [newBonusPeriod, setNewBonusPeriod] = useState<AddBonusPeriod>({ startDate: "", endDate: "", type: "", dateTimeInAMH: "", prizeDistribution:'PREDEFINED', predefinedWinners:null, prizes:[], minDeposit:0.00,minGames:0,allowedStakes:[] });
//   const [isAdding, setIsAdding] = useState(false);

  const { profile, loading } = useProfileStore();

  const { isPending, isError, error, data, refetch } = useQuery({
    queryKey: [
      "bonus Points",
      { page, limit, search, sortBy, sortOrder, status, startDate, endDate },
    ],
    queryFn: () =>
        fetchBonusPeriods({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
        startDate,
        endDate,
      }),
  });

  const {
    isPending: isBonusPeriodDetailsLoading,
    isError: isBonusPeriodDetialsError,
    error: bonusPeriodDetialsError,
    data: bonusPeriodDetails,
    refetch: bonusPeriodDetailsRefetch
  } = useQuery({
    queryKey: ["bonusPeriosDetails", selectedBonusPeriodId],
    queryFn: () =>
        selectedBonusPeriodId ? fetchBonusPeriod(selectedBonusPeriodId) : Promise.resolve(null),
    enabled: !!selectedBonusPeriodId, // Only fetch when a user ID is selected
    refetchOnWindowFocus: false, // Optional: Prevent refetching when the window is focused
  });

  const mutation = useMutation({
    mutationFn: addBonusPeriod,
    onSuccess: () => {
      setSuccessState("Bonus period added successfully");
      setOpenSuccessSnackbar(true);
      refetch();
    //   setIsAdding(false);
      setNewBonusPeriod({ startDate: "", endDate: "", type: "", dateTimeInAMH:"",predefinedWinners:null,prizeDistribution:'PREDFEINED',prizes:[], minDeposit:0.00,minGames:0,allowedStakes:[] }); // Reset form
    },
    onError: () => {
      setErrorState("Failed to add bonus period");
      setOpenSnackbar(true);
    },
  });
  const handleRowClick = async(BonusPeriodId: number) => {
    if (selectedBonusPeriodId === BonusPeriodId) {
        
        setSelectedBonusPeriodId(null); // Close dropdown if clicked again
    } else {
        await bonusPeriodDetailsRefetch();
        setSelectedBonusPeriodId(BonusPeriodId);

    }
  };

  

  useEffect(() => {
    if (data) {
      
      setBonusPeriods(data.bonusPeriods);
    }
  }, [data, setBonusPeriods]);

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch Bonus Periods");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  const handleDeleteBonusPeriod = async (bonusPeriodId: number, type:string) => {
    try {
      await deleteBonusPeriod(bonusPeriodId);
      
      setSuccessState(`${type} deleted Successfully`);
      setOpenSuccessSnackbar(true);
      await refetch();
    } catch (error: any) {
      setErrorState(error.response?.data.error || "Failed to delete user");
      setOpenSnackbar(true);
    }
  };

  const handlePrizeChange = (
    index: number, 
    field: keyof Prize, 
    value: string
  ): void => {
    const updatedPrizes = [...newBonusPeriod.prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setNewBonusPeriod({ ...newBonusPeriod, prizes: updatedPrizes });
  };
  
  const handlePredefinedWinnersChange = (value: string): void => {
    const numberOfWinners = parseInt(value, 10);
    if (isNaN(numberOfWinners) || numberOfWinners < 0) return;
  
    const updatedPrizes: Prize[] = Array.from(
      { length: numberOfWinners },
      (_, index) => ({
        rank: index + 1,
        amount: "",
      })
    );
  
    setNewBonusPeriod({
      ...newBonusPeriod,
      predefinedWinners: numberOfWinners,
      prizes: updatedPrizes,
    });
  };

  const handleSaveBonusPeriod = async () => {
    const { startDate, endDate, type } = newBonusPeriod;
    if (!startDate || !endDate || !type) {
      setErrorState("All fields are required");
      setOpenSnackbar(true);
      return;
    }

    try {
      await mutation.mutateAsync(newBonusPeriod); // Call the addBonusPeriod service function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setErrorState("Failed to add bonus period");
      setOpenSnackbar(true);
    }
  };

  const memoizedBonusPeriods = useMemo(() => {
    return bonusPeriods.map((bonusPeriod) => ({
      id: bonusPeriod.id,
      type: bonusPeriod.type,
      startDate: new Date(bonusPeriod.startDate).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Set to true for 12-hour format
      }),
      endDate: new Date(bonusPeriod.endDate).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Set to true for 12-hour format
      }),
      prizeDistribution: bonusPeriod.prizeDistribution,
      predefinedWinners: bonusPeriod.predefinedWinners,
      status: bonusPeriod.status,
      displayDate: bonusPeriod.dateTimeInAMH,
      createdAt: new Date(bonusPeriod.createdAt).toLocaleDateString(),
      players: bonusPeriod.id,
      minDeposit: bonusPeriod.minDeposit,
      minGames: bonusPeriod.minGames,
      allowedStakes: bonusPeriod.allowedStakes,
    }));
  }, [bonusPeriods]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value);
  };



  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setStatus(value === "" ? null : value === "active" ? "active" : "ended");
  };

  const handleDateFilterChange =
    (type: "startDate" | "endDate") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "startDate") {
        setStartDate(event.target.value);
      } else {
        setEndDate(event.target.value);
      }
    };

    // Fetch stakes for allowed stakes selection
    const { data: stakesData, isLoading: stakesLoading } = useQuery({
      queryKey: ["stakes"],
      queryFn: () => fetchStakes({ limit: 100 }),
  });

  return (
    <>
      {/* Filter and Sort Controls */}

      <Box mb={2}>
        {loading && (
          <>
            <CircularProgress />
          </>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search type"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="createdAt">Creation Date</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="status">status</MenuItem>
                <MenuItem value="startDate">Start Date</MenuItem>
                <MenuItem value="endDate">End Date</MenuItem>
                {/* Add more sorting options as needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={handleSortOrderChange}
                label="Sort Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={status === null ? "" : status.toString()}
                onChange={handleStatusChange}
                label="Verified"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="ended">Ended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Start Date"
              type="date"
              variant="outlined"
              onChange={handleDateFilterChange("startDate")}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="End Date"
              type="date"
              variant="outlined"
              onChange={handleDateFilterChange("endDate")}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
      <Box mb={2}>
        <Typography mb={4} mt={4}>Create a Bonus Period</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Start Date"
            variant="outlined"
            type="datetime-local"
            value={newBonusPeriod.startDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, startDate: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="End Date"
            variant="outlined"
            type="datetime-local"
            value={newBonusPeriod.endDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, endDate: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Type"
            value={newBonusPeriod.type}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, type: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Display Date"
            value={newBonusPeriod.dateTimeInAMH}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, dateTimeInAMH: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Minimum Deposit"
            type="number"
            value={newBonusPeriod.minDeposit}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, minDeposit: Number(e.target.value) })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Minimum Games"
            type="number"
            value={newBonusPeriod.minGames}
            onChange={(e) =>
              setNewBonusPeriod({ ...newBonusPeriod, minGames: Number(e.target.value) })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Allowed Stakes</InputLabel>
            <Select
              multiple
              value={newBonusPeriod.allowedStakes}
              label="Allowed Stakes"
              renderValue={(selected) =>
          (selected as number[]).join(", ")
              }
            >
              {stakesLoading ? (
          <MenuItem disabled>Loading...</MenuItem>
              ) : (
          stakesData?.stakes?.map((stake: any) => (
            <MenuItem
              key={stake.id}
              value={stake.id}
              onClick={(e) => {
                e.stopPropagation();
                if (newBonusPeriod.allowedStakes.includes(stake.id)) {
            setNewBonusPeriod({
              ...newBonusPeriod,
              allowedStakes: newBonusPeriod.allowedStakes.filter(
                (id: number) => id !== stake.id
              ),
            });
                } else {
            setNewBonusPeriod({
              ...newBonusPeriod,
              allowedStakes: [
                ...newBonusPeriod.allowedStakes,
                stake.id,
              ],
            });
                }
              }}
            >
              {stake.amount}
            </MenuItem>
          ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Prize Distribution</InputLabel>
            <Select
              value={newBonusPeriod.prizeDistribution}
              onChange={(e) =>
                setNewBonusPeriod({ ...newBonusPeriod, prizeDistribution: e.target.value })
              }
            >
              <MenuItem value="PREDEFINED">PREDEFINED</MenuItem>
              <MenuItem value="RANDOM">RANDOM</MenuItem>
              <MenuItem value="BOTH">BOTH</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {["PREDEFINED", "BOTH"].includes(newBonusPeriod.prizeDistribution) && (
          <Grid item xs={12} sm={4}>
            <TextField
              label="Number of Predefined Winners"
              type="number"
              value={newBonusPeriod.predefinedWinners || ""}
              onChange={(e) => handlePredefinedWinnersChange(e.target.value)}
              fullWidth
            />
          </Grid>
        )}
        {newBonusPeriod.prizes.map((prize, index) => (
          <Grid container spacing={2} key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Rank ${index + 1}`}
                type="number"
                value={prize.rank}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Prize Amount for Rank ${index + 1}`}
                type="number"
                value={prize.amount}
                onChange={(e) =>
                  handlePrizeChange(index, "amount", e.target.value)
                }
                fullWidth
              />
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveBonusPeriod}
            startIcon={<AddIcon />}
          >
            Add Bonus Period
          </Button>
        </Grid>
      </Grid>
    </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Prize Distribution</TableCell>
              <TableCell>Predefined Winners</TableCell>
              <TableCell>Minimum Deposit</TableCell>
              <TableCell>Minimum Games</TableCell>
              <TableCell>Stakes Allowed</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Display Date</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Players</TableCell>
              {/* Conditionally render the Delete column header */}
              {profile?.role === "ADMIN" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          {isPending && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}
          {bonusPeriods.length === 0 && !isPending && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40px"
                >
                  <Typography>No Bonus Periods Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableBody>
            {memoizedBonusPeriods.map((bonusPeriod) => (
              <React.Fragment key={bonusPeriod.id}>
                <TableRow key={bonusPeriod.id} onClick={() => handleRowClick(bonusPeriod.id)}>
                  <TableCell>{bonusPeriod.id}</TableCell>
                  <TableCell>{bonusPeriod.type}</TableCell>
                  <TableCell>{bonusPeriod.prizeDistribution}</TableCell>
                  <TableCell>{bonusPeriod.predefinedWinners === null? 0: bonusPeriod.predefinedWinners}</TableCell>
                  <TableCell>{bonusPeriod.minDeposit}</TableCell>
                  <TableCell>{bonusPeriod.minGames}</TableCell>
                  <TableCell>{bonusPeriod.allowedStakes.join(", ")}</TableCell>
                  <TableCell>{bonusPeriod.startDate}</TableCell>
                  <TableCell>{bonusPeriod.endDate}</TableCell>
                  <TableCell>{bonusPeriod.status}</TableCell>
                  <TableCell>{bonusPeriod.displayDate}</TableCell>
                  <TableCell>{bonusPeriod.createdAt}</TableCell>
                  <TableCell>{bonusPeriod.players}</TableCell>
                  {/* Conditionally render the Delete button */}
                  {profile?.role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteBonusPeriod(Number(bonusPeriod.id),bonusPeriod.type)}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {selectedBonusPeriodId === bonusPeriod.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {isBonusPeriodDetailsLoading ? (
                        <CircularProgress />
                      ) : isBonusPeriodDetialsError ? (
                        <p>Error: {bonusPeriodDetialsError.message}</p>
                      ) : bonusPeriodDetails ? (
                        <BonusPeriodDetails
                          bonusId={bonusPeriod.id}
                          onClose={() => setSelectedBonusPeriodId(null)} // Close user details
                          isLoading={isBonusPeriodDetailsLoading}
                          pageInfo={bonusPeriodDetails.pageInfo}
                          bonusPeriodDetails={bonusPeriodDetails.bonusPeriod}
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

      {/* Pagination controls */}
      <Box mt={2} display="flex" justifyContent="center">
      <Pagination
        count={data?.pageInfo?.totalPages || 1} // Use totalPages from data.pageInfo
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
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

export default BonusPeriodList;
