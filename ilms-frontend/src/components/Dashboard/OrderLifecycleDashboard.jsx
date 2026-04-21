import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Paper, Typography, Grid, Card, CardContent,
    List, ListItemButton, ListItemIcon, ListItemText,
    Chip, Divider, Stepper, Step, StepLabel,
    Breadcrumbs, Link, IconButton, Tooltip, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    History as HistoryIcon,
    NavigateNext,
    LocalShipping,
    Inventory2,
    CheckCircle,
    Schedule,
    Person,
    LocationOn,
    Category,
    QrCode2,
    Assignment,
    Straighten,
    Thermostat,
    GppGood
} from '@mui/icons-material';
import { ORDER_LIFECYCLE_DATA } from './orderDemoData';

const AnimatedBox = motion(Box);
const AnimatedCard = motion(Card);

const STATUS_COLORS = {
    'SHIPPED': { bg: '#E3F2FD', color: '#1976D2', icon: LocalShipping },
    'DELIVERED': { bg: '#E8F5E9', color: '#2E7D32', icon: CheckCircle },
    'IN_TRANSIT': { bg: '#FFF3E0', color: '#E65100', icon: LocalShipping },
    'PROCESSING': { bg: '#F3E5F5', color: '#7B1FA2', icon: Schedule },
    'PACKED': { bg: '#E0F2F1', color: '#00695C', icon: Inventory2 }
};

const EVENT_ICONS = {
    'ORDER_CREATED': Assignment,
    'ORDER_CONFIRMED': GppGood,
    'FULFILLMENT_STARTED': Inventory2,
    'PACKED_&_AGGREGATED': Category,
    'SHIPPED': LocalShipping,
    'DELIVERED': CheckCircle,
    'QC_PASS': GppGood,
    'QC_STERILITY_PASS': GppGood,
    'MANUFACTURED': Category,
    'COLD_CHAIN_ENTRY': Thermostat,
    'TEMP_VERIFIED': Thermostat,
    'BIOREACTOR_RELEASE': Category,
    'PURIFICATION_DONE': Straighten,
    'VIAL_FILL_FINISH': QrCode2
};

export default function OrderLifecycleDashboard() {
    const [selectedOrder, setSelectedOrder] = useState(ORDER_LIFECYCLE_DATA[0]);
    const [selectedNode, setSelectedNode] = useState(ORDER_LIFECYCLE_DATA[0]);

    // Simple path tracking for the drill-down
    const [drillPath, setDrillPath] = useState([{ label: 'Order', data: ORDER_LIFECYCLE_DATA[0] }]);

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setSelectedNode(order);
        setDrillPath([{ label: 'Order', data: order }]);
    };

    const handleDrillDown = (child, label) => {
        const newNode = { label, data: child };
        setDrillPath(prev => [...prev, newNode]);
        setSelectedNode(child);
    };

    const handleBreadcrumbClick = (index) => {
        const newPath = drillPath.slice(0, index + 1);
        setDrillPath(newPath);
        setSelectedNode(newPath[newPath.length - 1].data);
    };

    const events = useMemo(() => {
        return selectedNode.events || [];
    }, [selectedNode]);

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HistoryIcon fontSize="large" /> Order Lifecycle Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Detailed pharma order tracking and hierarchical item traceability
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Left Panel: Orders List */}
                <Grid item xs={12} md={3}>
                    <Paper variant="outlined" sx={{ height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Active Sales Orders</Typography>
                        </Box>
                        <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                            {ORDER_LIFECYCLE_DATA.map((order) => (
                                <ListItemButton 
                                    key={order.id} 
                                    selected={selectedOrder.id === order.id}
                                    onClick={() => handleOrderSelect(order)}
                                    sx={{ borderRadius: 2, mb: 1, border: '1px solid transition', '&.Mui-selected': { borderColor: 'primary.light' } }}
                                >
                                    <ListItemText 
                                        primary={<Typography variant="body2" fontWeight="bold">{order.order_number}</Typography>}
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" display="block" noWrap>{order.customer_name}</Typography>
                                                <Chip 
                                                    label={order.status} 
                                                    size="small" 
                                                    sx={{ 
                                                        height: 20, 
                                                        fontSize: '0.65rem', 
                                                        mt: 0.5,
                                                        bgcolor: STATUS_COLORS[order.status]?.bg,
                                                        color: STATUS_COLORS[order.status]?.color
                                                    }} 
                                                />
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Center Panel: Focused Drill-Down */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Order Header Card */}
                        <AnimatedCard 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={selectedOrder.id}
                            variant="outlined" 
                            sx={{ borderRadius: 2, background: 'linear-gradient(to right, #ffffff, #f8faff)' }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>ORDER DETAILS</Typography>
                                        <Typography variant="h5" fontWeight="bold">{selectedOrder.order_number}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Chip 
                                            label={selectedOrder.priority} 
                                            color={selectedOrder.priority === 'CRITICAL' || selectedOrder.priority === 'EMERGENCY' ? 'error' : 'warning'}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {new Date(selectedOrder.order_date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Stepper activeStep={selectedOrder.status === 'DELIVERED' ? 4 : 2} alternativeLabel size="small">
                                    {['Ordered', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </CardContent>
                        </AnimatedCard>

                        {/* Hierarchical Drill-Down Box */}
                        <Paper variant="outlined" sx={{ borderRadius: 2, minHeight: '40vh', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                    {drillPath.map((crumb, idx) => (
                                        <Link 
                                            key={idx} 
                                            component="button" 
                                            underline="hover" 
                                            color={idx === drillPath.length - 1 ? 'text.primary' : 'inherit'}
                                            onClick={() => handleBreadcrumbClick(idx)}
                                            sx={{ fontSize: '0.875rem', fontWeight: idx === drillPath.length - 1 ? 700 : 400 }}
                                        >
                                            {crumb.label}
                                        </Link>
                                    ))}
                                </Breadcrumbs>
                            </Box>

                            <Box sx={{ flex: 1, p: 2 }}>
                                <AnimatePresence mode="wait">
                                    <AnimatedBox 
                                        key={selectedNode.id || selectedNode.serial}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            RESOURCES AT THIS LEVEL
                                        </Typography>
                                        
                                        {selectedNode.fulfillment || selectedNode.children ? (
                                            <Grid container spacing={2}>
                                                {(selectedNode.fulfillment ? [selectedNode.fulfillment] : selectedNode.children).map((child) => (
                                                    <Grid item xs={12} sm={6} key={child.serial || child.id}>
                                                        <Card 
                                                            variant="outlined" 
                                                            onClick={() => handleDrillDown(child, child.type)}
                                                            sx={{ 
                                                                cursor: 'pointer', 
                                                                p: 2, 
                                                                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                                                    {child.type === 'UNIT' ? <QrCode2 /> : child.type === 'CASE' ? <Category /> : <Inventory2 />}
                                                                </Avatar>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                                                        {child.serial || child.id}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {child.type} • {child.status}
                                                                    </Typography>
                                                                </Box>
                                                                {(child.children?.length > 0 || child.fulfillment) && <NavigateNext fontSize="small" color="action" />}
                                                            </Box>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'success.light', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                                    <QrCode2 fontSize="large" />
                                                </Avatar>
                                                <Typography variant="h6">End of Hierarchy</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    You are viewing an individual serialized unit.
                                                </Typography>
                                                
                                                <Divider sx={{ my: 3 }} />
                                                <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                                                        <Typography variant="body2" fontWeight="bold">{selectedNode.serial}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                                        <Typography variant="body2" fontWeight="bold">{selectedNode.status}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </AnimatedBox>
                                </AnimatePresence>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>

                {/* Right Panel: Life Events Timeline */}
                <Grid item xs={12} md={3}>
                    <Paper variant="outlined" sx={{ height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimelineIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">Life Events</Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                            {events.length > 0 ? (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 2 }}>
                                        TRACEABILITY LOG FOR: {selectedNode.serial || selectedOrder.order_number}
                                    </Typography>
                                    {events.map((event, idx) => {
                                        const IconComp = EVENT_ICONS[event.type] || HistoryIcon;
                                        return (
                                            <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: idx === 0 ? 'primary.main' : 'grey.200', color: idx === 0 ? 'white' : 'grey.600' }}>
                                                        <IconComp sx={{ fontSize: 18 }} />
                                                    </Avatar>
                                                    {idx < events.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', my: 1 }} />}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                                        {event.type.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {new Date(event.time).toLocaleString()}
                                                    </Typography>
                                                    <Chip 
                                                        icon={<LocationOn sx={{ fontSize: 12 }} />}
                                                        label={event.location}
                                                        size="small"
                                                        sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                                                    />
                                                    {event.notes && (
                                                        <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic', bgcolor: 'grey.50', p: 0.5, borderRadius: 1 }}>
                                                            "{event.notes}"
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'text.secondary', p: 3 }}>
                                    <Assignment sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
                                    <Typography variant="body2">No life events recorded at this level.</Typography>
                                    <Typography variant="caption">Try drilling down to a lower level or selecting a different order.</Typography>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'primary.dark', color: 'white' }}>
                            <Typography variant="caption" display="block" align="center">Certified GS1 Traceability Record</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

// Re-using the TimelineIcon naming from parent scope
function TimelineIcon(props) {
    return <HistoryIcon {...props} />;
}
