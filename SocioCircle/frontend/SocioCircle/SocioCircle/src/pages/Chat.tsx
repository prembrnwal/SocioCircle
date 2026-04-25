import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoArrowBack, IoSend, IoVideocamOutline, IoInformationCircleOutline, IoEllipsisHorizontal } from 'react-icons/io5';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Loading';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { connectWebSocket, disconnectWebSocket, sendMessage, isConnected } from '../services/websocket';
import type { ChatMessage } from '../types';
import { toast } from 'react-toastify';

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2 items-end px-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600/30 to-fuchsia-500/30 flex-shrink-0" />
    <div className="bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ── Connection status badge ───────────────────────────────────────────────────
const ConnectionBadge = ({ connected, connecting }: { connected: boolean; connecting: boolean }) => {
  const label = connecting ? 'Connecting...' : connected ? 'Live' : 'Disconnected';
  const color  = connecting ? 'bg-yellow-500' : connected ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1.5">
      <motion.span
        className={`w-2 h-2 rounded-full ${color}`}
        animate={connected && !connecting ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [showTyping, setShowTyping] = useState(false);

  const { messages, addMessage, setMessages, setConnected } = useChatStore();
  const sessionMessages = sessionId ? messages[Number(sessionId)] || [] : [];

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => apiService.getChatMessages(Number(sessionId!)),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(Number(sessionId!), [...messagesData.content].reverse());
    }
  }, [messagesData, sessionId, setMessages]);

  useEffect(() => {
    if (!sessionId || !currentUser) return;
    setIsConnecting(true);

    const handleMessage = (chatMessage: ChatMessage) => {
      addMessage(Number(sessionId), chatMessage);
      scrollToBottom();
    };
    const handleConnect = () => { setIsConnecting(false); setConnected(true); };
    const handleError = () => { setIsConnecting(false); setConnected(false); toast.error('Failed to connect to chat'); };

    connectWebSocket(Number(sessionId), handleMessage, handleConnect, handleError);
    return () => { disconnectWebSocket(); setConnected(false); };
  }, [sessionId, currentUser, addMessage, setConnected]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [sessionMessages]);

  // Simulate typing indicator when user is actively typing
  useEffect(() => {
    if (message.length > 0) {
      setShowTyping(false);
    }
  }, [message]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !sessionId || !isConnected()) {
      if (!isConnected()) toast.error('Not connected to chat');
      return;
    }
    sendMessage(Number(sessionId), message);
    setMessage('');
    inputRef.current?.focus();
  };

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Spinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  const connected = isConnected();

  return (
    <div className="relative flex flex-col h-[100dvh] bg-gray-50/50 dark:bg-[#050505] w-full overflow-hidden selection:bg-violet-500/30">
      {/* ── Background Flair ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-fuchsia-500 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-violet-600 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative flex flex-col h-full max-w-4xl mx-auto w-full bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-x border-gray-200/50 dark:border-white/5 shadow-2xl z-10">
        
        {/* ── Header ── */}
        <div className="flex-shrink-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
              aria-label="Go back"
            >
              <IoArrowBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-lg shadow-violet-500/40 transform transition-transform group-hover:scale-105">
                JS
              </div>
              {connected && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-white dark:border-[#0a0a0a] rounded-full shadow-sm" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 leading-tight mb-0.5">
                Live Jam Chat
              </h1>
              <ConnectionBadge connected={connected} connecting={isConnecting} />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              title="Group Video Call (Coming Soon)"
              onClick={() => toast.info('Group Video Call coming in a future update!')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 rounded-2xl transition-all text-sm font-bold border border-fuchsia-100/50 dark:border-fuchsia-500/20 hover:scale-105 active:scale-95"
            >
              <IoVideocamOutline className="w-5 h-5" />
              Video
            </button>
            <button
              aria-label="Session info"
              className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <IoInformationCircleOutline className="w-6 h-6" />
            </button>
            <button aria-label="More options" className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95">
              <IoEllipsisHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 custom-scrollbar">
          {sessionMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center h-full opacity-80 text-center"
            >
              <div className="w-28 h-28 mb-6 rounded-full bg-gradient-to-tr from-violet-600/10 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center shadow-2xl shadow-violet-500/10">
                <span className="text-5xl drop-shadow-md">👋</span>
              </div>
              <p className="text-gray-900 dark:text-white font-extrabold text-2xl mb-2 tracking-tight">Start the vibe</p>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-xs font-medium">Be the first to break the ice and drop a message below.</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {sessionMessages.map((msg, index) => {
                const isOwn = msg.userEmail === currentUser?.email;
                const showSender = !isOwn && (
                  index === 0 || sessionMessages[index - 1]?.userEmail !== msg.userEmail
                );
                const isGrouped = !isOwn && index > 0 && sessionMessages[index - 1]?.userEmail === msg.userEmail;

                return (
                  <motion.div
                    key={msg.id ?? `${msg.userEmail}-${index}`}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end ${isGrouped ? 'mt-1.5' : 'mt-5'}`}
                  >
                    {/* Avatar placeholder for alignment */}
                    <div className={`w-9 flex-shrink-0 ${isOwn ? 'hidden' : ''}`}>
                      {showSender && !isGrouped ? (
                        <Avatar
                          src={msg.userProfilePicture}
                          alt={msg.userName}
                          size="sm"
                          className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-[#121212] shadow-sm"
                        />
                      ) : !isOwn ? (
                        <div className="w-9" />
                      ) : null}
                    </div>

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[70%]`}>
                      {showSender && !isGrouped && !isOwn && (
                        <span className="text-[0.8rem] font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                          {msg.userName}
                        </span>
                      )}
                      <div
                        className={`px-5 py-3 text-[0.95rem] leading-relaxed shadow-sm ${
                          isOwn
                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-[1.5rem] rounded-br-sm shadow-lg shadow-violet-500/25'
                            : 'bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-gray-100 rounded-[1.5rem] rounded-bl-sm border border-gray-100 dark:border-white/5 shadow-md shadow-gray-200/40 dark:shadow-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <span className={`text-[0.65rem] font-medium text-gray-400 dark:text-gray-500 mt-1.5 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {showTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mt-4"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* ── Input Bar ── */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-[#050505] dark:via-[#050505] dark:to-transparent z-20">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-end max-w-3xl mx-auto relative group">
            <div className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-none focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all flex items-center px-2 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={connected ? 'Type your message...' : 'Connecting...'}
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2.5 px-4 outline-none text-[0.95rem] font-medium"
                disabled={!connected}
                autoComplete="off"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!message.trim() || !connected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-500/30"
            >
              <IoSend className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};
