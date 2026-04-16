import React, { useState, useEffect } from 'react';
import {
    Box, Button, Paper, Typography, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Alert, TextField, InputAdornment, IconButton, Switch, FormControlLabel,
    Tooltip, LinearProgress
} from '@mui/material';
import { 
    Search, Print, Refresh, 
    CheckCircle, Error as ErrorIcon, 
    FilterList, Inventory2, LocationOn
} from '@mui/icons-material';
import { InventoryAPI } from '../../services/APIService';
import { useNavigate } from 'react-router-dom';

export default function MaterialInventory() {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUnprintedOnly, setShowUnprintedOnly] = useState(false);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await InventoryAPI.list();
            setInventory(data);
        } catch (e) {
            console.error("Failed to load inventory", e);
        }
        setLoading(false);
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = 
            item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.materialName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = showUnprintedOnly ? item.labelPrinted === 'N' : true;
        
        return matchesSearch && matchesFilter;
    });

    const handlePrint = (item) => {
        // Find a hierarchy for this material if possible, or just go to generic print
        // For now, navigating to generic print station
        navigate('/labels/generate');
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Inventory2 color="primary" /> Material Inventory
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time tracking of all serialized units and label status
                    </Typography>
                </Box>
                <Button 
                    startIcon={<Refresh />} 
                    onClick={loadInventory} 
                    disabled={loading}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters Bar */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search by Serial, Material or Batch..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                
                <FormControlLabel
                    control={
                        <Switch 
                            checked={showUnprintedOnly} 
                            onChange={(e) => setShowUnprintedOnly(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Show Unprinted Only"
                />

                <Box sx={{ flex: 1 }} />
                
                <Chip 
                    label={`Total Items: ${inventory.length}`} 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                />
                <Chip 
                    label={`Filtered: ${filteredInventory.length}`} 
                    variant="outlined" 
                    color="secondary" 
                    size="small" 
                />
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {/* Inventory Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Serial Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Material Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Batch / Lot</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Quality Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }} align="center">Label Printed</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {item.serialNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.materialName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Code: {item.materialCode}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={item.batchNumber} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                                {item.locationName || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={item.qualityStatus}
                                            size="small"
                                            color={item.qualityStatus === 'PASS' ? 'success' : item.qualityStatus === 'HOLD' ? 'warning' : 'error'}
                                            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={item.labelPrinted === 'Y' ? 'YES' : 'NO'}
                                            color={item.labelPrinted === 'Y' ? 'success' : 'default'}
                                            size="small"
                                            variant={item.labelPrinted === 'Y' ? 'filled' : 'outlined'}
                                            sx={{ minWidth: 50 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Go to Print Station">
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<Print />}
                                                onClick={() => handlePrint(item)}
                                                sx={{ 
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                Print Label
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ opacity: 0.5 }}>
                                        <Inventory2 sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography variant="h6">No inventory records found</Typography>
                                        <Typography variant="body2">
                                            Try adjusting your filters or search query
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
