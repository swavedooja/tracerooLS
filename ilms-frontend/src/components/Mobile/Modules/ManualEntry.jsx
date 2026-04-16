import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, TextField, Paper, Alert } from '@mui/material';
import { ArrowBack, AppRegistration, DoneAll, QrCode } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ManualEntry = ({ onBack }) => {
    const [formData, setFormData] = useState({
        uid: '',
        productName: '',
        batchId: '',
        mfgDate: new Date().toISOString().split('T')[0]
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate registration
        setIsSubmitted(true);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>
                <Typography sx={{ fontWeight: 700 }}>Manual Registration</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff9c4', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <QrCode color="warning" />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    Use this for items with pre-existing UIDs (Standard GS1 or Legacy codes)
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Existing UID / Serial"
                                        fullWidth
                                        variant="outlined"
                                        required
                                        value={formData.uid}
                                        onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                                        placeholder="e.g. GS1-0395600-..."
                                    />
                                    <TextField
                                        label="Product Name"
                                        fullWidth
                                        variant="outlined"
                                        required
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    />
                                    <TextField
                                        label="Batch / Lot ID"
                                        fullWidth
                                        variant="outlined"
                                        required
                                        value={formData.batchId}
                                        onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                    />
                                    <TextField
                                        label="Mfg Date"
                                        type="date"
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.mfgDate}
                                        onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        startIcon={<AppRegistration />}
                                        sx={{ borderRadius: 2, py: 1.5, mt: 2 }}
                                    >
                                        Register Item
                                    </Button>
                                </Stack>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <DoneAll sx={{ fontSize: 80, color: '#2E7D32', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Registration Successful</Typography>
                                <Paper sx={{ p: 2, textAlign: 'left', mb: 4, bgcolor: '#f8f9fa' }}>
                                    <GridRow label="External UID" value={formData.uid} />
                                    <GridRow label="Product" value={formData.productName} />
                                    <GridRow label="SLS ID" value="TRA-992-K2L" />
                                </Paper>
                                <Button variant="contained" fullWidth onClick={() => setIsSubmitted(false)} sx={{ borderRadius: 2, mb: 2 }}>
                                    Register Another
                                </Button>
                                <Button variant="text" fullWidth onClick={onBack}>
                                    Back to Menu
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

const GridRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
);

export default ManualEntry;
