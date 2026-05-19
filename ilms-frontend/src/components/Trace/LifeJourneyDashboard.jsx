import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, 
    TextField, MenuItem, Button, Chip, Stack, Divider,
    Avatar, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip, Alert, Zoom, Grow,
    Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material';
import {
    Timeline, Search, QrCode, LocalShipping, 
    Layers, Category, ArrowForward, CheckCircle, 
    Warning, Schedule, Person, LocationOn, 
    Fingerprint, Refresh, Map, MyLocation, Close
} from '@mui/icons-material';

// Supply Chain Expert High-Fidelity Dummy Data with real GPS coordinate mappings
const MOCK_JOURNEY_DATA = {
    'ORDER': {
        id: 'ORD-99210',
        name: 'Pharma Procurement Order #99210',
        level: 'Order',
        status: 'COMPLETED',
        details: {
            customer: 'Novartis Global Distribution (Zurich)',
            gln: '7611300000014',
            orderDate: '2026-05-01',
            releaseDate: '2026-05-03',
            itemsCount: '150,000 Units',
            value: '$450,000 USD',
            complianceCode: 'FDA-IND-2026-19',
        },
        pedigree: {
            parent: null,
            self: { id: 'ORD-99210', label: 'Contract Purchase Order' },
            children: [
                { id: 'SH-NOV-99102', label: 'Shipment #SH-NOV-99102', type: 'SHIPMENT' },
                { id: 'SH-NOV-99103', label: 'Shipment #SH-NOV-99103', type: 'SHIPMENT' }
            ]
        },
        timeline: [
            { stage: 'Order Placement', date: '2026-05-01 09:30', location: 'Zurich Office', operator: 'Procurement VP', notes: 'Digital smart contract executed', status: 'COMPLETED' },
            { stage: 'Credit Approved', date: '2026-05-01 14:15', location: 'Zurich Finance', operator: 'Finance System', notes: 'Letter of credit verified', status: 'COMPLETED' },
            { stage: 'Compliance Verification', date: '2026-05-02 11:00', location: 'Regulatory Portal', operator: 'FDA Auto-check', notes: 'Export permit matching SKU TAB-AM-250MG', status: 'COMPLETED' },
            { stage: 'Production Allocated', date: '2026-05-03 08:00', location: 'Mumbai Mfg Plant', operator: 'Scheduling Engine', notes: 'Assigned to Sterile Line 01', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'Sourcing', hours: 48 },
                { label: 'Mfg Allocation', hours: 24 },
                { label: 'Production', hours: 72 },
                { label: 'QC Audit', hours: 36 },
                { label: 'Transit Prep', hours: 12 }
            ],
            gpsPoints: [
                { name: 'Zurich Office', lat: '47.3769° N', lon: '8.5417° E', latNum: 47.3769, lonNum: 8.5417, active: false },
                { name: 'Mumbai Site', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: true }
            ]
        }
    },
    'ORDER_LINE': {
        id: 'OLI-99210-A',
        name: 'Amoxicillin 250mg Tablets - Line A',
        level: 'Order Line Item',
        status: 'IN_PRODUCTION',
        details: {
            parentOrder: 'ORD-99210',
            sku: 'TAB-AM-250MG',
            gtin: '8901234560012',
            requestedQty: '50,000 Strips',
            allocatedQty: '50,000 Strips',
            batchNo: 'B-1001-24',
        },
        pedigree: {
            parent: { id: 'ORD-99210', label: 'Order #ORD-99210', type: 'ORDER' },
            self: { id: 'OLI-99210-A', label: 'Amoxicillin Line Item' },
            children: [
                { id: 'PLT-NOV-8821', label: 'Pallet #PLT-NOV-8821', type: 'PALLET' }
            ]
        },
        timeline: [
            { stage: 'Line Item Created', date: '2026-05-01 09:30', location: 'Zurich Office', operator: 'Procurement VP', notes: 'Line item mapped to SKU code', status: 'COMPLETED' },
            { stage: 'Raw Material Staged', date: '2026-05-03 10:00', location: 'Mumbai RM Store', operator: 'Storekeeper', notes: 'Active API Batch #AMOX-API staged', status: 'COMPLETED' },
            { stage: 'Line Production Started', date: '2026-05-04 06:00', location: 'Mumbai Line 01', operator: 'Operator Suresh', notes: 'Sterile high speed run initialized', status: 'COMPLETED' },
            { stage: 'First Batch Clearance', date: '2026-05-05 18:00', location: 'Central QC Lab', operator: 'QC Inspector Raj', notes: 'Bacteriology test pass', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'Staging', hours: 12 },
                { label: 'Granulation', hours: 8 },
                { label: 'Compression', hours: 24 },
                { label: 'Coating', hours: 16 },
                { label: 'QC Test', hours: 24 }
            ],
            gpsPoints: [
                { name: 'Mumbai RM Store', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: false },
                { name: 'Mumbai Line 01', lat: '19.0782° N', lon: '72.8812° E', latNum: 19.0782, lonNum: 72.8812, active: true }
            ]
        }
    },
    'SHIPMENT': {
        id: 'SH-NOV-99102',
        name: 'Shipment #SH-NOV-99102 (Novartis)',
        level: 'Shipment',
        status: 'DELIVERED',
        details: {
            carrier: 'DHL Medical Express',
            trackingNo: 'DHL-MED-77192',
            origin: 'Strategic Pharma Mfg - Mumbai Site',
            destination: 'Zurich Cold Hub (Switzerland)',
            departureDate: '2026-05-07',
            arrivalDate: '2026-05-11',
        },
        pedigree: {
            parent: { id: 'ORD-99210', label: 'Order #ORD-99210', type: 'ORDER' },
            self: { id: 'SH-NOV-99102', label: 'Shipment Container' },
            children: [
                { id: 'PLT-NOV-8821', label: 'Pallet #PLT-NOV-8821', type: 'PALLET' }
            ]
        },
        timeline: [
            { stage: 'Shipment Manifest Created', date: '2026-05-06 14:00', location: 'Mumbai Loading Bay', operator: 'DHL Logistics Agent', notes: 'Customs declaration attached', status: 'COMPLETED' },
            { stage: 'Pallets Secured', date: '2026-05-07 08:30', location: 'Mumbai Loading Bay', operator: 'Supervisor', notes: 'Active temperature sensors linked', status: 'COMPLETED' },
            { stage: 'Dispatched from Mumbai', date: '2026-05-07 10:15', location: 'Mumbai Dispatch', operator: 'Driver Ramesh', notes: 'GPS tracker activated', status: 'COMPLETED' },
            { stage: 'Customs Cleared', date: '2026-05-09 13:00', location: 'Frankfurt Cargo Port', operator: 'Customs Officer', notes: 'Cleared medical priority pathway', status: 'COMPLETED' },
            { stage: 'Final Delivery', date: '2026-05-11 16:45', location: 'Zurich Cold Hub', operator: 'Dr. Klaus', notes: 'Custody signed and temperature checked', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'Manifest', hours: 4 },
                { label: 'Loading', hours: 2 },
                { label: 'Air Transit', hours: 36 },
                { label: 'Customs', hours: 18 },
                { label: 'Local Delivery', hours: 8 }
            ],
            gpsPoints: [
                { name: 'Mumbai Site', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: false },
                { name: 'Frankfurt Port', lat: '50.1109° N', lon: '8.6821° E', latNum: 50.1109, lonNum: 8.6821, active: false },
                { name: 'Zurich Hub', lat: '47.3769° N', lon: '8.5417° E', latNum: 47.3769, lonNum: 8.5417, active: true }
            ]
        }
    },
    'PALLET': {
        id: 'PLT-NOV-8821',
        name: 'Euro Pallet #PLT-NOV-8821',
        level: 'Pallet',
        status: 'DELIVERED',
        details: {
            sscc: '00039560020001017',
            weight: '180kg',
            dimensions: '1200mm x 800mm x 1500mm',
            wrappingMaterial: 'Anti-Static High Tension Wrap',
            packingDate: '2026-05-05',
            validatorGln: '8901234500001',
        },
        pedigree: {
            parent: { id: 'SH-NOV-99102', label: 'Shipment #SH-NOV-99102', type: 'SHIPMENT' },
            self: { id: 'PLT-NOV-8821', label: 'Pallet Ledger' },
            children: [
                { id: 'CASE-SOLN-101', label: 'Case #CASE-SOLN-101', type: 'CASE' },
                { id: 'CASE-SOLN-102', label: 'Case #CASE-SOLN-102', type: 'CASE' }
            ]
        },
        timeline: [
            { stage: 'Pallet ID Generated', date: '2026-05-05 08:30', location: 'Mumbai Packaging', operator: 'Packer Lead', notes: 'SSCC-18 serial printed', status: 'COMPLETED' },
            { stage: 'Cases Aggregated', date: '2026-05-05 10:15', location: 'Mumbai Packaging', operator: 'Packer Lead', notes: '24 Cases scanned and parented', status: 'COMPLETED' },
            { stage: 'Stretch Wrap Applied', date: '2026-05-05 11:30', location: 'Wrapping Room 3', operator: 'Operator Amit', notes: 'RFID tag linked to wrapping', status: 'COMPLETED' },
            { stage: 'Loaded into Pallet Unit', date: '2026-05-06 09:00', location: 'Mumbai Dispatch', operator: 'DHL Logistics Agent', notes: 'Securely loaded onto SH-NOV-99102', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'SSCC Print', hours: 0.5 },
                { label: 'Case Scan', hours: 2.0 },
                { label: 'Wrapping', hours: 1.0 },
                { label: 'Staging', hours: 18.0 },
                { label: 'Loading', hours: 1.5 }
            ],
            gpsPoints: [
                { name: 'Mumbai Packaging', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: false },
                { name: 'Mumbai Dispatch', lat: '19.0782° N', lon: '72.8812° E', latNum: 19.0782, lonNum: 72.8812, active: true }
            ]
        }
    },
    'CASE': {
        id: 'CASE-SOLN-101',
        name: 'Secondary Box #CASE-SOLN-101',
        level: 'Case',
        status: 'DELIVERED',
        details: {
            sscc: '00039560030001016',
            gtin: '8901234567894',
            batchId: 'BATCH-SOLN-2024-A',
            manufacturingDate: '2026-05-04',
            containedQty: '12 Primary Vials',
            sealingMethod: 'Tamper Evident Tape',
        },
        pedigree: {
            parent: { id: 'PLT-NOV-8821', label: 'Pallet #PLT-NOV-8821', type: 'PALLET' },
            self: { id: 'CASE-SOLN-101', label: 'Case Serial' },
            children: [
                { id: 'SOLN-SN-1001', label: 'Vial #SOLN-SN-1001', type: 'ITEM' },
                { id: 'SOLN-SN-1002', label: 'Vial #SOLN-SN-1002', type: 'ITEM' },
                { id: 'SOLN-SN-1003', label: 'Vial #SOLN-SN-1003', type: 'ITEM' }
            ]
        },
        timeline: [
            { stage: 'Case Formed', date: '2026-05-04 09:00', location: 'Mumbai Line 01', operator: 'System', notes: 'Corrugated Case code applied', status: 'COMPLETED' },
            { stage: 'Primary Vials Packed', date: '2026-05-04 10:30', location: 'Packing Zone', operator: 'Packer Vijay', notes: '12 Vials nested in grid', status: 'COMPLETED' },
            { stage: 'Weight Verified', date: '2026-05-04 10:45', location: 'Weight Check', operator: 'Sensor W-3', notes: 'Weight: 4.8kg - PASS', status: 'COMPLETED' },
            { stage: 'Sealed & Packed', date: '2026-05-04 11:00', location: 'Sealing Station 2', operator: 'Packer Vijay', notes: 'Case aggregated to Pallet PLT-NOV-8821', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'Forming', hours: 0.1 },
                { label: 'Nesting', hours: 1.5 },
                { label: 'Weight', hours: 0.2 },
                { label: 'Sealing', hours: 0.5 },
                { label: 'Pallet Agg', hours: 24.0 }
            ],
            gpsPoints: [
                { name: 'Line 01', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: false },
                { name: 'Packing Zone', lat: '19.0765° N', lon: '72.8785° E', latNum: 19.0765, lonNum: 72.8785, active: true }
            ]
        }
    },
    'ITEM': {
        id: 'SN-TAB-AM-250MG-1005',
        name: 'Amoxicillin 250mg Serial #1005',
        level: 'Item',
        status: 'ACTIVE',
        details: {
            serialNumber: 'SN-TAB-AM-250MG-1005',
            gtin: '8901234560012',
            batchId: 'B-1001-24',
            manufacturingDate: '2026-05-04',
            expiryDate: '2028-05-04',
            qcPassBadge: 'PASS (Bacteriology Clear)',
        },
        pedigree: {
            parent: { id: 'CASE-SOLN-101', label: 'Case #CASE-SOLN-101', type: 'CASE' },
            self: { id: 'SN-TAB-AM-250MG-1005', label: 'Individual Serialization Unit' },
            children: []
        },
        timeline: [
            { stage: 'Active Product Formed', date: '2026-05-04 06:12', location: 'Mumbai Site - Room B', operator: 'Operator Suresh', notes: 'Compression successful', status: 'COMPLETED' },
            { stage: 'QC Samples Drawn', date: '2026-05-04 08:30', location: 'Central QC Lab', operator: 'QC Tech', notes: 'Dissolution testing clearance', status: 'COMPLETED' },
            { stage: 'Unit Labeled (Serialized)', date: '2026-05-04 10:15', location: 'Laser Station 3', operator: 'System', notes: 'GS1 Datamatrix marked', status: 'COMPLETED' },
            { stage: 'Item Packed', date: '2026-05-04 10:45', location: 'Packing Zone', operator: 'Packer Vijay', notes: 'Packed into Case CASE-SOLN-101', status: 'COMPLETED' }
        ],
        metrics: {
            leadTimes: [
                { label: 'Granulating', hours: 2 },
                { label: 'Pressing', hours: 4 },
                { label: 'QA Clear', hours: 12 },
                { label: 'Lasering', hours: 1 },
                { label: 'Packing', hours: 2 }
            ],
            gpsPoints: [
                { name: 'Room B', lat: '19.0760° N', lon: '72.8777° E', latNum: 19.0760, lonNum: 72.8777, active: false },
                { name: 'Packing Zone', lat: '19.0765° N', lon: '72.8785° E', latNum: 19.0765, lonNum: 72.8785, active: true }
            ]
        }
    }
};

export default function LifeJourneyDashboard() {
    const [level, setLevel] = useState('PALLET');
    const [serialInput, setSerialInput] = useState('PLT-NOV-8821');
    const [searchedData, setSearchedData] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mapModalOpen, setMapModalOpen] = useState(false);

    // Map instances storage references
    const miniMapInstanceRef = useRef(null);
    const modalMapInstanceRef = useRef(null);

    const handleSearch = () => {
        if (!serialInput.trim()) return;
        setLoading(true);
        
        setTimeout(() => {
            const foundData = MOCK_JOURNEY_DATA[level];
            setSearchedData(foundData);
            setHasSearched(true);
            setLoading(false);
        }, 800);
    };

    const handleQuickSearch = (lvl, serial) => {
        setLevel(lvl);
        setSerialInput(serial);
        setLoading(true);
        setTimeout(() => {
            const foundData = MOCK_JOURNEY_DATA[lvl];
            setSearchedData(foundData);
            setHasSearched(true);
            setLoading(false);
        }, 600);
    };

    const handleReset = () => {
        setHasSearched(false);
        setSearchedData(null);
        setSerialInput('');
    };

    // Check if the current timeline node represents a parenting activity
    const isParentingStage = (stageName, notesText) => {
        const text = (stageName + " " + notesText).toLowerCase();
        return text.includes('pack') || text.includes('load') || text.includes('aggregat') || text.includes('shipment');
    };

    // Shared Leaflet initializer
    const initLeafletMap = (containerId, isModal = false) => {
        if (!window.L) {
            console.error('Leaflet is not loaded on window.');
            return;
        }

        const points = searchedData?.metrics.gpsPoints;
        if (!points || points.length === 0) return;

        // Destroy previous maps on search changes to prevent container reuse errors
        if (isModal) {
            if (modalMapInstanceRef.current) {
                modalMapInstanceRef.current.remove();
                modalMapInstanceRef.current = null;
            }
        } else {
            if (miniMapInstanceRef.current) {
                miniMapInstanceRef.current.remove();
                miniMapInstanceRef.current = null;
            }
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Center map around active point or first coordinate
        const activePoint = points.find(p => p.active) || points[0];
        
        const map = window.L.map(containerId, {
            center: [activePoint.latNum, activePoint.lonNum],
            zoom: isModal ? 5 : 3,
            zoomControl: isModal
        });

        // Use standard highly premium Dark Matter Cartography tile layers
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
        }).addTo(map);

        const pathCoords = [];

        points.forEach(p => {
            const pinColor = p.active ? '#10b981' : '#ef4444';
            
            // Render custom HTML/SVG Google Teardrop pins directly
            const svgIcon = window.L.divIcon({
                html: `
                    <div style="position: relative; width: 30px; height: 42px;">
                        ${p.active ? `
                        <div style="
                            position: absolute; 
                            top: -4px; 
                            left: -4px; 
                            width: 38px; 
                            height: 38px; 
                            border-radius: 50%; 
                            background: rgba(16, 185, 129, 0.3); 
                            animation: pulse 1.8s infinite ease-in-out;
                        "></div>
                        ` : ''}
                        <svg viewBox="0 0 24 24" width="30" height="42" style="position: absolute; left: 0; top: 0; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.55));">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${pinColor}"/>
                        </svg>
                    </div>
                `,
                className: 'custom-leaflet-pin',
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            });

            // Bind marker to leaflet map
            window.L.marker([p.latNum, p.lonNum], { icon: svgIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="color: #0f172a; font-family: sans-serif; font-size: 0.8rem; line-height: 1.4;">
                        <strong style="font-size: 0.85rem;">${p.name}</strong><br/>
                        Geocoordinates: <b>${p.lat}, ${p.lon}</b><br/>
                        Status: <span style="color: ${p.active ? '#10b981' : '#f59e0b'}; font-weight: bold;">${p.active ? 'ACTIVE' : 'PASSED'}</span>
                    </div>
                `);

            pathCoords.push([p.latNum, p.lonNum]);
        });

        // Add connecting polyline transit routing line
        if (pathCoords.length > 1) {
            window.L.polyline(pathCoords, {
                color: '#6366f1',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.85
            }).addTo(map);

            // Fit bounds automatically so everything is perfectly framed
            map.fitBounds(pathCoords, { padding: [40, 40] });
        }

        if (isModal) {
            modalMapInstanceRef.current = map;
        } else {
            miniMapInstanceRef.current = map;
        }
    };

    // Update mini map when searchedData changes
    useEffect(() => {
        if (hasSearched && searchedData) {
            const timer = setTimeout(() => {
                initLeafletMap('mini-leaflet-map', false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [searchedData, hasSearched]);

    // Update modal map when mapModalOpen changes
    useEffect(() => {
        if (mapModalOpen) {
            const timer = setTimeout(() => {
                initLeafletMap('modal-leaflet-map', true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [mapModalOpen]);

    // Cleanup Leaflet maps on unmount
    useEffect(() => {
        return () => {
            if (miniMapInstanceRef.current) {
                miniMapInstanceRef.current.remove();
            }
            if (modalMapInstanceRef.current) {
                modalMapInstanceRef.current.remove();
            }
        };
    }, []);

    return (
        <Box sx={{ p: 3, minHeight: '80vh' }}>
            {/* Pulsing Google Pin CSS */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.6); opacity: 0.9; }
                    50% { transform: scale(1.2); opacity: 0.2; }
                    100% { transform: scale(0.6); opacity: 0.9; }
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
                }
            `}</style>

            {/* Landing Unsearched State */}
            {!hasSearched && (
                <Grow in={!hasSearched}>
                    <Box sx={{ maxWidth: 850, mx: 'auto', mt: { xs: 4, md: 8 }, textAlign: 'center' }}>
                        {/* Glowing Header Icon */}
                        <Box 
                            sx={{ 
                                width: 90, 
                                height: 90, 
                                borderRadius: '32px', 
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                boxShadow: '0 0 30px rgba(99, 102, 241, 0.25)',
                                mb: 3
                            }}
                        >
                            <Timeline sx={{ fontSize: 44, color: '#6366f1' }} />
                        </Box>

                        <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: -1, background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Supply Chain Pedigree & Life Journey
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 300 }}>
                            Track and trace raw materials, pharmaceutical active batches, packaging nest structures, shipping containers, and physical geocast journeys instantly.
                        </Typography>

                        {/* Glassmorphic Search Panel */}
                        <Paper
                            elevation={6}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                background: 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.4)',
                                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
                                mb: 6
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Custody Level"
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        size="small"
                                        InputProps={{ sx: { borderRadius: 3, bgcolor: 'white', textAlign: 'left' } }}
                                    >
                                        <MenuItem value="ORDER">Procurement Order</MenuItem>
                                        <MenuItem value="ORDER_LINE">Order Line Item</MenuItem>
                                        <MenuItem value="SHIPMENT">Logistics Shipment</MenuItem>
                                        <MenuItem value="PALLET">Pallet (SSCC)</MenuItem>
                                        <MenuItem value="CASE">Box / Case (Secondary)</MenuItem>
                                        <MenuItem value="ITEM">Individual Item (Serial)</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter Serial Number or ID..."
                                        value={serialInput}
                                        onChange={(e) => setSerialInput(e.target.value)}
                                        size="small"
                                        InputProps={{ 
                                            borderRadius: 3, 
                                            bgcolor: 'white',
                                            startAdornment: <QrCode sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleSearch}
                                        disabled={loading}
                                        sx={{ 
                                            borderRadius: 3, 
                                            py: 1.1, 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                            '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)' }
                                        }}
                                    >
                                        {loading ? 'Tracing...' : 'Trace Journey'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Supply Chain Quick Example Pills */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                Supply Chain Example Pedigrees
                            </Typography>
                            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ gap: 1.5 }}>
                                <Chip 
                                    label="Order: ORD-99210" 
                                    onClick={() => handleQuickSearch('ORDER', 'ORD-99210')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', fontWeight: 500, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                />
                                <Chip 
                                    label="Shipment: SH-NOV-99102" 
                                    onClick={() => handleQuickSearch('SHIPMENT', 'SH-NOV-99102')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', fontWeight: 500, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                />
                                <Chip 
                                    label="Pallet: PLT-NOV-8821" 
                                    onClick={() => handleQuickSearch('PALLET', 'PLT-NOV-8821')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', fontWeight: 500, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                />
                                <Chip 
                                    label="Case: CASE-SOLN-101" 
                                    onClick={() => handleQuickSearch('CASE', 'CASE-SOLN-101')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', fontWeight: 500, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                />
                                <Chip 
                                    label="Item: SN-TAB-AM-250MG-1005" 
                                    onClick={() => handleQuickSearch('ITEM', 'SN-TAB-AM-250MG-1005')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', fontWeight: 500, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                />
                            </Stack>
                        </Box>
                    </Box>
                </Grow>
            )}

            {/* Active Searched State */}
            {hasSearched && searchedData && (
                <Zoom in={hasSearched}>
                    <Box>
                        {/* Collapsed Top Search Bar */}
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 2, 
                                mb: 4, 
                                borderRadius: 3, 
                                display: 'flex', 
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: 'center', 
                                justifySelf: 'stretch',
                                justifyContent: 'space-between',
                                gap: 2,
                                bgcolor: '#f8fafc' 
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                    <Timeline sx={{ fontSize: 20 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">Supply Chain Pedigree Tracer</Typography>
                                    <Typography variant="caption" color="text.secondary">Current Search: <b>{searchedData.level} ({searchedData.id})</b></Typography>
                                </Box>
                            </Box>

                            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                <TextField
                                    select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    size="small"
                                    sx={{ width: 140, bgcolor: 'white', borderRadius: 2 }}
                                >
                                    <MenuItem value="ORDER">Procurement Order</MenuItem>
                                    <MenuItem value="ORDER_LINE">Order Line Item</MenuItem>
                                    <MenuItem value="SHIPMENT">Logistics Shipment</MenuItem>
                                    <MenuItem value="PALLET">Pallet (SSCC)</MenuItem>
                                    <MenuItem value="CASE">Box / Case (Secondary)</MenuItem>
                                    <MenuItem value="ITEM">Individual Item (Serial)</MenuItem>
                                </TextField>

                                <TextField
                                    placeholder="Enter Serial..."
                                    value={serialInput}
                                    onChange={(e) => setSerialInput(e.target.value)}
                                    size="small"
                                    sx={{ width: 220, bgcolor: 'white', borderRadius: 2 }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />

                                <Button 
                                    variant="contained" 
                                    onClick={handleSearch} 
                                    size="small" 
                                    sx={{ px: 3, borderRadius: 2, fontWeight: 'bold' }}
                                >
                                    Trace
                                </Button>

                                <Button 
                                    variant="outlined" 
                                    onClick={handleReset} 
                                    size="small" 
                                    sx={{ borderRadius: 2 }}
                                >
                                    Clear
                                </Button>
                            </Stack>
                        </Paper>

                        {/* Grid Analytics */}
                        <Grid container spacing={3}>
                            {/* Left Panel: Custody Pedigree Info */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={3}>
                                    {/* Main Pedigree Header Card */}
                                    <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                                <Chip 
                                                    label={searchedData.level.toUpperCase()} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold', fontSize: '0.65rem' }} 
                                                />
                                                <Chip 
                                                    label={searchedData.status} 
                                                    color={searchedData.status === 'COMPLETED' || searchedData.status === 'DELIVERED' ? 'success' : 'warning'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', fontSize: '0.65rem', borderRadius: 1.5 }}
                                                />
                                            </Box>

                                            <Typography variant="h5" fontWeight="900" gutterBottom>
                                                {searchedData.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace" display="block" sx={{ mb: 3 }}>
                                                ID: {searchedData.id}
                                            </Typography>

                                            <Divider sx={{ mb: 2.5 }} />

                                            <Stack spacing={1.5}>
                                                {Object.entries(searchedData.details).map(([key, value]) => (
                                                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                            {key.replace(/([A-Z])/g, ' $1')}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="600" sx={{ fontFamily: key.toLowerCase().includes('hash') || key.toLowerCase().includes('gln') || key.toLowerCase().includes('sscc') ? 'monospace' : 'inherit' }}>
                                                            {value}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </CardContent>
                                    </Card>

                                    {/* Nesting Hierarchy Diagram */}
                                    <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Layers color="primary" /> Hierarchy Pedigree Nesting
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                                Immediate ancestor and descendant linkages of this supply chain entity.
                                            </Typography>

                                            <Stack spacing={2} alignItems="stretch" sx={{ position: 'relative' }}>
                                                {/* Parent Node */}
                                                {searchedData.pedigree.parent ? (
                                                    <Paper 
                                                        variant="outlined" 
                                                        onClick={() => handleQuickSearch(searchedData.pedigree.parent.type, searchedData.pedigree.parent.id)}
                                                        sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', borderStyle: 'dashed', cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                                                    >
                                                        <Typography variant="caption" color="text.secondary" block>PARENT CONTAINER</Typography>
                                                        <Typography variant="body2" fontWeight="bold" color="primary.main">{searchedData.pedigree.parent.label} ➔</Typography>
                                                    </Paper>
                                                ) : (
                                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                                                        <Typography variant="caption" color="text.secondary">NO PARENT (Root Order Level)</Typography>
                                                    </Paper>
                                                )}

                                                {/* Connective arrows */}
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <ArrowForward sx={{ transform: 'rotate(90deg)', color: 'primary.main', my: -0.5 }} />
                                                </Box>

                                                {/* Active Node (Self) */}
                                                <Paper 
                                                    elevation={2} 
                                                    sx={{ 
                                                        p: 2, 
                                                        borderRadius: 2, 
                                                        textAlign: 'center', 
                                                        border: '2px solid #6366f1',
                                                        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)'
                                                    }}
                                                >
                                                    <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>ACTIVE FOCUS</Typography>
                                                    <Typography variant="body1" fontWeight="800" color="#312e81">{searchedData.pedigree.self.label}</Typography>
                                                </Paper>

                                                {/* Connective arrows */}
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <ArrowForward sx={{ transform: 'rotate(90deg)', color: 'primary.main', my: -0.5 }} />
                                                </Box>

                                                {/* Children Nodes */}
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                                                        NESTED DESCENDANTS ({searchedData.pedigree.children.length})
                                                    </Typography>
                                                    {searchedData.pedigree.children.length > 0 ? (
                                                        <Stack spacing={1}>
                                                            {searchedData.pedigree.children.map(child => (
                                                                <Button 
                                                                    key={child.id}
                                                                    variant="outlined" 
                                                                    size="small"
                                                                    onClick={() => handleQuickSearch(child.type, child.id)}
                                                                    sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 0.5, borderRadius: 1.5, fontSize: '0.75rem' }}
                                                                >
                                                                    {child.label}
                                                                </Button>
                                                            ))}
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'center' }}>
                                                            None (Serialization End Unit)
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Grid>

                            {/* Middle Panel: Visual Physical Custody Journey Timeline */}
                            <Grid item xs={12} md={5}>
                                <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Timeline color="primary" /> Custody Physical Journey
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 4 }}>
                                            Chain of custody scan events with coordinates, active operator credentials and geolocations.
                                        </Typography>

                                        <Stack spacing={3} sx={{ pl: 1, position: 'relative' }}>
                                            {/* Connective Line */}
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    left: 17, 
                                                    top: 20, 
                                                    bottom: 20, 
                                                    width: 2, 
                                                    bgcolor: '#e2e8f0', 
                                                    zIndex: 0 
                                                }} 
                                            />

                                            {searchedData.timeline.map((evt, idx) => {
                                                const hasParentLink = searchedData.pedigree.parent && isParentingStage(evt.stage, evt.notes);
                                                
                                                return (
                                                    <Box key={idx} sx={{ display: 'flex', gap: 2.5, position: 'relative', zIndex: 1 }}>
                                                        <Avatar 
                                                            sx={{ 
                                                                bgcolor: idx === searchedData.timeline.length - 1 ? 'primary.main' : '#f1f5f9', 
                                                                color: idx === searchedData.timeline.length - 1 ? 'white' : 'text.secondary',
                                                                width: 36, 
                                                                height: 36,
                                                                border: '3px solid white',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                                            }}
                                                        >
                                                            {idx === searchedData.timeline.length - 1 ? <CheckCircle sx={{ fontSize: 20 }} /> : <Schedule sx={{ fontSize: 18 }} />}
                                                        </Avatar>

                                                        <Box sx={{ flex: 1, bgcolor: '#f8fafc', p: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0f172a' }}>
                                                                    {evt.stage}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {evt.date}
                                                                </Typography>
                                                            </Box>

                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                                <Chip 
                                                                    icon={<LocationOn sx={{ fontSize: 12 }} />} 
                                                                    label={evt.location} 
                                                                    size="small" 
                                                                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e2e8f0' }} 
                                                                />
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Person sx={{ fontSize: 13 }} /> {evt.operator}
                                                                </Typography>
                                                            </Stack>

                                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic', bgcolor: 'white', p: 1, borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                                                                "{evt.notes}"
                                                            </Typography>

                                                            {/* Parental Tracking Linkage Overlay */}
                                                            {hasParentLink && (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleQuickSearch(searchedData.pedigree.parent.type, searchedData.pedigree.parent.id)}
                                                                    sx={{ 
                                                                        mt: 1.5, 
                                                                        textTransform: 'none', 
                                                                        fontWeight: 'bold', 
                                                                        fontSize: '0.65rem', 
                                                                        borderRadius: 2,
                                                                        py: 0.25,
                                                                        bgcolor: 'primary.dark'
                                                                    }}
                                                                >
                                                                    ➔ Trace Parent Level ({searchedData.pedigree.parent.id})
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Right Panel: GPS Map & Performance Metrics */}
                            <Grid item xs={12} md={3}>
                                <Stack spacing={3}>
                                    {/* Global GPS Transit Map Card (Actual Leaflet GPS Library Map!) */}
                                    <Tooltip title="Click to view interactive real-world GPS Google Map pins" placement="top" arrow>
                                        <Card 
                                            onClick={() => setMapModalOpen(true)}
                                            sx={{ 
                                                borderRadius: 4, 
                                                border: '1px solid #e2e8f0', 
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    borderColor: '#6366f1',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 12px 20px rgba(99,102,241,0.08)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Map color="primary" /> Global GPS Transit Route
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                                    Real-world interactive logistics tracking. Click to expand.
                                                </Typography>

                                                <Box 
                                                    sx={{ 
                                                        position: 'relative', 
                                                        height: 180, 
                                                        borderRadius: 3, 
                                                        border: '1px solid #e2e8f0', 
                                                        overflow: 'hidden' 
                                                    }}
                                                >
                                                    {/* Real Leaflet Map Render Div */}
                                                    <Box 
                                                        id="mini-leaflet-map" 
                                                        sx={{ width: '100%', height: '100%', bgcolor: '#0f172a', zIndex: 1 }} 
                                                    />

                                                    /* Bottom Overlay Status */
                                                 </Box>
                                            </CardContent>
                                        </Card>
                                    </Tooltip>

                                    {/* Lead Time Metrics Bar Chart */}
                                    <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Schedule color="primary" /> Lead Time Distribution
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                                Hours elapsed at each logistical milestones.
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {searchedData.metrics.leadTimes.map((lt, idx) => {
                                                    const maxHours = Math.max(...searchedData.metrics.leadTimes.map(l => l.hours));
                                                    const ratio = (lt.hours / maxHours) * 100;
                                                    return (
                                                        <Box key={idx}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="caption" fontWeight="bold">{lt.label}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{lt.hours}h</Typography>
                                                            </Box>
                                                            {/* Horizontal SVG bar */}
                                                            <svg width="100%" height="8" style={{ background: '#f1f5f9', borderRadius: 4, display: 'block' }}>
                                                                <rect 
                                                                    width={`${ratio}%`} 
                                                                    height="8" 
                                                                    fill="url(#barGradient)" 
                                                                    rx="4"
                                                                />
                                                                <defs>
                                                                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                        <stop offset="0%" stopColor="#4f46e5" />
                                                                        <stop offset="100%" stopColor="#818cf8" />
                                                                    </linearGradient>
                                                                </defs>
                                                            </svg>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Zoom>
            )}

            {/* Interactive GPS Large Google Map Pin Modal */}
            <Dialog
                open={mapModalOpen}
                onClose={() => setMapModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Map sx={{ color: '#6366f1', fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Interactive GPS Transit Route Map</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Active lock on {searchedData?.id} geocast route</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setMapModalOpen(false)} sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#0f172a', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 450 }}>
                    {/* Left Side: Real-world Leaflet Map View */}
                    <Box sx={{ flex: 1.8, position: 'relative', minHeight: 400 }}>
                        <Box sx={{ position: 'absolute', top: 15, left: 15, zIndex: 1000, bgcolor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MyLocation sx={{ fontSize: 13 }} /> LIVE GPS TRACKER
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mt: 0.5 }}>
                                Current Node: {searchedData?.metrics.gpsPoints?.find(p => p.active)?.name || 'N/A'}
                            </Typography>
                        </Box>

                        {/* Leaflet Large Map Render Container */}
                        <Box 
                            id="modal-leaflet-map" 
                            sx={{ width: '100%', height: '100%', minHeight: 400, bgcolor: '#0b0f19' }} 
                        />
                    </Box>

                    {/* Right Side: Route stop details ledger */}
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#0f172a', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShipping sx={{ color: '#6366f1' }} /> Transit Stop Ledger
                        </Typography>
                        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                        <Stack spacing={2} sx={{ overflowY: 'auto', flex: 1, maxHeight: 330 }}>
                            {searchedData?.metrics.gpsPoints?.map((p, idx) => (
                                <Box key={idx} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: p.active ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)', border: p.active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)' }}>
                                    <Box sx={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>{p.name}</Typography>
                                        {p.active ? (
                                            <Chip label="ACTIVE" color="success" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 'bold' }} />
                                        ) : (
                                            <Chip label="PASSED" color="warning" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 'bold' }} />
                                        )}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontFamily: 'monospace' }}>
                                        Geocoordinates: {p.lat}, {p.lon}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
