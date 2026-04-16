import React from 'react';
import { 
  Box, Card, CardContent, CardMedia, Grid, Paper, Typography, 
  Divider, Stack, Accordion, AccordionSummary, AccordionDetails,
  Chip, Avatar
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Info, Thermostat, WaterDrop, Warning, Done, 
  Settings, Layers, ShoppingBag
} from '@mui/icons-material';

export default function MaterialDetailCard({ material, images = [] }) {
  const mainImage = images.find(img => img.type === 'MAIN')?.url || images[0]?.url || 'https://via.placeholder.com/600x400?text=Pharma+Material';

  const DetailRow = ({ label, value, icon }) => (
    <Box sx={{ py: 1.5 }}>
      <Grid container alignItems="center">
        <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && React.cloneElement(icon, { fontSize: 'small', sx: { color: 'text.secondary', opacity: 0.7 } })}
          <Typography variant="body2" color="text.secondary" fontWeight="500">{label}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2" fontWeight="600">{value ?? <Typography variant="caption" color="text.disabled">Not specified</Typography>}</Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'white' }}>
      <Grid container spacing={0}>
        {/* Left: Visuals */}
        <Grid item xs={12} md={5} sx={{ borderRight: '1px solid #f1f5f9' }}>
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              border: '1px solid #e2e8f0', 
              bgcolor: '#f8fafc',
              height: 400,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <CardMedia 
                component="img" 
                image={mainImage} 
                alt={material?.materialName}
                sx={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} 
              />
            </Paper>
            
            <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
              {images.map((img, idx) => (
                <Box 
                  key={idx} 
                  component="img" 
                  src={img.url} 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    objectFit: 'cover', 
                    borderRadius: 2, 
                    border: img.type === 'MAIN' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }} 
                />
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Right: Primary Info */}
        <Grid item xs={12} md={7}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
                {material?.type || 'Standard Material'}
              </Typography>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', mb: 1 }}>
                {material?.materialName || 'Unnamed Material'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {material?.description || 'No description provided for this Life Science asset.'}
              </Typography>
              
              <Stack direction="row" spacing={1}>
                {material?.isBatchManaged && <Chip label="Batch Managed" size="small" color="primary" variant="outlined" />}
                {material?.isSerialized && <Chip label="Serialized" size="small" color="secondary" variant="outlined" />}
                {material?.isHazmat && <Chip icon={<Warning />} label="Hazmat" size="small" color="error" variant="outlined" />}
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info fontSize="small" /> Key Specifications
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                   <Box sx={{ px: 2 }}>
                    <DetailRow label="Material Code" value={material?.materialCode} icon={<Settings />} />
                    <Divider />
                    <DetailRow label="Base UOM" value={material?.baseUOM} icon={<Layers />} />
                    <Divider />
                    <DetailRow label="Shelf Life" value={material?.shelfLifeDays ? `${material.shelfLifeDays} days` : null} icon={<ShoppingBag />} />
                   </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Thermostat fontSize="small" /> Storage & Handling
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Avatar sx={{ bgcolor: '#eff6ff', color: '#1d4ed8' }}><Thermostat /></Avatar>
                       <Box>
                         <Typography variant="caption" color="text.secondary">Temp Range</Typography>
                         <Typography variant="body2" fontWeight="bold">
                           {material?.handlingParameter?.temperatureMin ? `${material.handlingParameter.temperatureMin}°C - ${material.handlingParameter.temperatureMax}°C` : 'Ambient'}
                         </Typography>
                       </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Avatar sx={{ bgcolor: '#f0fdf4', color: '#15803d' }}><WaterDrop /></Avatar>
                       <Box>
                         <Typography variant="caption" color="text.secondary">Physical State</Typography>
                         <Typography variant="body2" fontWeight="bold">{material?.materialState || 'NA'}</Typography>
                       </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
