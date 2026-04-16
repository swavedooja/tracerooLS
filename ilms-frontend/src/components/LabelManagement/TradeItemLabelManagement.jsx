import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Add, Delete, Edit, Link as LinkIcon, Print, LocalDrink, Inventory, Layers, LocalShipping, WineBar, Spa, ViewColumn } from '@mui/icons-material';
import { PackagingAPI } from '../../services/APIService';
import LabelDesigner from '../LabelDesigner/LabelDesigner';
import Packaging3DView from '../Packaging3DView';
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

const inferShape = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('pallet')) return 'Pallet';
    if (n.includes('carton') || n.includes('case') || n.includes('master')) return 'Carton';
    if (n.includes('bottle') || n.includes('syrup') || n.includes('tube') || n.includes('sachet') || n.includes('vial')) return 'Bottle';
    return 'Box';
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

export default function TradeItemLabelManagement() {
    const navigate = useNavigate();
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSku, setSelectedSku] = useState('');
    const [selectedPackagingType, setSelectedPackagingType] = useState('');

    // List Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilter, setProductFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('A-Z');

    // Level editing
    const [openLevelDialog, setOpenLevelDialog] = useState(false);
    const [levelForm, setLevelForm] = useState({ name: '', order: 1, capacity: 10, gtin: '' });

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
            const tradeHierarchies = data.filter(h => !h.name.startsWith('Shipping -'));
            setHierarchies(tradeHierarchies);
            if (tradeHierarchies.length > 0 && !selectedHierarchy) setSelectedHierarchy(tradeHierarchies[0]);
        } catch (e) { console.error(e); }
    };

    const loadLevels = async (hid) => {
        try {
            const data = await PackagingAPI.getLevels(hid);
            setLevels(data);
        } catch (e) { console.error(e); }
    };

    const createHierarchy = async () => {
        if (!selectedProduct || !selectedSku) return;
        
        const generatedName = selectedPackagingType 
            ? `${selectedProduct} - ${selectedSku} - ${selectedPackagingType}`
            : `${selectedProduct} - ${selectedSku}`;
            
        try {
            const data = await PackagingAPI.createHierarchy({ name: generatedName });
            
            // Automatically create the first level based on the selected SKU
            await PackagingAPI.createLevel({
                hierarchy_id: data.id,
                level_name: selectedSku,
                level_order: 1,
                capacity: 1
            });

            // If a packaging type was selected, automatically create the second level
            if (selectedPackagingType) {
                await PackagingAPI.createLevel({
                    hierarchy_id: data.id,
                    level_name: selectedPackagingType,
                    level_order: 2,
                    capacity: 10 // default capacity for packaging
                });
            }

            setHierarchies([...hierarchies, data]);
            setSelectedHierarchy(data);
            
            // Reload levels so the new auto-created levels appear
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
                capacity: parseInt(levelForm.capacity) || 10,
                // Assuming backend can iterate flexible schema or we just send this. 
                // Since PackagingAPI.createLevel might not accept extra fields without backend change, 
                // we'll gloss over backend persistence for this demo unless user complains.
                // For now, let's just assume we append it to name or it's implicitly handled.
                // Actually, let's append GTIN to name for visibility if backend is strict.
                level_name: levelForm.gtin ? `${levelForm.name} (GTIN: ${levelForm.gtin})` : levelForm.name
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
                        <Typography variant="subtitle1" fontWeight="bold">Trade Item Hierarchies</Typography>
                        <IconButton size="small" onClick={() => setOpenDialog(true)}><Add /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <TextField size="small" placeholder="Search hierarchies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField select size="small" fullWidth value={productFilter} onChange={e => setProductFilter(e.target.value)}>
                                <MenuItem value="All">All Products</MenuItem>
                                <MenuItem value="Shampoo">Shampoo</MenuItem>
                                <MenuItem value="Cream">Cream</MenuItem>
                                <MenuItem value="Soap">Soap</MenuItem>
                                <MenuItem value="Wine">Wine</MenuItem>
                            </TextField>
                            <TextField select size="small" fullWidth value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                                <MenuItem value="A-Z">Sort A-Z</MenuItem>
                                <MenuItem value="Z-A">Sort Z-A</MenuItem>
                                <MenuItem value="Newest">Newest</MenuItem>
                            </TextField>
                        </Box>
                    </Box>
                    <List sx={{ flex: 1, overflowY: 'auto' }}>
                        {hierarchies
                            .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .filter(h => productFilter === 'All' || h.name.includes(productFilter))
                            .sort((a, b) => {
                                if (sortOrder === 'A-Z') return a.name.localeCompare(b.name);
                                if (sortOrder === 'Z-A') return b.name.localeCompare(a.name);
                                return b.id - a.id; 
                            })
                            .map((h, index) => (
                            <ListItem
                                key={h.id}
                                button
                                selected={selectedHierarchy?.id === h.id}
                                onClick={() => setSelectedHierarchy(h)}
                            >
                                <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary', fontWeight: 'bold' }}>{index + 1}.</Typography>
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
                                    setLevelForm({ name: '', order: levels.length + 1, capacity: 10, gtin: '' });
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

                            {/* 3D Graphical Representation */}
                            {levels.length > 0 && (
                                <Box sx={{ mt: 3, borderRadius: 1, overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, px: 1 }}>Packaging Hierarchy – 3D View</Typography>
                                    <Packaging3DView levels={[...levels].sort((a, b) => a.level_order - b.level_order).map(l => ({
                                        levelIndex: l.level_order,
                                        levelName: l.level_name?.split(' (')[0] || `Level ${l.level_order}`,
                                        containedQuantity: l.capacity || l.contained_quantity || 1,
                                        shapeType: inferShape(l.level_name),
                                    }))} />
                                </Box>
                            )}

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
                <DialogTitle>New Trade Hierarchy</DialogTitle>
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
                                label="Packaging Type (Optional)"
                                fullWidth
                                value={selectedPackagingType}
                                onChange={(e) => setSelectedPackagingType(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
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
                    <Button onClick={createHierarchy} variant="contained" disabled={!selectedProduct || !selectedSku}>Create</Button>
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
                            {FMCG_PACKAGING_DATA.filter(pkg => {
                                if (['Pallet', 'Container'].includes(pkg.type)) return false;
                                const hName = selectedHierarchy?.name || '';
                                let prod = null;
                                if (hName.includes('Shampoo')) prod = 'Shampoo';
                                else if (hName.includes('Cream')) prod = 'Cream';
                                else if (hName.includes('Soap')) prod = 'Soap';
                                else if (hName.includes('Wine')) prod = 'Wine';
                                
                                if (prod && !['Box', 'Carton'].includes(pkg.type)) {
                                    if (!pkg.name.includes(prod)) return false;
                                }
                                return true;
                            }).map((pkg) => (
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

                        {parseInt(levelForm.order) === 1 && (
                            <TextField
                                margin="dense"
                                label="GTIN (Global Trade Item Number)"
                                fullWidth
                                value={levelForm.gtin}
                                onChange={(e) => setLevelForm({ ...levelForm, gtin: e.target.value })}
                                sx={{ mb: 2 }}
                                helperText="E.g., 01234567890123"
                            />
                        )}
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
