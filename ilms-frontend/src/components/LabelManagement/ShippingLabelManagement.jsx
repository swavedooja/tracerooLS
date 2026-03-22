import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Delete, Edit, Link as LinkIcon, Print } from '@mui/icons-material';
import { PackagingAPI } from '../../services/APIService';
import LabelDesigner from '../LabelDesigner/LabelDesigner';
import { useNavigate } from 'react-router-dom';

const FMCG_PACKAGING_DATA = [
    { name: 'Shampoo Bottle (200ml)', type: 'Bottle', dimensions: '50mm x 50mm x 150mm', weight: '0.25kg' },
    { name: 'Shampoo Bottle (500ml)', type: 'Bottle', dimensions: '70mm x 70mm x 220mm', weight: '0.6kg' },
    { name: 'Fairness Cream Tube (50g)', type: 'Tube', dimensions: '30mm x 30mm x 120mm', weight: '0.06kg' },
    { name: 'Fairness Cream Jar (100g)', type: 'Jar', dimensions: '60mm x 60mm x 50mm', weight: '0.15kg' },
    { name: '12-Unit Display Box', type: 'Box', dimensions: '200mm x 150mm x 150mm', weight: '3.0kg' },
    { name: '48-Unit Master Carton', type: 'Carton', dimensions: '400mm x 300mm x 300mm', weight: '12.0kg' },
    { name: 'Standard Pallet', type: 'Pallet', dimensions: '1200mm x 1000mm x 1500mm', weight: '500kg' },
    { name: 'Euro Pallet', type: 'Pallet', dimensions: '1200mm x 800mm x 1500mm', weight: '400kg' },
    { name: '20ft Container', type: 'Container', dimensions: '5.9m x 2.35m x 2.39m', weight: 'Max 28,000kg' },
    { name: '40ft Container', type: 'Container', dimensions: '12.0m x 2.35m x 2.39m', weight: 'Max 29,000kg' }
];

export default function ShippingLabelManagement() {
    const navigate = useNavigate();
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newHierarchyName, setNewHierarchyName] = useState('');
    const [ssccPrefix, setSsccPrefix] = useState('');

    // Level editing
    const [openLevelDialog, setOpenLevelDialog] = useState(false);
    const [levelForm, setLevelForm] = useState({ name: '', order: 1, capacity: 10 });

    // Designer Popup
    const [designerOpen, setDesignerOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);

    useEffect(() => {
        loadHierarchies();
    }, []);

    useEffect(() => {
        if (selectedHierarchy) {
            loadLevels(selectedHierarchy.id);
        } else {
            setLevels([]);
        }
    }, [selectedHierarchy]);

    const loadHierarchies = async () => {
        try {
            const data = await PackagingAPI.getHierarchies();
            setHierarchies(data);
            if (data.length > 0 && !selectedHierarchy) setSelectedHierarchy(data[0]);
        } catch (e) { console.error(e); }
    };

    const loadLevels = async (hid) => {
        try {
            const data = await PackagingAPI.getLevels(hid);
            setLevels(data);
        } catch (e) { console.error(e); }
    };

    const createHierarchy = async () => {
        if (!newHierarchyName.trim()) return;
        try {
            // Append SSCC config to name for now as mock storage
            const nameToSave = ssccPrefix ? `${newHierarchyName} (SSCC: ${ssccPrefix})` : newHierarchyName;
            const data = await PackagingAPI.createHierarchy({ name: nameToSave });
            setHierarchies([...hierarchies, data]);
            setSelectedHierarchy(data);
            setOpenDialog(false);
            setNewHierarchyName('');
            setSsccPrefix('');
        } catch (e) { console.error(e); }
    };

    const saveLevel = async () => {
        if (!selectedHierarchy) return;
        try {
            await PackagingAPI.createLevel({
                hierarchy_id: selectedHierarchy.id,
                level_name: levelForm.name,
                level_order: parseInt(levelForm.order),
                capacity: parseInt(levelForm.capacity) || 10
            });
            loadLevels(selectedHierarchy.id);
            setOpenLevelDialog(false);
        } catch (e) { console.error(e); }
    };

    const deleteLevel = async (id) => {
        if (window.confirm('Delete this level?')) {
            await PackagingAPI.deleteLevel(id);
            loadLevels(selectedHierarchy.id);
        }
    };

    const handleLinkClick = (level) => {
        setEditingLevel(level);
        setDesignerOpen(true);
    };

    const handleDesignerSave = async (savedTemplate) => {
        if (editingLevel) {
            try {
                await PackagingAPI.updateLevel(editingLevel.id, { label_template_id: savedTemplate.id });
                loadLevels(selectedHierarchy.id);
                setDesignerOpen(false);
                setEditingLevel(null);
            } catch (e) {
                console.error("Failed to link template", e);
                alert("Template saved but failed to link to level.");
            }
        }
    };

    return (
        <Grid container spacing={2} sx={{ height: { xs: 'auto', md: '100%' } }}>
            {/* Sidebar: Hierarchies */}
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Shipping Hierarchies</Typography>
                        <IconButton size="small" onClick={() => setOpenDialog(true)}><Add /></IconButton>
                    </Box>
                    <List sx={{ flex: 1, overflowY: 'auto' }}>
                        {hierarchies.map(h => (
                            <ListItem
                                key={h.id}
                                button
                                selected={selectedHierarchy?.id === h.id}
                                onClick={() => setSelectedHierarchy(h)}
                            >
                                <ListItemText primary={h.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Main: Levels */}
            <Grid item xs={12} md={9}>
                <Paper variant="outlined" sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column' }}>
                    {selectedHierarchy ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6">Levels for {selectedHierarchy.name}</Typography>
                                <Button variant="contained" startIcon={<Add />} onClick={() => {
                                    setLevelForm({ name: '', order: levels.length + 1, capacity: 10 });
                                    setOpenLevelDialog(true);
                                }}>Add Level</Button>
                            </Box>

                            <List sx={{ flex: 1, overflowY: 'auto' }}>
                                {levels.length === 0 && <Typography color="text.secondary">No levels defined. Add levels like "Pallet", "Container".</Typography>}
                                {levels.map(l => (
                                    <ListItem key={l.id} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2, fontWeight: 'bold' }}>
                                                {l.level_order}
                                            </Box>
                                            <ListItemText
                                                primary={l.level_name}
                                                secondary={l.label_template ? `Template: ${l.label_template.name}` : 'No Label Template Linked'}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Link Template / Design Label">
                                                    <IconButton onClick={() => handleLinkClick(l)} color="primary">
                                                        <LinkIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton edge="end" onClick={() => deleteLevel(l.id)}><Delete /></IconButton>
                                            </ListItemSecondaryAction>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                            {/* Graphical Representation Here */}
                            {levels.length > 0 && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Packaging Hierarchy Visualization</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', pb: 1, pt: 1 }}>
                                        {[...levels].sort((a, b) => a.level_order - b.level_order).reduce((innerContent, level, idx, arr) => {
                                            const depthIndex = arr.length - 1 - idx;
                                            const bgColors = ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5'];
                                            return (
                                                <Paper elevation={3} sx={{ 
                                                    p: 2, 
                                                    m: 1, 
                                                    bgcolor: bgColors[depthIndex % bgColors.length], 
                                                    border: '2px dashed #1565c0', 
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    width: innerContent ? 'calc(100% - 16px)' : 'auto',
                                                    minWidth: 180,
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { transform: 'scale(1.02)' }
                                                }}>
                                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="caption" fontWeight="bold" color="primary.dark">Level {level.level_order}</Typography>
                                                        {level.capacity > 1 && (
                                                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.7)', px: 1, py: 0.5, borderRadius: 1 }}>
                                                                <Typography variant="caption" fontWeight="bold" color="primary.dark">Cap: {level.capacity}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Typography variant="body1" fontWeight="bold" color="primary.dark" sx={{ mb: innerContent ? 3 : 1, textAlign: 'center' }}>
                                                        {level.level_name.split(' (')[0]}
                                                    </Typography>
                                                    {innerContent}
                                                </Paper>
                                            )
                                        }, null)}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<Print />}
                                    onClick={() => navigate(`/print/${selectedHierarchy.id}`)}
                                >
                                    Print Labels
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography color="text.secondary">Select a Hierarchy to configure</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* New Hierarchy Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>New Shipping Hierarchy</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={newHierarchyName} onChange={(e) => setNewHierarchyName(e.target.value)} sx={{ mb: 2 }} />
                    <TextField
                        margin="dense"
                        label="SSCC Company Prefix"
                        fullWidth
                        value={ssccPrefix}
                        onChange={(e) => setSsccPrefix(e.target.value)}
                        helperText="Used to generate Shipping Container Codes"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={createHierarchy} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* New Level Dialog */}
            <Dialog open={openLevelDialog} onClose={() => setOpenLevelDialog(false)}>
                <DialogTitle>Add Level</DialogTitle>
                <DialogContent>
                    <>
                        <TextField
                            select
                            autoFocus
                            margin="dense"
                            label="Packaging Level"
                            fullWidth
                            value={levelForm.name}
                            onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                            sx={{ mb: 2 }}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value=""></option>
                            {FMCG_PACKAGING_DATA.map((pkg) => (
                                <option key={pkg.name} value={pkg.name}>
                                    {pkg.name}
                                </option>
                            ))}
                        </TextField>

                        {(() => {
                            const selectedPkg = FMCG_PACKAGING_DATA.find(p => p.name === levelForm.name);
                            if (!selectedPkg) return null;
                            return (
                                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="body2" color="text.secondary"><strong>Type:</strong> {selectedPkg.type}</Typography>
                                    <Typography variant="body2" color="text.secondary"><strong>Dimensions:</strong> {selectedPkg.dimensions}</Typography>
                                    <Typography variant="body2" color="text.secondary"><strong>Weight:</strong> {selectedPkg.weight}</Typography>
                                </Box>
                            );
                        })()}
                    </>
                    <TextField type="number" label="Order (1 = Inner, 10 = Outer)" fullWidth value={levelForm.order} onChange={(e) => setLevelForm({ ...levelForm, order: e.target.value })} sx={{ mb: 2 }} />
                    <TextField type="number" label="Capacity (Items per this level)" fullWidth value={levelForm.capacity} onChange={(e) => setLevelForm({ ...levelForm, capacity: e.target.value })} helperText="How many of the previous level fit in one of this level" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLevelDialog(false)}>Cancel</Button>
                    <Button onClick={saveLevel} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog fullScreen open={designerOpen} onClose={() => setDesignerOpen(false)}>
                {designerOpen && (
                    <LabelDesigner
                        propTemplateId={editingLevel?.label_template_id || editingLevel?.label_template?.id}
                        onClose={() => setDesignerOpen(false)}
                        onSaveSuccess={handleDesignerSave}
                    />
                )}
            </Dialog>
        </Grid>
    );
}
