/* eslint-disable @typescript-eslint/no-explicit-any */
// DashboardLayout.tsx
import React, { useEffect } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import CasinoIcon from "@mui/icons-material/Casino";
import BadgeIcon from "@mui/icons-material/Badge";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Outlet, Link } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore"; // Import the profile store
import { fetchProfile } from "../../services/profileServices";
import { useThemeStore } from '../../store/themeStore';
import { logout } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import zIndex from "@mui/material/styles/zIndex";

const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 60;

const DashboardLayout: React.FC = () => {
  const muiTheme = useTheme();
  const [open, setOpen] = React.useState(true); // Drawer initially expanded
  const { setProfile, setLoading, profile, loading, setError, error } =
    useProfileStore();

  const handleDrawerToggle = () => {
    setOpen(!open); // Toggle between expanded and collapsed
  };

  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Transactions", icon: <CurrencyExchangeIcon />,path: "/transactions" },
    { text: "Users", icon: <PeopleIcon />, path: "/users" },
    { text: "Withdrawals > 1000", icon: <CurrencyExchangeIcon />, path: "/withdrawals" },
    { text: "Bingo", icon: <CasinoIcon />, path: "/bingo-games" },
    { text: "Stakes", icon: <MonetizationOnIcon />, path: "/stakes" },
    {
      text: "User Bingo Cards",
      icon: <BadgeIcon />,
      path: "/user-bingo-cards",
    },
    { text: "Bingo Cards", icon: <BadgeIcon />, path: "/bingo-cards" },
    
    { text: "Bonus Point Sysytem(BPS)", icon: <LeaderboardIcon />, path: "/bonus" },
    { text: "Jackpot", icon: <EmojiEventsIcon />, path: "/jackpot"},
    { text: "Referrals", icon: <ConfirmationNumberIcon />, path: "/referrals" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await fetchProfile();

        setProfile(profile.user);
      } catch (error: any) {
        const errMsg = error.response?.data?.error || "An error occurred";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    if (!profile) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [profile, setError, setLoading, setProfile]);

  useEffect(() => {
    // Toggle Tailwind's dark mode class
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async() => {
    await logout();
    navigate('/login')
  }
  const drawerContent = (
    <List>
      {menuItems.map((item) => (
        <ListItem
  key={item.text}
  component={Link}
  to={item.path}
  sx={{
    display: "flex",
    justifyContent: open ? "initial" : "center",
    paddingLeft: open ? 2 : 1,
    color: muiTheme.palette.mode === 'light' ? 'black' : 'white', // Dynamic text color based on theme
    '&:hover': {
      backgroundColor: muiTheme.palette.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(255, 255, 255, 0.3)', // Adjust hover background based on theme
    },
    }}
>
  <ListItemIcon
    sx={{
      minWidth: open ? "40px" : "auto",
      color: muiTheme.palette.mode === 'light' ? 'black' : 'white', // Dynamic icon color based on theme
    }}
  >
    {item.icon}
  </ListItemIcon>
  {open && <ListItemText primary={item.text} />} {/* Render text only if open */}
</ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {/* Display welcome message with the username */}
          <Typography variant="h6" noWrap component="div">
            {profile ? `Welcome, ${profile?.username}!` : "Welcome!"}{" "}
            {/* Fallback message */}
          </Typography>
          <Button variant="contained" onClick={toggleTheme} >
        Change Theme
      </Button>
      <Button variant="outlined" onClick={()=>handleLogout()} startIcon={<LogoutIcon />} color="error">
        Logout
      </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? expandedDrawerWidth : collapsedDrawerWidth, // Adjust width
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? expandedDrawerWidth : collapsedDrawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden", // Hide overflowing content
            transition: muiTheme.transitions.create("width", {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.standard,
            }),
          },
        }}
        open={open}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          transition: muiTheme.transitions.create("margin", {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
          }}
      >
        <Toolbar />
        {loading && (
          <>
            <CircularProgress />
          </>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {/* Outlet will render the matched child route component */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
