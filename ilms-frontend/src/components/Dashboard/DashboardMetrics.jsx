import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Alert,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    IconButton,
    Stack
} from '@mui/material';
import {
    Inventory2,
    LocalShipping,
    Archive,
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Schedule,
    Refresh,
    TrendingUp,
    QrCode2,
    Timeline,
    AutoAwesome,
    LocationOn
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DashboardAPI } from '../../services/APIService';
import OperationTicker from './OperationTicker';

// Enhanced Metric Card with Glassmorphism
const ExecutiveMetric = ({ title, value, icon: Icon, color, subtitle, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${color}33`,
                boxShadow: `0 8px 32px 0 ${color}15`,
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: color,
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: `${color}20` }}>
                        <Icon sx={{ fontSize: 24, color }} />
                    </Box>
                    <Chip 
                        label="Daily" 
                        size="small" 
                        sx={{ bgcolor: `${color}10`, color, fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                </Box>
                <Typography variant="h3" fontWeight="900" sx={{ mb: 0.5, color: '#263238' }}>
                    {value?.toLocaleString() || 0}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                    {title.toUpperCase()}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

// Standard Metric Component for Location Health
const LocationMetric = ({ title, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
    >
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'background.paper',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}
        >
            <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: color }} />
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{title}</Typography>
                <Typography variant="h6" fontWeight="800">{value?.toLocaleString() || 0}</Typography>
            </Box>
        </Paper>
    </motion.div>
);

// Stage Progress Component
const StageProgress = ({ stages }) => {
    const colors = {
        PRE_INVENTORY: '#ff9800',
        ACTIVE: '#4caf50',
        PACKED: '#2196f3',
        SHIPPED: '#9c27b0',
        DELIVERED: '#00bcd4'
    };

    return (
        <Box>
            {stages.map((stage, index) => (
                <Box key={stage.stage} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{stage.stage}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {stage.count} ({stage.percentage}%)
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={stage.percentage}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: `${colors[stage.stage] || '#999'}20`,
                            '& .MuiLinearProgress-bar': {
                                bgcolor: colors[stage.stage] || '#999',
                                borderRadius: 5
                            }
                        }}
                    />
                </Box>
            ))}
        </Box>
    );
};

// Alert Item Component
const AlertItem = ({ alert }) => {
    const severityConfig = {
        ERROR: { color: 'error', icon: <ErrorIcon color="error" /> },
        WARNING: { color: 'warning', icon: <Warning color="warning" /> },
        INFO: { color: 'info', icon: <Schedule color="info" /> }
    };

    const config = severityConfig[alert.severity] || severityConfig.INFO;

    return (
        <ListItem
            sx={{
                bgcolor: `${config.color}.light`,
                borderRadius: 2,
                mb: 1.5,
                border: '1px solid',
                borderColor: `${config.color}.main`,
                opacity: 0.9,
                '&:hover': { opacity: 1, transform: 'translateX(4px)' },
                transition: 'all 0.2s'
            }}
        >
            <ListItemIcon sx={{ minWidth: 40 }}>
                {config.icon}
            </ListItemIcon>
            <ListItemText
                primary={alert.description}
                secondary={`${alert.reference} • ${new Date(alert.timestamp).toLocaleString()}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                secondaryTypographyProps={{ variant: 'caption' }}
            />
        </ListItem>
    );
};

// Event Item Component
const EventItem = ({ event }) => (
    <ListItem sx={{ px: 0 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex' }}>
                <QrCode2 sx={{ color: 'primary.main', fontSize: 16 }} />
            </Box>
        </ListItemIcon>
        <ListItemText
            primary={event.event_type}
            secondary={`${event.inventory?.serial_number || event.container?.serial_number || 'N/A'} • ${new Date(event.event_timestamp || event.created_at).toLocaleTimeString()}`}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
            secondaryTypographyProps={{ variant: 'caption' }}
        />
        <Chip
            label={event.status || 'SUCCESS'}
            size="small"
            sx={{ 
                bgcolor: event.status === 'SUCCESS' ? 'success.light' : 'grey.200',
                color: event.status === 'SUCCESS' ? 'success.dark' : 'grey.700',
                fontWeight: 700,
                fontSize: '0.65rem'
            }}
        />
    </ListItem>
);

export default function DashboardMetrics() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [stages, setStages] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [metricsData, stagesData, alertsData, eventsData] = await Promise.all([
                DashboardAPI.getMetrics(),
                DashboardAPI.getInventoryByStage(),
                DashboardAPI.getAlerts(10),
                DashboardAPI.getRecentEvents(10)
            ]);

            setMetrics(metricsData);
            setStages(stagesData || []);
            setAlerts(alertsData || []);
            setRecentEvents(eventsData || []);
        } catch (e) {
            console.error('Failed to load dashboard data', e);
            setError('Failed to load dashboard data. Some widgets may show partial information.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 600, gap: 2 }}>
                <CircularProgress size={60} thickness={5} />
                <Typography variant="h6" color="text.secondary">Initializing Command Center...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#0A1929' }}>
                        <Timeline sx={{ fontSize: 36, color: 'primary.main' }} />
                        Daily Summary
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Real-time operational health for location: <Chip label="MAIN-DIST-01" size="small" icon={<LocationOn />} sx={{ fontWeight: 700 }} />
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        startIcon={<Refresh />}
                        onClick={loadDashboardData}
                        variant="outlined"
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Sync Data
                    </Button>
                </Stack>
            </Box>

            {/* AI Ticker */}
            <OperationTicker />

            {error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
            )}

            {/* Executive Throughput Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <ExecutiveMetric
                        title="Today's Production"
                        value={metrics?.total_inventory_count}
                        icon={Archive}
                        color="#1976D2"
                        subtitle="Items aggregated in the last 24h"
                        delay={0.1}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <ExecutiveMetric
                        title="Outbound Success"
                        value={metrics?.shipped_count}
                        icon={LocalShipping}
                        color="#9C27B0"
                        subtitle="Shipments dispatched without delay"
                        delay={0.2}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <ExecutiveMetric
                        title="Quality Compliance"
                        value={metrics?.active_inventory_count}
                        icon={CheckCircle}
                        color="#4CAF50"
                        subtitle="Materials passing QC inspection"
                        delay={0.3}
                    />
                </Grid>
            </Grid>

            {/* Location Health Summaries */}
            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Location Health <Divider sx={{ flex: 1 }} />
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <LocationMetric title="Active Containers" value={metrics?.box_count + metrics?.pallet_count} color="#FF9800" delay={0.4} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <LocationMetric title="Serial Pool Reserv." value={metrics?.reserved_serials} color="#00BCD4" delay={0.5} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <LocationMetric title="Pending Release" value={metrics?.pre_inventory_count} color="#F44336" delay={0.6} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <LocationMetric title="Sealed Units" value={metrics?.sealed_containers} color="#2196F3" delay={0.7} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Inventory Pipeline */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            height: '100%', 
                            borderRadius: '24px', 
                            bgcolor: 'rgba(255, 255, 255, 0.6)', 
                            border: '1px solid #EDF2F7' 
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight="800">
                                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                                Pipeline
                            </Typography>
                            <IconButton size="small"><Timeline /></IconButton>
                        </Box>
                        {stages.length > 0 ? (
                            <StageProgress stages={stages} />
                        ) : (
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>Pipeline data updating...</Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Alerts - Preserved Layout */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            height: '100%', 
                            borderRadius: '24px', 
                            bgcolor: '#FFF', 
                            border: '1px solid #EDF2F7',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight="800" sx={{ color: 'error.main' }}>
                                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Exceptions ({alerts.length})
                            </Typography>
                            <Button variant="text" size="small" sx={{ fontWeight: 700 }}>History</Button>
                        </Box>
                        {alerts.length > 0 ? (
                            <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
                                {alerts.map((alert, index) => (
                                    <AlertItem key={index} alert={alert} />
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircle sx={{ fontSize: 64, color: 'success.light', mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6" color="success.main" fontWeight="800">System Healthy</Typography>
                                <Typography variant="caption" color="text.secondary">No active exceptions detected at this location</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Events - Preserved Layout */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            height: '100%', 
                            borderRadius: '24px', 
                            bgcolor: '#FFF', 
                            border: '1px solid #EDF2F7' 
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight="800">
                                <Schedule sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                                Activity Feed
                            </Typography>
                            <IconButton size="small"><QrCode2 /></IconButton>
                        </Box>
                        {recentEvents.length > 0 ? (
                            <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
                                {recentEvents.map((event, index) => (
                                    <React.Fragment key={index}>
                                        <EventItem event={event} />
                                        {index < recentEvents.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>Scanning for location events...</Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
