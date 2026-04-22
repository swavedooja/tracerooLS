import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Avatar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Collapse
} from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ExpandLess, ExpandMore } from '@mui/icons-material'; // Added imports
import MaterialList from './components/MaterialList';
import MaterialForm from './components/MaterialForm';
import MaterialCreate from './components/MaterialCreate';
import PackagingHierarchyEditor from './components/PackagingHierarchyEditor';
import LocationList from './components/Location/LocationList';
import MasterDefinitions from './components/MasterDefinitions'; // Added import
import LabelDashboard from './components/LabelManagement/LabelDashboard'; // Restored Import
import TradeItemLabelManagement from './components/LabelManagement/TradeItemLabelManagement'; // Added import
import ShippingLabelManagement from './components/LabelManagement/ShippingLabelManagement'; // Added import
import MaterialInventory from './components/LabelManagement/MaterialInventory'; // Add import
import PackingDashboard from './components/Packing/PackingDashboard';
import AggregationStation from './components/Packing/AggregationStation';
import PrintStation from './components/LabelManagement/Print/PrintStation';
import TradeItemPrint from './components/LabelManagement/Print/TradeItemPrint';
import LabelPreview from './components/LabelPreview';
import MobileApp from './components/Mobile/MobileApp';


import Registration from './components/Inventory/Registration';
import SerialGeneration from './components/Inventory/SerialGeneration';
import InventoryScanConfirm from './components/Inventory/InventoryScanConfirm';
import PackingStation from './components/Inventory/PackingStation';
import TrackTraceDashboard from './components/Trace/TrackTraceDashboard';
import ChainTrackDashboard from './components/Trace/ChainTrackDashboard';
import Dashboard from './components/Dashboard.jsx';
import DashboardMetrics from './components/Dashboard/DashboardMetrics.jsx';
import OrderLifecycleDashboard from './components/Dashboard/OrderLifecycleDashboard.jsx';
import ShipmentCreate from './components/Shipping/ShipmentCreate';
import Login from './components/Login';
import Footer from './components/Footer';
import TracerooChatbot from './components/Chat/TracerooChatbot';
import {
  Menu as MenuIcon,
  AddCircleOutline,
  Inventory2,
  Dashboard as DashboardIcon,
  Notifications,
  Settings,
  Logout,
  LocalShipping,
  Store,
  Style,
  QrCodeScanner,
  Timeline,
  ListAlt,
  Storage,
  Archive,
  Print,
  PlayCircleOutline, ShoppingCart, Business, 
  CalendarMonth, Edit, Calculate,
  History as HistoryIcon
} from '@mui/icons-material';

const AnimatedBox = motion(Box);

function NavBar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: DashboardIcon,
      stateKey: 'dashboardOpen',
      children: [
        { label: 'Operations', icon: Timeline, path: '/' },
        { label: 'Order Lifecycle', icon: HistoryIcon, path: '/dashboard/order-lifecycle' },
        { label: 'Track & Trace', icon: Timeline, path: '/trace' },
        // { label: 'Home', icon: DashboardIcon, path: '/dashboard/home' },
        // { label: 'ChainTrack', icon: Timeline, path: '/chaintrack' },
      ]
    },
    {
      label: 'Master Data',
      icon: Storage,
      stateKey: 'masterDataOpen',
      children: [
        { label: 'Materials', icon: Inventory2, path: '/materials' },
        { label: 'Locations', icon: Store, path: '/locations' },
        { label: 'Definitions', icon: ListAlt, path: '/master-definitions' },
      ]
    },
    {
      label: 'Inventory',
      icon: Inventory2,
      stateKey: 'inventoryOpen',
      children: [
        { label: 'Generate Shipping Labels', icon: Print, path: '/labels/generate' },
        { label: 'Material Inventory', icon: Storage, path: '/label-management/material-inventory' },
      ]
    },
    {
      label: 'Label Management',
      icon: Style,
      stateKey: 'labelsOpen',
      children: [
        { label: 'Trade Item', icon: Style, path: '/labels/trade' },
        { label: 'Shipping', icon: LocalShipping, path: '/labels/shipping' },
      ]
    },
    // {
    //   label: 'Packing',
    //   icon: Archive,
    //   stateKey: 'packingOpen',
    //   children: [
    //     { label: 'Aggregation Station', icon: QrCodeScanner, path: '/packing/aggregation' },
    //     { label: 'Packing Dashboard', icon: Inventory2, path: '/packing' },
    //   ]
    // },
    // { label: 'Shipping', icon: LocalShipping, path: '/shipping' },
  ];

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderMenuItem = (item, index) => {
    if (item.children) {
      const isOpen = expandedMenus[item.label] || false;
      return (
        <React.Fragment key={item.label}>
          <ListItemButton onClick={() => toggleMenu(item.label)} sx={{ borderRadius: 2, mb: 1, color: 'white' }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><item.icon /></ListItemIcon>
            <ListItemText primary={item.label} />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, cIndex) => (
                <ListItemButton
                  key={child.path}
                  onClick={() => { navigate(child.path); setDrawerOpen(false); }}
                  selected={location.pathname === child.path}
                  sx={{ pl: 4, borderRadius: 2, mb: 1, color: 'white', '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><child.icon /></ListItemIcon>
                  <ListItemText primary={child.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    return (
      <ListItemButton
        key={item.path}
        onClick={() => { navigate(item.path); setDrawerOpen(false); }}
        selected={location.pathname === item.path}
        sx={{
          borderRadius: 2, mb: 1, color: 'white',
          '&.Mui-selected': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
        }}
      >
        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><item.icon /></ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(25, 118, 210, 0.95))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #FFFFFF, #90CAF9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 12px rgba(255, 255, 255, 0.3)' }}>
              <LocalShipping sx={{ fontSize: 24, color: 'primary.dark' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              SLS Material Management
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error"><Notifications /></Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>IL</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
      >
        <MenuItem onClick={handleProfileClose}><ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleProfileClose(); onLogout(); }}><ListItemIcon><Logout fontSize="small" /></ListItemIcon>Logout</MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, background: 'linear-gradient(180deg, #0A1929, #1976D2)', color: 'white' } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            {/* Logo placeholder */}
            <Typography variant="h6" fontWeight="bold">SLS Material Management</Typography>
          </Box>
          <List>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </List>
        </Box>
      </Drawer>
      {/* Side Rail omitted for brevity if drawer is enough, or implement simplified version */}
    </>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const isMobileWireframe = location.pathname === '/mobile-wireframe';

  if (!isAuthenticated && !isMobileWireframe) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isMobileWireframe ? '#f5f5f5' : 'inherit' }}>
      <GlobalStyles styles={{ 
        body: { scrollBehavior: 'smooth' },
        '@media print': {
          '.no-print': { display: 'none !important' },
          '.only-print': { display: 'block !important' },
          'header, footer, nav, .MuiDrawer-root': { display: 'none !important' },
          'body': { margin: 0, padding: 0 }
        }
      }} />
      {!isMobileWireframe && <NavBar className="no-print" onLogout={() => setIsAuthenticated(false)} />}
      <Container
        maxWidth={isMobileWireframe ? false : "xl"}
        sx={{
          mt: isMobileWireframe ? 0 : { xs: 2, sm: 3 },
          mb: isMobileWireframe ? 0 : { xs: 3, sm: 6 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: isMobileWireframe ? 0 : { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Routes>
          <Route path="/" element={<DashboardMetrics />} />
          <Route path="/dashboard/home" element={<Dashboard />} />
          <Route path="/dashboard/order-lifecycle" element={<OrderLifecycleDashboard />} />
          <Route path="/materials/new" element={<MaterialCreate />} />
          <Route path="/materials/:code" element={<MaterialForm />} />
          <Route path="/materials" element={<MaterialList />} />
          <Route path="/packaging" element={<LabelDashboard />} />
          <Route path="/locations" element={<LocationList />} />
          <Route path="/master-definitions" element={<MasterDefinitions />} />
          <Route path="/labels" element={<LabelDashboard />} />
          <Route path="/labels/trade" element={<TradeItemLabelManagement />} />
          <Route path="/labels/shipping" element={<ShippingLabelManagement />} />
          <Route path="/label-management/material-inventory" element={<MaterialInventory />} />
          <Route path="/label-management/material-inventory/:hierarchyId" element={<MaterialInventory />} />
          <Route path="/label-templates" element={<LabelDashboard />} />
          <Route path="/label-templates/*" element={<LabelDashboard />} />
          <Route path="/labels/generate" element={<PrintStation />} />
          <Route path="/labels/trade-print" element={<TradeItemPrint />} />
          <Route path="/print/:hierarchyId" element={<PrintStation />} />
          <Route path="/inventory/register" element={<Registration />} />
          <Route path="/inventory/serials" element={<SerialGeneration />} />
          <Route path="/inventory/scan" element={<InventoryScanConfirm />} />
          <Route path="/inventory/packing" element={<PackingStation />} />
          <Route path="/packing" element={<PackingDashboard />} />
          <Route path="/packing/aggregation" element={<AggregationStation />} />
          <Route path="/shipping" element={<ShipmentCreate />} />
          <Route path="/trace" element={<TrackTraceDashboard />} />
          <Route path="/chaintrack" element={<ChainTrackDashboard />} />
          <Route path="/mobile-wireframe" element={<MobileApp />} />
        </Routes>
      </Container>
      {!isMobileWireframe && <Footer className="no-print" />}
      {!isMobileWireframe && <TracerooChatbot />}
    </Box>
  );
}
