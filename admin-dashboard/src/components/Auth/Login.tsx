/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  CardContent,
  CardActions,
  Card,
  Typography,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../services/authServices";
import { fetchProfile } from "../../services/profileServices";
import { useProfileStore } from '../../store/profileStore';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorState, setErrorState] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const setProfile = useProfileStore((state) => state.setProfile);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async(data) => {
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      const profileData = await fetchProfile();
      setProfile(profileData.user);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      setErrorState(error?.response?.data?.message || "Login failed");
      setOpenSnackbar(true);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = () => {
    setErrorState("");
    mutation.mutate(formData);
  };
  const handleNavigateToRegister = () => {
    navigate("/register");
  }

  return (
<Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      bgcolor="background.default" // Optional: adds a background color to the Box
      p={2} // Optional: adds padding
    >
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Login
          </Typography>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </CardContent>
        <CardActions>
          <Button
            onClick={()=>handleLogin()}
            variant="contained"
            disabled={mutation.isPending}
            fullWidth
            sx={{ mt: 2 }}
          >
            {mutation.isPending ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </CardActions>
        <Typography sx={{ display: "flex", p: 2 }}>
          Haven't Registered? 
          <Typography 
            sx={{ ml: 1, cursor: 'pointer', color: 'primary.main' }} 
            onClick={()=>handleNavigateToRegister()}
          >
            Register
          </Typography>
          </Typography>
      </Card>

      {/* Error Snackbar */}
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

export default Login;
