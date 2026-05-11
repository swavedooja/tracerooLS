import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Fab, Paper, Typography, TextField, IconButton, 
  Avatar, CircularProgress, Badge, Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  Gavel as AdjudicatorIcon,
  Security as PolicyIcon,
  RecordVoiceOver as ChatIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService } from '../../services/GeminiService';

const ClaimaxChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'I am clAImax, your strict insurance claims adjudicator. Please provide your claim details (Date of accident, Amount, Policy ID, and Description) for review against the Apex Auto Insurance policy.' }
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
      const botResponse = await GeminiService.chat(userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "I encountered an error while accessing the policy database. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Color Palette
  const colors = {
    primary: '#1A237E', // Deep Navy
    secondary: '#D4AF37', // Gold
    background: '#F5F7FA',
    userMsg: '#1A237E',
    botMsg: '#FFFFFF',
    text: '#2C3E50',
    accent: '#B0BEC5' // Slate Gray
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
                width: { xs: '320px', sm: '420px' },
                height: '600px',
                mb: 2,
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${colors.accent}`,
                boxShadow: '0 25px 70px rgba(26, 35, 126, 0.2)',
              }}
            >
              {/* Header */}
              <Box sx={{ 
                p: 3, 
                background: `linear-gradient(135deg, ${colors.primary} 0%, #283593 100%)`, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: colors.secondary
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 48, height: 48, border: `1px solid ${colors.secondary}` }}>
                    <AdjudicatorIcon sx={{ color: colors.secondary }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ lineHeight: 1, mb: 0.5, fontWeight: 800, letterSpacing: '0.5px', color: colors.secondary }}>
                      clAImax
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box 
                        component={motion.div}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%' }} 
                      />
                      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, fontSize: '0.7rem' }}>
                        POLICY ADJUDICATOR ACTIVE
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Message List */}
              <Box sx={{ 
                flex: 1, 
                p: 3, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2.5,
                bgcolor: colors.background,
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-thumb': { background: '#CFD8DC', borderRadius: '10px' }
              }}>
                {messages.map((msg, idx) => (
                  <Box 
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    sx={{ 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '90%',
                    }}
                  >
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: msg.role === 'user' ? colors.primary : colors.botMsg,
                      color: msg.role === 'user' ? 'white' : colors.text,
                      boxShadow: msg.role === 'user' ? '0 5px 15px rgba(26, 35, 126, 0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
                      border: msg.role === 'user' ? 'none' : `1px solid #ECEFF1`
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                    {msg.role === 'bot' && idx === 0 && (
                      <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: colors.accent, fontSize: '0.7rem' }}>
                         <PolicyIcon sx={{ fontSize: 10, verticalAlign: 'middle', mr: 0.5 }} />
                         Apex Auto Policy v2026.1 Loaded
                      </Typography>
                    )}
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
                    <CircularProgress size={16} thickness={5} sx={{ color: colors.secondary }} />
                    <Typography variant="caption" sx={{ color: colors.accent, fontStyle: 'italic', fontWeight: 500 }}>
                      Adjudicating claim against policy sections...
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderTop: `1px solid #ECEFF1` }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Describe your claim query..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  multiline
                  maxRows={4}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={handleSend} 
                        size="medium"
                        disabled={!input.trim() || isLoading}
                        sx={{ 
                          bgcolor: input.trim() ? colors.secondary : 'transparent',
                          color: input.trim() ? colors.primary : 'inherit',
                          '&:hover': { bgcolor: input.trim() ? '#C49F27' : 'transparent' },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          ml: 1
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    ),
                    sx: { 
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.9rem',
                      '& fieldset': { borderColor: '#E0E4E8' },
                      '&:hover fieldset': { borderColor: colors.secondary + ' !important' },
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1.5, display: 'block', textAlign: 'center', color: colors.accent, fontSize: '0.65rem' }}>
                  clAImax provides recommendations based on the provided policy document.
                </Typography>
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
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              sx={{ width: 14, height: 14, bgcolor: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} 
            />
          }
        >
          <Fab 
            onClick={() => setIsOpen(!isOpen)}
            sx={{ 
              background: `linear-gradient(135deg, ${colors.primary} 0%, #283593 100%)`,
              color: colors.secondary,
              boxShadow: '0 10px 30px rgba(26, 35, 126, 0.4)',
              width: 70,
              height: 70,
              border: `2px solid ${colors.secondary}`,
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 35px rgba(26, 35, 126, 0.5)',
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
                  <CloseIcon fontSize="large" />
                </motion.div>
              ) : (
                <motion.div 
                  key="chat"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <AdjudicatorIcon fontSize="large" />
                </motion.div>
              )}
            </AnimatePresence>
          </Fab>
        </Badge>
      </motion.div>
    </Box>
  );
};

export default ClaimaxChatbot;
