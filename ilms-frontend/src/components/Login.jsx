import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalShipping,
  Lock,
  Person,
} from '@mui/icons-material';

const AnimatedBox = motion(Box);
const AnimatedPaper = motion(Paper);

// Animated background particles
const Particle = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    style={{
      position: 'absolute',
      width: Math.random() * 60 + 20,
      height: Math.random() * 60 + 20,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(25, 118, 210, 0.3), rgba(66, 165, 245, 0.1))`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      filter: 'blur(40px)',
      pointerEvents: 'none',
    }}
  />
);

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials. Try username: admin, password: admin123');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A1929 0%, #1976D2 50%, #42A5F5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles */}
      {[...Array(15)].map((_, i) => (
        <Particle key={i} delay={i * 0.3} />
      ))}

      {/* Animated grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedPaper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          elevation={24}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Logo and Title */}
          <Stack spacing={3} alignItems="center" mb={4}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 8px 24px rgba(25, 118, 210, 0.4)',
                }}
              >
                <LocalShipping sx={{ fontSize: 48, color: 'white' }} />
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0A1929, #1976D2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                }}
              >
                SLS Material Management
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                sx={{ fontWeight: 500 }}
              >
                Integrated Logistics Management System
              </Typography>
            </motion.div>
          </Stack>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(245, 247, 250, 0.5)',
                    },
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(245, 247, 250, 0.5)',
                    },
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                    boxShadow: '0px 8px 24px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                      boxShadow: '0px 12px 32px rgba(25, 118, 210, 0.4)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                  sx={{ mt: 2 }}
                >
                  Demo Credentials: admin / admin123
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <Button
                  component={Link}
                  to="/mobile-wireframe"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Try Mobile App Wireframe
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </AnimatedPaper>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '-10%',
            width: 100,
            height: 100,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: 'linear-gradient(135deg, rgba(66, 165, 245, 0.3), rgba(25, 118, 210, 0.2))',
            filter: 'blur(30px)',
          }}
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '-10%',
            width: 120,
            height: 120,
            borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
            background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.3), rgba(0, 150, 136, 0.2))',
            filter: 'blur(30px)',
          }}
        />
      </Container>
    </Box>
  );
}