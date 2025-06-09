/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, TextField, ToggleButton, ToggleButtonGroup, Snackbar, Alert, CircularProgress, Box, Card, CardContent, Typography, CardActions } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../services/authServices';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
  });
  const [errorState, setErrorState] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setErrorState(error?.response?.data?.message || 'Registration failed');
      setOpenSnackbar(true);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleToggle = (_event: React.MouseEvent<HTMLElement>, newRole: 'ADMIN' | 'STAFF') => {
    if (newRole !== null) setFormData({ ...formData, role: newRole });
  };

  const handleRegister = () => {
    setErrorState('');
    mutation.mutate(formData);
  };

  // Function to navigate to the login page
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

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
            Register
          </Typography>
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
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

          <ToggleButtonGroup
            value={formData.role}
            exclusive
            onChange={handleRoleToggle}
            fullWidth
            sx={{ mt: 2 }}
          >
            <ToggleButton value="STAFF">STAFF</ToggleButton>
            <ToggleButton value="ADMIN">ADMIN</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleRegister}
            variant="contained"
            disabled={mutation.isPending}
            fullWidth
            sx={{ mt: 2 }}
          >
            {mutation.isPending ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </CardActions>
        <Typography sx={{ display: "flex", p: 2 }}>
          Already Registered? 
          <Typography 
            sx={{ ml: 1, cursor: 'pointer', color: 'primary.main' }} 
            onClick={handleNavigateToLogin}
          >
            Login
          </Typography>
        </Typography>
      </Card>

      {/* Error Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {errorState}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
