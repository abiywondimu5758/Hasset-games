import React, { useEffect, useState } from "react";
import { AxiosError } from "../../types"
import io from "socket.io-client";
import {
  Grid,
  Card,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { BASE_URL } from "../../helper/Api";
import {
  calculateMonthlyAggregates,
  calculateFees,
  fetchLast7DaysStats,
  fetchDashboardData,
  fetchPlatformFeeStats,
} from "../../services/transactionTrackingServices";
import { useQuery } from "@tanstack/react-query";

// Define the socket connection
const socket = io(BASE_URL);

// Define types for the data from the server
interface GameMetrics {
  gamesToday: number;
  gamesLast3Days: number;
  gamesLastWeek: number;
  gamesLastMonth: number;
}

interface UserMetrics {
  totalUsers: number;
  totalReferrals: number;
}

interface StakeMetrics {
  stakes: {
    id: number;
    amount: string;
    _count: {
      bingoGames: number;
    };
  }[];
}

interface MonthlyAggregates {
  month: number;
  year: number;
  deposit: number;
  withdrawal: number;
}

const Dashboard: React.FC = () => {
  const [activeGames, setActiveGames] = useState<number | null>(0);
  const [gameMetrics, setGameMetrics] = useState<GameMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [activeBonuses, setActiveBonuses] = useState<number | null>(0);
  const [stakeMetrics, setStakeMetrics] = useState<StakeMetrics | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(0);
  const [monthlyAggregates, setMonthlyAggregates] =
    useState<MonthlyAggregates | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [errorState, setErrorState] = useState("");

  const [feesStartDate, setFeesStartDate] = useState("");
  const [feesEndDate, setFeesEndDate] = useState("");

  useEffect(() => {
    // Emit the event to request real-time updates from the server
    socket.emit("realTimeAdminUpdates");

    // Listen for the data updates from the server and set state
    socket.on("activeGamesUpdate", (data: { count: number }) => {
      setActiveGames(data.count);
    });

    socket.on("gameMetricsUpdate", (data: GameMetrics) => {
      setGameMetrics(data);
    });

    socket.on("userMetricsUpdate", (data: UserMetrics) => {
      setUserMetrics(data);
    });

    socket.on("bonusMetricsUpdate", (data: { count: number }) => {
      setActiveBonuses(data.count);
    });

    socket.on("stakeMetricsUpdate", (data: StakeMetrics) => {
      setStakeMetrics(data);
    });

    socket.on("activeUsersUpdate", (data: { count: number }) => {
      setActiveUsers(data.count);
    });

    return () => {
      socket.off("activeGamesUpdate");
      socket.off("gameMetricsUpdate");
      socket.off("userMetricsUpdate");
      socket.off("bonusMetricsUpdate");
      socket.off("stakeMetricsUpdate");
    };
  }, []);

  const {
    data: monthlyData,
    isLoading: isMonthlyAggregatesLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["monthlyAggregates"],
    queryFn: () => calculateMonthlyAggregates(startDate, endDate),
    enabled: false,
  });

  const {
    data: feesData,
    isLoading: isFeesLoading,
    isError: isFeesError,
    error: feesError,
    refetch: refetchFees,
  } = useQuery({
    queryKey: ["fees"],
    queryFn: () => calculateFees(feesStartDate, feesEndDate),
    enabled: false,
  });

  const {
    data: last7DaysData,
    isLoading: isLast7DaysLoading,
    isError: isLast7DaysError,
    error: last7DaysError,
  } = useQuery({
    queryKey: ["last7DaysStats"],
    queryFn: fetchLast7DaysStats,
  });

  const {
    data: dashboardData,
    isLoading: isDashboardDataLoading,
    isError: isDashboardDataError,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });

  const {
    data: platformFeesData,
    isLoading: isPlatformFeesLoading,
    isError: isPlatformFeesError,
    error: platformFeesError,
  } = useQuery({
    queryKey: ["platformFeeStats"],
    queryFn: fetchPlatformFeeStats,
  });

  useEffect(() => {
    if (isError) {
      setErrorState("Failed to fetch Monthly data");
      setOpenSnackbar(true);
    }
  }, [isError, error]);

  useEffect(() => {
    // Whenever monthlyData changes, store it in local state if needed
    if (monthlyData) {
      setMonthlyAggregates(monthlyData);
    }
  }, [monthlyData]);

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleFetchAggregates = () => {
    refetch();
  };

  const handleFeesStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFeesStartDate(event.target.value);
  };

  const handleFeesEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFeesEndDate(event.target.value);
  };

  const handleFetchFees = () => {
    refetchFees();
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Real-Time Dashboard Updates
      </Typography>
      {/* Active Metrics */}
      <Typography variant="h5" gutterBottom>
        Active Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Active Users</Typography>
            <Typography variant="h2" color="primary">
              {activeUsers ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Active Games</Typography>
            <Typography variant="h2" color="primary">
              {activeGames ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Active Bonuses</Typography>
            <Typography variant="h2" color="primary">
              {activeBonuses ?? 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>
      {/* Game Metrics */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Game Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Games Today</Typography>
            <Typography variant="h2" color="primary">
              {gameMetrics ? gameMetrics.gamesToday : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Games Last 3 Days</Typography>
            <Typography variant="h2" color="primary">
              {gameMetrics ? gameMetrics.gamesLast3Days : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Games Last Week</Typography>
            <Typography variant="h2" color="primary">
              {gameMetrics ? gameMetrics.gamesLastWeek : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Games Last Month</Typography>
            <Typography variant="h2" color="primary">
              {gameMetrics ? gameMetrics.gamesLastMonth : 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>
      {/* User Metrics */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        User Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Total Users</Typography>
            <Typography variant="h2" color="primary">
              {userMetrics ? userMetrics.totalUsers : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Total Referrals</Typography>
            <Typography variant="h2" color="primary">
              {userMetrics ? userMetrics.totalReferrals : 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>
      {/* Stake Metrics */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Stake Metrics
      </Typography>
      <Grid container spacing={3}>
        {stakeMetrics?.stakes.map((stake) => (
          <Grid item xs={12} sm={6} md={3} key={stake.id}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Stake {stake.amount}</Typography>
              <Typography variant="h2" color="primary">
                {stake._count.bingoGames}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Monthly Aggregates */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Monthly Aggregates
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" onClick={handleFetchAggregates}>
            Fetch Data
          </Button>
        </Grid>
      </Grid>
      {isMonthlyAggregatesLoading && <CircularProgress />}
      {monthlyAggregates && (
        <Grid container spacing={3} marginTop={1}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Month</Typography>
              <Typography variant="h2" color="primary">
                {monthlyAggregates.month}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Year</Typography>
              <Typography variant="h2" color="primary">
                {monthlyAggregates.year}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Total Deposits</Typography>
              <Typography variant="h2" color="primary">
                {monthlyAggregates.deposit}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Total Withdrawals</Typography>
              <Typography variant="h2" color="primary">
                {monthlyAggregates.withdrawal}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Fees Section */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Platform Fees
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Fees Start Date"
            type="date"
            value={feesStartDate}
            onChange={handleFeesStartDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Fees End Date"
            type="date"
            value={feesEndDate}
            onChange={handleFeesEndDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" onClick={handleFetchFees}>
            Fetch Fees
          </Button>
        </Grid>
      </Grid>
      {isFeesLoading && <CircularProgress />}
      {feesData && (
        <Grid container spacing={3} marginTop={1}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Start Date</Typography>
              <Typography variant="h2" color="primary">
                {feesData.startDate}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">End Date</Typography>
              <Typography variant="h2" color="primary">
                {feesData.endDate}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography variant="h5">Total Fees</Typography>
              <Typography variant="h2" color="primary">
                {feesData.totalFees}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      {isFeesError && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {(feesError as AxiosError)?.response?.data.message|| "Failed to fetch Fees"}
          </Alert>
        </Snackbar>
      )}
      {/* Last 7 Days Stats */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Last 7 Days Stats
      </Typography>
      {isLast7DaysLoading && <CircularProgress />}
      {isLast7DaysError && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {(last7DaysError as AxiosError)?.response?.data.message || "Failed to fetch last 7 days stats"}
          </Alert>
        </Snackbar>
      )}
      {last7DaysData?.last7Days?.map(
        (stat: { date: string; deposit: number; withdrawal: number }) => (
          <Card key={stat.date} sx={{ padding: 2, marginBottom: 2 }}>
            <Typography>Date: {stat.date}</Typography>
            <Typography>Deposit: {stat.deposit}</Typography>
            <Typography>Withdrawal: {stat.withdrawal}</Typography>
          </Card>
        )
      )}
      fetchPlatformFeeStats
      {/* Aggregated Dashboard Data */}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Aggregated Dashboard Data
      </Typography>
      {isDashboardDataLoading && <CircularProgress />}
      {isDashboardDataError && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {dashboardError?.message || "Failed to fetch dashboard data"}
          </Alert>
        </Snackbar>
      )}
      {dashboardData && (
        <Grid container spacing={2} marginTop={1}>
          {/* Daily */}
          <Grid item xs={12}>
            <Typography variant="h6">Daily</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Deposit: {dashboardData.daily.deposit}</Typography>
              <Typography>
                Withdrawal: {dashboardData.daily.withdrawal}
              </Typography>
            </Card>
          </Grid>

          {/* Weekly */}
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h6">Weekly</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Deposit: {dashboardData.weekly.deposit}</Typography>
              <Typography>
                Withdrawal: {dashboardData.weekly.withdrawal}
              </Typography>
            </Card>
          </Grid>

          {/* Monthly */}
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h6">Monthly</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Deposit: {dashboardData.monthly.deposit}</Typography>
              <Typography>
                Withdrawal: {dashboardData.monthly.withdrawal}
              </Typography>
            </Card>
          </Grid>

          {/* Quarterly */}
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h6">Quarterly</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>
                Deposit: {dashboardData.quarterly.deposit}
              </Typography>
              <Typography>
                Withdrawal: {dashboardData.quarterly.withdrawal}
              </Typography>
            </Card>
          </Grid>

          {/* Six-Month */}
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h6">Six-Month</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Deposit: {dashboardData.sixMonth.deposit}</Typography>
              <Typography>
                Withdrawal: {dashboardData.sixMonth.withdrawal}
              </Typography>
            </Card>
          </Grid>

          {/* Yearly */}
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h6">Yearly</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Deposit: {dashboardData.yearly.deposit}</Typography>
              <Typography>
                Withdrawal: {dashboardData.yearly.withdrawal}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      <Typography variant="h5" gutterBottom marginTop={4}>
        Platform Fee Aggregates
      </Typography>
      {isPlatformFeesLoading && <CircularProgress />}
      {isPlatformFeesError && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {(platformFeesError as AxiosError)?.response?.data.message|| "Failed to fetch platform fee stats"}
          </Alert>
        </Snackbar>
      )}
      {platformFeesData && (
        <Grid container spacing={2} marginTop={1}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Daily: {platformFeesData.daily}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Weekly: {platformFeesData.weekly}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Monthly: {platformFeesData.monthly}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Quarterly: {platformFeesData.quarterly}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Six-Month: {platformFeesData.sixMonth}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ padding: 2 }}>
              <Typography>Yearly: {platformFeesData.yearly}</Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {errorState}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
