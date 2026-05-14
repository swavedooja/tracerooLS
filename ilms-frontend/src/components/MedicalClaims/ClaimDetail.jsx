import React from 'react';
import { 
  Box, Typography, Paper, Grid, Chip, Button, 
  Breadcrumbs, Link as MuiLink, Container, Stack,
  Stepper, Step, StepLabel, Divider, List, ListItem,
  ListItemIcon, ListItemText, Avatar, IconButton
} from '@mui/material';
import { 
  ChevronRight as ChevronRightIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  AccountCircle as UserIcon,
  Gavel as AdminIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const MOCK_DETAILS = {
  'MED-2024-001': {
    id: 'MED-2024-001',
    date: '2024-05-10',
    amount: '₹2,500',
    status: 'IN_PROGRESS',
    type: 'Hospitalization',
    provider: 'City General Hospital',
    diagnosis: 'Acute Appendicitis',
    workflow: [
      { step: 'Request Raised', date: '2024-05-10 09:30 AM', user: 'Patient', status: 'COMPLETED', notes: 'Initial submission with hospital bill.' },
      { step: 'Document Verification', date: '2024-05-10 02:15 PM', user: 'Verification Bot', status: 'COMPLETED', notes: 'Prescriptions and Bills verified against hospital records.' },
      { step: 'Medical Review', date: '2024-05-11 11:00 AM', user: 'Dr. Sarah Wilson', status: 'COMPLETED', notes: 'Treatment aligns with diagnosis. Recommended for approval.' },
      { step: 'Final Approval', date: 'Pending', user: 'Finance Manager', status: 'PENDING', notes: 'Waiting for final disbursement clearance.' }
    ],
    documents: [
      { name: 'Hospital_Bill_881.pdf', size: '1.2 MB', type: 'Invoice' },
      { name: 'Discharge_Summary.pdf', size: '2.4 MB', type: 'Clinical' },
      { name: 'Lab_Reports_Blood.pdf', size: '0.8 MB', type: 'Reports' }
    ]
  },
  // Add other mocks if needed
};

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    case 'IN_PROGRESS': return 'warning';
    case 'RAISED': return 'info';
    default: return 'default';
  }
};

const ClaimDetail = () => {
  const { id } = useParams();
  const claim = MOCK_DETAILS[id] || MOCK_DETAILS['MED-2024-001']; // Fallback for demo

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">Dashboard</MuiLink>
          <MuiLink component={Link} to="/medical-claims" underline="hover" color="inherit">Medical Claims</MuiLink>
          <Typography color="text.primary">{claim.id}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="primary.main">
              Claim Details: {claim.id}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Submitted on {claim.date} • {claim.type}
            </Typography>
          </Box>
          <Chip 
            label={claim.status} 
            color={getStatusColor(claim.status)} 
            sx={{ fontWeight: 'bold', px: 2, py: 2, height: 'auto', fontSize: '1rem' }} 
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: Summary & Documents */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E0E4E8', mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Request Summary</Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Provider</Typography>
                <Typography variant="body1" fontWeight="bold">{claim.provider}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Amount</Typography>
                <Typography variant="body1" fontWeight="bold">{claim.amount}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Type</Typography>
                <Typography variant="body1" fontWeight="bold">{claim.type}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Diagnosis</Typography>
                <Typography variant="body1" fontWeight="bold">{claim.diagnosis}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E0E4E8' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon color="primary" /> Attached Documents
            </Typography>
            <List>
              {claim.documents.map((doc, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    secondaryAction={
                      <IconButton edge="end" aria-label="download">
                        <DownloadIcon />
                      </IconButton>
                    }
                    sx={{ py: 2 }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#F1F5F9', color: '#1E293B' }}>
                        <FileIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.name} 
                      secondary={`${doc.type} • ${doc.size}`} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                  {index < claim.documents.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Workflow Timeline */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E0E4E8', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <HistoryIcon color="primary" /> Workflow Timeline
            </Typography>
            <Stepper orientation="vertical" activeStep={3} connector={<Box sx={{ width: 2, bgcolor: '#E2E8F0', flex: 1, ml: '11px' }} />}>
              {claim.workflow.map((step, index) => (
                <Step key={index}>
                  <StepLabel 
                    icon={
                      step.status === 'COMPLETED' ? 
                      <SuccessIcon sx={{ color: 'success.main' }} /> : 
                      <PendingIcon sx={{ color: 'warning.main' }} />
                    }
                  >
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" fontWeight="bold">{step.step}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.date} • {step.user}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', color: 'text.secondary' }}>
                        {step.notes}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClaimDetail;
