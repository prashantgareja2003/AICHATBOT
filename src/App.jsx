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
  Code,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TigerMascot } from './components/TigerMascot';
import { DataChart } from './components/DataChart';
import { DevToolsModal } from './components/DevToolsModal';
import { parseUploadedFile, extractChartDataFromResponse } from './utils/fileParser';
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

  // Handle File Uploads (Excel, CSV, PDF, Word, TXT, Images)
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

    // Combine user prompt with attached file contents
    let fullPromptText = query;
    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => `📁 [ATTACHED FILE: ${f.name}]\n${f.contentPreview}`).join('\n\n');
      fullPromptText = `${query ? query + '\n\n' : ''}${fileContext}`;
    }

    const displayUserText = query || `Uploaded ${attachedFiles.length} file(s): ${attachedFiles.map(f => f.name).join(', ')}`;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: displayUserText,
      fullPromptText: fullPromptText,
      attachedFilesCount: attachedFiles.length,
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
          setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: `⚠️ **TigerX Error**: ${err.message || 'Failed to reach Groq API.'}` } : msg));
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

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([]);
      localStorage.removeItem('tigerx_chat_history');
    }
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
      particleCount: 45,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#FF5F1F', '#FF8C42', '#38BDF8', '#FFFFFF']
    });
  };

  return (
    <div className="app-container">
      {/* Dev Tools Modal Popup */}
      <DevToolsModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSelectPrompt={(prompt) => {
          setInput(prompt);
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
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

      {/* Navbar */}
      <header className="tiger-header">
        <div className="header-brand">
          <div className="brand-avatar" onClick={triggerRoar} style={{ cursor: 'pointer' }} title="Click for Tiger Sparkle!">
            <TigerMascot size={32} interactive={false} />
          </div>
          <div className="header-title-group">
            <h1>TigerX AI</h1>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Ready to assist you</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Dev Tools Button */}
          <button
            className="icon-btn-header"
            onClick={() => setShowDevModal(true)}
            title="Developer Power Tools (SQL, Invoice OCR, Code Gen)"
          >
            <Zap size={17} color="#FF5F1F" />
          </button>

          {/* Theme Toggle */}
          <button
            className="icon-btn-header"
            onClick={toggleTheme}
            title={theme === 'light' ? "Switch to Dark Tiger Glass Mode" : "Switch to Light Smoke White Mode"}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Clear Chat */}
          <button
            className="icon-btn-header"
            onClick={clearChat}
            disabled={messages.length === 0}
            title="Clear Chat History"
          >
            <Trash2 size={17} />
          </button>
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

            <h2>Hello! I'm TigerX 🐅</h2>
            <p style={{ margin: 0 }}>
              Upload files (Excel, CSV, PDF, Invoices) or ask for SQL, Code, Charts & Analysis!
            </p>
          </div>
        ) : (
          /* Message List */
          <div className="messages-container">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const chartData = !isUser ? extractChartDataFromResponse(msg.text) : null;
              const cleanText = !isUser && chartData ? msg.text.replace(/```json\s*chart[\s\S]*?```/gi, '').trim() : msg.text;

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
                      {cleanText ? (
                        <div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{cleanText}</div>

                          {/* Render Dynamic Chart if AI generated chart data */}
                          {chartData && <DataChart chartData={chartData} />}

                          <div className="message-meta">
                            <span>{msg.timestamp || 'Just now'}</span>
                            {isUser ? (
                              <span className="blue-tick" title="Seen by TigerX AI">
                                <CheckCheck size={15} color="#38BDF8" />
                              </span>
                            ) : (
                              <span className="blue-tick" title="Delivered">
                                <Check size={14} color="#64748B" />
                              </span>
                            )}
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

        {/* Floating Bottom Input Pill */}
        <div className="input-dock">
          {/* Attached Files Preview Bar */}
          {attachedFiles.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
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
            {/* File Attachment Button */}
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
              placeholder="Ask TigerX or upload files (Excel, CSV, PDF, Invoices)..."
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
            />

            {/* Mic Dictation */}
            <button
              type="button"
              className="action-icon-btn"
              onClick={toggleVoiceInput}
              title={isListening ? "Listening..." : "Voice Input"}
              style={{ color: isListening ? '#FF5F1F' : '#64748B' }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
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
