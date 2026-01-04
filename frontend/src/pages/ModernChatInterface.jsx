import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RenameChatModal from "../components/RenameChatModal";
import DeleteChatModal from "../components/DeleteChatModal";
import "../css/Chat.css";
import "../css/Markdown.css";
import { useTranslation } from 'react-i18next';

// Markdown components configuration
const markdownComponents = {
  h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
  p: ({ children }) => <p className="markdown-p">{children}</p>,
  ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
  ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
  li: ({ children }) => <li className="markdown-li">{children}</li>,
  code: ({ inline, children }) =>
    inline ?
      <code className="markdown-inline-code">{children}</code> :
      <code className="markdown-code-block">{children}</code>,
  pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
  strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
  em: ({ children }) => <em className="markdown-em">{children}</em>,
  a: ({ href, children }) => <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">{children}</a>,
  table: ({ children }) => <table className="markdown-table">{children}</table>,
  thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
  tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
  tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
  th: ({ children }) => <th className="markdown-th">{children}</th>,
  td: ({ children }) => <td className="markdown-td">{children}</td>,
};


// Modern Chat Interface Component
function ModernChatInterface({ onBack }) {
  const [chats, setChats] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renameModal, setRenameModal] = useState({ open: false, session_id: null, title: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, session_id: null });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);
  const { t } = useTranslation('chat');


  // Auto-resize textarea function for 3-line display with expand functionality
  const autoResizeTextarea = (textarea) => {
    const normalMaxHeight = 66; // Max height for 3 lines (22px * 3)
    const expandedMaxHeight = window.innerHeight * 0.4; // 40% of viewport height for expanded mode

    const maxHeight = isExpanded ? expandedMaxHeight : normalMaxHeight;
    const shouldShowExpandButton = textarea.scrollHeight > normalMaxHeight;

    setShowExpandButton(shouldShowExpandButton && !isExpanded);
  };

  // Handle input change with auto-resize
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  };

  // Handle composition events for IME (Input Method Editor) support
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Handle key down with IME support
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle expand/collapse textarea
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      if (textareaRef.current) {
        autoResizeTextarea(textareaRef.current);
      }
    }, 0);
  };

  // Reset expand state when sending message
  const resetExpandState = () => {
    setIsExpanded(false);
    setShowExpandButton(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Load chat sessions
  const fetchChats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data.sort((a, b) => b.last_update - a.last_update));
      }
    } catch (e) {
      console.error("Failed to fetch chats:", e);
    }
  };

  // Load messages for current session
  const fetchMessages = async (session_id) => {
    if (!session_id) return setMessages([]);
    try {
      const res = await fetch(`http://localhost:8000/api/chats/${session_id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (currentId) fetchMessages(currentId);
    else setMessages([]);
  }, [currentId]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMsg = { role: "user", content: input, timestamp: Date.now() / 1000 };
    let session_id = currentId;
    let newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");
    resetExpandState(); // Reset expand state when sending message

    try {
      // Create new session if needed
      if (!session_id) {
        const res = await fetch("http://localhost:8000/api/chats", { method: "POST" });
        const data = await res.json();
        session_id = data.session_id;
        setCurrentId(session_id);
        await fetchChats();
      }

      // Send to AI
      const res = await fetch("http://localhost:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput, session_id }),
      });

      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.answer, timestamp: Date.now() / 1000 };
      newMessages = [...newMessages, aiMsg];
      setMessages(newMessages);
      setCurrentId(data.session_id || session_id);
      await fetchChats();
    } catch (e) {
      console.error("Failed to send message:", e);
      setMessages([...newMessages, {
        role: "assistant",
        content: t('errorMessage'),
        timestamp: Date.now() / 1000
      }]);
    }
    setLoading(false);
  };

  // Create new chat
  const newChat = () => {
    setCurrentId(null);
    setMessages([]);
    setInput("");
  };

  // Select chat session
  const selectChat = (session_id) => {
    setCurrentId(session_id);
  };

  // Rename chat session
  const renameChat = async () => {
    if (!renameModal.title.trim()) return;
    try {
      await fetch(`http://localhost:8000/api/chats/${renameModal.session_id}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameModal.title })
      });
      setRenameModal({ open: false, session_id: null, title: "" });
      await fetchChats();
    } catch (e) {
      console.error("Failed to rename chat:", e);
    }
  };

  // Delete chat session
  const deleteChat = async (session_id) => {
    try {
      await fetch(`http://localhost:8000/api/chats/${session_id}`, { method: "DELETE" });
      if (session_id === currentId) {
        setCurrentId(null);
        setMessages([]);
      }
      setDeleteModal({ open: false, session_id: null });
      await fetchChats();
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  };

  // Open rename modal
  const openRenameModal = (session_id, currentTitle) => {
    setRenameModal({ open: true, session_id, title: currentTitle || "" });
  };

  // Open delete confirmation modal
  const openDeleteModal = (session_id) => {
    setDeleteModal({ open: true, session_id });
  };

  return (
    <div className="modern-chat-container">
      {/* Modern Chat Header */}
      <div className="modern-chat-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={t('header.toggleSidebar')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="chat-title">
            <h1>{t('header.title')}</h1>
            <span className="chat-subtitle">{t('header.subtitle')}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="new-chat-btn" onClick={newChat} title={t('header.newChat')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('header.newChat')}
          </button>
          <button className="back-btn" onClick={onBack} title={t('header.homeTitle')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            {t('header.home')}
          </button>
        </div>
      </div>

      <div className="modern-chat-body">
        {/* Modern Sidebar */}
        <div className={`modern-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <div className="sidebar-section">
              <h3>{t('sidebar.title')}</h3>
              <div className="chat-list">
                {chats.length === 0 ? (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>{t('sidebar.empty.message')}</p>
                    <span>{t('sidebar.empty.prompt')}</span>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div
                      key={chat.session_id}
                      className={`chat-item ${chat.session_id === currentId ? 'active' : ''}`}
                      onClick={() => selectChat(chat.session_id)}
                    >
                      <div className="chat-item-content">
                        <div className="chat-item-title">
                          {chat.title || t('sidebar.defaultTitle')}
                        </div>
                        <div className="chat-item-time">
                          {new Date(chat.last_update * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="chat-item-actions">
                        <button
                          className="rename-chat-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameModal(chat.session_id, chat.title);
                          }}
                          title={t('sidebar.renameTitle')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="delete-chat-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(chat.session_id);
                          }}
                          title={t('sidebar.deleteTitle')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="modern-chat-main">
          <div className="chat-messages">
            {messages.length === 0 && !loading ? (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <div className="welcome-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <h2>{t('welcome.title')}</h2>
                  <p>{t('welcome.message')}</p>
                  <div className="suggestion-chips">
                    <button
                      className="suggestion-chip"
                      onClick={() => setInput(t('welcome.suggestions.topicsPrompt'))}
                    >
                      {t('welcome.suggestions.topics')}
                    </button>
                    <button
                      className="suggestion-chip"
                      onClick={() => setInput(t('welcome.suggestions.planningPrompt'))}
                    >
                      {t('welcome.suggestions.planning')}
                    </button>
                    <button
                      className="suggestion-chip"
                      onClick={() => setInput(t('welcome.suggestions.techniquesPrompt'))}
                    >
                      {t('welcome.suggestions.techniques')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div className="message-time">
                        {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant">
                    <div className="message-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modern Input Area */}
          <div className="modern-input-area">
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder={t('input.placeholder')}
                  disabled={loading}
                  rows="1"
                />
                {/* Expand Button - shows when content exceeds 3 lines */}
                {showExpandButton && (
                  <button
                    className="expand-button"
                    onClick={toggleExpand}
                    title={isExpanded ? t('input.collapse') : t('input.expand')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isExpanded ? (
                        // Collapse icon
                        <path d="M8 12l4-4 4 4M8 16l4-4 4 4" />
                      ) : (
                        // Expand icon
                        <path d="M8 18l4 4 4-4M8 6l4-4 4 4" />
                      )}
                    </svg>
                  </button>
                )}
                <button
                  className="send-button"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  title={t('input.send')}
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22,2 15,22 11,13 2,9 22,2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals are now imported components */}
      <RenameChatModal
        renameModal={renameModal}
        setRenameModal={setRenameModal}
        renameChat={renameChat}
      />

      <DeleteChatModal
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        deleteChat={deleteChat}
      />
    </div>
  );
}

export default ModernChatInterface;