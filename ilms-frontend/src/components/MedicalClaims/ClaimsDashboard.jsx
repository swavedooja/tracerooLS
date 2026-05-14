import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  Button, Breadcrumbs, Link as MuiLink, Container
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  History as HistoryIcon,
  MedicalServices as MedicalIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

const MOCK_CLAIMS = [
  { id: 'MED-2024-001', date: '2024-05-10', amount: '₹2,500', status: 'IN_PROGRESS', type: 'Hospitalization', provider: 'City General Hospital' },
  { id: 'MED-2024-002', date: '2024-05-08', amount: '₹450', status: 'APPROVED', type: 'Pharmacy', provider: 'Wellness Pharma' },
  { id: 'MED-2024-003', date: '2024-05-05', amount: '₹1,200', status: 'REJECTED', type: 'Laboratory', provider: 'Precision Labs' },
  { id: 'MED-2024-004', date: '2024-05-01', amount: '₹800', status: 'RAISED', type: 'Radiology', provider: 'Modern Imaging' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    case 'IN_PROGRESS': return 'warning';
    case 'RAISED': return 'info';
    default: return 'default';
  }
};

const ClaimsDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">Dashboard</MuiLink>
          <Typography color="text.primary">Medical Claims</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom>
          Medical Claims Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track your medical reimbursement requests.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E0E4E8' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Claim Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_CLAIMS.map((claim) => (
                <TableRow key={claim.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Link to={`/medical-claims/${claim.id}`} style={{ textDecoration: 'none', color: '#1A237E', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {claim.id}
                    </Link>
                  </TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell>{claim.provider}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{claim.amount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={claim.status} 
                      size="small" 
                      color={getStatusColor(claim.status)}
                      sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />} 
                      onClick={() => navigate(`/medical-claims/${claim.id}`)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ClaimsDashboard;
