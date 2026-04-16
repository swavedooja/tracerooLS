import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import PackagingTreeView from './PackagingTreeView';
import Packaging3DView from './Packaging3DView';
import LabelPreview from './LabelPreview';
import { PackagingAPI } from '../services/APIService';

const SHAPE_TYPES = ['Box', 'Carton', 'Bottle', 'Pallet'];
const ID_TECHS = ['BARCODE', 'RFID', 'BLE'];
const defaultLevel = (idx) => ({
  levelIndex: idx,
  levelCode: `L${idx}`,
  levelName: idx === 1 ? 'ITEM' : `LEVEL ${idx}`,
  containedQuantity: idx === 1 ? 1 : 0,
  idTech: 'BARCODE',
  barcodeType: 'EAN-13',
  defaultLabelCopies: 1,
  isReturnable: false,
  isSerialized: false,
  shapeType: idx === 1 ? 'Bottle' : 'Box',
});

export default function PackagingHierarchyEditor() {
  const [name, setName] = useState('Standard Shampoo 100ml');
  const [gtinFormat, setGtinFormat] = useState('GTIN-14');
  const [capacity, setCapacity] = useState(false);
  const [levels, setLevels] = useState([defaultLevel(1)]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });
  const [viewMode, setViewMode] = useState('3D');

  const addLevel = () => {
    const idx = levels.length + 1;
    setLevels((lvls) => [...lvls, defaultLevel(idx)]);
  };

  const updateLevel = (i, patch) => {
    setLevels((lvls) => lvls.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };

  const removeLevel = (i) => {
    setLevels((lvls) => lvls.filter((_, idx) => idx !== i).map((l, idx2) => ({ ...l, levelIndex: idx2 + 1, levelCode: `L${idx2 + 1}` })));
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= levels.length) return;
    const copy = [...levels];
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
    // reindex
    const re = copy.map((l, idx) => ({ ...l, levelIndex: idx + 1, levelCode: `L${idx + 1}` }));
    setLevels(re);
  };

  const valid = useMemo(() => {
    if (!name.trim()) return false;
    if (!levels.length) return false;
    for (let i = 0; i < levels.length; i++) {
      const l = levels[i];
      if (i > 0 && (!l.containedQuantity || l.containedQuantity <= 0)) return false;
      if (!l.levelName) return false;
    }
    return true;
  }, [name, levels]);

  const save = async () => {
    if (!valid) {
      setToast({ open: true, msg: 'Please complete required fields (containedQuantity > 0 for all but Level 1).', sev: 'error' });
      return;
    }
    const payload = {
      name,
      gtinAssignmentFormat: gtinFormat,
      packagingCapacityConstraints: capacity,
      levels,
    };
    try {
      const res = await PackagingAPI.create(payload);
      setSavedId(res.id);
      setToast({ open: true, msg: 'Hierarchy saved', sev: 'success' });
    } catch (e) {
      setToast({ open: true, msg: e?.response?.data?.message || 'Save failed', sev: 'error' });
    }
  };

  const preview = async () => {
    try {
      if (!savedId) {
        await save();
      }
      const id = savedId;
      if (!id) return; // save failed
      await PackagingAPI.preview(id);
      setPreviewOpen(true);
    } catch (e) {
      setToast({ open: true, msg: 'Preview failed', sev: 'error' });
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Packaging Hierarchy</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth size="small" label="Name" value={name} onChange={(e)=> setName(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="GTIN Assignment Format" value={gtinFormat} onChange={(e)=> setGtinFormat(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Capacity Constraints" value={capacity ? 'Enabled' : 'Disabled'} disabled /></Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Levels</Typography>
              <Button startIcon={<AddIcon />} onClick={addLevel}>Add Level</Button>
            </Box>

            {levels.map((l, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={4}><TextField size="small" label="Level Name" fullWidth value={l.levelName} onChange={(e)=> updateLevel(i, { levelName: e.target.value })} /></Grid>
                  <Grid item xs={6} sm={2}><TextField size="small" label="Index" fullWidth value={l.levelIndex} disabled /></Grid>
                  <Grid item xs={6} sm={2}><TextField size="small" label="Code" fullWidth value={l.levelCode} disabled /></Grid>
                  <Grid item xs={12} sm={4}><TextField type="number" size="small" label="Contained Qty" fullWidth value={l.containedQuantity} onChange={(e)=> updateLevel(i, { containedQuantity: Number(e.target.value) })} disabled={i===0} /></Grid>

                  <Grid item xs={12} sm={4}><TextField select size="small" label="ID Tech" fullWidth value={l.idTech} onChange={(e)=> updateLevel(i, { idTech: e.target.value })}>
                    {ID_TECHS.map((t)=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField></Grid>
                  
                  <Grid item xs={12} sm={4}><TextField select size="small" label="Shape Type" fullWidth value={l.shapeType || 'Box'} onChange={(e)=> updateLevel(i, { shapeType: e.target.value })}>
                    {SHAPE_TYPES.map((t)=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField></Grid>
                  {l.idTech === 'BARCODE' && (
                    <Grid item xs={12} sm={4}><TextField size="small" label="Barcode Type" fullWidth value={l.barcodeType || ''} onChange={(e)=> updateLevel(i, { barcodeType: e.target.value })} /></Grid>
                  )}
                  {l.idTech === 'RFID' && (
                    <>
                      <Grid item xs={12} sm={4}><TextField size="small" label="RFID Tag Type" fullWidth value={l.rfidTagType || ''} onChange={(e)=> updateLevel(i, { rfidTagType: e.target.value })} /></Grid>
                      <Grid item xs={12} sm={6}><TextField size="small" label="EPC Format" fullWidth value={l.epcFormat || ''} onChange={(e)=> updateLevel(i, { epcFormat: e.target.value })} /></Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}><TextField size="small" label="Label Template" fullWidth value={l.labelTemplate || ''} onChange={(e)=> updateLevel(i, { labelTemplate: e.target.value })} /></Grid>
                  <Grid item xs={12} sm={6}><TextField size="small" label="GTIN Format" fullWidth value={l.gtinFormat || ''} onChange={(e)=> updateLevel(i, { gtinFormat: e.target.value })} /></Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box>
                      <IconButton onClick={()=> move(i, -1)} disabled={i===0}><ArrowUpwardIcon /></IconButton>
                      <IconButton onClick={()=> move(i, +1)} disabled={i===levels.length-1}><ArrowDownwardIcon /></IconButton>
                    </Box>
                    <Box>
                      <IconButton color="error" onClick={()=> removeLevel(i)} disabled={levels.length===1}><DeleteIcon /></IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>Save Hierarchy</Button>
              <Button variant="outlined" startIcon={<PreviewIcon />} onClick={preview}>Preview</Button>
              <Button variant="text" onClick={()=> { setLevels([defaultLevel(1)]); setSavedId(null); }}>Cancel</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Visualization</Typography>
            <Box>
              <Button size="small" variant={viewMode === '2D' ? 'contained' : 'outlined'} onClick={() => setViewMode('2D')} sx={{ mr: 1 }}>2D Tree</Button>
              <Button size="small" variant={viewMode === '3D' ? 'contained' : 'outlined'} onClick={() => setViewMode('3D')}>3D View</Button>
            </Box>
          </Box>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {viewMode === '3D' ? <Packaging3DView levels={levels} /> : <PackagingTreeView levels={levels} />}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={previewOpen} onClose={()=> setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <PackagingTreeView levels={levels} />
            </Grid>
            <Grid item xs={12} md={5}>
              {levels.map((l, i)=> (
                <Box key={i} sx={{ mb: 2 }}>
                  <LabelPreview level={l} />
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=> setToast(t=> ({...t, open:false}))}>
        <Alert severity={toast.sev} sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
