import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Tooltip,
  Autocomplete, Chip,
  CircularProgress
} from '@mui/material';
import { AutoFixHigh, CloudUpload, Delete, Image as ImageIcon, Add, ArrowBack, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MaterialsAPI } from '../services/APIService';
import MaterialDetailCard from './MaterialDetailCard';

const TYPES = ['Finished Goods', 'Raw Material', 'Packaging Material'];
const STATES = ['Liquid', 'Solid', 'Gel', 'Powder'];
const CLASSES = ['Bottles', 'Tubes', 'Jars', 'Cartons', 'Vials', 'Ampoules', 'Blisters'];
const GROUPS = ['Amoxicillin', 'Insulin Glargine', 'mRNA Vaccine', 'Sterile Saline', 'Antibiotics', 'Vaccines'];
const STORAGE_TYPES = ['Ambient', 'Cool Storage', 'Cold Storage', 'Ultra-Low Temp'];
const PROCUREMENT_TYPES = ['Make To Stock', 'Make To Order', 'Purchase'];
const VEHICLE_TYPES = ['Bulker', 'Tanker', 'Flatbed', 'Refrigerated Truck', 'Standard Container'];
const UOMS = ['EA', 'KG', 'LT', 'TON', 'ML', 'GM', 'VIAL', 'BTR'];
const STEPS = ['General', 'Dimensions & Weight', 'Storage & Handling', 'Packaging', 'Identifiers', 'Images', 'Flags', 'Review'];

export default function MaterialForm() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') || 'edit';
  const [mode, setMode] = useState(initialMode); // 'edit' or 'view'

  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]); 
  const [form, setForm] = useState({
    materialCode: '',
    materialName: '',
    description: '',
    packagingTypes: [],
    skus: [],
    countryOfOrigin: '',
    type: '',
    materialClass: '',
    materialGroup: '',
    materialState: '',
    baseUOM: '',
    netWeightKg: '',
    netWeightUom: 'KG',
    lengthMM: '',
    widthMM: '',
    heightMM: '',
    dimensionUom: 'MM',
    shelfLifeDays: '',
    materialEANupc: '',
    upc: '',
    storageType: '',
    procurementType: '',
    vehicleType: '',
    tradeUOM: '',
    tradeWeightKg: '',
    tradeWeightUom: 'KG',
    tradeLengthMM: '',
    tradeWidthMM: '',
    tradeHeightMM: '',
    tradeDimensionUom: 'MM',
    isPackaged: false,
    isFragile: false,
    isHighValue: false,
    isEnvSensitive: false,
    isBatchManaged: false,
    isSerialized: false,
    handlingParameter: {
      temperatureMin: '',
      temperatureMax: '',
      humidityMin: '',
      humidityMax: '',
      hazardousClass: '',
      epcFormat: '',
      envParameters: '',
      precautions: '',
    },
  });
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    if (code) {
      loadMaterial(code);
    }
  }, [code]);

  const loadMaterial = async (c) => {
    setLoading(true);
    try {
      const data = await MaterialsAPI.get(c);
      
      // Map API data to Form State
      setForm({
        materialCode: data.code || '',
        materialName: data.name || '',
        description: data.description || '',
        packagingTypes: data.packagingTypes || [],
        skus: data.skus || [],
        countryOfOrigin: data.countryOfOrigin || '',
        type: data.type || '',
        materialClass: data.class || '',
        materialGroup: data.category || '',
        materialState: data.state || '',
        baseUOM: data.baseUom || '',
        netWeightKg: data.netWeight || '',
        netWeightUom: data.weightUom || 'KG',
        lengthMM: data.length || '',
        widthMM: data.width || '',
        heightMM: data.height || '',
        dimensionUom: data.dimensionUom || 'MM',
        shelfLifeDays: data.shelfLifeDays || '',
        materialEANupc: data.ean || '',
        upc: data.upc || '',
        storageType: data.storageType || '',
        procurementType: data.procurementType || '',
        vehicleType: data.vehicleType || '',
        tradeUOM: data.tradeUom || '',
        tradeWeightKg: data.tradeWeight || '',
        tradeWeightUom: data.weightUom || 'KG',
        tradeLengthMM: data.trade_length || '',
        tradeWidthMM: data.trade_width || '',
        tradeHeightMM: data.trade_height || '',
        tradeDimensionUom: data.dimensionUom || 'MM',
        isPackaged: !!data.isPackaged,
        isFragile: !!data.isFragile,
        isHighValue: !!data.isHighValue,
        isEnvSensitive: !!data.isEnvSensitive,
        isBatchManaged: !!data.isBatchManaged,
        isSerialized: !!data.isSerialManaged,
        handlingParameter: data.handlingParameter || {
          temperatureMin: '',
          temperatureMax: '',
          humidityMin: '',
          humidityMax: '',
          hazardousClass: '',
          epcFormat: '',
          envParameters: '',
          precautions: '',
        },
      });
      
      if (data.images) {
        setImages(data.images.map(img => ({
          id: img.id,
          name: img.filename || 'Image',
          dataUrl: img.url,
          isPrimary: img.type === 'MAIN'
        })));
      }
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Failed to load material details', sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (field) => (e) => {
    if (mode === 'view') return;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const onHP = (field) => (e) => {
    if (mode === 'view') return;
    setForm((f) => ({ ...f, handlingParameter: { ...(f.handlingParameter || {}), [field]: e.target.value } }));
  };

  const handleImageUpload = (e) => {
    if (mode === 'view') return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImages(prev => [...prev, {
          name: file.name,
          dataUrl: evt.target.result,
          isPrimary: prev.length === 0
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    if (mode === 'view') return;
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index) => {
    if (mode === 'view') return;
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.materialName,
        description: form.description,
        type: form.type,
        category: form.materialGroup,
        baseUom: form.baseUOM,
        isBatchManaged: !!form.isBatchManaged,
        isSerialManaged: !!form.isSerialized,
        shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : null,
        grossWeight: form.tradeWeightKg ? Number(form.tradeWeightKg) : null,
        netWeight: form.netWeightKg ? Number(form.netWeightKg) : null,
        weightUom: form.netWeightUom || 'KG',
        length: form.lengthMM ? Number(form.lengthMM) : null,
        width: form.widthMM ? Number(form.widthMM) : null,
        height: form.heightMM ? Number(form.heightMM) : null,
        dimensionUom: form.dimensionUom || 'MM',
        isHazmat: !!(form.handlingParameter.hazardousClass && form.handlingParameter.hazardousClass !== 'None'),
        hazmatClass: form.handlingParameter.hazardousClass,
        packagingTypes: form.packagingTypes,
        skus: form.skus,
        countryOfOrigin: form.countryOfOrigin,
        state: form.materialState,
        class: form.materialClass,
        storageType: form.storageType,
        procurementType: form.procurementType,
        vehicleType: form.vehicleType,
        ean: form.materialEANupc,
        upc: form.upc,
        isPackaged: !!form.isPackaged,
        isFragile: !!form.isFragile,
        isHighValue: !!form.isHighValue,
        isEnvSensitive: !!form.isEnvSensitive,
        handlingParameter: form.handlingParameter
      };

      await MaterialsAPI.update(code, payload);
      setToast({ open: true, msg: 'Material updated successfully', sev: 'success' });
      setTimeout(() => navigate('/materials'), 1000);
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: 'Update failed', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/materials')}><ArrowBack /></IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {mode === 'view' ? 'Material Insight' : 'Refine Material'}
        </Typography>
        <Chip 
          label={code} 
          color="primary" 
          variant="outlined" 
          size="small" 
          sx={{ fontWeight: 'bold' }} 
        />
        <Box sx={{ flexGrow: 1 }} />
        {mode === 'view' && (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => setMode('edit')}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Switch to Edit
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">General Information</Typography></Grid>
              <Grid item xs={6}><TextField label="Material Code" fullWidth size="small" value={form.materialCode} disabled /></Grid>
              <Grid item xs={6}><TextField label="Material Name" fullWidth size="small" value={form.materialName} onChange={onChange('materialName')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={12}><TextField label="Description" multiline minRows={2} fullWidth size="small" value={form.description} onChange={onChange('description')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={6}><TextField label="Country of Origin" fullWidth size="small" value={form.countryOfOrigin} onChange={onChange('countryOfOrigin')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={6}><TextField select label="Material Type" fullWidth size="small" value={form.type} onChange={onChange('type')} disabled={mode === 'view'}>{TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6}><TextField select label="Material State" fullWidth size="small" value={form.materialState} onChange={onChange('materialState')} disabled={mode === 'view'}>{STATES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6}><TextField select label="Material Class" fullWidth size="small" value={form.materialClass} onChange={onChange('materialClass')} disabled={mode === 'view'}>{CLASSES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6}><TextField select label="Material Group" fullWidth size="small" value={form.materialGroup} onChange={onChange('materialGroup')} disabled={mode === 'view'}>{GROUPS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Dimensions & Weight</Typography></Grid>
              <Grid item xs={3}><TextField select label="Base UOM" fullWidth size="small" value={form.baseUOM} onChange={onChange('baseUOM')} disabled={mode === 'view'}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={3}><TextField type="number" label="Net Weight" fullWidth size="small" value={form.netWeightKg} onChange={onChange('netWeightKg')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={2}><TextField select label="Weight UOM" fullWidth size="small" value={form.netWeightUom} onChange={onChange('netWeightUom')} disabled={mode === 'view'}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={4} />
              <Grid item xs={3}><TextField type="number" label="Length" fullWidth size="small" value={form.lengthMM} onChange={onChange('lengthMM')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={3}><TextField type="number" label="Width" fullWidth size="small" value={form.widthMM} onChange={onChange('widthMM')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={3}><TextField type="number" label="Height" fullWidth size="small" value={form.heightMM} onChange={onChange('heightMM')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={3}>
                 <TextField select label="Dim UOM" fullWidth size="small" value={form.dimensionUom} onChange={onChange('dimensionUom')} disabled={mode === 'view'}>
                     <MenuItem value="MM">MM</MenuItem><MenuItem value="CM">CM</MenuItem><MenuItem value="IN">IN</MenuItem><MenuItem value="M">M</MenuItem>
                 </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Storage & Handling</Typography></Grid>
              <Grid item xs={3}><TextField type="number" label="Shelf Life (days)" fullWidth size="small" value={form.shelfLifeDays} onChange={onChange('shelfLifeDays')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={3}><TextField select label="Storage Type" fullWidth size="small" value={form.storageType} onChange={onChange('storageType')} disabled={mode === 'view'}>{STORAGE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={3}><TextField select label="Procurement Type" fullWidth size="small" value={form.procurementType} onChange={onChange('procurementType')} disabled={mode === 'view'}>{PROCUREMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={3}><TextField select label="Vehicle Type" fullWidth size="small" value={form.vehicleType} onChange={onChange('vehicleType')} disabled={mode === 'view'}>{VEHICLE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6}><TextField type="number" label="Temp Min (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMin} onChange={onHP('temperatureMin')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={6}><TextField type="number" label="Temp Max (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMax} onChange={onHP('temperatureMax')} disabled={mode === 'view'} /></Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>Packaging Settings</Typography>
              <Autocomplete
                multiple
                freeSolo
                disabled={mode === 'view'}
                options={['Institutional Bulk Pack', 'Standard Pharma Carton', 'Global Export Case', 'Cold Chain Shipper']}
                value={form.packagingTypes}
                onChange={(e, newValue) => setForm(f => ({ ...f, packagingTypes: newValue }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />)
                }
                renderInput={(params) => <TextField {...params} label="Packaging Configurations" placeholder="Type and press Enter" size="small" />}
              />
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Defined SKUs</Typography>
                {form.skus.map((sku, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1, bgcolor: '#fbfbfb' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={4}><Typography variant="body2" fontWeight="bold">{sku.name}</Typography></Grid>
                      <Grid item xs={3}><Chip label={sku.type} size="small" /></Grid>
                      <Grid item xs={3}><Typography variant="caption">Inner Qty: {sku.quantity}</Typography></Grid>
                      <Grid item xs={2}><Typography variant="caption">{sku.length}x{sku.width}x{sku.height} {sku.dimUom}</Typography></Grid>
                    </Grid>
                  </Paper>
                ))}
                {form.skus.length === 0 && <Typography variant="caption" color="text.secondary">No SKU configurations defined.</Typography>}
              </Box>
            </Box>
          )}

          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Material Identifiers</Typography></Grid>
              <Grid item xs={6}><TextField label="Material EAN/UPC" fullWidth size="small" value={form.materialEANupc} onChange={onChange('materialEANupc')} disabled={mode === 'view'} /></Grid>
              <Grid item xs={6}><TextField label="UPC" fullWidth size="small" value={form.upc} onChange={onChange('upc')} disabled={mode === 'view'} /></Grid>
            </Grid>
          )}

          {activeStep === 5 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>Images</Typography>
              <Grid container spacing={2}>
                {images.map((img, index) => (
                  <Grid item xs={12} sm={4} md={3} key={index}>
                    <Card sx={{ border: img.isPrimary ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                      <CardMedia component="img" height="140" image={img.dataUrl} alt={img.name} sx={{ objectFit: 'contain', p: 1 }} />
                      {mode === 'edit' && (
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <IconButton size="small" onClick={() => removeImage(index)} color="error"><Delete /></IconButton>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                ))}
                {images.length === 0 && <Grid item xs={12}><Alert severity="info" variant="outlined">No images available for this material.</Alert></Grid>}
              </Grid>
            </Box>
          )}

          {activeStep === 6 && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Configuration Flags</Typography></Grid>
              <Grid item xs={12}>
                <Grid container>
                  {['isPackaged', 'isFragile', 'isHighValue', 'isEnvSensitive', 'isBatchManaged', 'isSerialized'].map(f => (
                    <Grid item xs={4} key={f}>
                      <FormControlLabel 
                        control={<Checkbox checked={!!form[f]} onChange={onChange(f)} disabled={mode === 'view'} />} 
                        label={f.replace(/is([A-Z])/, '$1').replace(/([A-Z])/g, ' $1')} 
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeStep === 7 && (
            <Box>
               <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>Summary Preview</Typography>
               <MaterialDetailCard material={form} images={images.map(i => ({ url: i.dataUrl, type: i.isPrimary ? 'MAIN' : 'OTHER' }))} />
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
          <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)} sx={{ textTransform: 'none' }}>Prev Step</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < 7 && <Button variant="contained" onClick={() => setActiveStep(s => s + 1)} sx={{ textTransform: 'none' }}>Next Step</Button>}
            {activeStep === 7 && mode === 'edit' && (
              <Button variant="contained" color="success" onClick={submit} disabled={saving} sx={{ textTransform: 'none', px: 4 }}>
                {saving ? 'Updating...' : 'Publish Changes'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}>
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
