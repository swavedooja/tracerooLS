import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Delete, Edit, Link as LinkIcon, Print, LocalDrink, Inventory, Layers, LocalShipping, WineBar, Spa, ViewColumn } from '@mui/icons-material';
import { PackagingAPI } from '../../../services/APIService';
import LabelDesigner from '../../LabelDesigner/LabelDesigner';
import { useNavigate } from 'react-router-dom';

const getIconForType = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('bottle') || t.includes('sachet')) return <LocalDrink fontSize="small" />;
    if (t.includes('wine')) return <WineBar fontSize="small" />;
    if (t.includes('box') || t.includes('carton') || t.includes('case')) return <Inventory fontSize="small" />;
    if (t.includes('pallet')) return <Layers fontSize="small" />;
    if (t.includes('container')) return <LocalShipping fontSize="small" />;
    if (t.includes('soap') || t.includes('cream')) return <Spa fontSize="small" />;
    if (t.includes('shampoo') || t.includes('tube')) return <ViewColumn fontSize="small" />;
    return <Inventory fontSize="small" />;
};

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

const PRODUCT_HIERARCHY_DATA = {
    "Shampoo": {
        skus: [
            { name: "Shampoo Bottle (200ml)", dimensions: "50mm x 50mm x 150mm", weight: "0.25kg", type: "Bottle" },
            { name: "Shampoo Bottle (500ml)", dimensions: "70mm x 70mm x 220mm", weight: "0.6kg", type: "Bottle" },
            { name: "Shampoo Sachet 50ml", dimensions: "50mm x 50mm x 5mm", weight: "0.05kg", type: "Sachet" }
        ],
        packagingTypes: ["Economy Packaging", "Global Packaging", "Standard Packaging"]
    },
    "Fairness Cream": {
        skus: [
            { name: "Fairness Cream Tube (50g)", dimensions: "30mm x 30mm x 120mm", weight: "0.06kg", type: "Tube" },
            { name: "Fairness Cream Jar (100g)", dimensions: "60mm x 60mm x 50mm", weight: "0.15kg", type: "Jar" }
        ],
        packagingTypes: ["Premium Packaging", "Standard Packaging"]
    },
    "Soap": {
        skus: [
            { name: "Soap Bar 100g", dimensions: "80mm x 50mm x 25mm", weight: "0.1kg", type: "Bar" },
            { name: "Soap Pack 3x100g", dimensions: "80mm x 150mm x 25mm", weight: "0.3kg", type: "Pack" }
        ],
        packagingTypes: ["Value Pack", "Premium Wrap"]
    },
    "Wine": {
        skus: [
            { name: "Wine Bottle 750ml", dimensions: "80mm x 80mm x 300mm", weight: "1.2kg", type: "Bottle" }
        ],
        packagingTypes: ["Wooden Crate", "Export Corrugated Box"]
    }
};

export default function HierarchyConfig() {
    const navigate = useNavigate();
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSku, setSelectedSku] = useState('');
    const [selectedPackagingType, setSelectedPackagingType] = useState('');

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
        if (!selectedProduct || !selectedSku || !selectedPackagingType) return;
        const generatedName = `${selectedProduct} - ${selectedSku} - ${selectedPackagingType}`;
        try {
            const data = await PackagingAPI.createHierarchy({ name: generatedName });
            
            // Now automatically create the first level based on the selected SKU
            await PackagingAPI.createLevel({
                hierarchy_id: data.id,
                level_name: selectedSku,
                level_order: 1,
                capacity: 1
            });

            setHierarchies([...hierarchies, data]);
            setSelectedHierarchy(data);
            
            // Reload levels so the new auto-created level appears
            loadLevels(data.id);
            
            setOpenDialog(false);
            setSelectedProduct('');
            setSelectedSku('');
            setSelectedPackagingType('');
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
        // Link the saved template to the current level
        if (editingLevel) {
            try {
                // We need to update the packaging_level with label_template_id
                await PackagingAPI.updateLevel(editingLevel.id, { label_template_id: savedTemplate.id });
                // Refresh levels to show updated link
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
                        <Typography variant="subtitle1" fontWeight="bold">Hierarchies</Typography>
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
                                    setLevelForm({ name: '', order: levels.length + 1 });
                                    setOpenLevelDialog(true);
                                }}>Add Level</Button>
                            </Box>

                            <List sx={{ flex: 1, overflowY: 'auto' }}>
                                {levels.length === 0 && <Typography color="text.secondary">No levels defined. Add levels like "Primary Box", "Carton", "Pallet".</Typography>}
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', pb: 1 }}>
                                        {[...levels].sort((a, b) => a.level_order - b.level_order).map((l, index) => (
                                            <React.Fragment key={`graphical-${l.id}`}>
                                                <Paper elevation={2} sx={{ p: 1.5, minWidth: 120, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>Level {l.level_order}</Typography>
                                                    <Typography variant="body1" fontWeight="bold">{l.level_name.split(' (')[0]}</Typography>
                                                    {l.capacity > 1 && <Typography variant="caption" display="block">Capacity: {l.capacity}</Typography>}
                                                </Paper>
                                                {index < levels.length - 1 && (
                                                    <Box sx={{ mx: 2, color: 'text.secondary', fontWeight: 'bold' }}>➔</Box>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Print Button Area - Below Levels */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<Print />}
                                    onClick={() => navigate(`/print/${selectedHierarchy.id}`)}
                                // disabled={levels.every(l => !l.label_template)} 
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
                <DialogTitle>New Packaging Hierarchy</DialogTitle>
                <DialogContent sx={{ minHeight: 350, minWidth: 400 }}>
                    <TextField
                        select
                        autoFocus
                        margin="dense"
                        label="Product"
                        fullWidth
                        value={selectedProduct}
                        onChange={(e) => {
                            setSelectedProduct(e.target.value);
                            setSelectedSku('');
                            setSelectedPackagingType('');
                        }}
                        sx={{ mb: 2, mt: 1 }}
                    >
                        <MenuItem value="" disabled><em>Select Product</em></MenuItem>
                        {Object.keys(PRODUCT_HIERARCHY_DATA).map(prod => (
                            <MenuItem key={prod} value={prod}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getIconForType(prod)}
                                    {prod}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    {selectedProduct && (
                        <>
                            <TextField
                                select
                                margin="dense"
                                label="SKU"
                                fullWidth
                                value={selectedSku}
                                onChange={(e) => setSelectedSku(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="" disabled><em>Select SKU</em></MenuItem>
                                {PRODUCT_HIERARCHY_DATA[selectedProduct].skus.map(sku => (
                                    <MenuItem key={sku.name} value={sku.name}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getIconForType(sku.type || sku.name)}
                                            {sku.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Show details for selected SKU */}
                            {(() => {
                                const activeSku = PRODUCT_HIERARCHY_DATA[selectedProduct].skus.find(s => s.name === selectedSku);
                                if (!activeSku) return null;
                                return (
                                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="body2" color="text.secondary"><strong>Type:</strong> {activeSku.type}</Typography>
                                        <Typography variant="body2" color="text.secondary"><strong>Dimensions:</strong> {activeSku.dimensions}</Typography>
                                        <Typography variant="body2" color="text.secondary"><strong>Weight:</strong> {activeSku.weight}</Typography>
                                    </Box>
                                );
                            })()}

                            <TextField
                                select
                                margin="dense"
                                label="Packaging Type"
                                fullWidth
                                value={selectedPackagingType}
                                onChange={(e) => setSelectedPackagingType(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="" disabled><em>Select Packaging</em></MenuItem>
                                {PRODUCT_HIERARCHY_DATA[selectedProduct].packagingTypes.map(ptype => (
                                    <MenuItem key={ptype} value={ptype}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getIconForType(ptype)}
                                            {ptype}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={createHierarchy} variant="contained" disabled={!selectedProduct || !selectedSku || !selectedPackagingType}>Create</Button>
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
                            label={parseInt(levelForm.order) === 1 ? "Product (Level 1 Item)" : "Packaging Level"}
                            fullWidth
                            value={levelForm.name}
                            onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="" disabled><em>Select Level</em></MenuItem>
                            {FMCG_PACKAGING_DATA.map((pkg) => (
                                <MenuItem key={pkg.name} value={pkg.name}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getIconForType(pkg.type || pkg.name)}
                                        {pkg.name}
                                    </Box>
                                </MenuItem>
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

            {/* Label Designer Popup */}
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
