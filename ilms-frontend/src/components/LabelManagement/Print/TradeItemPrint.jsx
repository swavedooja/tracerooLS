import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Button, Typography, Paper, Grid, Stack, 
    Divider, IconButton, Tooltip, Alert 
} from '@mui/material';
import { 
    Print, Download, ArrowBack, Inventory2, 
    QrCode2, Warning, CheckCircle 
} from '@mui/icons-material';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';

export default function TradeItemPrint() {
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef();
    
    const items = location.state?.preSelectedItems || [];

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 150] 
        });

        items.forEach((item, index) => {
            if (index > 0) doc.addPage([100, 150], 'portrait');
            
            // Draw a border / card representation
            doc.setDrawColor(0);
            doc.rect(5, 5, 90, 140);
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("ILMS PHARMA", 50, 15, { align: 'center' });
            doc.setFontSize(8);
            doc.text("SERIALIZED TRADE ITEM", 50, 20, { align: 'center' });
            
            doc.setDrawColor(200);
            doc.line(10, 25, 90, 25);
            
            doc.setFontSize(10);
            doc.text(`PRODUCT:`, 10, 35);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.material_name || item.material_code}`, 10, 40);
            
            doc.setFont("helvetica", "normal");
            doc.text(`BATCH:`, 10, 50);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.batchNumber || 'N/A'}`, 10, 55);
            
            doc.setFont("helvetica", "normal");
            doc.text(`EXPIRY:`, 10, 65);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.expiryDate || 'N/A'}`, 10, 70);
            
            doc.setFont("helvetica", "normal");
            doc.text(`SERIAL:`, 10, 80);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.serialNumber || item.id}`, 10, 85);
            
            // Design representation
            doc.setDrawColor(100);
            doc.rect(15, 95, 70, 30);
            doc.setFontSize(8);
            doc.text("BARCODE DESIGN", 50, 112, { align: 'center' });
            
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text("AUTHORIZED FOR DISTRIBUTION", 50, 140, { align: 'center' });
        });

        doc.save(`Labels_TradeItems_${new Date().getTime()}.pdf`);
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

    return (
        <Box sx={{ p: 3 }}>
            {/* Action Bar - Hidden during print */}
            <Box className="no-print" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">Trade Item Labels</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Professional serialization labels for {items.length} items
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
                        Print Labels
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

            <Alert severity="info" className="no-print" sx={{ mb: 4 }}>
                The preview below shows a continuous roll-feed layout. Click <b>Print Labels</b> to open the system dialog optimized for label printers.
            </Alert>

            {/* Labels Container */}
            <Box 
                ref={printRef}
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 4,
                    // Print styles
                    '@media print': {
                        p: 0,
                        m: 0,
                        gap: 0,
                        backgroundColor: 'white',
                    }
                }}
            >
                {items.map((item, index) => (
                    <Paper 
                        key={item.id}
                        elevation={2}
                        sx={{ 
                            width: '400px', 
                            height: '250px', 
                            p: 3, 
                            border: '2px solid #000',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backgroundColor: 'white',
                            color: 'black',
                            // Force page break in print
                            '@media print': {
                                boxShadow: 'none',
                                border: '1px solid #eee',
                                pageBreakAfter: 'always',
                                width: '100%',
                                height: 'auto',
                                mb: 0
                            }
                        }}
                    >
                        <Box sx={{ borderBottom: '2px solid #000', pb: 1, mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>ILMS PHARMA</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>CERTIFIED SERIALIZED PRODUCT</Typography>
                        </Box>

                        <Grid container spacing={1}>
                            <Grid item xs={7}>
                                <Stack spacing={0.5}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, fontWeight: 'bold', display: 'block' }}>PRODUCT NAME</Typography>
                                        <Typography variant="body2" fontWeight="800" sx={{ fontSize: 13 }}>{item.material_name || item.material_code}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, fontWeight: 'bold', display: 'block' }}>BATCH NUMBER</Typography>
                                        <Typography variant="body2" fontWeight="bold">{item.batchNumber || '2024-DEF-01'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, fontWeight: 'bold', display: 'block' }}>EXPIRY DATE</Typography>
                                        <Typography variant="body2" fontWeight="bold">{item.expiryDate || '12/2026'}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontSize: 8, fontWeight: 'bold', display: 'block' }}>QC PASS</Typography>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1, fontSize: 8, fontWeight: 'bold' }}>SN: {item.serialNumber || 'SN-00'+index}</Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
                            <Barcode 
                                value={item.serialNumber || `SN-${item.id}`} 
                                width={1.5}
                                height={50}
                                fontSize={10}
                                margin={0}
                            />
                        </Box>

                        <Box sx={{ borderTop: '1px solid #ddd', pt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontSize: 7 }}>Generated: {new Date().toLocaleDateString()}</Typography>
                            <Typography variant="caption" sx={{ fontSize: 7, fontWeight: 'bold' }}>TRACK & TRACE ENABLED</Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* Global Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #root, #root * {
                            visibility: hidden;
                        }
                        .no-print {
                            display: none !important;
                        }
                        /* Selectively show the print container */
                        [ref="printRef"], [ref="printRef"] * {
                            visibility: visible;
                        }
                        /* Actually, easier to just target the specific container and its children */
                        div[class*="MuiBox-root"][ref] {
                            visibility: visible;
                        }
                        /* Best way to handle MUI with standard window.print() */
                        body {
                            background: white !important;
                        }
                    }

                    /* Dedicated print-specific class logic */
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    
                    @media print {
                        .no-print { display: none !important; }
                        /* Ensure the labels are visible */
                        path, rect, text { fill: black !important; stroke: black !important; }
                    }
                `}
            </style>
        </Box>
    );
}
