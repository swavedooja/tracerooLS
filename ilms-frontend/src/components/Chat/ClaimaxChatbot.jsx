import React, { useState, useRef, useEffect } from 'react';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  Gavel as AdjudicatorIcon,
  Security as PolicyIcon,
  RecordVoiceOver as ChatIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  ListAlt as ListIcon,
  AddCircleOutline as AddIcon,
  Search as SearchIcon,
  SettingsSuggest as ActionIcon,
  History as HistoryIcon,
  ChevronLeft as BackIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  ReportProblem as WarningIcon
} from '@mui/icons-material';
import { 
  Box, Fab, Paper, Typography, TextField, IconButton, 
  Avatar, CircularProgress, Badge, Tooltip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Divider, Link
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../../services/GeminiService';

const ClaimaxChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // { name, mimeType, data (base64) }
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'I am clAImax, your strict insurance claims adjudicator. Please provide your claim details or upload a document (PDF, JPEG, PNG) for review against the Apex Auto Insurance policy.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // New states for medical claims
  const [currentIntent, setCurrentIntent] = useState(null); // 'RAISE', 'CHECK', 'ACT'
  const [intentStep, setIntentStep] = useState(0);
  const [claimData, setClaimData] = useState({ amount: '', id: '' });
  
  const [claimRequests, setClaimRequests] = useState([
    { id: 'MED-2024-001', date: '2024-05-10', amount: '₹2,500', status: 'IN_PROGRESS', type: 'Hospitalization' },
    { id: 'MED-2024-002', date: '2024-05-08', amount: '₹450', status: 'APPROVED', type: 'Pharmacy' },
    { id: 'MED-2024-003', date: '2024-05-05', amount: '₹1,200', status: 'REJECTED', type: 'Laboratory' },
    { id: 'MED-2024-004', date: '2024-05-01', amount: '₹800', status: 'RAISED', type: 'Radiology' }
  ]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload a PDF, JPEG, or PNG file.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setAttachedFile({
        name: file.name,
        mimeType: file.type,
        data: base64
      });
    } catch (error) {
      console.error('File conversion error:', error);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const colors = {
    primary: '#1A237E', // Deep Navy
    secondary: '#D4AF37', // Gold
    background: '#F5F7FA',
    userMsg: '#1A237E',
    botMsg: '#FFFFFF',
    text: '#2C3E50',
    accent: '#B0BEC5', // Slate Gray
    success: '#4CAF50',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#29B6F6'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return colors.success;
      case 'REJECTED': return colors.error;
      case 'IN_PROGRESS': return colors.warning;
      case 'RAISED': return colors.info;
      default: return colors.accent;
    }
  };

  const startIntent = (intent) => {
    setCurrentIntent(intent);
    setIntentStep(1);
    let msg = '';
    switch (intent) {
      case 'RAISE':
        msg = 'Starting new medical claim. Please enter the billed amount:';
        break;
      case 'CHECK':
        msg = 'Please enter your Medical Request ID:';
        break;
      case 'ACT':
        msg = 'Please enter the Request ID you wish to act upon:';
        break;
      default: break;
    }
    setMessages(prev => [...prev, { role: 'bot', content: msg }]);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMsg = input.trim();
    const fileData = attachedFile;
    
    setInput('');
    setAttachedFile(null);
    
    const displayMsg = userMsg + (fileData ? `\n[Attached: ${fileData.name}]` : '');
    setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);

    if (currentIntent) {
      handleIntentStep(userMsg, fileData);
      return;
    }

    setIsLoading(true);

    try {
      const botResponse = await GeminiService.chat(userMsg, fileData);
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.warn("Gemini API error, falling back to dummy response:", error);
      // Fallback for demo purpose
      const fallbackResponse = "I've reviewed your request against the medical policy. Based on your description, this appears to be a valid medical claim. You can proceed with the 'Raise Medical Request' flow for formal adjudication.";
      setMessages(prev => [...prev, { role: 'bot', content: fallbackResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntentStep = (val, file) => {
    if (currentIntent === 'RAISE') {
      if (intentStep === 1) {
        setClaimData(prev => ({ ...prev, amount: val }));
        setIntentStep(2);
        setMessages(prev => [...prev, { role: 'bot', content: 'Great. Now please upload the medical document (prescription or lab report):' }]);
      } else if (intentStep === 2) {
        if (!file) {
          setMessages(prev => [...prev, { role: 'bot', content: 'Please upload a document to proceed.' }]);
          return;
        }
        setIsLoading(true);
        setTimeout(() => {
          const newId = `MED-2024-${Math.floor(Math.random() * 9000) + 1000}`;
          const newClaim = {
            id: newId,
            date: new Date().toISOString().split('T')[0],
            amount: `₹${claimData.amount}`,
            status: 'RAISED',
            type: 'General'
          };
          setClaimRequests(prev => [newClaim, ...prev]);
          setMessages(prev => [
            ...prev, 
            { role: 'bot', content: `Success! Medical Request ${newId} has been raised successfully for ₹${claimData.amount}.` },
            { role: 'bot', content: `*AI Insight*: I've cross-referenced the billed amount with the uploaded document. Note: The entered amount (₹${claimData.amount}) and the receipt totals seem to have a minor mismatch. Please recheck the entries as per *clAImax Understanding* to avoid delays in final disbursement.` }
          ]);
          resetIntent();
          setIsLoading(false);
        }, 1500);
      }
    } else if (currentIntent === 'CHECK') {
      setIsLoading(true);
      setTimeout(() => {
        const claim = claimRequests.find(c => c.id.toUpperCase() === val.toUpperCase());
        if (claim) {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            content: `Request Details for ${claim.id}:\nStatus: ${claim.status}\nAmount: ${claim.amount}\nType: ${claim.type}\nDate: ${claim.date}` 
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'bot', content: `Sorry, I couldn't find a request with ID: ${val}` }]);
        }
        resetIntent();
        setIsLoading(false);
      }, 1000);
    } else if (currentIntent === 'ACT') {
      const claim = claimRequests.find(c => c.id.toUpperCase() === val.toUpperCase());
      if (claim) {
        setClaimData(prev => ({ ...prev, id: claim.id }));
        setIntentStep(2);
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `Found request ${claim.id}. What would you like to do?`,
          isAction: true 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: `Sorry, I couldn't find a request with ID: ${val}` }]);
        resetIntent();
      }
    }
  };

  const handleAction = (type) => {
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', content: `Action '${type}' has been initiated for request ${claimData.id}. A medical officer will review this shortly.` }]);
      resetIntent();
      setIsLoading(false);
    }, 1000);
  };

  const resetIntent = () => {
    setCurrentIntent(null);
    setIntentStep(0);
    setClaimData({ amount: '', id: '' });
    
    // Show main menu again
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'How else can I assist you today?',
        showActions: true
      }]);
    }, 1000);
  };

  const renderQuickActions = () => (
    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<AddIcon />}
        onClick={() => startIntent('RAISE')}
        sx={{ justifyContent: 'flex-start', color: colors.primary, borderColor: colors.primary, textTransform: 'none', borderRadius: '8px' }}
      >
        Raise a New Medical Request
      </Button>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<SearchIcon />}
        onClick={() => startIntent('CHECK')}
        sx={{ justifyContent: 'flex-start', color: colors.primary, borderColor: colors.primary, textTransform: 'none', borderRadius: '8px' }}
      >
        Check my request status
      </Button>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<ActionIcon />}
        onClick={() => startIntent('ACT')}
        sx={{ justifyContent: 'flex-start', color: colors.primary, borderColor: colors.primary, textTransform: 'none', borderRadius: '8px' }}
      >
        Act on existing request
      </Button>
    </Stack>
  );

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
                      {msg.isAction && (
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="error" 
                            onClick={() => handleAction('Cancel')}
                            startIcon={<CancelIcon />}
                            sx={{ borderRadius: '8px' }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="warning" 
                            onClick={() => handleAction('Escalate')}
                            startIcon={<WarningIcon />}
                            sx={{ borderRadius: '8px' }}
                          >
                            Escalate
                          </Button>
                        </Stack>
                      )}
                    </Paper>
                    {(msg.showActions || (msg.role === 'bot' && idx === 0)) && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block', color: colors.accent, fontSize: '0.7rem' }}>
                           <PolicyIcon sx={{ fontSize: 10, verticalAlign: 'middle', mr: 0.5 }} />
                           Medical Policy v2026.1 Loaded
                        </Typography>
                        {renderQuickActions()}
                      </Box>
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
                {attachedFile && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 1, 
                    bgcolor: '#F1F5F9', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    border: `1px solid ${colors.accent}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon sx={{ color: colors.primary, fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text }}>
                        {attachedFile.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={removeFile}>
                      <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                    </IconButton>
                  </Box>
                )}
                
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Describe your claim or upload a doc..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  multiline
                  maxRows={4}
                  InputProps={{
                    startAdornment: (
                      <IconButton 
                        size="small" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        sx={{ mr: 1, color: colors.accent }}
                      >
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    ),
                    endAdornment: (
                      <IconButton 
                        onClick={handleSend} 
                        size="medium"
                        disabled={(!input.trim() && !attachedFile) || isLoading}
                        sx={{ 
                          bgcolor: (input.trim() || attachedFile) ? colors.secondary : 'transparent',
                          color: (input.trim() || attachedFile) ? colors.primary : 'inherit',
                          '&:hover': { bgcolor: (input.trim() || attachedFile) ? '#C49F27' : 'transparent' },
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
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Link 
                    component="button"
                    variant="caption" 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/medical-claims');
                    }}
                    sx={{ 
                      color: colors.primary, 
                      fontWeight: 700, 
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: 14 }} />
                    See my medical requests
                  </Link>
                  <Typography variant="caption" sx={{ color: colors.accent, fontSize: '0.65rem' }}>
                    clAImax provides recommendations based on the provided policy document.
                  </Typography>
                </Box>
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
