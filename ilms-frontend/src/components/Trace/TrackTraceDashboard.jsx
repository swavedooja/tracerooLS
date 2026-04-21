import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Chip,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Tabs,
    Tab,
    Breadcrumbs,
    Link,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    LinearProgress,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Badge,
    Avatar
} from '@mui/material';
import {
    Search,
    LocalShipping,
    Inventory2,
    LocationOn,
    Timeline as TimelineIcon,
    PlayArrow,
    ExpandMore,
    ExpandLess,
    ChevronRight,
    Category,
    QrCode2,
    CalendarMonth,
    Person,
    CheckCircle,
    Schedule,
    Warning,
    Error as ErrorIcon,
    TrendingUp,
    Warehouse,
    Factory,
    Store,
    NavigateNext,
    Refresh,
    FilterList,
    AccountTree
} from '@mui/icons-material';
import { loadDemoData, calculateStats, searchBySerial } from './demoData';

const AnimatedCard = motion(Card);
const AnimatedBox = motion(Box);

// Status colors
const STATUS_COLORS = {
    CREATED: { bg: '#E0E0E0', color: '#424242', label: 'Created' },
    LOADING: { bg: '#BBDEFB', color: '#1565C0', label: 'Loading' },
    SEALED: { bg: '#B3E5FC', color: '#0277BD', label: 'Sealed' },
    DISPATCHED: { bg: '#CE93D8', color: '#7B1FA2', label: 'Dispatched' },
    IN_TRANSIT: { bg: '#E1BEE7', color: '#7B1FA2', label: 'In Transit' },
    DELIVERED: { bg: '#C8E6C9', color: '#2E7D32', label: 'Delivered' },
    QC_HOLD: { bg: '#FFE0B2', color: '#E65100', label: 'QC Hold' },
    EXCEPTION: { bg: '#FFCDD2', color: '#C62828', label: 'Exception' },
    ACTIVE: { bg: '#C8E6C9', color: '#2E7D32', label: 'Active' },
    PASS: { bg: '#C8E6C9', color: '#2E7D32', label: 'Pass' }
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 1.5, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [end, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Stat card component
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <AnimatedCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        sx={{
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            border: `1px solid ${color}30`,
            height: '100%'
        }}
    >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                    <Icon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color={color}>
                        <AnimatedCounter end={value} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </AnimatedCard>
);

// Hierarchy Tree Node
const TreeNode = ({ node, type, level = 0, onSelect, selectedId, expanded, onToggle }) => {
    const hasChildren = (type === 'CONTAINER' && node.pallets?.length) ||
        (type === 'PALLET' && node.cases?.length) ||
        (type === 'CASE' && node.items?.length);
    const isExpanded = expanded[node.id];
    const isSelected = selectedId === node.id;

    const getIcon = () => {
        switch (type) {
            case 'CONTAINER': return <LocalShipping fontSize="small" />;
            case 'PALLET': return <Inventory2 fontSize="small" />;
            case 'CASE': return <Category fontSize="small" />;
            case 'ITEM': return <QrCode2 fontSize="small" />;
            default: return <Category fontSize="small" />;
        }
    };

    const childType = type === 'CONTAINER' ? 'PALLET' : type === 'PALLET' ? 'CASE' : 'ITEM';
    const children = type === 'CONTAINER' ? node.pallets : type === 'PALLET' ? node.cases : type === 'CASE' ? node.items : [];

    return (
        <>
            <ListItemButton
                onClick={() => onSelect(node, type)}
                selected={isSelected}
                sx={{
                    pl: 2 + level * 2,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' }
                }}
            >
                {hasChildren && (
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                        sx={{ mr: 0.5, color: isSelected ? 'inherit' : 'action.active' }}
                    >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                )}
                {!hasChildren && <Box sx={{ width: 28 }} />}
                <ListItemIcon sx={{ minWidth: 32, color: isSelected ? 'inherit' : 'primary.main' }}>
                    {getIcon()}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography variant="body2" fontFamily="monospace" noWrap>
                            {node.serial || node.id}
                        </Typography>
                    }
                    secondary={!isSelected && (
                        <Chip
                            label={STATUS_COLORS[node.status]?.label || node.status}
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: STATUS_COLORS[node.status]?.bg,
                                color: STATUS_COLORS[node.status]?.color
                            }}
                        />
                    )}
                />
                {(node.itemCount || node.caseCount || children?.length) > 0 && (
                    <Chip
                        label={node.itemCount || node.caseCount || children?.length}
                        size="small"
                        sx={{ height: 20, minWidth: 24 }}
                    />
                )}
            </ListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children?.map((child, idx) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            type={childType}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    );
};

// Location Tree Node
const LocationTreeNode = ({ location, level = 0, onSelect, selectedId, expanded, onToggle }) => {
    const children = location.zones || location.racks || location.bins || [];
    const hasChildren = children.length > 0;
    const isExpanded = expanded[location.id];
    const isSelected = selectedId === location.id;

    const getIcon = () => {
        if (location.type === 'MANUFACTURING') return <Factory fontSize="small" />;
        if (location.type === 'WAREHOUSE') return <Warehouse fontSize="small" />;
        if (location.type === 'CUSTOMER') return <Store fontSize="small" />;
        if (location.racks) return <LocationOn fontSize="small" />;
        if (location.bins) return <Inventory2 fontSize="small" />;
        return <Category fontSize="small" />;
    };

    return (
        <>
            <ListItemButton
                onClick={() => onSelect(location)}
                selected={isSelected}
                sx={{ pl: 2 + level * 2, borderRadius: 1, mb: 0.5 }}
            >
                {hasChildren && (
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onToggle(location.id); }}
                        sx={{ mr: 0.5 }}
                    >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                )}
                {!hasChildren && <Box sx={{ width: 28 }} />}
                <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                    {getIcon()}
                </ListItemIcon>
                <ListItemText
                    primary={<Typography variant="body2" noWrap>{location.name || location.code}</Typography>}
                    secondary={location.itemCount && `${location.itemCount} items`}
                />
            </ListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children.map((child) => (
                        <LocationTreeNode
                            key={child.id}
                            location={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    );
};

// Material BOM Tree Node
const MaterialTreeNode = ({ material, level = 0, onSelect, selectedId, expanded, onToggle }) => {
    const children = material.subAssemblies || material.components || material.rawMaterials || [];
    const hasChildren = children.length > 0;
    const isExpanded = expanded[material.id];
    const isSelected = selectedId === material.id;

    return (
        <>
            <ListItemButton
                onClick={() => onSelect(material)}
                selected={isSelected}
                sx={{ pl: 2 + level * 2, borderRadius: 1, mb: 0.5 }}
            >
                {hasChildren && (
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onToggle(material.id); }}
                        sx={{ mr: 0.5 }}
                    >
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                )}
                {!hasChildren && <Box sx={{ width: 28 }} />}
                <ListItemIcon sx={{ minWidth: 32, color: 'secondary.main' }}>
                    <AccountTree fontSize="small" />
                </ListItemIcon>
                <ListItemText
                    primary={<Typography variant="body2" noWrap>{material.name}</Typography>}
                    secondary={
                        <Typography variant="caption" color="text.secondary">
                            {material.code} {material.qtyPerParent && `× ${material.qtyPerParent}`}
                        </Typography>
                    }
                />
            </ListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children.map((child) => (
                        <MaterialTreeNode
                            key={child.id}
                            material={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    );
};

// Detail Panel Component
const DetailPanel = ({ selected, type }) => {
    if (!selected) {
        return (
            <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Select an item to view details</Typography>
            </Paper>
        );
    }

    const [detailTab, setDetailTab] = useState(0);

    const InfoRow = ({ label, value, mono = false }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontFamily={mono ? 'monospace' : 'inherit'} fontWeight={500}>
                {value || 'N/A'}
            </Typography>
        </Box>
    );

    return (
        <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #1976D2, #42A5F5)', color: 'white' }}>
                <Typography variant="overline">{type}</Typography>
                <Typography variant="h6" fontFamily="monospace">
                    {selected.serial || selected.id}
                </Typography>
                <Chip
                    label={STATUS_COLORS[selected.status]?.label || selected.status}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.9)', color: STATUS_COLORS[selected.status]?.color }}
                />
            </Box>

            {/* Tabs */}
            <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Info" sx={{ minWidth: 60 }} />
                <Tab label="Timeline" sx={{ minWidth: 60 }} />
                {(selected.pallets || selected.cases || selected.items ||
                  selected.zones || selected.racks || selected.bins ||
                  selected.subAssemblies || selected.components || selected.rawMaterials) && (
                    <Tab label="Hierarchy" sx={{ minWidth: 60 }} />
                )}
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {detailTab === 0 && (
                    <Box>
                        {/* Container/Item specific */}
                        {selected.sscc && <InfoRow label="SSCC (AI 00)" value={selected.sscc} mono />}
                        {selected.gtin && <InfoRow label="GTIN (AI 01)" value={selected.gtin} mono />}
                        {selected.batchId && <InfoRow label="Batch/Lot (AI 10)" value={selected.batchId} mono />}
                        
                        {/* Location specific */}
                        {selected.gln && <InfoRow label="GLN" value={selected.gln} mono />}
                        {selected.address && <InfoRow label="Address" value={selected.address} />}
                        {selected.zones && <InfoRow label="Zones Count" value={selected.zones.length} />}
                        {selected.racks && <InfoRow label="Racks Count" value={selected.racks.length} />}
                        {selected.bins && <InfoRow label="Bins Count" value={selected.bins.length} />}

                        {/* Material specific */}
                        {selected.category && <InfoRow label="Category" value={selected.category} />}
                        {selected.uom && <InfoRow label="Unit of Measure" value={selected.uom} />}
                        {selected.shelfLife && <InfoRow label="Shelf Life" value={`${selected.shelfLife} Days`} />}
                        {selected.qtyPerParent && <InfoRow label="Quantity per Parent" value={selected.qtyPerParent} />}

                        {/* Shared/General */}
                        {selected.type && <InfoRow label="Type" value={selected.type} />}
                        {selected.mfgDate && <InfoRow label="Mfg Date (AI 11)" value={new Date(selected.mfgDate).toLocaleDateString()} />}
                        {selected.expiryDate && <InfoRow label="Expiry (AI 17)" value={new Date(selected.expiryDate).toLocaleDateString()} />}
                        {selected.qcStatus && <InfoRow label="QC Status" value={selected.qcStatus} />}
                        {selected.origin && <InfoRow label="Origin" value={selected.origin.name} />}
                        {selected.destination && <InfoRow label="Destination" value={selected.destination.name} />}
                        {selected.carrier && <InfoRow label="Carrier" value={selected.carrier} />}
                        {selected.vehicleNumber && <InfoRow label="Vehicle" value={selected.vehicleNumber} />}
                        {selected.weight && <InfoRow label="Weight" value={selected.weight} />}
                        {selected.dimensions && <InfoRow label="Dimensions" value={selected.dimensions} />}
                        {selected.itemCount && <InfoRow label="Total Items" value={selected.itemCount} />}
                        {selected.caseCount && <InfoRow label="Case Count" value={selected.caseCount} />}
                        {selected.createdAt && <InfoRow label="Created At" value={new Date(selected.createdAt).toLocaleString()} />}
                        
                        {selected.material && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>Linked Material Info</Typography>
                                <InfoRow label="Material" value={selected.material.name} />
                                <InfoRow label="Category" value={selected.material.category} />
                            </>
                        )}
                    </Box>
                )}

                {detailTab === 1 && (
                    <Box>
                        {selected.events?.length > 0 ? (
                            selected.events.map((event, idx) => (
                                <Box key={event.id || idx} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: idx === 0 ? 'primary.main' : 'grey.300',
                                                color: idx === 0 ? 'white' : 'grey.600'
                                            }}
                                        >
                                            {idx === 0 ? <CheckCircle fontSize="small" /> : <Schedule fontSize="small" />}
                                        </Avatar>
                                        {idx < selected.events.length - 1 && (
                                            <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.300', my: 0.5 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ flex: 1, pb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{event.eventType}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </Typography>
                                        <Chip
                                            icon={<LocationOn sx={{ fontSize: 14 }} />}
                                            label={event.location}
                                            size="small"
                                            sx={{ mt: 0.5, height: 22 }}
                                        />
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            <Person sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                            {event.user}
                                        </Typography>
                                        {event.notes && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                "{event.notes}"
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Alert severity="info">No timeline events available</Alert>
                        )}
                    </Box>
                )}

                {detailTab === 2 && (
                    <Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{selected.zones ? 'Zone / Area' : selected.racks ? 'Rack' : selected.bins ? 'Bin' : 'Name / Serial'}</TableCell>
                                        <TableCell>Type / Status</TableCell>
                                        <TableCell align="right">{selected.qtyPerParent ? 'Qty' : 'Total Count'}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(selected.pallets || selected.cases || selected.items || 
                                      selected.zones || selected.racks || selected.bins ||
                                      selected.subAssemblies || selected.components || selected.rawMaterials || []).slice(0, 20).map((child, cidx) => (
                                        <TableRow key={child.id || cidx} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily={child.serial ? 'monospace' : 'inherit'}>
                                                    {child.name || child.code || child.serial || child.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={child.type || child.status}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        bgcolor: STATUS_COLORS[child.status]?.bg || 'grey.100',
                                                        color: STATUS_COLORS[child.status]?.color || 'text.primary'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {child.qtyPerParent || child.caseCount || child.itemCount || child.items?.length || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

// Main Dashboard Component
export default function TrackTraceDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [mainTab, setMainTab] = useState(0); // 0=Shipments, 1=Locations, 2=Materials
    const [selected, setSelected] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    useEffect(() => {
        // Auto-load demo data on mount
        handleLoadDemo();
    }, []);

    const handleLoadDemo = () => {
        setLoading(true);
        setTimeout(() => {
            const demoData = loadDemoData();
            setData(demoData);
            const calculatedStats = calculateStats(demoData.containers);
            setStats(calculatedStats);
            setLoading(false);
            // Auto-expand first container
            if (demoData.containers.length > 0) {
                setExpanded({ [demoData.containers[0].id]: true });
            }
        }, 500);
    };

    const handleToggle = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSelect = (node, type) => {
        setSelected(node);
        setSelectedType(type);
        // Build breadcrumbs
        const crumbs = [{ label: type, id: node.id }];
        setBreadcrumbs(crumbs);
    };

    const handleSearch = () => {
        if (!searchQuery.trim() || !data) return;
        const results = searchBySerial(data.containers, searchQuery);
        setSearchResults(results);
        if (results.length > 0) {
            setSelected(results[0].data);
            setSelectedType(results[0].type);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineIcon color="primary" /> Track & Trace Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Complete supply chain visibility with drill-down to individual items
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Manual button removed for auto-load flow */}
                </Box>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {!data && loading ? (
                 <Box sx={{ p: 10, textAlign: 'center' }}>
                     <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mb: 2 }} />
                     <Typography color="text.secondary">Initializing Supply Chain Data...</Typography>
                 </Box>
             ) : !data ? (
                 <Paper sx={{ p: 4, textAlign: 'center' }}>
                     <Typography color="text.secondary">Failed to initialize data.</Typography>
                 </Paper>
             ) : (
                <>
                    {/* Stats Row */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={Inventory2} value={stats?.totalItems || 0} label="Total Items" color="#1976D2" delay={0} />
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={LocalShipping} value={stats?.activeShipments || 0} label="Active Shipments" color="#9C27B0" delay={0.05} />
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={TrendingUp} value={stats?.inTransit || 0} label="In Transit" color="#FF9800" delay={0.1} />
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={CheckCircle} value={stats?.delivered || 0} label="Delivered" color="#4CAF50" delay={0.15} />
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={Factory} value={stats?.atManufacturing || 0} label="At Manufacturing" color="#00BCD4" delay={0.2} />
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                            <StatCard icon={Warning} value={stats?.inQCHold || 0} label="QC Hold" color="#F44336" delay={0.25} />
                        </Grid>
                    </Grid>

                    {/* Search Bar */}
                    <Paper variant="outlined" sx={{ p: 1.5, mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by Serial Number, SSCC, or GTIN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                sx: { bgcolor: 'grey.50' }
                            }}
                            size="small"
                        />
                        <Button variant="contained" onClick={handleSearch}>Search</Button>
                    </Paper>

                    {/* Main Content */}
                    <Grid container spacing={2}>
                        {/* Left Panel - Navigation */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper variant="outlined" sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
                                <Tabs
                                    value={mainTab}
                                    onChange={(e, v) => setMainTab(v)}
                                    variant="fullWidth"
                                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                                >
                                    <Tab icon={<LocalShipping />} label="Shipments" sx={{ minHeight: 48 }} />
                                    <Tab icon={<LocationOn />} label="Locations" sx={{ minHeight: 48 }} />
                                    <Tab icon={<AccountTree />} label="Materials" sx={{ minHeight: 48 }} />
                                </Tabs>

                                <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                                    {mainTab === 0 && (
                                        <List dense>
                                            {data.containers.map((container) => (
                                                <TreeNode
                                                    key={container.id}
                                                    node={container}
                                                    type="CONTAINER"
                                                    onSelect={handleSelect}
                                                    selectedId={selected?.id}
                                                    expanded={expanded}
                                                    onToggle={handleToggle}
                                                />
                                            ))}
                                        </List>
                                    )}

                                    {mainTab === 1 && (
                                        <List dense>
                                            {data.locations.plants.map((location) => (
                                                <LocationTreeNode
                                                    key={location.id}
                                                    location={location}
                                                    onSelect={(loc) => { setSelected(loc); setSelectedType('LOCATION'); }}
                                                    selectedId={selected?.id}
                                                    expanded={expanded}
                                                    onToggle={handleToggle}
                                                />
                                            ))}
                                        </List>
                                    )}

                                    {mainTab === 2 && (
                                        <List dense>
                                            {data.materials.finishedGoods.map((material) => (
                                                <MaterialTreeNode
                                                    key={material.id}
                                                    material={material}
                                                    onSelect={(mat) => { setSelected(mat); setSelectedType('MATERIAL'); }}
                                                    selectedId={selected?.id}
                                                    expanded={expanded}
                                                    onToggle={handleToggle}
                                                />
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Center Panel - Data Grid */}
                        <Grid item xs={12} md={4} lg={5}>
                            <Paper variant="outlined" sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {mainTab === 0 ? 'Packaging Hierarchy' : mainTab === 1 ? 'Location Details' : 'Bill of Materials'}
                                    </Typography>
                                    {breadcrumbs.length > 0 && (
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mt: 1 }}>
                                            {breadcrumbs.map((crumb, idx) => (
                                                <Chip key={idx} label={crumb.label} size="small" variant="outlined" />
                                            ))}
                                        </Breadcrumbs>
                                    )}
                                </Box>

                                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                                    {selected ? (
                                        <Box>
                                            {/* Quick Info Cards */}
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid item xs={4}>
                                                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {selectedType === 'LOCATION' ? 'GLN' : selectedType === 'MATERIAL' ? 'GTIN' : 'Status'}
                                                        </Typography>
                                                        {selectedType === 'LOCATION' || selectedType === 'MATERIAL' ? (
                                                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ mt: 0.5, fontSize: 11, fontFamily: 'monospace' }}>
                                                                {selected.gln || selected.gtin || 'N/A'}
                                                            </Typography>
                                                        ) : (
                                                            <Chip
                                                                label={selected.status || 'N/A'}
                                                                size="small"
                                                                sx={{
                                                                    mt: 0.5,
                                                                    bgcolor: STATUS_COLORS[selected.status]?.bg,
                                                                    color: STATUS_COLORS[selected.status]?.color
                                                                }}
                                                            />
                                                        )}
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {selected.zones ? 'Zones' : selected.racks ? 'Racks' : selected.bins ? 'Bins' : 
                                                             selected.subAssemblies ? 'Components' : 'Items'}
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                                            {selected.zones?.length || selected.racks?.length || selected.bins?.length || 
                                                             selected.subAssemblies?.length || selected.components?.length || selected.rawMaterials?.length || 
                                                             selected.itemCount || selected.caseCount || selected.items?.length || '-'}
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%' }}>
                                                        <Typography variant="caption" color="text.secondary">Events</Typography>
                                                        <Typography variant="h6" fontWeight="bold" color="secondary">
                                                            {selected.events?.length || 0}
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                            </Grid>

                                            {/* Children Table */}
                                            {(selected.pallets || selected.cases || selected.items ||
                                              selected.zones || selected.racks || selected.bins ||
                                              selected.subAssemblies || selected.components || selected.rawMaterials) && (
                                                <TableContainer>
                                                    <Table size="small" stickyHeader>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>{selected.zones ? 'Zone' : selected.racks ? 'Rack' : selected.bins ? 'Bin' : 
                                                                           selected.subAssemblies || selected.components ? 'BOM Name' : 'Serial / ID'}</TableCell>
                                                                <TableCell>Type / Category</TableCell>
                                                                <TableCell>Status / UOM</TableCell>
                                                                <TableCell align="right">Count / Qty</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {(selected.pallets || selected.cases || selected.items || 
                                                              selected.zones || selected.racks || selected.bins ||
                                                              selected.subAssemblies || selected.components || selected.rawMaterials || []).map((child, cidx) => (
                                                                <TableRow
                                                                    key={child.id || cidx}
                                                                    hover
                                                                    onClick={() => handleSelect(child, child.type || (child.cases ? 'PALLET' : child.items ? 'CASE' : 'ITEM'))}
                                                                    sx={{ cursor: 'pointer' }}
                                                                >
                                                                    <TableCell>
                                                                        <Typography variant="body2" fontFamily={child.serial ? 'monospace' : 'inherit'} fontWeight={child.serial ? 800 : 500}>
                                                                            {child.name || child.code || child.serial || child.id}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={child.type || child.category || (child.cases ? 'PALLET' : child.items ? 'CASE' : 'ITEM')}
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={child.status || child.uom || 'OK'}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: STATUS_COLORS[child.status]?.bg || 'grey.100',
                                                                                color: STATUS_COLORS[child.status]?.color || 'text.primary'
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Typography variant="body2" fontWeight="bold">
                                                                            {child.qtyPerParent || child.caseCount || child.itemCount || child.items?.length || '-'}
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Typography color="text.secondary">Select an item from the tree to view details</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Right Panel - Details */}
                        <Grid item xs={12} md={4} lg={4}>
                            <Box sx={{ height: 600 }}>
                                <DetailPanel selected={selected} type={selectedType} />
                            </Box>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}
