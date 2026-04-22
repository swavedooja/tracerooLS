import React from 'react';
import { Box, Typography } from '@mui/material';
import { AutoAwesome, Warning, Info, Timeline } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TickerItem = ({ type, text }) => {
  const getIcon = () => {
    switch(type) {
      case 'warning': return <Warning sx={{ fontSize: 16, color: '#FF9800' }} />;
      case 'prediction': return <Timeline sx={{ fontSize: 16, color: '#9c27b0' }} />;
      case 'milestone': return <AutoAwesome sx={{ fontSize: 16, color: '#4caf50' }} />;
      default: return <Info sx={{ fontSize: 16, color: '#2196f3' }} />;
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mx: 4, gap: 1 }}>
      {getIcon()}
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}>
        {text}
      </Typography>
    </Box>
  );
};

const OperationTicker = () => {
  const dummyInsights = [
    { type: 'milestone', text: "Daily Goal: 85% of shipping manifest completed." },
    { type: 'prediction', text: "AI Prediction: High outbound volume expected between 14:00 - 16:00." },
    { type: 'warning', text: "Note: Humidity levels at Area-A are nearing threshold (38%)." },
    { type: 'info', text: "Efficiency: Packing Line 2 has increased throughput by 12% today." },
    { type: 'milestone', text: "Security: All 24 traceability gates currently online and verified." }
  ];

  return (
    <Box 
      sx={{ 
        width: '100%', 
        overflow: 'hidden', 
        bgcolor: 'rgba(25, 118, 210, 0.05)', 
        py: 1.5, 
        borderY: '1px solid rgba(25, 118, 210, 0.1)',
        backdropFilter: 'blur(5px)',
        position: 'relative',
        borderRadius: '8px',
        mb: 3
      }}
    >
      <Box
        component={motion.div}
        animate={{ x: [0, -1500] }}
        transition={{ 
          repeat: Infinity, 
          duration: 35, 
          ease: "linear" 
        }}
        sx={{ display: 'flex', whiteSpace: 'nowrap', pl: '120px' }}
      >
        {/* Repeat items to ensure continuous flow */}
        {[...dummyInsights, ...dummyInsights, ...dummyInsights].map((item, idx) => (
          <TickerItem key={idx} type={item.type} text={item.text} />
        ))}
      </Box>
      
      {/* AI Label Overlay */}
      <Box sx={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        height: '100%', 
        bgcolor: '#1976D2', 
        display: 'flex', 
        alignItems: 'center', 
        px: 2, 
        zIndex: 2,
        boxShadow: '4px 0 8px rgba(0,0,0,0.2)',
        borderRadius: '8px 0 0 8px'
      }}>
        <AutoAwesome sx={{ color: 'white', fontSize: 16, mr: 1 }} />
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, letterSpacing: 1 }}>AI INSIGHTS</Typography>
      </Box>
    </Box>
  );
};

export default OperationTicker;
