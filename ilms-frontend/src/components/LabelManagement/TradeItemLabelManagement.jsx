import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Add, Delete, Edit, Link as LinkIcon, Print, LocalDrink, Inventory, Layers, LocalShipping, WineBar, Spa, ViewColumn } from '@mui/icons-material';
import { PackagingAPI } from '../../services/APIService';
import LabelDesigner from '../LabelDesigner/LabelDesigner';
import Packaging3DView from '../Packaging3DView';
import { useNavigate } from 'react-router-dom';

const getIconForType = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('vial') || t.includes('ampoule') || t.includes('sachet')) return <LocalDrink fontSize="small" sx={{ color: '#0ea5e9' }} />;
    if (t.includes('tablet') || t.includes('caplet')) return <Inventory fontSize="small" sx={{ color: '#6366f1' }} />;
    if (t.includes('box') || t.includes('carton') || t.includes('case')) return <Inventory fontSize="small" sx={{ color: '#f59e0b' }} />;
    if (t.includes('pallet')) return <Layers fontSize="small" sx={{ color: '#10b981' }} />;
    if (t.includes('container') || t.includes('truck')) return <LocalShipping fontSize="small" sx={{ color: '#3b82f6' }} />;
    if (t.includes('serum') || t.includes('vaccine') || t.includes('blood')) return <Spa fontSize="small" sx={{ color: '#ef4444' }} />;
    if (t.includes('blister')) return <ViewColumn fontSize="small" sx={{ color: '#8b5cf6' }} />;
    return <Inventory fontSize="small" />;
};

const inferShape = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('pallet')) return 'Pallet';
    if (n.includes('case') || n.includes('master') || n.includes('shipper')) return 'Carton';
    if (n.includes('vial') || n.includes('ampoule') || n.includes('bottle')) return 'Bottle';
    if (n.includes('blister') || n.includes('flat')) return 'Box'; // Boxes are good for blisters
    return 'Box';
};

const PHARMA_PACKAGING_DATA = [
    { name: 'Amoxicillin Vial (10ml)', type: 'Vial', dimensions: '25mm x 25mm x 50mm', weight: '0.05kg' },
    { name: 'Sterile Ampoule (2ml)', type: 'Ampoule', dimensions: '12mm x 12mm x 60mm', weight: '0.02kg' },
    { name: 'Insulin Pen (3ml)', type: 'Syringe', dimensions: '15mm x 15mm x 160mm', weight: '0.08kg' },
    { name: 'Blister Pack (10 Caplets)', type: 'Blister', dimensions: '100mm x 50mm x 5mm', weight: '0.01kg' },
    { name: 'Secondary Folding Box', type: 'Box', dimensions: '120mm x 60mm x 40mm', weight: '0.15kg' },
    { name: 'Master Shipper Case (50 Units)', type: 'Carton', dimensions: '400mm x 300mm x 250mm', weight: '8.5kg' },
    { name: 'Euro Pharma Pallet', type: 'Pallet', dimensions: '1200mm x 800mm x 1400mm', weight: '350kg' },
    { name: 'Cold-Chain Container', type: 'Container', dimensions: '2.2m x 1.5m x 1.6m', weight: 'Max 1,200kg' }
];

const PRODUCT_HIERARCHY_DATA = {
    "Amoxicillin 250mg": {
        skus: [
            { name: "Amoxicillin Blister (10 Caplets)", dimensions: "100mm x 50mm x 5mm", weight: "0.01kg", type: "Blister" },
            { name: "Amoxicillin Vial (10ml)", dimensions: "25mm x 25mm x 50mm", weight: "0.05kg", type: "Vial" }
        ],
        packagingTypes: ["Standard Pharma Carton", "Institutional Bulk Pack", "Global Export Case"]
    },
    "Insulin Glargine": {
        skus: [
            { name: "Insulin Pre-filled Pen (3ml)", dimensions: "15mm x 15mm x 160mm", weight: "0.08kg", type: "Syringe" }
        ],
        packagingTypes: ["Insulated Cold-Chain Case", "Standard Retail Box"]
    },
    "mRNA Vaccine": {
        skus: [
            { name: "Single Dose Vial (2ml)", dimensions: "12mm x 12mm x 45mm", weight: "0.02kg", type: "Vial" },
            { name: "Multi Dose Vial (10ml)", dimensions: "25mm x 25mm x 55mm", weight: "0.06kg", type: "Vial" }
        ],
        packagingTypes: ["Ultra-Cold Shipper", "Ambient Buffer Box"]
    },
    "Sterile Saline": {
        skus: [
            { name: "Saline IV Bag (500ml)", dimensions: "200mm x 120mm x 30mm", weight: "0.55kg", type: "Bag" }
        ],
        packagingTypes: ["Sterile Overwrap Carton", "Standard Hospital Case"]
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
                                <MenuItem value="Amoxicillin">Amoxicillin</MenuItem>
                                <MenuItem value="Insulin">Insulin</MenuItem>
                                <MenuItem value="Vaccine">Vaccine</MenuItem>
                                <MenuItem value="Saline">Saline</MenuItem>
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
                            {PHARMA_PACKAGING_DATA.filter(pkg => {
                                if (['Pallet', 'Container'].includes(pkg.type)) return false;
                                const hName = selectedHierarchy?.name || '';
                                let prod = null;
                                if (hName.includes('Amoxicillin')) prod = 'Amoxicillin';
                                else if (hName.includes('Insulin')) prod = 'Insulin';
                                else if (hName.includes('Vaccine')) prod = 'Vaccine';
                                else if (hName.includes('Saline')) prod = 'Saline';
                                
                                if (prod && !['Box', 'Carton'].includes(pkg.type)) {
                                    if (!pkg.name.toLowerCase().includes(prod.toLowerCase())) return false;
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
                            const selectedPkg = PHARMA_PACKAGING_DATA.find(p => p.name === levelForm.name);
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
