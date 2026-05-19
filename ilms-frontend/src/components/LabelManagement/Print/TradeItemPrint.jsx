import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Button, Typography, Paper, Grid, Stack, 
    Divider, IconButton, Tooltip, Alert, FormControl,
    InputLabel, Select, MenuItem, TextField, Card,
    CardContent, LinearProgress, Tab, Tabs, Chip
} from '@mui/material';
import { 
    Print, Download, ArrowBack, Inventory2, 
    QrCode2, Warning, CheckCircle, Edit,
    Calculate, Storage, ChevronRight
} from '@mui/icons-material';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import { PackagingAPI } from '../../../services/APIService';

export default function TradeItemPrint() {
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef();
    
    const rawItems = location.state?.preSelectedItems || [];
    const items = rawItems.length >= 300 ? rawItems : [
        ...rawItems,
        ...Array.from({ length: Math.max(0, 300 - rawItems.length) }, (_, i) => ({
            id: `seed-${i}`,
            serialNumber: `SN-PROD-${1000 + i}`,
            materialCode: rawItems[0]?.materialCode || rawItems[0]?.material_code || 'AMX-250',
            materialName: rawItems[0]?.materialName || rawItems[0]?.material_name || 'Amoxicillin 250mg Tablets',
            batchNumber: rawItems[0]?.batchNumber || 'B-1001-24',
            mfgDate: rawItems[0]?.mfgDate || '2026-05-04',
            expiryDate: rawItems[0]?.expiryDate || '2028-05-04'
        }))
    ];

    // State for packaging hierarchy & calculations
    const [loading, setLoading] = useState(false);
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [calculatedCounts, setCalculatedCounts] = useState({});
    const [userCounts, setUserCounts] = useState({});
    
    // Tab selector for label preview
    const [activeLevelTab, setActiveLevelTab] = useState(0);

    // Fallback Dummy Hierarchy for Demo
    const DUMMY_HIERARCHY = {
        id: 'dummy-h-1',
        name: 'Standard Pharma Blister Flow (Seeded)',
        description: 'Tablet Strip -> Secondary Folding Box (10) -> Master Carton (5) -> Pallet'
    };

    const DUMMY_LEVELS = [
        { id: 'dl-1', level_order: 1, level_name: 'Tablet Strip', contained_quantity: 1, capacity: 1 },
        { id: 'dl-2', level_order: 2, level_name: 'Secondary Folding Box', contained_quantity: 10, capacity: 10 },
        { id: 'dl-3', level_order: 3, level_name: 'Master Carton', contained_quantity: 50, capacity: 5 }
    ];

    const AMOXICILLIN_GLOBAL_HIERARCHY = {
        id: 'amox-global-export-h',
        name: 'Amoxicillin Tablets Global Export',
        description: 'Tablet Strip (1) -> Secondary Folding Box (10) -> Master Export Carton (50)'
    };

    const AMOXICILLIN_GLOBAL_LEVELS = [
        { id: 'agel-1', level_order: 1, level_name: 'Tablet Strip', contained_quantity: 1, capacity: 1 },
        { id: 'agel-2', level_order: 2, level_name: 'Secondary Folding Box', contained_quantity: 10, capacity: 10 },
        { id: 'agel-3', level_order: 3, level_name: 'Master Export Carton', contained_quantity: 50, capacity: 5 }
    ];

    useEffect(() => {
        if (items.length > 0) {
            loadPackagingConfig();
        }
    }, [items]);

    const loadPackagingConfig = async () => {
        setLoading(true);
        try {
            // Find the material code of the first preSelected item
            const firstItem = items[0];
            const matCode = firstItem.materialCode || firstItem.material_code || '';
            
            // 1. Fetch hierarchies matching the material code
            let matchedHierarchies = [];
            if (matCode) {
                matchedHierarchies = await PackagingAPI.getHierarchies(matCode);
            }
            
            // 2. If none, fetch all hierarchies
            if (matchedHierarchies.length === 0) {
                const all = await PackagingAPI.getHierarchies();
                // Filter out shipping hierarchies if trade items are requested
                matchedHierarchies = all.filter(h => !h.name.startsWith('Shipping -'));
            }

            // 3. Fallback to dummy hierarchies if nothing in DB
            if (matchedHierarchies.length === 0) {
                matchedHierarchies = [DUMMY_HIERARCHY];
            }

            // Prepend Amoxicillin Tablets Global Export as the leading choice
            matchedHierarchies = [
                AMOXICILLIN_GLOBAL_HIERARCHY,
                ...matchedHierarchies.filter(h => h.name !== 'Amoxicillin Tablets Global Export' && h.id !== 'amox-global-export-h')
            ];

            setHierarchies(matchedHierarchies);
            
            // Default to the first hierarchy (which is now Amoxicillin Tablets Global Export)
            const defaultH = matchedHierarchies[0];
            setSelectedHierarchy(defaultH);
            await loadHierarchyLevels(defaultH);

        } catch (e) {
            console.error("Failed to load hierarchy config", e);
            // Graceful fallback to default
            setHierarchies([AMOXICILLIN_GLOBAL_HIERARCHY]);
            setSelectedHierarchy(AMOXICILLIN_GLOBAL_HIERARCHY);
            setLevels(AMOXICILLIN_GLOBAL_LEVELS);
            performNestingCalculations(items.length, AMOXICILLIN_GLOBAL_LEVELS);
        }
        setLoading(false);
    };

    const loadHierarchyLevels = async (hierarchy) => {
        if (hierarchy.id === 'amox-global-export-h') {
            setLevels(AMOXICILLIN_GLOBAL_LEVELS);
            performNestingCalculations(items.length, AMOXICILLIN_GLOBAL_LEVELS);
            return;
        }

        if (hierarchy.id === 'dummy-h-1') {
            setLevels(DUMMY_LEVELS);
            performNestingCalculations(items.length, DUMMY_LEVELS);
            return;
        }


        try {
            const data = await PackagingAPI.getLevels(hierarchy.id);
            if (data.length === 0) {
                // If the hierarchy has no levels defined, use standard dummy levels for demo
                setLevels(DUMMY_LEVELS);
                performNestingCalculations(items.length, DUMMY_LEVELS);
            } else {
                const sorted = data.sort((a, b) => a.level_order - b.level_order);
                setLevels(sorted);
                performNestingCalculations(items.length, sorted);
            }
        } catch (e) {
            console.error("Failed to load levels", e);
            setLevels(DUMMY_LEVELS);
            performNestingCalculations(items.length, DUMMY_LEVELS);
        }
    };

    const performNestingCalculations = (qty, activeLevels) => {
        const sorted = [...activeLevels].sort((a, b) => a.level_order - b.level_order);
        const counts = {};
        
        let prevCumulativeFactor = 1;
        let prevCount = qty;
        
        sorted.forEach((lvl, index) => {
            if (index === 0) {
                counts[lvl.id] = qty;
                prevCumulativeFactor = lvl.contained_quantity || lvl.capacity || 1;
                prevCount = qty;
            } else {
                const val = lvl.contained_quantity || lvl.capacity || 1;
                if (val > prevCumulativeFactor) {
                    // Cumulative calculation
                    counts[lvl.id] = Math.ceil(qty / val);
                    prevCumulativeFactor = val;
                    prevCount = counts[lvl.id];
                } else {
                    // Nested nesting calculation
                    counts[lvl.id] = Math.ceil(prevCount / val);
                    prevCumulativeFactor = prevCumulativeFactor * val;
                    prevCount = counts[lvl.id];
                }
            }
        });
        
        setCalculatedCounts(counts);
        setUserCounts(counts);
    };

    const handleHierarchyChange = async (event) => {
        const hid = event.target.value;
        const selected = hierarchies.find(h => h.id === hid);
        setSelectedHierarchy(selected);
        setLoading(true);
        await loadHierarchyLevels(selected);
        setLoading(false);
    };

    const handleCountOverride = (levelId, value) => {
        const val = Math.max(0, parseInt(value) || 0);
        setUserCounts(prev => ({
            ...prev,
            [levelId]: val
        }));
    };

    const generateLabelSerial = (level, index, item) => {
        const matCode = item?.materialCode || item?.material_code || 'PROD';
        const batchNum = item?.batchNumber || 'B-1001-24';
        
        if (level.level_order === 1) {
            return item?.serialNumber || `SN-${matCode}-${1000 + index}`;
        } else if (level.level_order === 2) {
            return `BOX-${matCode}-${batchNum}-${101 + index}`;
        } else if (level.level_order === 3) {
            return `CTN-${matCode}-${batchNum}-${11 + index}`;
        } else {
            return `PLT-${matCode}-${batchNum}-${1 + index}`;
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 150] 
        });

        const canvas = document.createElement('canvas');
        let isFirstPage = true;

        levels.forEach((lvl) => {
            const count = userCounts[lvl.id] || 0;
            for (let i = 0; i < count; i++) {
                if (!isFirstPage) {
                    doc.addPage([100, 150], 'portrait');
                }
                isFirstPage = false;
                
                // Draw border card
                doc.setDrawColor(0);
                doc.rect(5, 5, 90, 140);
                
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("ILMS PHARMA", 50, 15, { align: 'center' });
                doc.setFontSize(8);
                doc.text(`CERTIFIED HIERARCHY LEVEL: ${lvl.level_name.toUpperCase()}`, 50, 20, { align: 'center' });
                
                doc.setDrawColor(200);
                doc.line(10, 25, 90, 25);
                
                const item = items[0] || {};
                doc.setFontSize(10);
                doc.text(`PRODUCT:`, 10, 35);
                doc.setFont("helvetica", "bold");
                doc.text(`${item.materialName || item.material_name || item.materialCode || 'Amoxicillin'}`, 10, 40);
                
                doc.setFont("helvetica", "normal");
                doc.text(`BATCH:`, 10, 50);
                doc.setFont("helvetica", "bold");
                doc.text(`${item.batchNumber || 'B-1001-24'}`, 10, 55);
                
                doc.setFont("helvetica", "normal");
                doc.text(`EXPIRY:`, 10, 65);
                doc.setFont("helvetica", "bold");
                doc.text(`${item.expiresAt || item.expiryDate || '12/2027'}`, 10, 70);
                
                doc.setFont("helvetica", "normal");
                doc.text(`LEVEL INFO:`, 10, 80);
                doc.setFont("helvetica", "bold");
                doc.text(`Level ${lvl.level_order} of ${levels.length} (${i + 1}/${count})`, 10, 85);
                
                // Serial calculation
                const serialValue = generateLabelSerial(lvl, i, item);
                
                // Generate Barcode Image
                try {
                    JsBarcode(canvas, serialValue, {
                        format: "CODE128",
                        width: 2,
                        height: 100,
                        displayValue: false
                    });
                    const barcodeData = canvas.toDataURL('image/png');
                    doc.addImage(barcodeData, 'PNG', 15, 95, 70, 30);
                } catch (err) {
                    console.error("Barcode generation failed", err);
                    doc.rect(15, 95, 70, 30);
                    doc.text("BARCODE ERROR", 50, 112, { align: 'center' });
                }
                
                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                doc.text("AUTHORIZED FOR DISTRIBUTION", 50, 140, { align: 'center' });
                doc.setFont("helvetica", "bold");
                doc.text(`${serialValue}`, 50, 128, { align: 'center' });
            }
        });

        doc.save(`Labels_Hierarchical_${new Date().getTime()}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (items.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>No Items Selected</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Please go back to Material Inventory and select items to print.
                </Typography>
                <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/label-management/material-inventory')}>
                    Back to Inventory
                </Button>
            </Box>
        );
    }

    const currentActiveLevel = levels[activeLevelTab];
    const currentCalculatedCount = currentActiveLevel ? (userCounts[currentActiveLevel.id] || 0) : 0;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header - Hidden during print */}
            <Box className="no-print" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Calculate color="primary" /> Hierarchical Label Station
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Auto-calculate and print serialized hierarchy levels for {items.length} selected items
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<ArrowBack />} 
                        onClick={() => navigate('/label-management/material-inventory')}
                    >
                        Back
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<Print />} 
                        onClick={handlePrint}
                        sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}
                    >
                        Print All
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<Download />} 
                        onClick={handleDownloadPDF}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Download PDF
                    </Button>
                </Stack>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            <Grid container spacing={3} className="no-print">
                {/* Configurator Side Panel */}
                <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#f8fafc', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Storage color="primary" /> Hierarchy Selection
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                            Choose the Trade Item Hierarchy to compute packaging level count allocations.
                        </Typography>

                        <FormControl fullWidth size="small" sx={{ mb: 3, bgcolor: 'white' }}>
                            <InputLabel id="hierarchy-select-label">Active Trade Hierarchy</InputLabel>
                            <Select
                                labelId="hierarchy-select-label"
                                value={selectedHierarchy?.id || ''}
                                label="Active Trade Hierarchy"
                                onChange={handleHierarchyChange}
                            >
                                {hierarchies.map(h => (
                                    <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calculate color="primary" /> Calculated Allocation
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                            Based on your selection of <b>{items.length} units</b>, the following nesting label requirements have been calculated:
                        </Typography>

                        <Stack spacing={2}>
                            {levels.map((lvl) => {
                                const ratio = lvl.contained_quantity || lvl.capacity || 1;
                                return (
                                    <Card key={lvl.id} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        Level {lvl.level_order}: {lvl.level_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Ratio: 1 per {ratio} unit{ratio > 1 ? 's' : ''} of previous level
                                                    </Typography>
                                                </Box>
                                                
                                                <TextField 
                                                    type="number"
                                                    label="Label Count"
                                                    value={userCounts[lvl.id] || 0}
                                                    onChange={(e) => handleCountOverride(lvl.id, e.target.value)}
                                                    size="small"
                                                    sx={{ width: 90 }}
                                                    InputProps={{ sx: { fontWeight: 'bold' } }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Previews Panel */}
                <Grid item xs={12} md={8}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Label Preview Station
                            </Typography>
                            <Chip 
                                label={`Total Labels: ${Object.values(userCounts).reduce((a, b) => a + b, 0)}`}
                                color="primary"
                                fontWeight="bold"
                                size="small"
                            />
                        </Box>
                        
                        <Tabs 
                            value={activeLevelTab} 
                            onChange={(e, val) => setActiveLevelTab(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                        >
                            {levels.map((lvl) => (
                                <Tab 
                                    key={lvl.id}
                                    label={`${lvl.level_name} (${userCounts[lvl.id] || 0})`}
                                    sx={{ fontWeight: 'bold', textTransform: 'none' }}
                                />
                            ))}
                        </Tabs>

                        {/* Rendering labels under active tab category */}
                        {currentActiveLevel ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', p: 2, bgcolor: '#f1f5f9', borderRadius: 3, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
                                {currentCalculatedCount > 0 ? (
                                    Array.from({ length: currentCalculatedCount }).map((_, idx) => {
                                        const sampleItem = items[0] || {};
                                        const serial = generateLabelSerial(currentActiveLevel, idx, sampleItem);
                                        return (
                                            <Paper 
                                                key={idx}
                                                elevation={2}
                                                sx={{ 
                                                    width: '320px', 
                                                    height: '210px', 
                                                    p: 2.5, 
                                                    border: '1.5px solid #000',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: 'white',
                                                    color: 'black'
                                                }}
                                            >
                                                <Box sx={{ borderBottom: '1.5px solid #000', pb: 0.5, mb: 1, textAlign: 'center' }}>
                                                    <Typography variant="subtitle2" fontWeight="800" sx={{ letterSpacing: 1, fontSize: 12 }}>ILMS PHARMA</Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 7, color: 'text.secondary', textTransform: 'uppercase' }}>
                                                        Certified Level {currentActiveLevel.level_order}: {currentActiveLevel.level_name}
                                                    </Typography>
                                                </Box>

                                                <Grid container spacing={0.5}>
                                                    <Grid item xs={7}>
                                                        <Stack spacing={0.2}>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 7, fontWeight: 'bold', display: 'block' }}>PRODUCT NAME</Typography>
                                                                <Typography variant="body2" fontWeight="800" sx={{ fontSize: 10, lineHeight: 1.1 }}>{sampleItem.materialName || sampleItem.material_name || sampleItem.materialCode || 'Amoxicillin'}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 7, fontWeight: 'bold', display: 'block' }}>BATCH NUMBER</Typography>
                                                                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: 9 }}>{sampleItem.batchNumber || 'B-1001-24'}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 7, fontWeight: 'bold', display: 'block' }}>EXPIRY DATE</Typography>
                                                                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: 9 }}>{sampleItem.expiresAt || sampleItem.expiryDate || '12/2027'}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                        <Box sx={{ p: 0.5, border: '1px solid #10b981', bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 1, textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{ fontSize: 7, fontWeight: 'bold', color: '#10b981', display: 'block' }}>QC PASS</Typography>
                                                        </Box>
                                                        <Typography variant="caption" sx={{ mt: 1, fontSize: 7, fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                            Idx: {idx + 1} of {currentCalculatedCount}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 0.5 }}>
                                                    <Barcode 
                                                        value={serial} 
                                                        width={1.2}
                                                        height={35}
                                                        fontSize={8}
                                                        margin={0}
                                                    />
                                                </Box>

                                                <Box sx={{ borderTop: '1px solid #ddd', pt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ fontSize: 6 }}>Gen: {new Date().toLocaleDateString()}</Typography>
                                                    <Typography variant="caption" sx={{ fontSize: 6, fontWeight: 'bold', color: 'primary.main' }}>TRACK & TRACE SECURED</Typography>
                                                </Box>
                                            </Paper>
                                        );
                                    })
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, opacity: 0.5 }}>
                                        <QrCode2 sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography variant="body2">No labels allocated for this level</Typography>
                                    </Box>
                                )}
                            </Box>
                        ) : null}
                    </Paper>
                </Grid>
            </Grid>

            {/* Continuous roll printable container (Only active during Window Print layout) */}
            <Box 
                id="printable-area"
                ref={printRef}
                sx={{ 
                    display: 'none',
                    '@media print': {
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 0,
                        backgroundColor: 'white',
                        color: 'black',
                        width: '100%',
                    }
                }}
            >
                {levels.map((lvl) => {
                    const count = userCounts[lvl.id] || 0;
                    return Array.from({ length: count }).map((_, idx) => {
                        const sampleItem = items[0] || {};
                        const serial = generateLabelSerial(lvl, idx, sampleItem);
                        return (
                            <Paper 
                                key={`${lvl.id}-${idx}`}
                                elevation={0}
                                sx={{ 
                                    width: '100mm', 
                                    height: '150mm', 
                                    p: 4, 
                                    border: '1.5px solid #000',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    pageBreakAfter: 'always',
                                    breakAfter: 'page',
                                    margin: '0 auto'
                                }}
                            >
                                <Box sx={{ borderBottom: '2.5px solid #000', pb: 1, mb: 2, textAlign: 'center' }}>
                                    <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1.5 }}>ILMS PHARMA</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 10 }}>
                                        CERTIFIED PACKAGING LEVEL: {lvl.level_name.toUpperCase()}
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={7}>
                                        <Stack spacing={1}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 'bold', display: 'block' }}>PRODUCT NAME</Typography>
                                                <Typography variant="body1" fontWeight="900">{sampleItem.materialName || sampleItem.material_name || sampleItem.materialCode || 'Amoxicillin'}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 'bold', display: 'block' }}>BATCH NUMBER</Typography>
                                                <Typography variant="body1" fontWeight="bold">{sampleItem.batchNumber || 'B-1001-24'}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 'bold', display: 'block' }}>EXPIRY DATE</Typography>
                                                <Typography variant="body1" fontWeight="bold">{sampleItem.expiresAt || sampleItem.expiryDate || '12/2027'}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <Box sx={{ p: 1, border: '2px solid #10b981', bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 1.5, textAlign: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#10b981', display: 'block' }}>QC PASS</Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ mt: 2, fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}>
                                            Label {idx + 1} of {count}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                                    <Barcode 
                                        value={serial} 
                                        width={1.6}
                                        height={55}
                                        fontSize={10}
                                        margin={0}
                                    />
                                </Box>

                                <Box sx={{ borderTop: '1.5px solid #ddd', pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ fontSize: 9 }}>Generated: {new Date().toLocaleDateString()}</Typography>
                                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 'bold', color: 'primary.main' }}>TRACK & TRACE SYSTEM SECURED</Typography>
                                </Box>
                            </Paper>
                        );
                    });
                })}
            </Box>

            {/* Global Print Styles override */}
            <style>
                {`
                    @media print {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        body {
                            visibility: hidden !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        #root {
                            display: none !important;
                        }
                        
                        #printable-area {
                            display: block !important;
                            visibility: visible !important;
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        #printable-area * {
                            visibility: visible !important;
                        }

                        .no-print {
                            display: none !important;
                        }

                        @page {
                            size: auto;
                            margin: 0;
                        }
                    }
                `}
            </style>
        </Box>
    );
}
