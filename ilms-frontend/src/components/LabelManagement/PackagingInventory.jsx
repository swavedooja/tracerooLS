import React, { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, 
    TextField, InputAdornment, Chip, Button, Tabs, Tab,
    LinearProgress, Divider, Avatar, Tooltip
} from '@mui/material';
import {
    Search, Refresh, Inventory, Layers, 
    LocalShipping, Warning, CheckCircle, 
    LocationOn, ArrowUpward, HelpOutline
} from '@mui/icons-material';

// Premium high-fidelity dummy data for Packaging Material Inventory
const DUMMY_PACKAGING_DATA = [
    {
        id: 'pkg-1',
        sku: 'PKG-BOX-AM250',
        name: 'Amoxicillin Secondary Folding Box',
        category: 'Boxes',
        materialType: 'Corrugated Paperboard (Pharma Grade)',
        dimensions: '120mm x 60mm x 40mm',
        weight: '0.15kg',
        currentStock: 2500,
        safeStock: 500,
        maxStock: 5000,
        capacityDescription: 'Holds 10 Amoxicillin Blister Packs',
        location: 'Strategic Pharma Site - Zone PKG-01',
        status: 'AVAILABLE',
        lastAuditDate: '2026-05-10'
    },
    {
        id: 'pkg-2',
        sku: 'PKG-AMP-BOX',
        name: 'Sterile Ampoule Secondary Box (10ct)',
        category: 'Boxes',
        materialType: 'High-Density Cardboard',
        dimensions: '150mm x 80mm x 30mm',
        weight: '0.18kg',
        currentStock: 1800,
        safeStock: 400,
        maxStock: 3000,
        capacityDescription: 'Holds 10 Sterile Ampoules (2ml)',
        location: 'Strategic Pharma Site - Zone PKG-01',
        status: 'AVAILABLE',
        lastAuditDate: '2026-05-12'
    },
    {
        id: 'pkg-3',
        sku: 'PKG-CTN-STD',
        name: 'Standard Corrugated Master Carton',
        category: 'Cartons',
        materialType: 'Double-Wall Corrugated Fiberboard',
        dimensions: '400mm x 300mm x 250mm',
        weight: '8.5kg',
        currentStock: 120,
        safeStock: 50,
        maxStock: 500,
        capacityDescription: 'Holds 50 Secondary Folding Boxes',
        location: 'strategic Pharma Site - Aisle A3',
        status: 'AVAILABLE',
        lastAuditDate: '2026-05-14'
    },
    {
        id: 'pkg-4',
        sku: 'PKG-CTN-EXP',
        name: 'Heavy-Duty Global Export Master Case',
        category: 'Cartons',
        materialType: 'Triple-Wall Kraft Board',
        dimensions: '500mm x 400mm x 350mm',
        weight: '12.0kg',
        currentStock: 42,
        safeStock: 60,
        maxStock: 300,
        capacityDescription: 'Holds 100 Secondary Folding Boxes',
        location: 'Strategic Pharma Site - Aisle A4',
        status: 'LOW_STOCK',
        lastAuditDate: '2026-05-15'
    },
    {
        id: 'pkg-5',
        sku: 'PKG-PLT-EUR',
        name: 'Euro Pharma Pallet (Standardized)',
        category: 'Pallets',
        materialType: 'Heat-Treated Solid Pine (ISPM 15)',
        dimensions: '1200mm x 800mm x 144mm',
        weight: '350kg (Max load)',
        currentStock: 45,
        safeStock: 15,
        maxStock: 100,
        capacityDescription: 'Holds 20 Master Cartons',
        location: 'Cold Chain Hub - Loading Bay B',
        status: 'AVAILABLE',
        lastAuditDate: '2026-05-08'
    },
    {
        id: 'pkg-6',
        sku: 'PKG-CNT-CC',
        name: 'Cold-Chain Insulated shipping Container',
        category: 'Containers',
        materialType: 'Polyurethane Foam / Vacuum Panel',
        dimensions: '2.2m x 1.5m x 1.6m',
        weight: 'Max load 1,200kg',
        currentStock: 4,
        safeStock: 5,
        maxStock: 15,
        capacityDescription: 'Holds up to 4 Euro Pallets',
        location: 'Cold Chain Hub - Freezer Unit A',
        status: 'CRITICAL',
        lastAuditDate: '2026-05-18'
    }
];

export default function PackagingInventory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(DUMMY_PACKAGING_DATA);

    const categories = ['All', 'Boxes', 'Cartons', 'Pallets', 'Containers'];

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 600);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'LOW_STOCK': return 'warning';
            case 'CRITICAL': return 'error';
            default: return 'default';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Boxes': return <Inventory sx={{ color: '#6366f1' }} />;
            case 'Cartons': return <Inventory sx={{ color: '#f59e0b' }} />;
            case 'Pallets': return <Layers sx={{ color: '#10b981' }} />;
            case 'Containers': return <LocalShipping sx={{ color: '#3b82f6' }} />;
            default: return <Inventory />;
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearch = 
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.materialType.toLowerCase().includes(searchQuery.toLowerCase());
        
        const categoryFilter = categories[activeTab];
        const matchesCategory = categoryFilter === 'All' ? true : item.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Stats calculations
    const totalBoxes = data.filter(i => i.category === 'Boxes').reduce((sum, i) => sum + i.currentStock, 0);
    const totalCartons = data.filter(i => i.category === 'Cartons').reduce((sum, i) => sum + i.currentStock, 0);
    const totalPallets = data.filter(i => i.category === 'Pallets').reduce((sum, i) => sum + i.currentStock, 0);
    const totalContainers = data.filter(i => i.category === 'Containers').reduce((sum, i) => sum + i.currentStock, 0);

    return (
        <Box sx={{ p: 3 }}>
            {/* Simple Clean Header */}
            <Paper 
                elevation={0}
                variant="outlined"
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    borderRadius: 3, 
                    bgcolor: '#f8fafc',
                    color: 'text.primary',
                    borderColor: '#e2e8f0'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ letterSpacing: -0.5, color: '#1e293b' }}>
                            Packaging Material Inventory
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ReadOnly warehouse ledger for active packaging materials, boxes, master shippers, and thermal containers.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Button 
                            variant="outlined" 
                            startIcon={<Refresh />} 
                            onClick={handleRefresh}
                            disabled={loading}
                            sx={{ 
                                borderColor: '#cbd5e1',
                                color: 'text.primary',
                                bgcolor: 'white',
                                '&:hover': { bgcolor: '#f1f5f9' },
                                borderRadius: 2.5,
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Refreshing...' : 'Refresh Stock'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Filter and Search Bar */}
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 2, 
                    mb: 4, 
                    borderRadius: 3, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 2,
                    bgcolor: '#f8fafc' 
                }}
            >
                <Tabs 
                    value={activeTab} 
                    onChange={(e, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                    }}
                >
                    {categories.map((c, i) => (
                        <Tab 
                            key={c} 
                            label={c} 
                            sx={{ fontWeight: 'bold', textTransform: 'none', minWidth: 90 }} 
                        />
                    ))}
                </Tabs>

                <TextField
                    placeholder="Search SKU, Name or Material..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: { xs: '100%', md: 350 }, bgcolor: 'white', borderRadius: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search scale={0.8} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Main Inventory Card Grid */}
            <Grid container spacing={3}>
                {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                        const stockRatio = (item.currentStock / item.maxStock) * 100;
                        const isLowStock = item.currentStock <= item.safeStock;
                        
                        return (
                            <Grid item xs={12} md={6} lg={4} key={item.id}>
                                <Card 
                                    variant="outlined"
                                    sx={{ 
                                        borderRadius: 4,
                                        height: '100%',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 12px 20px -8px rgba(0,0,0,0.08)',
                                            borderColor: 'primary.light'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        {/* Row 1: Icon and Status Badge */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.03)', width: 44, height: 44 }}>
                                                {getCategoryIcon(item.category)}
                                            </Avatar>
                                            <Chip 
                                                label={item.status} 
                                                size="small" 
                                                color={getStatusColor(item.status)}
                                                sx={{ fontWeight: 'bold', fontSize: '0.65rem', borderRadius: 1.5 }}
                                            />
                                        </Box>

                                        {/* SKU and Name */}
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                            {item.sku}
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1, lineHeight: 1.3, minHeight: 46 }}>
                                            {item.name}
                                        </Typography>

                                        <Divider sx={{ my: 1.5 }} />

                                        {/* Tech Specs */}
                                        <Grid container spacing={1} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Dimensions</Typography>
                                                <Typography variant="body2" fontWeight="bold">{item.dimensions}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Unit Weight</Typography>
                                                <Typography variant="body2" fontWeight="bold">{item.weight}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, mb: 3 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                                                <Layers sx={{ fontSize: 14 }} /> HIERARCHY NATIVE CAPACITY
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ mt: 0.5 }}>
                                                {item.capacityDescription}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ flexGrow: 1 }} />

                                        {/* Stock Level Bar */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">Stock Level ({item.currentStock} / {item.maxStock})</Typography>
                                                <Typography variant="caption" fontWeight="bold" color={isLowStock ? 'error.main' : 'success.main'}>
                                                    {Math.round(stockRatio)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stockRatio} 
                                                color={isLowStock ? 'warning' : 'primary'}
                                                sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0' }}
                                            />
                                        </Box>

                                        {/* Location */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.location}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
                                                Audited: {item.lastAuditDate}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                ) : (
                    <Grid item xs={12} sx={{ py: 8 }}>
                        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', opacity: 0.6, borderRadius: 4 }}>
                            <Warning sx={{ fontSize: 48, mb: 1, color: 'warning.main' }} />
                            <Typography variant="h6">No packaging inventory matched your criteria</Typography>
                            <Typography variant="body2">Try adjusting your filters or search terms</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
