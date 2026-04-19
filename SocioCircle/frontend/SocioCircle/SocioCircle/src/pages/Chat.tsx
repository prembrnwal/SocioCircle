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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a] max-w-4xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-1 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/30">
                JS
              </div>
              {connected && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111] rounded-full" />
              )}
            </div>

            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Live Jam Chat</h1>
              <ConnectionBadge connected={connected} connecting={isConnecting} />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              title="Group Video Call (Coming Soon)"
              onClick={() => toast.info('Group Video Call coming in a future update!')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 rounded-full transition-all text-sm font-semibold"
            >
              <IoVideocamOutline className="w-5 h-5" />
              Video
            </button>
            <button
              aria-label="Session info"
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <IoInformationCircleOutline className="w-6 h-6" />
            </button>
            <button aria-label="More options" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <IoEllipsisHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {sessionMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full opacity-60 text-center"
          >
            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center">
              <span className="text-4xl">👋</span>
            </div>
            <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">Start the conversation</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hello!</p>
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
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end ${isGrouped ? 'mt-1' : 'mt-4'}`}
                >
                  {/* Avatar placeholder for alignment */}
                  <div className={`w-8 flex-shrink-0 ${isOwn ? 'hidden' : ''}`}>
                    {showSender && !isGrouped ? (
                      <Avatar
                        src={msg.userProfilePicture}
                        alt={msg.userName}
                        size="sm"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : !isOwn ? (
                      <div className="w-8" />
                    ) : null}
                  </div>

                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[65%]`}>
                    {showSender && !isGrouped && !isOwn && (
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">
                        {msg.userName}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 text-[0.93rem] leading-relaxed shadow-sm ${
                        isOwn
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-2xl rounded-tr-md shadow-md shadow-violet-500/20'
                          : 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-md border border-gray-100 dark:border-white/5'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* ── Input Bar ── */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 px-4 py-3 z-20">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
          <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full border border-transparent focus-within:border-violet-500/50 focus-within:bg-white dark:focus-within:bg-[#1a1a1a] transition-all flex items-center px-4 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={connected ? 'Message...' : 'Connecting...'}
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2 outline-none text-[0.95rem]"
              disabled={!connected}
              autoComplete="off"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!message.trim() || !connected}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-md shadow-violet-500/30"
          >
            <IoSend className="w-4 h-4 ml-0.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};
