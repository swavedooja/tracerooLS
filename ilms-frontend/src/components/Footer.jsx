import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import {
  LinkedIn,
  Twitter,
  Facebook,
  Instagram,
  Email,
  Phone,
  LocationOn,
  LocalShipping,
} from '@mui/icons-material';

const AnimatedBox = motion(Box);

export default function Footer() {
  const quickLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  const resources = [

  ];

  const socialLinks = [
    { icon: LinkedIn, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0A1929 0%, #1976D2 100%)',
        color: 'white',
        pt: 8,
        pb: 3,
        mt: 'auto',
      }}
    >
      {/* Wave separator */}
      <Box
        sx={{
          position: 'absolute',
          top: -1,
          left: 0,
          right: 0,
          height: 100,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          <motion.path
            d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
            fill="url(#gradient)"
            initial={{ d: 'M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z' }}
            animate={{
              d: [
                'M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z',
                'M0,20 C300,80 900,120 1200,20 L1200,120 L0,120 Z',
                'M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0A1929" />
              <stop offset="50%" stopColor="#1976D2" />
              <stop offset="100%" stopColor="#42A5F5" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <AnimatedBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocalShipping sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    SLS Material Management
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.7 }}>
                  Track and Trace solution providing cutting-edge solutions for
                  modern supply chain operations.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {socialLinks.map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.2, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconButton
                        href={social.href}
                        aria-label={social.label}
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                          },
                        }}
                      >
                        <social.icon />
                      </IconButton>
                    </motion.div>
                  ))}
                </Stack>
              </Stack>
            </AnimatedBox>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <AnimatedBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: 'white',
                        pl: 1,
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </AnimatedBox>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <AnimatedBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Resources
              </Typography>
              <Stack spacing={1}>
                {resources.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: 'white',
                        pl: 1,
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </AnimatedBox>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <AnimatedBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Contact Us
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Email sx={{ fontSize: 20, mt: 0.3, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    support@sls-mm.com
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Phone sx={{ fontSize: 20, mt: 0.3, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +91 9769534547
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <LocationOn sx={{ fontSize: 20, mt: 0.3, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    MIHAN, Nagpur
                  </Typography>
                </Stack>
              </Stack>
            </AnimatedBox>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

        {/* Bottom Bar */}
        <AnimatedBox
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} SLS Material Management. All rights reserved. Powered by DOPS | Last Updated: Dec 11, 2025, 05:16 IST
            </Typography>
            <Stack direction="row" spacing={3}>
              <Link
                href="#"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'white' },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'white' },
                }}
              >
                Terms of Service
              </Link>
            </Stack>
          </Stack>
        </AnimatedBox>
      </Container>
    </Box>
  );
}