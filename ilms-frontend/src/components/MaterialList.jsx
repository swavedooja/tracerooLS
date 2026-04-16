import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, TextField, Chip, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add, Edit, Delete, Search, Visibility } from '@mui/icons-material';
import { MaterialsAPI } from '../services/APIService';
import MaterialDetailCard from './MaterialDetailCard';

export default function MaterialList() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMaterial, setViewMaterial] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await MaterialsAPI.list();
      setMaterials(data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (code) => {
    if (window.confirm('Delete material?')) {
      await MaterialsAPI.remove(code);
      load();
    }
  };

  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Materials</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/materials/new')}>New Material</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField variant="standard" placeholder="Search by name or code..." fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>UOM</TableCell>
              <TableCell>Track & Trace</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.code}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{row.code}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.name}</Typography>
                </TableCell>
                <TableCell><Chip label="FINISHED_GOODS" size="small" /></TableCell>
                <TableCell>{row.category ? row.category.replace(/_/g, ' ') : 'General'}</TableCell>
                <TableCell>{row.baseUom}</TableCell>
                <TableCell>
                  {row.isBatchManaged && <Chip label="Batch" size="small" color="primary" variant="outlined" sx={{ mr: 0.5 }} />}
                  {row.isSerialManaged && <Chip label="Serial" size="small" color="secondary" variant="outlined" />}
                </TableCell>
                <TableCell>{row.netWeight ? `${row.netWeight} ${row.weightUom || ''}` : '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setViewMaterial(row)} color="info" title="Quick View"><Visibility /></IconButton>
                  <IconButton onClick={() => navigate(`/materials/${row.code}?mode=edit`)} color="primary" title="Edit Material"><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(row.code)} color="error" title="Delete"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Material Dialog */}
      <Dialog open={!!viewMaterial} onClose={() => setViewMaterial(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="bold">Material Insight</Typography>
          <IconButton onClick={() => setViewMaterial(null)} sx={{ p: 1 }}>
             <Typography sx={{fontSize: 24, lineHeight: 1}}>×</Typography>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewMaterial && (
            <Box>
              <MaterialDetailCard 
                material={viewMaterial} 
                images={viewMaterial.images || []} 
              />
              <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    navigate(`/materials/${viewMaterial.code}?mode=view`);
                    setViewMaterial(null);
                  }}
                  sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 'bold' }}
                >
                  View More Details
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
