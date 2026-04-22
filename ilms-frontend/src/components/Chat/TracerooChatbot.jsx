import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Fab, Paper, Typography, TextField, IconButton, 
  Avatar, CircularProgress, Badge
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Close as CloseIcon, 
  Send as SendIcon, 
  SmartToy as RobotIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { GrokService } from '../../services/GrokService';

const TracerooChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'I am Traceroo your tracking assistant. I can help you track anything here.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const botResponse = await GrokService.chat(userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "I encountered a minor glitch. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Paper
              elevation={24}
              sx={{
                width: { xs: '320px', sm: '380px' },
                height: '520px',
                mb: 2,
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              }}
            >
              {/* Header */}
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, #1976D2 0%, #00BCD4 100%)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <RobotIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ lineHeight: 1, mb: 0.5, fontWeight: 700 }}>Traceroo</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box 
                        component={motion.div}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%' }} 
                      />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>AI Assistant Online</Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Message List */}
              <Box sx={{ 
                flex: 1, 
                p: 2, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: '#E0E0E0', borderRadius: '10px' }
              }}>
                {messages.map((msg, idx) => (
                  <Box 
                    component={motion.div}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    sx={{ 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    <Paper sx={{ 
                      p: 1.5, 
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: msg.role === 'user' ? '#1976D2' : '#FFFFFF',
                      color: msg.role === 'user' ? 'white' : '#263238',
                      boxShadow: msg.role === 'user' ? '0 4px 12px rgba(25, 118, 210, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                      border: msg.role === 'user' ? 'none' : '1px solid #F0F0F0'
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                    <CircularProgress size={14} thickness={6} sx={{ color: '#00BCD4' }} />
                    <Typography variant="caption" sx={{ color: '#90A4AE', fontStyle: 'italic' }}>
                      Checking logs...
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #F0F0F0' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask Traceroo..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={handleSend} 
                        size="small"
                        color="primary" 
                        disabled={!input.trim() || isLoading}
                        sx={{ 
                          bgcolor: input.trim() ? '#1976D2' : 'transparent',
                          color: input.trim() ? 'white' : 'inherit',
                          '&:hover': { bgcolor: input.trim() ? '#1565C0' : 'transparent' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    ),
                    sx: { 
                      borderRadius: '16px',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    }
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box 
              component={motion.div}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} 
            />
          }
        >
          <Fab 
            color="primary" 
            onClick={() => setIsOpen(!isOpen)}
            sx={{ 
              background: 'linear-gradient(135deg, #1976D2 0%, #00BCD4 100%)',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
              width: 64,
              height: 64,
              '&:hover': {
                transform: 'rotate(5deg)',
              }
            }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div 
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <CloseIcon />
                </motion.div>
              ) : (
                <motion.div 
                  key="chat"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <ChatIcon />
                </motion.div>
              )}
            </AnimatePresence>
          </Fab>
        </Badge>
      </motion.div>
    </Box>
  );
};

export default TracerooChatbot;
