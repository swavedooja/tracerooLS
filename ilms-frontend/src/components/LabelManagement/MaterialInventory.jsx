import React, { useState, useEffect } from 'react';
import {
    Box, Button, Paper, Typography, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, TextField, InputAdornment, IconButton, Switch, FormControlLabel,
    Tooltip, LinearProgress, Checkbox, Menu, MenuItem, Divider
} from '@mui/material';
import { 
    Search, Print, Refresh, 
    CheckCircle, Error as ErrorIcon, 
    FilterList, Inventory2, LocationOn,
    ArrowDropDown, CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank
} from '@mui/icons-material';
import { InventoryAPI } from '../../services/APIService';
import { useNavigate } from 'react-router-dom';

export default function MaterialInventory() {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUnprintedOnly, setShowUnprintedOnly] = useState(false);
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await InventoryAPI.list();
            setInventory(data);
            setSelectedIds([]); // Reset selection on reload
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

    const passItems = filteredInventory.filter(item => item.qualityStatus === 'PASS');

    // Selection Handlers
    const handleToggleSelect = (id, status) => {
        if (status !== 'PASS') return; // Strict QC Check
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllPass = () => {
        const passIds = passItems.map(i => i.id);
        setSelectedIds(passIds);
        setAnchorEl(null);
    };

    const handleSelectByBatch = (batch) => {
        const batchPassIds = passItems.filter(i => i.batchNumber === batch).map(i => i.id);
        setSelectedIds(prev => Array.from(new Set([...prev, ...batchPassIds])));
        setAnchorEl(null);
    };

    const handleSelectByProduct = (productCode) => {
        const prodPassIds = passItems.filter(i => i.materialCode === productCode).map(i => i.id);
        setSelectedIds(prev => Array.from(new Set([...prev, ...prodPassIds])));
        setAnchorEl(null);
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
        setAnchorEl(null);
    };

    const handleBulkPrint = () => {
        if (selectedIds.length === 0) return;
        // Collect full objects for the selected IDs to pass to print station
        const selectedItems = inventory.filter(i => selectedIds.includes(i.id));
        navigate('/labels/trade-print', { state: { preSelectedItems: selectedItems } });
    };

    // Derived Data for Menus
    const uniqueBatches = Array.from(new Set(passItems.map(i => i.batchNumber)));
    const uniqueProducts = Array.from(new Set(passItems.map(i => i.materialName)));

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Inventory2 color="primary" /> Material Inventory
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        QC-Verified Label Management & Serialization Tracking
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        startIcon={<Refresh />} 
                        onClick={loadInventory} 
                        disabled={loading}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Refresh Data
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Print />}
                        disabled={selectedIds.length === 0}
                        onClick={handleBulkPrint}
                        sx={{ 
                            borderRadius: 2, 
                            px: 3, 
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                        }}
                    >
                        Print Selected ({selectedIds.length})
                    </Button>
                </Box>
            </Box>

            {/* Selection Toolbar */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                <Button
                    size="small"
                    variant="text"
                    startIcon={<CheckBoxIcon />}
                    endIcon={<ArrowDropDown />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Selection Options
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={handleSelectAllPass}>Select All (QC PASS Only)</MenuItem>
                    <Divider />
                    <Box sx={{ px: 2, py: 1 }}><Typography variant="caption" color="text.secondary" fontWeight="bold">SELECT BY BATCH</Typography></Box>
                    {uniqueBatches.map(b => (
                        <MenuItem key={b} onClick={() => handleSelectByBatch(b)}>Batch: {b}</MenuItem>
                    ))}
                    <Divider />
                    <Box sx={{ px: 2, py: 1 }}><Typography variant="caption" color="text.secondary" fontWeight="bold">SELECT BY PRODUCT</Typography></Box>
                    {uniqueProducts.map(p => (
                        <MenuItem key={p} onClick={() => handleSelectByProduct(inventory.find(i => i.materialName === p)?.materialCode)}>
                           {p}
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleClearSelection} sx={{ color: 'error.main' }}>Clear Selection</MenuItem>
                </Menu>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                
                <TextField
                    placeholder="Search Serial, Material or Batch..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 350, bgcolor: 'white' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search scale={0.8} />
                            </InputAdornment>
                        ),
                    }}
                />
                
                <FormControlLabel
                    control={
                        <Switch 
                            size="small"
                            checked={showUnprintedOnly} 
                            onChange={(e) => setShowUnprintedOnly(e.target.checked)}
                        />
                    }
                    label={<Typography variant="body2">Unprinted Only</Typography>}
                    sx={{ ml: 1 }}
                />

                <Box sx={{ flex: 1 }} />
                
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    <b>{selectedIds.length}</b> items selected of <b>{passItems.length}</b> eligible
                </Typography>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {/* Inventory Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ bgcolor: 'grey.50' }}>
                                <Checkbox
                                    size="small"
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < passItems.length}
                                    checked={passItems.length > 0 && selectedIds.length === passItems.length}
                                    onChange={(e) => {
                                        if (e.target.checked) handleSelectAllPass();
                                        else handleClearSelection();
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Serial Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Material Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Batch / Lot</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Quality Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }} align="center">Label Printed</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                const isEligible = item.qualityStatus === 'PASS';
                                
                                return (
                                    <TableRow 
                                        key={item.id} 
                                        hover 
                                        selected={isSelected}
                                        onClick={() => isEligible && handleToggleSelect(item.id, item.qualityStatus)}
                                        sx={{ cursor: isEligible ? 'pointer' : 'default', '&:hover': { bgcolor: isEligible ? 'action.hover' : 'inherit' } }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Tooltip title={!isEligible ? "Cannot select items requiring QC clearance" : ""}>
                                                <span>
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSelected}
                                                        disabled={!isEligible}
                                                        onChange={() => handleToggleSelect(item.id, item.qualityStatus)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
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
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption">
                                                    {item.locationName || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ opacity: 0.5 }}>
                                        <Inventory2 sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography variant="h6">No eligible inventory found</Typography>
                                        <Typography variant="body2">
                                            Only QC Pass materials are eligible for label printing
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
