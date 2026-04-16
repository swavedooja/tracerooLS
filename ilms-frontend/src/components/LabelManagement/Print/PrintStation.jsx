import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Paper, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem,
    Divider
} from '@mui/material';
import { 
    ArrowBack, Calculate, CheckCircle, Error as ErrorIcon, 
    Print, Storage, VerifiedUser, PlayCircleOutline
} from '@mui/icons-material';
import { PackagingAPI, InventoryAPI } from '../../../services/APIService';
import LabelPreview from '../../LabelPreview';

// Dummy data for preview fallback
const DUMMY_DATA = {
    materialCode: 'MAT-12345678',
    materialName: 'Premium Shampoo 500ml',
    batchNumber: 'B-2023-10-001',
    serialNumber: 'SN-9988776655',
    expiryDate: '2025-12-31',
    mfgDate: '2023-10-01',
    netWeight: '500g',
};

export default function PrintStation() {
    const { hierarchyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Stepper
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Selection', 'Data Verification', 'Preview & Print'];

    // Data
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [printingInProgress, setPrintingInProgress] = useState(false);
    const [isPrintConfirmed, setIsPrintConfirmed] = useState(false);

    // Selection
    const [allHierarchies, setAllHierarchies] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [tempHierarchyId, setTempHierarchyId] = useState(hierarchyId || '');
    const [activeHierarchy, setActiveHierarchy] = useState(null);

    // Live Inventory Data
    const [inventoryData, setInventoryData] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);

    useEffect(() => {
        loadAllHierarchies();
        if (hierarchyId) {
            handleHierarchySelect(hierarchyId);
        }
    }, [hierarchyId]);

    const loadAllHierarchies = async () => {
        setLoading(true);
        try {
            const data = await PackagingAPI.getHierarchies();
            setAllHierarchies(data);
            if (hierarchyId) {
                const found = data.find(h => h.id === hierarchyId);
                setActiveHierarchy(found);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleHierarchySelect = async (hid) => {
        setLoading(true);
        try {
            const levelsData = await PackagingAPI.getLevels(hid);
            const sorted = levelsData.sort((a, b) => a.level_order - b.level_order);
            setLevels(sorted);
            setSelectedLevel(sorted[0]?.id);
            
            const hInfo = allHierarchies.find(h => h.id === hid);
            setActiveHierarchy(hInfo);

            // Fetch live inventory for this hierarchy's material
            // We'll guess the material name from hierarchy name (e.g. "Amoxicillin - ...")
            const materialPart = hInfo?.name.split(' - ')[0];
            const allInv = await InventoryAPI.list();
            const filtered = allInv.filter(i => 
                i.materialName?.includes(materialPart) || i.materialCode?.includes(materialPart)
            );
            setInventoryData(filtered);
            
            setTempHierarchyId(hid);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const uniqueProducts = Array.from(new Set(allHierarchies.map(h => h.name.split(' - ')[0])));
    const filteredHierarchies = allHierarchies.filter(h => h.name.startsWith(selectedProduct + ' -'));

    const handleConfirmSuccess = async () => {
        setPrintingInProgress(true);
        try {
            // Mark the filtered items as printed
            const ids = inventoryData.filter(i => i.labelPrinted === 'N').map(i => i.id);
            if (ids.length > 0) {
                await InventoryAPI.markAsPrinted(ids);
            }
            setIsPrintConfirmed(true);
            setTimeout(() => {
                navigate('/label-management/material-inventory');
            }, 2000);
        } catch (e) {
            console.error("Failed to update print status", e);
        }
        setPrintingInProgress(false);
    };

    const renderPreview = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        if (!level || !level.label_template) return <Alert severity="info">No template linked.</Alert>;

        const template = level.label_template;
        const elements = typeof template.canvas_design === 'string'
            ? JSON.parse(template.canvas_design)
            : template.canvas_design || [];

        // For preview, we show the first unprinted item
        const previewItem = inventoryData.find(i => i.labelPrinted === 'N') || inventoryData[0] || DUMMY_DATA;

        const pxPerMm = 3.78;
        return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                    <LabelPreview
                        width={(template.width || 100) * pxPerMm}
                        height={(template.height || 150) * pxPerMm}
                        elements={elements}
                        data={{
                            ...DUMMY_DATA,
                            materialCode: previewItem.materialCode,
                            materialName: previewItem.materialName,
                            batchNumber: previewItem.batchNumber,
                            serialNumber: previewItem.serialNumber,
                            expiryDate: previewItem.expiresAt?.split('T')[0] || '2026-12-31',
                            mfgDate: previewItem.manufacturedAt?.split('T')[0] || '2024-04-16'
                        }}
                    />
                </Paper>
                <Typography variant="caption" sx={{ mt: 1 }}>Previewing data for SN: {previewItem.serialNumber}</Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
            
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Label Print Station</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {activeHierarchy ? `Hierarchy: ${activeHierarchy.name}` : 'Select a hierarchy to begin'}
                    </Typography>
                </Box>
                {activeHierarchy && (
                    <Chip label="Ready for Output" color="success" icon={<CheckCircle />} variant="outlined" />
                )}
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {/* Step 0: Selection */}
            {activeStep === 0 && (
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>1. Select Product Family</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Product</InputLabel>
                                <Select 
                                    value={selectedProduct} 
                                    label="Product" 
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    {uniqueProducts.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>2. Select Packaging Hierarchy</Typography>
                            <FormControl fullWidth disabled={!selectedProduct}>
                                <InputLabel>Hierarchy</InputLabel>
                                <Select 
                                    value={tempHierarchyId} 
                                    label="Hierarchy" 
                                    onChange={e => handleHierarchySelect(e.target.value)}
                                >
                                    {filteredHierarchies.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            size="large"
                            disabled={!activeHierarchy}
                            endIcon={<PlayCircleOutline />}
                            onClick={() => setActiveStep(1)}
                        >
                            Start Verification
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Step 1: Data Verification */}
            {activeStep === 1 && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Inventory Items to Print</Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Showing items from the <b>{activeHierarchy?.name}</b> that are currently in inventory and pending labels.
                        </Alert>
                        
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Label Flag</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventoryData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.serialNumber}</TableCell>
                                            <TableCell>{item.batchNumber}</TableCell>
                                            <TableCell>{item.qualityStatus}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={item.labelPrinted === 'Y' ? 'Printed' : 'Pending'} 
                                                    size="small"
                                                    color={item.labelPrinted === 'Y' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button 
                            variant="contained" 
                            onClick={() => setActiveStep(2)}
                            disabled={inventoryData.length === 0}
                        >
                            Proceed to Preview
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Step 2: Preview & Print */}
            {activeStep === 2 && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Print Settings</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" gutterBottom>Select packaging level to preview:</Typography>
                                <Tabs
                                    orientation="vertical"
                                    value={selectedLevel}
                                    onChange={(_, v) => setSelectedLevel(v)}
                                    sx={{ borderRight: 1, borderColor: 'divider' }}
                                >
                                    {levels.map(l => <Tab key={l.id} label={l.level_name} value={l.id} align="left" />)}
                                </Tabs>

                                <Box sx={{ mt: 3 }}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        startIcon={<Print />}
                                        onClick={() => window.print()}
                                        size="large"
                                        sx={{ mb: 2 }}
                                    >
                                        Print All Labels
                                    </Button>
                                    
                                    {!isPrintConfirmed ? (
                                        <Button 
                                            fullWidth 
                                            variant="outlined" 
                                            color="success"
                                            startIcon={<VerifiedUser />}
                                            onClick={handleConfirmSuccess}
                                            disabled={printingInProgress}
                                        >
                                            Confirm Success
                                        </Button>
                                    ) : (
                                        <Alert severity="success">
                                            Status updated! Redirecting...
                                        </Alert>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', minHeight: 400 }}>
                                <Typography variant="subtitle2" gutterBottom>Label Preview (Live Render)</Typography>
                                {renderPreview(selectedLevel)}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Button onClick={() => setActiveStep(1)}>Back</Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
