import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Paper, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem,
    Divider, Grid, IconButton, Tooltip, Avatar, Card, CardContent
} from '@mui/material';
import { 
    ArrowBack, CheckCircle, Print, Storage, 
    PlayCircleOutline, ShoppingCart, Business, 
    CalendarMonth, LocalShipping, Edit, Calculate
} from '@mui/icons-material';
import { PackagingAPI, OrdersAPI } from '../../../services/APIService';
import LabelPreview from '../../LabelPreview';

export default function ShippingLabelGenerator() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Order Selection', 'Configure Packaging', 'Preview & Print'];

    // Data State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderLines, setOrderLines] = useState([]);
    
    // Configuration State
    const [lineConfigs, setLineConfigs] = useState({}); // lineId -> { hierarchy, levels, counts: { levelId: count } }
    const [hierarchyDialog, setHierarchyDialog] = useState({ open: false, line: null, options: [] });

    useEffect(() => {
        loadPendingOrders();
    }, []);

    const loadPendingOrders = async () => {
        setLoading(true);
        try {
            const data = await OrdersAPI.listPending();
            setOrders(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleOrderSelect = async (order) => {
        setLoading(true);
        setSelectedOrder(order);
        try {
            const lines = await OrdersAPI.getLines(order.id);
            setOrderLines(lines);
            
            // For each line, try to find and auto-assign hierarchy
            const configs = {};
            for (const line of lines) {
                // Try to find hierarchy by material code, or its name (e.g. "Amoxicillin")
                let hierarchies = await PackagingAPI.getHierarchies(line.material_code);
                if (hierarchies.length === 0 && line.material?.name) {
                    const baseName = line.material.name.split(' ')[0]; // Take first word, e.g. "Amoxicillin"
                    hierarchies = await PackagingAPI.getHierarchies(baseName);
                }
                
                if (hierarchies.length === 1) {
                    const h = hierarchies[0];
                    const levels = await PackagingAPI.getLevels(h.id);
                    configs[line.id] = { 
                        hierarchy: h, 
                        levels: levels.sort((a,b) => a.level_order - b.level_order),
                        counts: calculateDefaultCounts(line.quantity, levels)
                    };
                } else if (hierarchies.length > 1) {
                    // Place in config without levels yet, trigger modal later
                    configs[line.id] = { hierarchies, needsSelection: true };
                } else {
                    configs[line.id] = { hierarchy: null, error: 'No hierarchy found' };
                }
            }
            setLineConfigs(configs);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const calculateDefaultCounts = (qty, levels) => {
        const sorted = [...levels].sort((a,b) => b.level_order - a.level_order); 
        const counts = {};
        let remaining = qty;

        // Simple calculation: How many of each type to cover the quantity
        // Note: In real scenarios, this might be more complex (nesting logic)
        // Here we just provide standard counts per level for the operator to override
        levels.forEach(lvl => {
            const perLevel = lvl.contained_quantity || 1;
            counts[lvl.id] = Math.ceil(qty / perLevel);
        });
        return counts;
    };

    const handleHierarchySelection = async (line, hierarchy) => {
        setLoading(true);
        try {
            const levels = await PackagingAPI.getLevels(hierarchy.id);
            setLineConfigs(prev => ({
                ...prev,
                [line.id]: {
                    hierarchy,
                    levels: levels.sort((a,b) => a.level_order - b.level_order),
                    counts: calculateDefaultCounts(line.quantity, levels)
                }
            }));
            setHierarchyDialog({ open: false, line: null, options: [] });
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const updateLevelCount = (lineId, levelId, val) => {
        setLineConfigs(prev => ({
            ...prev,
            [lineId]: {
                ...prev[lineId],
                counts: { ...prev[lineId].counts, [levelId]: parseInt(val) || 0 }
            }
        }));
    };

    const canProceedToSteps = () => {
        if (activeStep === 0) return !!selectedOrder;
        if (activeStep === 1) {
            return Object.values(lineConfigs).every(c => c.hierarchy && !c.needsSelection);
        }
        return true;
    };

    // --- Sub-components (Steps) ---

    const OrderGrid = () => (
        <Grid container spacing={3}>
            {orders.map(order => (
                <Grid item xs={12} md={4} key={order.id}>
                    <Card 
                        onClick={() => handleOrderSelect(order)}
                        sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: selectedOrder?.id === order.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            bgcolor: selectedOrder?.id === order.id ? '#eff6ff' : 'white',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}><ShoppingCart /></Avatar>
                                <Chip label={order.status} size="small" color="warning" variant="outlined" />
                            </Box>
                            <Typography variant="h6" fontWeight="800">{order.order_number}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                                <Business fontSize="small" />
                                <Typography variant="body2">{order.customer_name}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                                <CalendarMonth fontSize="small" />
                                <Typography variant="body2">{new Date(order.order_date).toLocaleDateString()}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            {orders.length === 0 && !loading && <Grid item xs={12}><Alert severity="info">No pending sales orders found.</Alert></Grid>}
        </Grid>
    );

    const PackagingConfig = () => (
        <Box>
            {orderLines.map(line => {
                const config = lineConfigs[line.id];
                return (
                    <Paper key={line.id} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold">MATERIAL</Typography>
                                <Typography variant="h6" fontWeight="bold">{line.material?.name || `Material: ${line.material_code}`}</Typography>
                                <Typography variant="body2" color="text.secondary">Order Quantity: {line.quantity} {line.uom}</Typography>
                                
                                {config?.needsSelection && (
                                    <Button 
                                        sx={{ mt: 1 }} 
                                        variant="contained" 
                                        color="warning" 
                                        size="small"
                                        startIcon={<Edit />}
                                        onClick={() => setHierarchyDialog({ open: true, line, options: config.hierarchies })}
                                    >
                                        Choose Packaging Template
                                    </Button>
                                )}
                                {config?.hierarchy && !config.needsSelection && (
                                    <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Storage fontSize="small" sx={{ color: '#0369a1' }} />
                                        <Typography variant="caption" fontWeight="800" sx={{ color: '#0369a1' }}>{config.hierarchy.name}</Typography>
                                        <IconButton size="small" onClick={() => setHierarchyDialog({ open: true, line, options: [config.hierarchy] })}><Edit sx={{ fontSize: 14 }} /></IconButton>
                                    </Box>
                                )}
                            </Grid>
                            
                            <Grid item xs={12} md={8}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Calculate fontSize="small" /> Required Shipping Labels (Auto-Calculated)
                                </Typography>
                                <Grid container spacing={2}>
                                    {config?.levels?.map(lvl => (
                                        <Grid item xs={12} sm={4} key={lvl.id}>
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>{lvl.level_name}</Typography>
                                                <TextField 
                                                    fullWidth 
                                                    type="number" 
                                                    size="small" 
                                                    value={config.counts[lvl.id] || 0}
                                                    onChange={(e) => updateLevelCount(line.id, lvl.id, e.target.value)}
                                                    InputProps={{ sx: { bgcolor: 'white' } }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {lvl.contained_quantity} units/pack
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                    {!config?.levels && <Typography variant="caption" color="error">Configure hierarchy to calculate labels.</Typography>}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                );
            })}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                        Shipping Label Generator
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fulfill Sales Orders with Automated Packaging & Label Calculations
                    </Typography>
                </Box>
                {selectedOrder && (
                    <Chip 
                        icon={<ShoppingCart />} 
                        label={`Order: ${selectedOrder.order_number}`} 
                        color="primary" 
                        variant="filled" 
                        sx={{ fontWeight: 'bold' }} 
                    />
                )}
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            <Box sx={{ minHeight: '50vh' }}>
                {activeStep === 0 && <OrderGrid />}
                {activeStep === 1 && <PackagingConfig />}
                {activeStep === 2 && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">Ready to Print</Typography>
                        <Alert severity="success" sx={{ display: 'inline-flex', mb: 4 }}>
                            Calculated labels for {orderLines.length} materials across {selectedOrder?.order_number}.
                        </Alert>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                           <Button variant="contained" size="large" startIcon={<Print />} onClick={() => window.print()} sx={{ px: 6, borderRadius: 3 }}>
                               Print All Labels
                           </Button>
                           <Button variant="outlined" size="large" onClick={() => navigate('/label-management/material-inventory')}>
                               Return to Inventory
                           </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            <Divider sx={{ my: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>Back</Button>
                <Button 
                    variant="contained" 
                    disabled={!canProceedToSteps()} 
                    onClick={() => setActiveStep(s => s + 1)}
                    endIcon={<PlayCircleOutline />}
                >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next Step'}
                </Button>
            </Box>

            {/* Hierarchy Selection Dialog */}
            <Dialog open={hierarchyDialog.open} onClose={() => setHierarchyDialog(p => ({ ...p, open: false }))}>
                <DialogTitle>Select Packaging Hierarchy</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Multiple hierarchy templates found for <b>{hierarchyDialog.line?.material_code}</b>. 
                        Please select the one for this shipment.
                    </Typography>
                    {hierarchyDialog.options.map(h => (
                        <Paper 
                            key={h.id} 
                            variant="outlined" 
                            sx={{ p: 2, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                            onClick={() => handleHierarchySelection(hierarchyDialog.line, h)}
                        >
                            <Typography variant="subtitle2" fontWeight="bold">{h.name}</Typography>
                        </Paper>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHierarchyDialog(p => ({ ...p, open: false }))}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
