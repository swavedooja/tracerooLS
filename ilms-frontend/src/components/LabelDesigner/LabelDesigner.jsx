import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem, ListItemText, ListItemIcon, IconButton, Chip, ToggleButton, ToggleButtonGroup, Tabs, Tab } from '@mui/material';
import { Save, TextFields, QrCode, ViewWeek, ArrowBack, AddCircle, FormatBold, FormatItalic, FormatUnderlined, UploadFile, Preview } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DesignerCanvas from './DesignerCanvas';
import LabelPreview from '../LabelPreview';
import { LabelTemplateAPI } from '../../services/APIService';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const DYNAMIC_FIELDS = [
    { label: 'Material Code', value: 'materialCode' },
    { label: 'Material Name', value: 'materialName' },
    { label: 'Description', value: 'description' },
    { label: 'Batch No', value: 'batchNumber' },
    { label: 'Serial No', value: 'serialNumber' },
    { label: 'Expiry', value: 'expiryDate' },
    { label: 'Mfg Date', value: 'mfgDate' },
    { label: 'Net Weight', value: 'netWeight' },
];

const DUMMY_DATA = {
    materialCode: 'MAT-12345678',
    materialName: 'Premium Shampoo 500ml',
    description: 'Anti-dandruff formulation with aloe vera.',
    batchNumber: 'B-2023-10-001',
    serialNumber: 'SN-9988776655',
    expiryDate: '2025-12-31',
    mfgDate: '2023-10-01',
    netWeight: '500g',
    grossWeight: '520g'
};

export default function LabelDesigner({ propTemplateId, onSaveSuccess, onClose }) {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    // Use prop if available (Modal mode), otherwise param (Route mode)
    const id = propTemplateId || paramId;
    const isModal = !!propTemplateId || !!onClose;

    const [template, setTemplate] = useState({
        name: 'New Template',
        levelName: 'ITEM',
        widthMm: 100,
        heightMm: 150,
        status: 'DRAFT',
        unit: 'mm'
    });
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [paperSize, setPaperSize] = useState('A4');

    useEffect(() => {
        if (id) {
            load();
        } else {
            // Reset for new template
            setTemplate({
                name: 'New Template',
                levelName: 'ITEM',
                widthMm: 100,
                heightMm: 150,
                status: 'DRAFT',
                unit: 'mm'
            });
            setElements([]);
        }
    }, [id]);

    const load = async () => {
        try {
            const data = await LabelTemplateAPI.get(id);
            const tpl = {
                ...data,
                widthMm: Number(data.width) || 100,
                heightMm: Number(data.height) || 150
            };
            setTemplate(tpl);
            if (data.canvas_design) {
                const design = typeof data.canvas_design === 'string'
                    ? JSON.parse(data.canvas_design)
                    : data.canvas_design;
                setElements(design || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ... (addElement, updateSelected, insertField, handleImageUpload kept same via code structure, simplified here for replace)
    // Redefining them here because check requires contiguous block replacement or carefully targeted.
    // Since I'm replacing the top part, I need to ensure I don't lose the functions.
    // The previous implementation had them inside the component. I should avoid replacing the whole component logic if possible 
    // unless I provide all of it.
    // Wait, replace_file_content replaces a block. The `addElement` etc are AFTER `load`.
    // I will use specific small edits to avoid re-writing the whole file logic.

    /* I will split this into two edits:
       1. The component signature and `useEffect` load logic.
       2. The `save` function and `return` (display) logic.
    */

    /* Edit 1: Signature and Load */

    const addElement = (type) => {
        const newEl = {
            id: Date.now(),
            type,
            x: 10,
            y: 10,
            width: type === 'text' ? 150 : 100,
            height: type === 'text' ? 40 : 100,
            formatString: type === 'text' ? 'Text' : '{materialCode}',
            fontSize: 14,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            src: ''
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const updateSelected = (field, value) => {
        setElements(elements.map(el => el.id === selectedId ? { ...el, [field]: value } : el));
    };

    const insertField = (fieldValue) => {
        const el = elements.find(e => e.id === selectedId);
        if (el) {
            const newFormatString = (el.formatString || '') + `{${fieldValue}}`;
            updateSelected('formatString', newFormatString);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const newEl = {
                    id: Date.now(),
                    type: 'image',
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    src: evt.target.result
                };
                setElements([...elements, newEl]);
                setSelectedId(newEl.id);
            };
            reader.readAsDataURL(file);
        }
    };

    const save = async () => {
        const payload = {
            name: template.name,
            type: template.levelName,
            width: Number(template.widthMm),
            height: Number(template.heightMm),
            status: template.status || 'DRAFT',
            canvas_design: elements,
            unit: 'mm'
        };
        try {
            let savedData;
            if (id) {
                savedData = await LabelTemplateAPI.update(id, payload);
            } else {
                savedData = await LabelTemplateAPI.create(payload);
            }
            alert('Template saved successfully');
            if (onSaveSuccess) onSaveSuccess(savedData);
        } catch (e) {
            console.error('Save API Error:', e);
            alert(`Save failed: ${e.message}`);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <Box sx={{ height: isModal ? '80vh' : 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Top Toolbar */}
            <Paper elevation={0} sx={{ p: 1, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 2 }}>
                {!isModal && <IconButton onClick={() => navigate('/label-templates')} size="small"><ArrowBack /></IconButton>}
                {isModal && <IconButton onClick={onClose} size="small"><ArrowBack /></IconButton>}

                <Typography variant="subtitle1" fontWeight="bold">{template.name}</Typography>
                <Chip label={template.levelName} size="small" color="primary" variant="outlined" />
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" size="small" startIcon={<Preview />} onClick={() => setPreviewOpen(true)} sx={{ mr: 1 }}>Preview</Button>
                <Button variant="contained" size="small" startIcon={<Save />} onClick={save}>Save</Button>
            </Paper>

            <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar: Assets - Hidden on Mobile */}
                <Grid item xs={12} md={2} sx={{ borderRight: { md: '1px solid #ddd' }, bgcolor: '#fafafa', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
                        <Tab label="Add" />
                        <Tab label="Layers" />
                    </Tabs>
                    <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                        {tabValue === 0 && (
                            <List>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">BASIC</Typography>
                                <ListItem button onClick={() => addElement('text')} sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}>
                                    <ListItemIcon><TextFields /></ListItemIcon>
                                    <ListItemText primary="Text Box" />
                                </ListItem>
                                <ListItem button onClick={() => addElement('barcode')} sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}>
                                    <ListItemIcon><ViewWeek /></ListItemIcon>
                                    <ListItemText primary="1D Barcode" />
                                </ListItem>
                                <ListItem button onClick={() => addElement('qr')} sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}>
                                    <ListItemIcon><QrCode /></ListItemIcon>
                                    <ListItemText primary="QR Code" />
                                </ListItem>

                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mt: 2, display: 'block' }}>MEDIA</Typography>
                                <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ mb: 1, textTransform: 'none' }}>
                                    Upload Image
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                            </List>
                        )}
                        {tabValue === 1 && (
                            <List dense>
                                {elements.map((el, i) => (
                                    <ListItem
                                        key={el.id}
                                        button
                                        selected={selectedId === el.id}
                                        onClick={() => setSelectedId(el.id)}
                                    >
                                        <ListItemText primary={`${el.type} ${i + 1}`} secondary={el.formatString || 'Image'} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Grid>

                {/* Center: Canvas */}
                <Grid item xs={12} md={7} sx={{ bgcolor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', p: { xs: 1, md: 4 } }}>
                    <DesignerCanvas
                        width={template.widthMm * 3.78}
                        height={template.heightMm * 3.78}
                        elements={elements}
                        setElements={setElements}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                    />
                </Grid>

                {/* Right Sidebar: Properties - Hidden on Mobile */}
                <Grid item xs={12} md={3} sx={{ borderLeft: { md: '1px solid #ddd' }, bgcolor: 'white', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                        <Typography variant="subtitle2" fontWeight="bold">Properties</Typography>
                    </Box>
                    <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                        {!selectedElement ? (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Template Settings</Typography>
                                <TextField fullWidth size="small" label="Name" value={template.name} onChange={e => setTemplate({ ...template, name: e.target.value })} margin="dense" />
                                <Grid container spacing={1}>
                                    <Grid item xs={6}><TextField size="small" label="Width (mm)" type="number" value={template.widthMm} onChange={e => setTemplate({ ...template, widthMm: Number(e.target.value) })} margin="dense" /></Grid>
                                    <Grid item xs={6}><TextField size="small" label="Height (mm)" type="number" value={template.heightMm} onChange={e => setTemplate({ ...template, heightMm: Number(e.target.value) })} margin="dense" /></Grid>
                                </Grid>
                                <FormControl fullWidth size="small" margin="dense">
                                    <InputLabel>Type</InputLabel>
                                    <Select value={template.levelName} label="Type" onChange={e => setTemplate({ ...template, levelName: e.target.value })}>
                                        <MenuItem value="ITEM">ITEM</MenuItem>
                                        <MenuItem value="BOX">BOX</MenuItem>
                                        <MenuItem value="PALLET">PALLET</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{selectedElement.type} Settings</Typography>

                                {selectedElement.type !== 'image' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Content / Data"
                                            value={selectedElement.formatString || ''}
                                            onChange={e => updateSelected('formatString', e.target.value)}
                                            multiline={selectedElement.type === 'text'}
                                            rows={2}
                                            margin="dense"
                                            helperText="Dynamic: {materialCode}"
                                        />
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            {DYNAMIC_FIELDS.map(f => (
                                                <Chip key={f.value} label={f.label} size="small" onClick={() => insertField(f.value)} sx={{ fontSize: 10 }} clickable />
                                            ))}
                                        </Box>
                                    </>
                                )}

                                {selectedElement.type === 'text' && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption">Typography</Typography>
                                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                            <Grid item xs={6}>
                                                <TextField type="number" size="small" label="Size" value={selectedElement.fontSize} onChange={e => updateSelected('fontSize', Number(e.target.value))} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <ToggleButtonGroup
                                                    size="small"
                                                    value={[
                                                        selectedElement.fontWeight === 'bold' ? 'bold' : null,
                                                        selectedElement.fontStyle === 'italic' ? 'italic' : null,
                                                        selectedElement.textDecoration === 'underline' ? 'under' : null,
                                                    ].filter(Boolean)}
                                                    onChange={(_, vals) => {
                                                        updateSelected('fontWeight', vals.includes('bold') ? 'bold' : 'normal');
                                                        updateSelected('fontStyle', vals.includes('italic') ? 'italic' : 'normal');
                                                        updateSelected('textDecoration', vals.includes('under') ? 'underline' : 'none');
                                                    }}
                                                    aria-label="text formatting"
                                                >
                                                    <ToggleButton value="bold"><FormatBold /></ToggleButton>
                                                    <ToggleButton value="italic"><FormatItalic /></ToggleButton>
                                                    <ToggleButton value="under"><FormatUnderlined /></ToggleButton>
                                                </ToggleButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption">Layout</Typography>
                                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                    <Grid item xs={6}><TextField size="small" label="X" value={Math.round(selectedElement.x)} margin="dense" disabled /></Grid>
                                    <Grid item xs={6}><TextField size="small" label="Y" value={Math.round(selectedElement.y)} margin="dense" disabled /></Grid>
                                    <Grid item xs={6}><TextField size="small" label="W" value={Math.round(selectedElement.width)} onChange={e => updateSelected('width', Number(e.target.value))} margin="dense" /></Grid>
                                    <Grid item xs={6}><TextField size="small" label="H" value={Math.round(selectedElement.height)} onChange={e => updateSelected('height', Number(e.target.value))} margin="dense" /></Grid>
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Label Sheet Preview
                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Paper Size</InputLabel>
                            <Select
                                value={paperSize}
                                label="Paper Size"
                                onChange={(e) => setPaperSize(e.target.value)}
                            >
                                <MenuItem value="A4">A4 (210 x 297 mm)</MenuItem>
                                <MenuItem value="Letter">Letter (215.9 x 279.4 mm)</MenuItem>
                                <MenuItem value="Continuous">Continuous Roll</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#eee', display: 'flex', justifyContent: 'center', p: 4, overflow: 'auto' }}>
                    {/* Imposition Logic */}
                    {(() => {
                        const isContinuous = paperSize === 'Continuous';
                        const pxPerMm = 3.78;
                        const paperDims = paperSize === 'A4' ? { w: 210, h: 297 } : (paperSize === 'Letter' ? { w: 215.9, h: 279.4 } : { w: template.widthMm, h: template.heightMm * 5 + 20 });
                        const sheetW = paperDims.w * pxPerMm;
                        const sheetH = isContinuous ? 'auto' : paperDims.h * pxPerMm;
                        const labelW = template.widthMm * pxPerMm;
                        const labelH = template.heightMm * pxPerMm;

                        const cols = isContinuous ? 1 : Math.floor(paperDims.w / template.widthMm);
                        const rows = isContinuous ? 5 : Math.floor(paperDims.h / template.heightMm);
                        const totalLabels = isContinuous ? 5 : cols * rows;

                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2">
                                    {isContinuous ? `Showing 5 sample labels on continuous roll.` : `Fits ${totalLabels} labels (${cols} x ${rows}) on ${paperSize}.`}
                                </Typography>
                                <Box
                                    id="sheet-preview"
                                    sx={{
                                        width: sheetW,
                                        height: sheetH,
                                        bgcolor: isContinuous ? 'transparent' : 'white',
                                        boxShadow: isContinuous ? 0 : 3,
                                        display: isContinuous ? 'flex' : 'grid',
                                        flexDirection: isContinuous ? 'column' : 'row',
                                        gridTemplateColumns: isContinuous ? 'none' : `repeat(${cols}, ${labelW}px)`,
                                        gridTemplateRows: isContinuous ? 'none' : `repeat(${rows}, ${labelH}px)`,
                                        gap: isContinuous ? '20px' : '0px',
                                        border: isContinuous ? 'none' : '1px solid #ccc'
                                    }}
                                >
                                    {Array.from({ length: totalLabels }).map((_, i) => (
                                        <Box key={i} sx={{ 
                                            border: '1px dashed #eee', 
                                            overflow: 'visible',
                                            bgcolor: 'white',
                                            boxShadow: isContinuous ? 1 : 0,
                                            position: 'relative',
                                            ...(isContinuous && i < totalLabels - 1 ? {
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: '-11px',
                                                    left: 0,
                                                    right: 0,
                                                    height: '1px',
                                                    borderBottom: '2px dashed #bbb'
                                                }
                                            } : {})
                                        }}>
                                            <Box sx={{ overflow: 'hidden', width: '100%', height: '100%' }}>
                                                {/* Scaled down content if needed, but here exact size */}
                                                <LabelPreview
                                                    width={labelW}
                                                    height={labelH}
                                                    elements={elements}
                                                    data={DUMMY_DATA}
                                                    scale={1} // Assuming LabelPreview handles scale or is purely px based
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
