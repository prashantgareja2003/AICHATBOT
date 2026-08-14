import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Trash2,
  Copy,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  User,
  Mic,
  MicOff,
  Sun,
  Moon,
  Paperclip,
  X,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TigerMascot } from './components/TigerMascot';
import { DataChart } from './components/DataChart';
import { DevToolsModal } from './components/DevToolsModal';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ThreeDIconBadge } from './components/ThreeDimensionalIcons';
import { parseUploadedFile, extractChartDataFromResponse } from './utils/fileParser';
import tigerxLogoImg from './assets/tigerx-logo.png';
import {
  streamGroqChat,
  DEFAULT_GROQ_KEY,
  DEFAULT_SYSTEM_PROMPT
} from './services/groqApi';

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('tigerx_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [activeMode, setActiveMode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('tigerx_theme') || 'dark');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tigerx_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tigerx_chat_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const parsedResults = await Promise.all(files.map(f => parseUploadedFile(f)));
      setAttachedFiles(prev => [...prev, ...parsedResults]);
    } catch (err) {
      alert(`File Upload Error: ${err.message}`);
    }
  };

  const removeAttachedFile = (idx) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if ((!query && attachedFiles.length === 0) || isGenerating) return;

    let promptPrefix = activeMode ? `${activeMode.promptPrefix}\n` : '';
    let fullPromptText = `${promptPrefix}${query}`;

    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => `📁 [ATTACHED FILE: ${f.name}]\n${f.contentPreview}`).join('\n\n');
      fullPromptText = `${fullPromptText ? fullPromptText + '\n\n' : ''}${fileContext}`;
    }

    const displayUserText = query || `Uploaded ${attachedFiles.length} file(s): ${attachedFiles.map(f => f.name).join(', ')}`;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: displayUserText,
      fullPromptText: fullPromptText,
      modeLabel: activeMode ? activeMode.name : null,
      timestamp: getTimeString()
    };

    const botMessageId = Date.now() + 1;
    const initialBotMessage = {
      id: botMessageId,
      sender: 'assistant',
      text: '',
      timestamp: getTimeString()
    };

    setMessages(prev => [...prev, userMessage, initialBotMessage]);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsGenerating(true);

    try {
      await streamGroqChat({
        apiKey: DEFAULT_GROQ_KEY,
        model: "llama-3.3-70b-versatile",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        messages: [...messages.map(m => ({ sender: m.sender, text: m.fullPromptText || m.text })), { sender: 'user', text: fullPromptText }],
        onChunk: (chunk, accumulated) => {
          setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: accumulated } : msg));
        },
        onFinish: () => setIsGenerating(false),
        onError: (err) => {
          setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: `⚠️ **tigerX Error**: ${err.message || 'Failed to reach Groq API.'}` } : msg));
          setIsGenerating(false);
        }
      });
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Instant smooth clear without native browser confirm alert boxes!
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('tigerx_chat_history');
    setActiveMode(null);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSpeech = (text, index) => {
    if ('speechSynthesis' in window) {
      if (speakingIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingIndex(index);
      }
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  };

  const triggerRoar = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5F1F', '#FF8C42', '#38BDF8', '#FFFFFF']
    });
  };

  return (
    <div className="app-container">
      {/* Dev Tools Power Modes Modal */}
      <DevToolsModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSelectMode={(modeObj) => {
          setActiveMode(modeObj);
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,.json,.sql,.log,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Header Navbar with 3D SVG Badges */}
      <header className="tiger-header">
        <div className="header-brand">
          <div className="brand-avatar" onClick={triggerRoar} style={{ cursor: 'pointer', overflow: 'hidden' }} title="tigerX — AI. SMARTER. BOLDER.">
            <img src={tigerxLogoImg} alt="tigerX" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="header-title-group">
            <h1>
              tiger<span style={{ color: '#FF5F1F' }}>X</span>
              <span className="brand-slogan-badge">AI. SMARTER. BOLDER.</span>
            </h1>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Ready to assist you</span>
            </div>
          </div>
        </div>

        {/* Navbar Actions with 3D SVG Gradient Icon Buttons */}
        <div className="header-actions">
          {/* 3D Power Modes Button */}
          <div
            onClick={() => setShowDevModal(true)}
            style={{ cursor: 'pointer' }}
            title="tigerX Power Modes (SQL, Invoice OCR, Code Gen)"
          >
            <ThreeDIconBadge
              icon={Zap}
              gradient={activeMode ? 'linear-gradient(135deg, #FF5F1F 0%, #FF3D00 100%)' : 'linear-gradient(135deg, #FF5F1F 0%, #FF8C42 100%)'}
              shadowColor="rgba(255, 95, 31, 0.5)"
              badgeSize={38}
              size={18}
            />
          </div>

          {/* 3D Theme Switcher Button */}
          <div
            onClick={toggleTheme}
            style={{ cursor: 'pointer' }}
            title={theme === 'light' ? "Switch to Dark Tiger Glass Mode" : "Switch to Light Smoke White Mode"}
          >
            <ThreeDIconBadge
              icon={theme === 'light' ? Moon : Sun}
              gradient={theme === 'light' ? 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'}
              shadowColor={theme === 'light' ? 'rgba(99, 102, 241, 0.45)' : 'rgba(245, 158, 11, 0.45)'}
              badgeSize={38}
              size={18}
            />
          </div>

          {/* 3D Clear History Button - Instant action without browser confirm alert! */}
          <div
            onClick={clearChat}
            style={{ cursor: messages.length === 0 ? 'not-allowed' : 'pointer', opacity: messages.length === 0 ? 0.45 : 1 }}
            title="Clear Chat History"
          >
            <ThreeDIconBadge
              icon={Trash2}
              gradient="linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)"
              shadowColor="rgba(239, 68, 68, 0.45)"
              badgeSize={38}
              size={18}
            />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="chat-window">
        {messages.length === 0 ? (
          /* Pure Minimal Welcome Screen */
          <div className="welcome-hero">
            <div className="welcome-mascot-box" onClick={triggerRoar} style={{ cursor: 'pointer' }}>
              <TigerMascot size={110} isTalking={isGenerating} interactive={true} />
            </div>

            <h2>Hello! I'm tiger<span style={{ color: '#FF5F1F' }}>X</span> 🐅</h2>
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-muted)' }}>
              AI. SMARTER. BOLDER. How can I assist you today?
            </p>
          </div>
        ) : (
          /* Message List */
          <div className="messages-container">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const chartData = !isUser ? extractChartDataFromResponse(msg.text) : null;
              
              const cleanText = !isUser && chartData 
                ? msg.text.replace(/```json\s*(?:chart)?[\s\S]*?```/gi, '').trim()
                : msg.text;

              return (
                <div key={msg.id || index} className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
                  <div className={`avatar-bubble ${isUser ? 'user' : 'assistant'}`}>
                    {isUser ? (
                      <User size={18} />
                    ) : (
                      <TigerMascot size={26} isTalking={isGenerating && index === messages.length - 1} interactive={false} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
                    <div className="chat-bubble">
                      {cleanText || chartData ? (
                        <div>
                          {/* Mode Tag inside user message */}
                          {isUser && msg.modeLabel && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(255, 255, 255, 0.25)',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              marginBottom: '6px'
                            }}>
                              <Zap size={11} color="#FFFFFF" />
                              <span>{msg.modeLabel}</span>
                            </div>
                          )}

                          {cleanText && (
                            isUser ? (
                              <div style={{ whiteSpace: 'pre-wrap' }}>{cleanText}</div>
                            ) : (
                              <MarkdownRenderer content={cleanText} />
                            )
                          )}

                          {/* Dynamic SVG Chart */}
                          {chartData && <DataChart chartData={chartData} />}

                          {/* WhatsApp-Style Double Blue Ticks */}
                          <div className="message-meta">
                            <span>{msg.timestamp || 'Just now'}</span>
                            <span className="blue-tick" title="Read & Delivered">
                              <CheckCheck size={15} color="#38BDF8" />
                            </span>
                          </div>
                        </div>
                      ) : isGenerating && index === messages.length - 1 ? (
                        <div className="typing-indicator">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      ) : null}
                    </div>

                    {!isUser && msg.text && (
                      <div className="chat-bubble-actions">
                        <button
                          className="action-icon-btn"
                          onClick={() => copyToClipboard(msg.text, index)}
                        >
                          {copiedIndex === index ? <Check size={13} color="#FF5F1F" /> : <Copy size={13} />}
                          {copiedIndex === index ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          className="action-icon-btn"
                          onClick={() => toggleSpeech(msg.text, index)}
                        >
                          {speakingIndex === index ? <VolumeX size={13} color="#FF5F1F" /> : <Volume2 size={13} />}
                          {speakingIndex === index ? 'Stop' : 'Listen'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating Bottom Input Dock */}
        <div className="input-dock">
          {/* Active Mode Chip & Attached Files Bar */}
          {(activeMode || attachedFiles.length > 0) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
              {/* Active Mode Chip */}
              {activeMode && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FF5F1F 0%, #FF8C42 100%)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(255, 95, 31, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <Zap size={13} color="#FFFFFF" />
                  <span>Mode: {activeMode.name}</span>
                  <button
                    onClick={() => setActiveMode(null)}
                    style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 2px' }}
                    title="Remove Mode"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Attached Files */}
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 95, 31, 0.15)',
                    border: '1px solid #FF5F1F',
                    color: 'var(--text-main)',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Paperclip size={13} color="#FF5F1F" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#FF5F1F', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="floating-pill-input">
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload File (Excel, CSV, PDF, Word, Images, Invoices)"
              style={{ color: '#FF5F1F' }}
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder={activeMode ? `Type for ${activeMode.name}...` : "Ask tigerX anything..."}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
            />

            <button
              type="button"
              className="action-icon-btn"
              onClick={toggleVoiceInput}
              title={isListening ? "Listening..." : "Voice Input"}
              style={{ color: isListening ? '#FF5F1F' : '#64748B' }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              type="button"
              className="send-btn-pill"
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachedFiles.length === 0) || isGenerating}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
