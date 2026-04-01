import React, { useMemo, useState, useRef } from 'react';
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
} from '@mui/material';
import { AutoFixHigh, CloudUpload, Delete, Image as ImageIcon, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MaterialsAPI } from '../services/APIService';
import MaterialDetailCard from './MaterialDetailCard';

const TYPES = ['Finished Goods', 'Raw Material', 'Packaging Material'];
const STATES = ['Liquid', 'Solid', 'Gel', 'Powder'];
const CLASSES = ['Bottles', 'Tubes', 'Jars', 'Cartons'];
const GROUPS = ['Shampoo', 'Fairness Cream', 'Body Wash', 'Hand Sanitizer'];
const STORAGE_TYPES = ['Ambient', 'Cool Storage', 'Cold Storage'];
const PROCUREMENT_TYPES = ['Make To Stock', 'Make To Order', 'Purchase'];
const VEHICLE_TYPES = ['Bulker', 'Tanker', 'Flatbed', 'Refrigerated Truck', 'Standard Container'];
const UOMS = ['EA', 'KG', 'LT', 'TON', 'ML', 'GM'];
const STEPS = ['General', 'Dimensions & Weight', 'Storage & Handling', 'Packaging', 'Identifiers', 'Images', 'Flags', 'Review & Submit'];

export default function MaterialCreate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]); // Array of { name, dataUrl, isPrimary }
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

  const onChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };
  const onHP = (field) => (e) => {
    setForm((f) => ({ ...f, handlingParameter: { ...(f.handlingParameter || {}), [field]: e.target.value } }));
  };

  // Image handling functions
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImages(prev => [...prev, {
          name: file.name,
          dataUrl: evt.target.result,
          isPrimary: prev.length === 0 // First image is primary
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first remaining image primary
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const handleAutoFill = () => {
    const unique = Math.floor(Math.random() * 1000);
    setForm({
      materialCode: `MAT-${unique}`,
      materialName: `Auto Material ${unique}`,
      description: 'Auto-generated material for testing',
      packagingTypes: ['Global Packaging'],
      skus: [{ 
         name: `SKU-${unique}-Base`, 
         type: 'Bottle',
         packagingMaterial: 'Carton',
         quantity: 1,
         length: 400, width: 300, height: 300, dimUom: 'MM', weight: 1.2, weightUom: 'KG'
      }],
      countryOfOrigin: 'USA',
      type: TYPES[0],
      materialClass: CLASSES[0],
      materialGroup: GROUPS[0],
      materialState: STATES[0],
      baseUOM: 'EA',
      netWeightKg: 0.5,
      netWeightUom: 'KG',
      lengthMM: 50,
      widthMM: 50,
      heightMM: 150,
      dimensionUom: 'MM',
      shelfLifeDays: 730,
      materialEANupc: `EAN-${unique}`,
      upc: `UPC-${unique}`,
      storageType: STORAGE_TYPES[0],
      procurementType: PROCUREMENT_TYPES[0],
      vehicleType: VEHICLE_TYPES[0],
      tradeUOM: 'EA',
      tradeWeightKg: 6,
      tradeWeightUom: 'KG',
      tradeLengthMM: 180,
      tradeWidthMM: 180,
      tradeHeightMM: 150,
      tradeDimensionUom: 'MM',
      isPackaged: true,
      isFragile: false,
      isHighValue: false,
      isEnvSensitive: false,
      isBatchManaged: true,
      isSerialized: false,
      handlingParameter: {
        temperatureMin: 10,
        temperatureMax: 25,
        humidityMin: 30,
        humidityMax: 60,
        hazardousClass: 'None',
        epcFormat: 'URN',
        envParameters: 'Keep Dry',
        precautions: 'Handle with care',
      },
    });
  };

  const valid = useMemo(() => {
    return (
      form.materialCode.trim() &&
      form.materialName.trim() &&
      form.type &&
      form.materialClass &&
      form.materialGroup &&
      form.baseUOM
    );
  }, [form]);

  const stepValid = useMemo(() => {
    switch (activeStep) {
      case 0:
        return form.materialCode.trim() && form.materialName.trim() && form.type && form.materialClass && form.materialGroup;
      case 1:
        return !!form.baseUOM;
      case 2:
        return true;
      case 3:
        return true; 
      case 4: 
        return true;
      case 5: // Images - optional
        return true;
      case 6: // Flags
        return true;
      case 7: // Review
        return valid;
      default:
        return true;
    }
  }, [activeStep, form, valid]);

  const submit = async () => {
    if (!valid) {
      setToast({ open: true, msg: 'Please complete all required fields.', sev: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.materialCode,
        name: form.materialName,
        description: form.description,
        type: form.type,
        category: form.materialGroup,
        baseUom: form.baseUOM,

        isBatchManaged: form.isBatchManaged,
        isSerialManaged: form.isSerialized,

        shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : null,
        minStock: 0,
        maxStock: 0,

        grossWeight: form.tradeWeightKg ? Number(form.tradeWeightKg) : null,
        netWeight: form.netWeightKg ? Number(form.netWeightKg) : null,
        weightUom: form.netWeightUom || 'KG', // Form handles weight in chosen UOM

        length: form.lengthMM ? Number(form.lengthMM) : null,
        width: form.widthMM ? Number(form.widthMM) : null,
        height: form.heightMM ? Number(form.heightMM) : null,
        dimensionUom: form.dimensionUom || 'MM',

        isHazmat: form.handlingParameter.hazardousClass && form.handlingParameter.hazardousClass !== 'None',
        hazmatClass: form.handlingParameter.hazardousClass,
        unNumber: null, // No field in form
        packagingTypes: form.packagingTypes,
        packagingMaterials: form.packagingMaterials || [],
        skus: form.skus,

        status: 'ACTIVE'
      };

      await MaterialsAPI.create(payload);
      setToast({ open: true, msg: 'Material created', sev: 'success' });
      // Short delay to allow toast to be seen before navigation or just nav
      setTimeout(() => navigate(`/materials`), 1000);
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: e?.response?.data?.message || e.message || 'Create failed', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Create Material</Typography>
        <Button startIcon={<AutoFixHigh />} onClick={handleAutoFill} color="secondary">Auto-Fill</Button>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>General</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Material Code" required fullWidth size="small" value={form.materialCode} onChange={onChange('materialCode')} /></Grid>
            <Grid item xs={6}><TextField label="Material Name" required fullWidth size="small" value={form.materialName} onChange={onChange('materialName')} /></Grid>
            <Grid item xs={12}><TextField label="Description" multiline minRows={2} fullWidth size="small" value={form.description} onChange={onChange('description')} /></Grid>
            <Grid item xs={6}><TextField label="Country of Origin" fullWidth size="small" value={form.countryOfOrigin} onChange={onChange('countryOfOrigin')} /></Grid>
            <Grid item xs={6}><TextField select label="Material Type" required fullWidth size="small" value={form.type} onChange={onChange('type')}>{TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material State" fullWidth size="small" value={form.materialState} onChange={onChange('materialState')}>{STATES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material Class" required fullWidth size="small" value={form.materialClass} onChange={onChange('materialClass')}>{CLASSES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material Group" required fullWidth size="small" value={form.materialGroup} onChange={onChange('materialGroup')}>{GROUPS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Dimensions & Weight</Typography>
          <Grid container spacing={2}>
            {/* Base */}
            <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>Base Specification</Typography></Grid>
            <Grid item xs={3}><TextField select label="Base UOM" required fullWidth size="small" value={form.baseUOM} onChange={onChange('baseUOM')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={3}><TextField type="number" label="Net Weight" fullWidth size="small" value={form.netWeightKg} onChange={onChange('netWeightKg')} /></Grid>
            <Grid item xs={2}><TextField select label="Weight UOM" fullWidth size="small" value={form.netWeightUom} onChange={onChange('netWeightUom')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4} />
            <Grid item xs={3}><TextField type="number" label="Length" fullWidth size="small" value={form.lengthMM} onChange={onChange('lengthMM')} /></Grid>
            <Grid item xs={3}><TextField type="number" label="Width" fullWidth size="small" value={form.widthMM} onChange={onChange('widthMM')} /></Grid>
            <Grid item xs={3}><TextField type="number" label="Height" fullWidth size="small" value={form.heightMM} onChange={onChange('heightMM')} /></Grid>
            <Grid item xs={3}>
               <TextField select label="Dim UOM" fullWidth size="small" value={form.dimensionUom} onChange={onChange('dimensionUom')}>
                   <MenuItem value="MM">MM</MenuItem>
                   <MenuItem value="CM">CM</MenuItem>
                   <MenuItem value="IN">IN</MenuItem>
                   <MenuItem value="M">M</MenuItem>
               </TextField>
            </Grid>

            {/* Trade */}
            <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: -1 }}>Trade Specification</Typography></Grid>
            <Grid item xs={3}><TextField select label="Trade UOM" fullWidth size="small" value={form.tradeUOM} onChange={onChange('tradeUOM')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={3}><TextField type="number" label="Trade Weight" fullWidth size="small" value={form.tradeWeightKg} onChange={onChange('tradeWeightKg')} /></Grid>
            <Grid item xs={2}><TextField select label="Weight UOM" fullWidth size="small" value={form.tradeWeightUom} onChange={onChange('tradeWeightUom')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4} />
            <Grid item xs={3}><TextField type="number" label="Trade Length" fullWidth size="small" value={form.tradeLengthMM} onChange={onChange('tradeLengthMM')} /></Grid>
            <Grid item xs={3}><TextField type="number" label="Trade Width" fullWidth size="small" value={form.tradeWidthMM} onChange={onChange('tradeWidthMM')} /></Grid>
            <Grid item xs={3}><TextField type="number" label="Trade Height" fullWidth size="small" value={form.tradeHeightMM} onChange={onChange('tradeHeightMM')} /></Grid>
            <Grid item xs={3}>
               <TextField select label="Trade Dim UOM" fullWidth size="small" value={form.tradeDimensionUom} onChange={onChange('tradeDimensionUom')}>
                   <MenuItem value="MM">MM</MenuItem>
                   <MenuItem value="CM">CM</MenuItem>
                   <MenuItem value="IN">IN</MenuItem>
                   <MenuItem value="M">M</MenuItem>
               </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Storage & Handling</Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}><TextField type="number" label="Shelf Life (days)" fullWidth size="small" value={form.shelfLifeDays} onChange={onChange('shelfLifeDays')} /></Grid>
            <Grid item xs={3}><TextField select label="Storage Type" fullWidth size="small" value={form.storageType} onChange={onChange('storageType')}>{STORAGE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={3}><TextField select label="Procurement Type" fullWidth size="small" value={form.procurementType} onChange={onChange('procurementType')}>{PROCUREMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={3}><TextField select label="Vehicle Type" fullWidth size="small" value={form.vehicleType} onChange={onChange('vehicleType')}>{VEHICLE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField type="number" label="Temp Min (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMin} onChange={onHP('temperatureMin')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Temp Max (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMax} onChange={onHP('temperatureMax')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Humidity Min (%)" fullWidth size="small" value={form.handlingParameter.humidityMin} onChange={onHP('humidityMin')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Humidity Max (%)" fullWidth size="small" value={form.handlingParameter.humidityMax} onChange={onHP('humidityMax')} /></Grid>
            <Grid item xs={6}><TextField label="Hazardous Class" fullWidth size="small" value={form.handlingParameter.hazardousClass} onChange={onHP('hazardousClass')} /></Grid>
            <Grid item xs={6}><TextField label="EPC Format" fullWidth size="small" value={form.handlingParameter.epcFormat} onChange={onHP('epcFormat')} /></Grid>
            <Grid item xs={12}><TextField label="Environment Parameters" fullWidth size="small" value={form.handlingParameter.envParameters} onChange={onHP('envParameters')} /></Grid>
            <Grid item xs={12}><TextField label="Precautions" fullWidth size="small" value={form.handlingParameter.precautions} onChange={onHP('precautions')} /></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 3 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Packaging Settings</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={['Economy Packaging', 'Global Packaging', 'Standard Packaging', 'Premium', 'Value Pack']}
                value={form.packagingTypes}
                onChange={(e, newValue) => setForm(f => ({ ...f, packagingTypes: newValue }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => <TextField {...params} label="Packaging Types" placeholder="Type and press Enter" size="small" />}
              />
              {(form.packagingTypes || []).length > 0 && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #90caf9' }}>
                      <Typography variant="subtitle2" color="primary.dark" gutterBottom>Selected Type Information</Typography>
                      {form.packagingTypes.map(pt => (
                          <Box key={pt} sx={{ mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="bold">{pt}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                  {pt.includes('Economy') ? 'Uses lesser levels of packaging and cheaper material. Choose when shipping location is not far and/or price is a constraint.' :
                                   pt.includes('Global') ? 'Uses high-quality sturdy material suitable for long transit covering multiple modes.' :
                                   pt.includes('Standard') ? 'Default level of protection suitable for regional shipping.' :
                                   'Custom configuration rules apply to this selected type.'}
                              </Typography>
                          </Box>
                      ))}
                  </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">SKU & Packaging Configurations</Typography>
                <Button size="small" startIcon={<Add />} onClick={() => setForm(f => ({ ...f, skus: [...(f.skus || []), { name: '', type: '', packagingMaterial: '', quantity: 1, length: '', width: '', height: '', dimUom: 'MM', weight: '', weightUom: 'KG' }] }))}>Add Configuration</Button>
              </Box>
              {(form.skus || []).map((sku, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fbfbfb' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                     <Typography variant="subtitle2">Configuration {index + 1}</Typography>
                     <IconButton size="small" color="error" onClick={() => {
                        const newSkus = [...form.skus];
                        newSkus.splice(index, 1);
                        setForm(f => ({ ...f, skus: newSkus }));
                     }}><Delete fontSize="small" /></IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                       <TextField label="SKU Name" size="small" fullWidth value={sku.name || ''} onChange={e => {
                         const newSkus = [...form.skus];
                         newSkus[index].name = e.target.value;
                         setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                       <TextField select label="SKU Type" size="small" fullWidth value={sku.type || ''} onChange={e => {
                         const newSkus = [...form.skus];
                         newSkus[index].type = e.target.value;
                         setForm(f => ({ ...f, skus: newSkus }));
                       }}>
                         {['Bottle', 'Tube', 'Jar', 'Sachet', 'Box', 'Carton', 'Other'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                       </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                       <TextField select label="Packaging Material" size="small" fullWidth value={sku.packagingMaterial || ''} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].packagingMaterial = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }}>
                           {['Box', 'Carton', 'Wooden Crate', 'Premium Wrap', 'Shrink Wrap'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                       </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                       <TextField type="number" label="Quantity" size="small" fullWidth value={sku.quantity ?? 1} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].quantity = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                       <TextField type="number" label="Length" size="small" fullWidth value={sku.length || ''} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].length = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                       <TextField type="number" label="Width" size="small" fullWidth value={sku.width || ''} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].width = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                       <TextField type="number" label="Height" size="small" fullWidth value={sku.height || ''} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].height = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                       <TextField select label="Dim UOM" size="small" fullWidth value={sku.dimUom || 'MM'} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].dimUom = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }}>
                           {['MM', 'CM', 'IN', 'M'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                       </TextField>
                    </Grid>
                    <Grid item xs={8} sm={2}>
                       <TextField type="number" label="Empty Weight" size="small" fullWidth value={sku.weight || ''} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].weight = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }} />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                       <TextField select label="Weight UOM" size="small" fullWidth value={sku.weightUom || 'KG'} onChange={e => {
                           const newSkus = [...form.skus];
                           newSkus[index].weightUom = e.target.value;
                           setForm(f => ({ ...f, skus: newSkus }));
                       }}>
                           {['KG', 'GM', 'LB', 'OZ'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                       </TextField>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 4 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Identifiers</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Material EAN/UPC" fullWidth size="small" value={form.materialEANupc} onChange={onChange('materialEANupc')} /></Grid>
            <Grid item xs={6}><TextField label="UPC" fullWidth size="small" value={form.upc} onChange={onChange('upc')} /></Grid>
            <Grid item xs={6}><TextField label="External ERP Code" fullWidth size="small" value={form.externalERPCode || ''} onChange={onChange('externalERPCode')} /></Grid>
            <Grid item xs={6}><TextField label="Packaging Material Code" fullWidth size="small" value={form.packagingMaterialCode || ''} onChange={onChange('packagingMaterialCode')} /></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 5 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            <ImageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Product Images
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload images of the material. The first image will be set as the primary image.
          </Typography>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            Upload Images
          </Button>

          {images.length > 0 ? (
            <Grid container spacing={2}>
              {images.map((img, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card variant="outlined" sx={{ position: 'relative' }}>
                    {img.isPrimary && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'primary.main',
                          color: 'white',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          zIndex: 1
                        }}
                      >
                        PRIMARY
                      </Box>
                    )}
                    <CardMedia
                      component="img"
                      height="120"
                      image={img.dataUrl}
                      alt={img.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ justifyContent: 'space-between', py: 0.5 }}>
                      <Tooltip title="Set as primary">
                        <IconButton
                          size="small"
                          onClick={() => setPrimaryImage(index)}
                          disabled={img.isPrimary}
                          color={img.isPrimary ? 'primary' : 'default'}
                        >
                          <ImageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No images uploaded. You can add images or skip this step.</Alert>
          )}
        </Paper>
      )}

      {activeStep === 6 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Flags</Typography>
          <Grid container>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={!!form.isPackaged} onChange={onChange('isPackaged')} />} label="Packaged Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isFragile} onChange={onChange('isFragile')} />} label="Fragile Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isHighValue} onChange={onChange('isHighValue')} />} label="High Value" />
              <FormControlLabel control={<Checkbox checked={!!form.isEnvSensitive} onChange={onChange('isEnvSensitive')} />} label="Environment Sensitive" />
              <FormControlLabel control={<Checkbox checked={!!form.isBatchManaged} onChange={onChange('isBatchManaged')} />} label="Batch Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isSerialized} onChange={onChange('isSerialized')} />} label="Serialized" />
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 7 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Review</Typography>
          <MaterialDetailCard material={form} images={images.map(i => i.dataUrl)} />
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => Math.max(0, s - 1))}>Back</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep < 7 && (
            <Button variant="contained" onClick={() => setActiveStep(s => s + 1)} disabled={!stepValid}>Next</Button>
          )}
          {activeStep === 7 && (
            <>
              <Button variant="outlined" onClick={() => setPreviewOpen(true)} disabled={!valid}>Preview</Button>
              <Button variant="contained" onClick={submit} disabled={!valid || saving}>{saving ? 'Saving...' : 'Submit'}</Button>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          <MaterialDetailCard material={form} images={images.map(i => i.dataUrl)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}>
        <Alert severity={toast.sev} sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
