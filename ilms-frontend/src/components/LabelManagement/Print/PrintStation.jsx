import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Paper, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { ArrowBack, Calculate, CheckCircle, Error as ErrorIcon, Print, Storage } from '@mui/icons-material';
import { PackagingAPI } from '../../../services/APIService';
import LabelPreview from '../../LabelPreview';

// Dummy data for preview
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

    // Stepper
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Plan Quantities', 'Verify Data', 'Preview & Print'];

    // Data
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);

    // Step 1: Quantity
    const [totalItems, setTotalItems] = useState('');
    const [calculatedCounts, setCalculatedCounts] = useState({}); // { levelId: count }

    // Step 2: Data Verification (Loaded from MaterialInventory)
    const [uploadedData, setUploadedData] = useState({}); // { levelId: { headers: [], rows: [] } }

    // Step 3: Preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLevel, setPreviewLevel] = useState(null);
    const [paperSize, setPaperSize] = useState('A4');

    useEffect(() => {
        if (hierarchyId) {
            loadLevels();
            // Load data from shared source
            const savedData = localStorage.getItem(`materialData_${hierarchyId}`);
            if (savedData) {
                setUploadedData(JSON.parse(savedData));
            }
        }
    }, [hierarchyId]);

    const loadLevels = async () => {
        setLoading(true);
        try {
            const data = await PackagingAPI.getLevels(hierarchyId);
            // Sort by level_order ascending (lowest = innermost = items)
            const sorted = data.sort((a, b) => a.level_order - b.level_order);
            setLevels(sorted);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // Step 1: Calculate counts based on capacity
    const handleCalculate = () => {
        if (!totalItems || isNaN(parseInt(totalItems))) return;

        const counts = {};
        let currentCount = parseInt(totalItems);

        levels.forEach((level, index) => {
            counts[level.id] = currentCount;
            // For next level, divide by current level's capacity
            const capacity = level.capacity || 10; // Default 10 if not set
            if (index < levels.length - 1) {
                currentCount = Math.ceil(currentCount / capacity);
            }
        });

        setCalculatedCounts(counts);
        setActiveStep(1);
    };

    // Check if row count matches expected
    const getUploadStatus = (levelId) => {
        const expected = calculatedCounts[levelId] || 0;
        const actual = uploadedData[levelId]?.rows?.length || 0;

        // If 0 expected, we don't need data? Or maybe we do. Assuming we need data if count > 0.
        if (expected === 0) return { status: 'na', color: 'default', text: 'N/A' };

        if (actual === 0) return { status: 'missing', color: 'error', text: 'No Data Found' };
        if (actual < expected) return { status: 'mismatch', color: 'warning', text: `Partial: ${actual}/${expected}` };
        // Be lenient if more data is present, usually that's fine, we just take first N
        return { status: 'ok', color: 'success', text: `Ready (${actual})` };
    };

    const allLevelsReady = levels.every(l => {
        const status = getUploadStatus(l.id);
        return status.status === 'ok' || status.status === 'na';
    });

    // Step 3: Render Imposition Preview for a level
    const renderImposition = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        if (!level || !level.label_template) return <Typography>No template linked to this level.</Typography>;

        const template = level.label_template;
        const elements = typeof template.canvas_design === 'string'
            ? JSON.parse(template.canvas_design)
            : template.canvas_design || [];

        const data = uploadedData[levelId]?.rows || [];
        if (data.length === 0) return <Typography>No data available for this level.</Typography>;

        const isContinuous = paperSize === 'Continuous';
        const paperDims = paperSize === 'A4' ? { w: 210, h: 297 } : (paperSize === 'Letter' ? { w: 215.9, h: 279.4 } : { w: template.width || 100, h: template.height || 150 });
        const pxPerMm = 3.78;
        const labelW = (template.width || 100) * pxPerMm;
        const labelH = (template.height || 150) * pxPerMm;
        const cols = isContinuous ? 1 : Math.floor(paperDims.w / (template.width || 100));
        const rows = isContinuous ? 1 : Math.floor(paperDims.h / (template.height || 150));
        const labelsPerSheet = isContinuous ? 1 : cols * rows; 
        const totalLabels = calculatedCounts[levelId] || data.length; 
        const totalSheets = isContinuous ? totalLabels : Math.ceil(totalLabels / labelsPerSheet);

        // Slice data to match needed quantity
        const neededData = data.slice(0, totalLabels);

        return (
            <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    <b>{totalLabels}</b> labels → <b>{totalSheets}</b> {isContinuous ? 'labels (continuous)' : 'sheet(s)'} ({labelsPerSheet} per sheet on {paperSize})
                </Typography>
                {/* Render first sheet as preview, or all for continuous */}
                <Paper
                    id="print-area"
                    sx={{
                        width: isContinuous ? labelW : paperDims.w * pxPerMm,
                        height: isContinuous ? 'auto' : paperDims.h * pxPerMm,
                        display: isContinuous ? 'flex' : 'grid',
                        flexDirection: isContinuous ? 'column' : 'row',
                        gridTemplateColumns: isContinuous ? 'none' : `repeat(${cols}, ${labelW}px)`,
                        gridTemplateRows: isContinuous ? 'none' : `repeat(${rows}, ${labelH}px)`,
                        gap: isContinuous ? '10px' : '0px',
                        bgcolor: isContinuous ? 'transparent' : 'white',
                        border: isContinuous ? 'none' : '1px solid #ccc',
                        boxShadow: isContinuous ? 0 : 2,
                        mx: 'auto'
                    }}
                >
                    {neededData.slice(0, isContinuous ? neededData.length : labelsPerSheet).map((rowData, i) => (
                        <Box key={i} className="label-container" sx={{ 
                            border: '1px dashed #eee', 
                            overflow: 'hidden', 
                            bgcolor: 'white', 
                            boxShadow: isContinuous ? 1 : 0 
                        }}>
                            <LabelPreview
                                width={labelW}
                                height={labelH}
                                elements={elements}
                                data={{ ...DUMMY_DATA, ...rowData }}
                            />
                        </Box>
                    ))}
                </Paper>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            border: none !important;
                            box-shadow: none !important;
                            ${paperSize === 'Continuous' ? 'display: block !important;' : ''}
                        }
                        @page {
                            size: ${paperSize === 'Continuous' ? 'auto' : `${paperSize} portrait`};
                            margin: ${paperSize === 'Continuous' ? '0mm' : '10mm'};
                        }
                        ${paperSize === 'Continuous' ? `
                        .label-container {
                            page-break-after: always;
                            margin: 0;
                            padding: 0;
                            border: none !important;
                        }
                        ` : ''}
                    }
                `}
            </style>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/labels')} sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Bulk Label Printing</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Step 1: Plan Quantities */}
            {activeStep === 0 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>How many items do you want to print?</Typography>
                    <TextField
                        label="Total Items (Lowest Level)"
                        type="number"
                        value={totalItems}
                        onChange={(e) => setTotalItems(e.target.value)}
                        sx={{ mb: 3, width: 300 }}
                    />
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<Calculate />}
                            onClick={handleCalculate}
                            disabled={!totalItems}
                        >
                            Calculate Quantities
                        </Button>
                    </Box>

                    {Object.keys(calculatedCounts).length > 0 && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Level</TableCell>
                                        <TableCell>Capacity</TableCell>
                                        <TableCell>Required Labels</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {levels.map(l => (
                                        <TableRow key={l.id}>
                                            <TableCell>{l.level_name}</TableCell>
                                            <TableCell>{l.capacity || 10}</TableCell>
                                            <TableCell><b>{calculatedCounts[l.id]}</b></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Step 2: Verify Data */}
            {activeStep === 1 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>Verify Data Availability</Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Data is sourced from Material Inventory. If data is missing, please go to 'Material Inventory' to upload or sync it.
                    </Alert>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Required</TableCell>
                                    <TableCell>Available Data</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {levels.map(l => {
                                    const status = getUploadStatus(l.id);
                                    const available = uploadedData[l.id]?.rows?.length || 0;
                                    return (
                                        <TableRow key={l.id}>
                                            <TableCell><b>{l.level_name}</b></TableCell>
                                            <TableCell>{calculatedCounts[l.id]}</TableCell>
                                            <TableCell>{available}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={status.text}
                                                    color={status.color}
                                                    icon={status.status === 'ok' ? <CheckCircle /> : status.status === 'mismatch' ? <ErrorIcon /> : null}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Preview Table for Data (Optional, just first few rows to confirm) */}
                    {Object.keys(uploadedData).length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>Data Preview (First 3 rows of loaded data)</Typography>
                            <Tabs value={previewLevel || levels[0]?.id} onChange={(_, v) => setPreviewLevel(v)} sx={{ mb: 1, minHeight: 0 }}>
                                {levels.map(l => <Tab key={l.id} label={l.level_name} value={l.id} sx={{ py: 1, minHeight: 0 }} />)}
                            </Tabs>
                            {previewLevel && uploadedData[previewLevel] && (
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                {uploadedData[previewLevel].headers.map((h, i) => <TableCell key={i}>{h}</TableCell>)}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {uploadedData[previewLevel].rows.slice(0, 3).map((r, i) => (
                                                <TableRow key={i}>
                                                    {uploadedData[previewLevel].headers.map((h, j) => <TableCell key={j}>{r[h]}</TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Box>
                            {!allLevelsReady && (
                                <Button
                                    sx={{ mr: 2 }}
                                    color="warning"
                                    onClick={() => navigate(`/label-management/material-inventory/${hierarchyId}`)}
                                >
                                    Go to Material Inventory
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={() => setActiveStep(2)}
                                disabled={!allLevelsReady}
                            >
                                Continue to Preview
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            {/* Step 3: Preview & Print */}
            {activeStep === 2 && (
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Preview & Print</Typography>
                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Paper Size</InputLabel>
                            <Select value={paperSize} label="Paper Size" onChange={(e) => setPaperSize(e.target.value)}>
                                <MenuItem value="A4">A4 (210 x 297 mm)</MenuItem>
                                <MenuItem value="Letter">Letter (215.9 x 279.4 mm)</MenuItem>
                                <MenuItem value="Continuous">Continuous Roll</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Tabs
                        value={previewLevel || levels[0]?.id}
                        onChange={(_, val) => setPreviewLevel(val)}
                        sx={{ mb: 3 }}
                    >
                        {levels.map(l => (
                            <Tab key={l.id} label={l.level_name} value={l.id} />
                        ))}
                    </Tabs>

                    <Box sx={{ overflow: 'auto', maxHeight: '60vh', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                        {renderImposition(previewLevel || levels[0]?.id)}
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setActiveStep(1)}>Back</Button>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => window.print()}
                        >
                            Print Labels
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
