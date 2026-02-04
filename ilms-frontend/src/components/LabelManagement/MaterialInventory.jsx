import React, { useState, useEffect } from 'react';
import {
    Box, Button, Paper, Typography, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Alert, Tabs, Tab
} from '@mui/material';
import { CloudUpload, Download, Storage, AddCircleOutline, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { PackagingAPI } from '../../services/APIService';
import { useNavigate, useParams } from 'react-router-dom';

export default function MaterialInventory() {
    const navigate = useNavigate();
    const { hierarchyId } = useParams();
    const [mode, setMode] = useState('erp'); // 'erp' or 'manual'
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [uploadedData, setUploadedData] = useState({}); // { levelId: { headers: [], rows: [] } }
    const [hierarchies, setHierarchies] = useState([]);

    useEffect(() => {
        if (hierarchyId) {
            loadLevels();
        } else {
            // Load hierarchies for selection
            loadHierarchies();
        }

        // Load existing data from LocalStorage
        const savedData = localStorage.getItem(`materialData_${hierarchyId}`);
        if (savedData) {
            setUploadedData(JSON.parse(savedData));
        }
    }, [hierarchyId]);

    const loadHierarchies = async () => {
        try {
            const data = await PackagingAPI.getHierarchies();
            setHierarchies(data);
        } catch (e) {
            console.error("Failed to load hierarchies", e);
        }
    };

    const loadLevels = async () => {
        setLoading(true);
        try {
            const data = await PackagingAPI.getLevels(hierarchyId);
            const sorted = data.sort((a, b) => a.level_order - b.level_order);
            setLevels(sorted);
            if (sorted.length > 0) setSelectedLevel(sorted[0].id);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleFileUpload = (levelId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1).map((line, i) => {
                    const values = line.split(',');
                    const row = { _id: i };
                    headers.forEach((h, idx) => row[h] = values[idx]?.trim() || '');
                    return row;
                });

                const newData = {
                    ...uploadedData,
                    [levelId]: { headers, rows, fileName: file.name, timestamp: new Date().toLocaleString() }
                };

                setUploadedData(newData);
                // Save to local storage for persistence
                localStorage.setItem(`materialData_${hierarchyId}`, JSON.stringify(newData));
            }
        };
        reader.readAsText(file);
    };

    const generateSampleCSV = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        // Default count 10 for sample
        const count = 10;

        // Common fields that might be used in labels
        const headers = ['serialNumber', 'batchNumber', 'materialCode', 'materialName', 'expiryDate', 'mfgDate', 'netWeight'];

        // Generate dummy rows
        const rows = [];
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setFullYear(today.getFullYear() + 2);

        for (let i = 1; i <= count; i++) {
            rows.push([
                `SN-${today.toLocaleDateString('en-GB').replace(/\//g, '')}-${String(i).padStart(5, '0')}`,
                `BATCH-${today.getFullYear()}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
                `MAT-${String(1000 + i).padStart(8, '0')}`,
                `Sample Product ${level?.level_name || 'Item'} #${i}`,
                expiryDate.toISOString().split('T')[0],
                today.toISOString().split('T')[0],
                `${(Math.random() * 500 + 100).toFixed(0)}g`
            ]);
        }

        // Create CSV content
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sample_${level?.level_name || 'data'}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Material Inventory</Typography>
                <Box>
                    <Button
                        variant={mode === 'erp' ? "contained" : "outlined"}
                        onClick={() => setMode('erp')}
                        startIcon={<Storage />}
                        sx={{ mr: 2 }}
                    >
                        ERP Integration
                    </Button>
                    <Button
                        variant={mode === 'manual' ? "contained" : "outlined"}
                        onClick={() => setMode('manual')}
                        startIcon={<AddCircleOutline />}
                    >
                        Manual Data
                    </Button>
                </Box>
            </Box>

            {mode === 'manual' && !hierarchyId && (
                <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>Select Packaging Hierarchy</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Please select a packaging hierarchy to manage its inventory data manually.
                    </Typography>

                    {hierarchies.length > 0 ? (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            {hierarchies.map(h => (
                                <Button
                                    key={h.id}
                                    variant="outlined"
                                    onClick={() => navigate(`/label-management/material-inventory/${h.id}`)}
                                    sx={{ justifyContent: 'flex-start', p: 2 }}
                                >
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{h.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{h.description || 'No description'}</Typography>
                                    </Box>
                                </Button>
                            ))}
                        </Box>
                    ) : (
                        <Alert severity="info">No hierarchies found. Please create one in Label Management first.</Alert>
                    )}
                </Paper>
            )}

            {!hierarchyId && mode !== 'manual' && (
                <Alert severity="warning">Please select a hierarchy to manage inventory.</Alert>
            )}

            {mode === 'erp' && (
                <Paper sx={{ p: 5, textAlign: 'center', minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Storage sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Connected to ERP/SAP System</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 500, mt: 1 }}>
                        Data is automatically synchronized from the central ERP system.
                        No manual action is required here.
                    </Typography>
                    <Chip label="Status: Online" color="success" variant="outlined" sx={{ mt: 3 }} />
                </Paper>
            )}

            {mode === 'manual' && hierarchyId && (
                <Box>
                    <Button onClick={() => navigate('/label-management/material-inventory')} sx={{ mb: 2 }}>Change Hierarchy</Button>
                    <Tabs
                        value={selectedLevel || false}
                        onChange={(_, val) => setSelectedLevel(val)}
                        sx={{ mb: 3 }}
                    >
                        {levels.map(l => (
                            <Tab key={l.id} label={l.level_name} value={l.id} />
                        ))}
                    </Tabs>

                    {selectedLevel && (
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">
                                    Upload Data for {levels.find(l => l.id === selectedLevel)?.level_name}
                                </Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={() => generateSampleCSV(selectedLevel)}
                                        sx={{ mr: 2 }}
                                    >
                                        Download Template
                                    </Button>
                                    <Button component="label" variant="contained" startIcon={<CloudUpload />}>
                                        Upload Excel/CSV
                                        <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(selectedLevel, e)} />
                                    </Button>
                                </Box>
                            </Box>

                            {uploadedData[selectedLevel] ? (
                                <Box>
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        File <b>{uploadedData[selectedLevel].fileName}</b> uploaded successfully at {uploadedData[selectedLevel].timestamp}.
                                        <br />
                                        Total Records: <b>{uploadedData[selectedLevel].rows.length}</b>
                                    </Alert>

                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    {uploadedData[selectedLevel].headers.map((h, i) => (
                                                        <TableCell key={i} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {uploadedData[selectedLevel].rows.slice(0, 50).map((row, i) => (
                                                    <TableRow key={i}>
                                                        {uploadedData[selectedLevel].headers.map((h, j) => (
                                                            <TableCell key={j}>{row[h]}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Showing first 50 rows.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ py: 5, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
                                    <Typography color="text.secondary">No data uploaded yet for this level.</Typography>
                                </Box>
                            )}
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
}
