import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, Paper, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem,
    Divider, Grid, IconButton, Tooltip, Avatar, Card, CardContent, Stack
} from '@mui/material';
import { 
    ArrowBack, CheckCircle, Print, Storage, 
    PlayCircleOutline, ShoppingCart, Business, 
    CalendarMonth, LocalShipping, Edit, Calculate,
    Assignment, Info, NavigateNext
} from '@mui/icons-material';
import { PackagingAPI, OrdersAPI } from '../../../services/APIService';
import LabelPreview from '../../LabelPreview';
import { jsPDF } from 'jspdf';
import Barcode from 'react-barcode';

export default function ShippingLabelGenerator() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Order Selection', 'Select Line Item', 'Configure Packaging', 'Preview & Print'];

    // Data State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderLines, setOrderLines] = useState([]);
    
    // Configuration State
    const [lineConfigs, setLineConfigs] = useState({}); // lineId -> { hierarchy, levels, counts: { levelId: count } }
    const [selectedLine, setSelectedLine] = useState(null);
    const [hierarchyDialog, setHierarchyDialog] = useState({ open: false, line: null, options: [] });
    const [detailDialog, setDetailDialog] = useState({ open: false, data: null, type: 'ORDER' });

    useEffect(() => {
        loadPendingOrders();
        
        // Handle items passed from Material Inventory
        if (location.state?.preSelectedItems) {
            handlePreSelectedItems(location.state.preSelectedItems);
        }
    }, []);

    const handlePreSelectedItems = async (items) => {
        setLoading(true);
        try {
            // Create a dummy order for these items
            const dummyOrder = { 
                id: 'bulk-print', 
                order_number: 'BULK-PRINT-' + Math.floor(Math.random() * 1000),
                customer_name: 'Internal Label Generation',
                status: 'PROCESSING'
            };
            setSelectedOrder(dummyOrder);
            
            // Format items into order lines
            const lines = items.map(item => ({
                id: 'line-' + item.id,
                material_code: item.material_code,
                material: { name: item.material_name || item.material_code },
                quantity: item.quantity || 1,
                uom: 'Units'
            }));
            setOrderLines(lines);
            
            // Fetch hierarchies/levels for each item
            const configs = {};
            for (const line of lines) {
                let hierarchies = await PackagingAPI.getHierarchies(line.material_code);
                if (hierarchies.length > 0) {
                    const h = hierarchies[0];
                    const levels = await PackagingAPI.getLevels(h.id);
                    configs[line.id] = {
                        hierarchy: h,
                        levels: levels.sort((a,b) => a.level_order - b.level_order),
                        counts: calculateDefaultCounts(line.quantity, levels)
                    };
                }
            }
            setLineConfigs(configs);
            setActiveStep(1); // Skip order selection
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const loadPendingOrders = async () => {
        setLoading(true);
        try {
            let data = await OrdersAPI.listPending();
            
            // DUMMY DATA FALLBACK
            if (!data || data.length === 0) {
                console.log("Using dummy orders for exploration...");
                data = [
                    { id: 'd1', order_number: 'SO-2024-001', customer_name: 'PharmaDist Inc.', order_date: new Date().toISOString(), status: 'PENDING' },
                    { id: 'd2', order_number: 'SO-2024-002', customer_name: 'Metro Health Co.', order_date: new Date().toISOString(), status: 'PENDING' }
                ];
            }
            
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
            setActiveStep(1); // Move to line selection
            
            // For each line, try to pre-fetch hierarchies
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

    const handleLineSelect = (line) => {
        setSelectedLine(line);
        setActiveStep(2); // Move to packaging config
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

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("SHIPPING LABELS", 105, 20, { align: 'center' });
        
        let y = 40;
        const line = selectedLine;
        const config = lineConfigs[line.id];
            
        config.levels?.forEach(lvl => {
            const count = config.counts[lvl.id] || 0;
            for (let i = 0; i < count; i++) {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setDrawColor(0);
                doc.rect(20, y, 170, 45); // Label border
                
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${line?.material?.name || line?.material_code}`, 25, y + 10);
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(`LEVEL: ${lvl.level_name}`, 25, y + 18);
                doc.text(`ORDER: ${selectedOrder?.order_number}`, 25, y + 25);
                doc.text(`SERIAL: ${lvl.level_code}-${Math.floor(Math.random()*10000)}`, 25, y + 32);
                
                // Design representation (simplified barcode for PDF)
                doc.setDrawColor(100);
                doc.rect(120, y + 10, 60, 25);
                doc.setFontSize(7);
                doc.text("BARCODE DATA", 150, y + 25, { align: 'center' });
                
                y += 55;
            }
        });
        
        doc.save(`Shipping_Labels_${selectedOrder?.order_number}_${line.material_code}.pdf`);
    };

    const canProceedToSteps = () => {
        if (activeStep === 0) return !!selectedOrder;
        if (activeStep === 1) return !!selectedLine;
        if (activeStep === 2) {
            const c = lineConfigs[selectedLine?.id];
            return c?.hierarchy && !c?.needsSelection;
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
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip label={order.status} size="small" color="warning" variant="outlined" sx={{ mb: 1 }} />
                                    <IconButton size="small" onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailDialog({ open: true, data: order, type: 'ORDER' });
                                    }}>
                                        <Info sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
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

    const PackagingConfig = () => {
        const line = selectedLine;
        const config = lineConfigs[line?.id];
        if (!line) return null;
        
        return (
            <Paper variant="outlined" sx={{ p: 4, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}>ITEM SPECIFICATION</Typography>
                            <Typography variant="h5" fontWeight="900" sx={{ mt: 1 }}>{line.material?.name || line.material_code}</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>SKU: {line.material_code}</Typography>
                        </Box>
                        
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', mb: 3, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block">PLAN QUANTITY</Typography>
                            <Typography variant="h6" fontWeight="bold">{line.quantity} <Typography component="span" variant="caption" color="text.secondary">{line.uom}</Typography></Typography>
                        </Paper>
                        
                        {config?.needsSelection && (
                            <Button 
                                fullWidth
                                variant="contained" 
                                color="warning" 
                                size="large"
                                startIcon={<Edit />}
                                onClick={() => setHierarchyDialog({ open: true, line, options: config.hierarchies })}
                                sx={{ py: 1.5, borderRadius: 2 }}
                            >
                                Choose Packaging Template
                            </Button>
                        )}
                        {config?.hierarchy && !config.needsSelection && (
                            <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Storage fontSize="medium" sx={{ color: '#0369a1' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">PACKAGING HIERARCHY</Typography>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: '#0369a1' }}>{config.hierarchy.name}</Typography>
                                </Box>
                                <IconButton sx={{ ml: 'auto' }} onClick={() => setHierarchyDialog({ open: true, line, options: [config.hierarchy] })}><Edit sx={{ fontSize: 18 }} /></IconButton>
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
                                    <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9 transition', '&:hover': { borderColor: 'primary.light' } }}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}>{lvl.level_name}</Typography>
                                        <TextField 
                                            fullWidth 
                                            type="number" 
                                            variant="standard"
                                            value={config.counts[lvl.id] || 0}
                                            onChange={(e) => updateLevelCount(line.id, lvl.id, e.target.value)}
                                            InputProps={{ sx: { fontSize: '1.2rem', fontWeight: 'bold' }, disableUnderline: true }}
                                        />
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {lvl.contained_quantity} units per {lvl.level_name.split(' ')[0]}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                            {!config?.levels && <Alert severity="warning" sx={{ width: '100%', borderRadius: 3 }}>No compatible packaging hierarchy found for this material. Please configure one in Label Management.</Alert>}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box className="no-print" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                        Shipping Label Generator
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fulfill Sales Orders with Automated Packaging & Label Calculations
                    </Typography>
                </Box>
                {selectedOrder && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                            icon={<ShoppingCart />} 
                            label={`Order: ${selectedOrder.order_number}`} 
                            color="primary" 
                            variant="filled" 
                            sx={{ fontWeight: 'bold' }} 
                        />
                        {selectedLine && (
                            <Chip 
                                icon={<CheckCircle />} 
                                label={`Line: ${selectedLine.material_code}`} 
                                color="secondary" 
                                variant="filled" 
                                sx={{ fontWeight: 'bold' }} 
                            />
                        )}
                    </Box>
                )}
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }} className="no-print">
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            <Box sx={{ minHeight: '50vh' }}>
                {activeStep === 0 && <OrderGrid />}
                {activeStep === 1 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>SELECT A LINE ITEM TO CONFIGURE LABELS</Typography>
                        </Grid>
                        {orderLines.map(line => (
                            <Grid item xs={12} md={6} key={line.id}>
                                <Paper 
                                    variant="outlined" 
                                    onClick={() => handleLineSelect(line)}
                                    sx={{ 
                                        p: 3, 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedLine?.id === line.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                        bgcolor: selectedLine?.id === line.id ? '#eff6ff' : 'white',
                                        '&:hover': { transform: 'scale(1.01)', boxShadow: 1 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main' }}><Assignment /></Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{line.material?.name || line.material_code}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Qty: {line.quantity} {line.uom} • {line.total_price ? `${line.total_price?.toLocaleString()} ${selectedOrder.currency}` : line.material_code}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            setDetailDialog({ open: true, data: line, type: 'LINE' });
                                        }}>
                                            <Info sx={{ fontSize: 18 }} />
                                        </IconButton>
                                        <NavigateNext color="action" />
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {activeStep === 2 && <PackagingConfig />}
                {activeStep === 3 && (
                    <Box sx={{ py: 3 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6} className="no-print">
                                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, bgcolor: '#f8fafc' }}>
                                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                                    <Typography variant="h5" gutterBottom fontWeight="bold">Configuration Complete</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        Ready to generate labels for <b>{selectedOrder?.order_number}</b>. 
                                        Calculated <b>{Object.values(lineConfigs).reduce((acc, c) => acc + Object.values(c.counts || {}).reduce((a, b) => a + b, 0), 0)}</b> total labels across all packaging levels.
                                    </Typography>
                                    
                                    <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
                                        <Button 
                                            variant="contained" 
                                            size="large" 
                                            startIcon={<Print />} 
                                            onClick={() => window.print()} 
                                            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold' }}
                                        >
                                            Open Print Dialog
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="large" 
                                            startIcon={<Storage />} 
                                            onClick={handleDownloadPDF}
                                            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold' }}
                                        >
                                            Download PDF
                                        </Button>
                                    </Stack>
                                    
                                    <Button 
                                        sx={{ mt: 4 }}
                                        variant="text" 
                                        color="inherit"
                                        onClick={() => navigate('/label-management/material-inventory')}
                                    >
                                        Return to Inventory
                                    </Button>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ '@media print': { width: '100%', maxWidth: '100%', flexBasis: '100%' } }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }} className="no-print">FINAL PREVIEW</Typography>
                                <Paper variant="outlined" sx={{ 
                                    overflow: 'hidden', 
                                    borderRadius: 4, 
                                    height: 450, 
                                    position: 'relative',
                                    '@media print': {
                                        height: 'auto',
                                        overflow: 'visible',
                                        border: 'none'
                                    }
                                }}>
                                    <Box className="no-print" sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                    </Box>
                                    <Box sx={{ p: 3, height: 'calc(100% - 40px)', overflow: 'auto', '@media print': { overflow: 'visible', p: 0 } }}>
                                        {selectedLine && (() => {
                                            const config = lineConfigs[selectedLine.id];
                                            if (!config) return null;
                                            return (
                                                <Box key={selectedLine.id} sx={{ mb: 4, '@media print': { mb: 0 } }}>
                                                    <Typography variant="overline" color="primary" className="no-print">{config.hierarchy?.name}</Typography>
                                                    {config.levels?.map(lvl => {
                                                        const count = config.counts[lvl.id] || 0;
                                                        const labels = [];
                                                        for (let i = 0; i < count; i++) {
                                                            labels.push(
                                                                <Box key={`${lvl.id}-${i}`} sx={{ 
                                                                    mb: 2, 
                                                                    transform: 'scale(0.8)', 
                                                                    transformOrigin: 'top left',
                                                                    '@media print': {
                                                                        transform: 'none',
                                                                        pageBreakAfter: 'always',
                                                                        mb: 0,
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        pt: 5
                                                                    }
                                                                }}>
                                                                    <Box className="no-print" sx={{ mb: 1 }}>
                                                                        <Typography variant="caption" fontWeight="bold">{lvl.level_name} ({i+1}/{count})</Typography>
                                                                    </Box>
                                                                    <Paper sx={{ 
                                                                        p: 2, 
                                                                        border: '1px solid #000', 
                                                                        width: 300, 
                                                                        height: 180,
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        justifyContent: 'space-between'
                                                                    }}>
                                                                        <Box>
                                                                            <Typography variant="overline" sx={{ fontWeight: 'bold', fontSize: 10, borderBottom: '1px solid #eee' }}>ILMS SHIPPING LABEL</Typography>
                                                                            <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 'bold', mt: 1 }}>
                                                                                {config.hierarchy?.name || 'Trade Item'}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ fontSize: 9 }}>
                                                                                LVL: {lvl.level_name} | QTY: {lvl.contained_quantity}
                                                                            </Typography>
                                                                        </Box>
                                                                        
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                            <Barcode 
                                                                                value={lvl.level_code ? `${lvl.level_code}-${1000 + i}` : `SHP-${lvl.id}-${i}`} 
                                                                                width={1.2}
                                                                                height={40}
                                                                                fontSize={8}
                                                                            />
                                                                        </Box>
                                                                        
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary' }}>
                                                                                BATCH: 2024-X1 | SO: {selectedOrder?.order_number || 'INTERNAL'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Paper>
                                                                </Box>
                                                            );
                                                        }
                                                        return labels;
                                                    })}
                                                </Box>
                                            );
                                        })()}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            <Divider sx={{ my: 4 }} className="no-print" />
            <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between' }}>
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

            {/* Commercial Details Dialog */}
            <Dialog 
                open={detailDialog.open} 
                onClose={() => setDetailDialog({ ...detailDialog, open: false })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold', color: 'primary.main' }}>
                    {detailDialog.type === 'ORDER' ? <ShoppingCart /> : <Assignment />}
                    {detailDialog.type === 'ORDER' ? `Order Details: ${detailDialog.data?.order_number}` : `Item Details: ${detailDialog.data?.material_code}`}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {detailDialog.type === 'ORDER' ? (
                            <>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.customer_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Customer PO Number</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.customer_po || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Order Value</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {detailDialog.data?.total_value?.toLocaleString()} {detailDialog.data?.currency || 'USD'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tax Code</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.tax_code || 'EXEMPT'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Shipping Destination</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'error.main' }}>
                                        {detailDialog.data?.ship_to_destination}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {detailDialog.data?.ship_to_address}
                                    </Typography>
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Material Name</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.material?.name || detailDialog.data?.material_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Quantity</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.quantity} {detailDialog.data?.uom}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Unit Price</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.unit_price?.toLocaleString()} {selectedOrder?.currency}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Line Total</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                        {detailDialog.data?.total_price?.toLocaleString()} {selectedOrder?.currency}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tax Info</Typography>
                                    <Typography variant="body2" fontWeight="bold">{detailDialog.data?.tax_amount?.toLocaleString()} ({detailDialog.data?.tax_code})</Typography>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailDialog({ ...detailDialog, open: false })} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
