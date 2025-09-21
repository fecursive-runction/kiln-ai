import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { 
  Send, 
  Robot, 
  Person, 
  TrashFill, 
  Circle,
  Lightning,
  Cpu,
  Mic,
  Paperclip
} from 'react-bootstrap-icons';
import { postChatMessage } from '../services/api';
import { getHistory, addChatMessage, ChatMessage } from '../services/websocket';

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(getHistory().chatMessages);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentInput]);

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput.trim(),
      timestamp: new Date(),
    };

    addChatMessage(newUserMessage);
    setMessages([...getHistory().chatMessages]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      const response = await postChatMessage(newUserMessage.content);
      const aiReply = response.data.reply;

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date(),
      };

      addChatMessage(newAiMessage);
      setMessages([...getHistory().chatMessages]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm experiencing connectivity issues with my neural networks. Please verify the backend services are operational.",
        timestamp: new Date(),
      };
      addChatMessage(errorMessage);
      setMessages([...getHistory().chatMessages]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([getHistory().chatMessages[0]]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const quickPrompts = [
    "Analyze current plant efficiency",
    "Suggest optimization strategies",
    "Check system alerts",
    "Review performance metrics"
  ];

  return (
    <div className="chatbot-container">
      {/* Page Header */}
      <div className="chatbot-header mt-4">
        <div className="header-content">
          <h1 className="page-title">PLantGPT</h1>
          <p className="page-subtitle">Intelligent co-pilot for plant optimization and analysis</p>
        </div>
        
        <div className="ai-status">
          <div className="status-indicator online">
            <Circle size={8} />
            <span>AI Online</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-interface">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-info">
            <div className="ai-avatar">
              <Cpu size={20} />
              <div className="avatar-glow"></div>
            </div>
            <div className="ai-details">
              <h5 className="ai-name">PlantGPT</h5>
              <div className="ai-status-text">
                <div className="pulse-dot"></div>
                <span>Active & Learning</span>
              </div>
            </div>
          </div>
          
          <div className="chat-actions">
            <Button 
              variant="outline-danger" 
              className="clear-btn"
              onClick={handleClearHistory}
            >
              <TrashFill size={14} />
              <span className="d-none d-sm-inline">Clear Chat</span>
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <Robot size={48} />
                <div className="icon-glow"></div>
              </div>
              <h3 className="welcome-title">Welcome to AI Assistant</h3>
              <p className="welcome-description">
                I'm here to help you optimize plant operations, analyze performance data, 
                and provide intelligent insights.
              </p>
              
              <div className="quick-prompts">
                <p className="prompts-label">Try asking:</p>
                <div className="prompt-buttons">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="prompt-btn"
                      onClick={() => setCurrentInput(prompt)}
                    >
                      <Lightning size={14} />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className="message-content">
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <Person size={16} />
                  ) : (
                    <Robot size={16} />
                  )}
                </div>
                
                <div className="message-bubble">
                  <div className="message-text">
                    {msg.content}
                  </div>
                  <div className="message-time">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message-content">
                <div className="message-avatar">
                  <Robot size={16} />
                </div>
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <div className="typing-text">AI is thinking...</div>
                </div>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <div className="input-tools">
              <Button variant="ghost" className="tool-btn" disabled>
                <Paperclip size={16} />
              </Button>
            </div>
            
            <div className="input-field">
              <Form.Control
                ref={textareaRef}
                as="textarea"
                placeholder="Ask about plant operations, request analysis, or seek optimization advice..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="message-input"
                rows={1}
                disabled={isTyping}
              />
            </div>
            
            <div className="input-actions">
              <Button 
                variant="ghost" 
                className="tool-btn" 
                disabled
              >
                <Mic size={16} />
              </Button>
              
              <Button 
                variant="primary" 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isTyping || !currentInput.trim()}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          
          <div className="input-footer">
            <p className="disclaimer">
              AI responses are generated based on plant data and may require verification for critical decisions.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .chatbot-container {
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          color: var(--text-primary);
        }

        /* ===== PAGE HEADER ===== */
        .chatbot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .header-content {
          flex: 1;
        }

        .page-title {
          font-size: 32px;
          font-weight: 300;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.8px;
        }

        .page-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator.online {
          background: rgba(0, 255, 136, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(0, 255, 136, 0.2);
        }

        /* ===== CHAT INTERFACE ===== */
        .chat-interface {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%);
          border-bottom: 1px solid var(--border-primary);
        }

        .chat-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ai-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-primary);
          box-shadow: var(--shadow-glow);
        }

        .avatar-glow {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: conic-gradient(var(--accent-primary), var(--accent-secondary), var(--accent-primary));
          border-radius: 50%;
          z-index: -1;
          opacity: 0.3;
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .ai-details {
          display: flex;
          flex-direction: column;
        }

        .ai-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .ai-status-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 12px;
          color: var(--accent-primary);
          margin-top: 2px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .clear-btn {
          background: transparent !important;
          border: 1px solid rgba(255, 71, 87, 0.3) !important;
          color: var(--accent-error) !important;
          padding: 0.5rem 0.875rem !important;
          border-radius: var(--radius-md) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: all var(--transition-fast) !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .clear-btn:hover {
          background: rgba(255, 71, 87, 0.1) !important;
          border-color: var(--accent-error) !important;
          transform: translateY(-1px);
        }

        /* ===== MESSAGES CONTAINER ===== */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: var(--bg-primary);
          background-image: radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.02) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(0, 255, 136, 0.02) 0%, transparent 50%);
        }

        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          padding: 2rem;
        }

        .welcome-icon {
          position: relative;
          margin-bottom: 2rem;
        }

        .welcome-icon .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .welcome-description {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 500px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .quick-prompts {
          width: 100%;
          max-width: 600px;
        }

        .prompts-label {
          font-size: 14px;
          color: var(--text-tertiary);
          margin-bottom: 1rem;
          text-align: left;
        }

        .prompt-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.75rem;
        }

        .prompt-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .prompt-btn:hover {
          background: var(--bg-hover);
          border-color: var(--accent-primary);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        /* ===== MESSAGE STYLES ===== */
        .message-wrapper {
          margin-bottom: 1.5rem;
          display: flex;
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-wrapper.assistant {
          justify-content: flex-start;
        }

        .message-content {
          display: flex;
          align-items: flex-start;
          max-width: 80%;
          gap: 0.75rem;
        }

        .message-wrapper.user .message-content {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .message-wrapper.user .message-avatar {
          background: var(--accent-primary);
          color: var(--bg-primary);
        }

        .message-wrapper.assistant .message-avatar {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-secondary);
          color: var(--accent-primary);
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          position: relative;
          word-wrap: break-word;
        }

        .message-wrapper.user .message-bubble {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: var(--bg-primary);
        }

        .message-wrapper.assistant .message-bubble {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .message-bubble.typing {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-secondary);
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          margin-bottom: 0.5rem;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          font-family: var(--font-primary);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          margin-bottom: 0.5rem;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: typing 1.4s ease-in-out infinite both;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.2); opacity: 1; }
        }

        .typing-text {
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        /* ===== INPUT AREA ===== */
        .input-area {
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-primary);
          padding: 1rem;
        }

        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 0.75rem;
          transition: border-color var(--transition-fast);
        }

        .input-container:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
        }

        .input-tools {
          display: flex;
          align-items: center;
        }

        .input-field {
          flex: 1;
        }

        .message-input {
          background: transparent !important;
          border: none !important;
          color: var(--text-primary) !important;
          font-size: 14px !important;
          resize: none !important;
          min-height: 20px !important;
          max-height: 120px !important;
          padding: 0 !important;
          line-height: 1.5 !important;
        }

        .message-input:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .message-input::placeholder {
          color: var(--text-tertiary) !important;
        }

        .input-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tool-btn {
          background: transparent !important;
          border: none !important;
          color: var(--text-tertiary) !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: var(--radius-md) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all var(--transition-fast) !important;
        }

        .tool-btn:hover:not(:disabled) {
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }

        .send-btn {
          background: var(--accent-primary) !important;
          border: 1px solid var(--accent-primary) !important;
          color: var(--bg-primary) !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: var(--radius-md) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all var(--transition-fast) !important;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--accent-secondary) !important;
          border-color: var(--accent-secondary) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-footer {
          margin-top: 0.75rem;
          text-align: center;
        }

        .disclaimer {
          font-size: 11px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.4;
        }

        /* ===== SCROLLBAR ===== */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: var(--accent-primary);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 991.98px) {
          .chatbot-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .message-content {
            max-width: 90%;
          }

          .prompt-buttons {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767.98px) {
          .page-title {
            font-size: 28px;
          }

          .chat-header {
            padding: 1rem;
          }

          .messages-container {
            padding: 1rem;
          }

          .input-area {
            padding: 0.75rem;
          }

          .message-content {
            max-width: 95%;
          }

          .welcome-screen {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotPage;