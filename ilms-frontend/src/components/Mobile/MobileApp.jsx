import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Stack, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCodeScanner,
    Inventory,
    FactCheck,
    AddPhotoAlternate,
    ArrowBack,
    BatteryFull,
    Wifi,
    SignalCellular4Bar,
    Home,
    Search,
    History,
    Person,
    Archive
} from '@mui/icons-material';
import ScanItem from './Modules/ScanItem';
import PackingSession from './Modules/PackingSession';
import ManualEntry from './Modules/ManualEntry';
import PhotographicEvidence from './Modules/PhotographicEvidence';
import QualityCheck from './Modules/QualityCheck';

const AnimatedBox = motion(Box);

const MobileApp = () => {
    const [currentModule, setCurrentModule] = useState('home');
    const [history, setHistory] = useState(['home']);
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const navigateTo = (module) => {
        setHistory(prev => [...prev, module]);
        setCurrentModule(module);
    };

    const goBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            setHistory(newHistory);
            setCurrentModule(newHistory[newHistory.length - 1]);
        }
    };

    const renderModule = () => {
        switch (currentModule) {
            case 'scan': return <ScanItem onBack={goBack} />;
            case 'packing': return <PackingSession onBack={goBack} />;
            case 'manual': return <ManualEntry onBack={goBack} />;
            case 'photo': return <PhotographicEvidence onBack={goBack} />;
            case 'qc': return <QualityCheck onBack={goBack} />;
            default: return <HomeModule onNavigate={navigateTo} />;
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.05)',
                py: 4
            }}
        >
            {/* Phone Frame */}
            <Paper
                elevation={24}
                sx={{
                    width: '380px',
                    height: '780px',
                    borderRadius: '40px',
                    border: '12px solid #1a1a1a',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3)',
                }}
            >
                {/* Status Bar */}
                <Box sx={{
                    height: '44px',
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8f9fa',
                    zIndex: 10
                }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{time}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <SignalCellular4Bar sx={{ fontSize: 16 }} />
                        <Wifi sx={{ fontSize: 16 }} />
                        <BatteryFull sx={{ fontSize: 16 }} />
                    </Stack>
                </Box>

                {/* Main Content Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        <AnimatedBox
                            key={currentModule}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            sx={{ height: '100%' }}
                        >
                            {renderModule()}
                        </AnimatedBox>
                    </AnimatePresence>
                </Box>

                {/* Bottom Navigation Bar */}
                <Box sx={{
                    height: '64px',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    background: 'white',
                    px: 1
                }}>
                    <IconButton onClick={() => setCurrentModule('home')} color={currentModule === 'home' ? 'primary' : 'default'}>
                        <Home />
                    </IconButton>
                    <IconButton>
                        <Search />
                    </IconButton>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: -4,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                        color: 'white'
                    }} onClick={() => navigateTo('scan')}>
                        <QrCodeScanner />
                    </Box>
                    <IconButton>
                        <History />
                    </IconButton>
                    <IconButton>
                        <Person />
                    </IconButton>
                </Box>

                {/* Android Navigation Pill */}
                <Box sx={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ width: 120, height: 5, borderRadius: 2.5, background: '#e0e0e0' }} />
                </Box>
            </Paper>
        </Box>
    );
};

const HomeModule = ({ onNavigate }) => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1a1a1a' }}>SLS Material Management</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Standard Android ILMS Terminal</Typography>

        <Stack spacing={2}>
            <MenuButton
                title="Scan Item"
                subtitle="Identify and view lifecycle"
                icon={<QrCodeScanner />}
                color="#1976D2"
                onClick={() => onNavigate('scan')}
            />
            <MenuButton
                title="Packing Session"
                subtitle="Execute packing & events"
                icon={<Archive />}
                color="#2E7D32"
                onClick={() => onNavigate('packing')}
            />
            <MenuButton
                title="Manual Entry"
                subtitle="Register non-SLS UIDs"
                icon={<Inventory />}
                color="#ED6C02"
                onClick={() => onNavigate('manual')}
            />
            <MenuButton
                title="Quality Check"
                subtitle="Verify purity & standards"
                icon={<FactCheck />}
                color="#9C27B0"
                onClick={() => onNavigate('qc')}
            />
            <MenuButton
                title="Evidence Capture"
                subtitle="Add photographic evidence"
                icon={<AddPhotoAlternate />}
                color="#00BCD4"
                onClick={() => onNavigate('photo')}
            />
        </Stack>
    </Box>
);

const MenuButton = ({ title, subtitle, icon, color, onClick }) => (
    <Button
        fullWidth
        onClick={onClick}
        sx={{
            justifyContent: 'flex-start',
            p: 2,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textTransform: 'none',
            '&:hover': {
                background: '#f0f4f8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
        }}
    >
        <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
        }}>
            {icon}
        </Box>
        <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
    </Button>
);

export default MobileApp;
