import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoArrowBack, IoSend, IoVideocamOutline, IoCallOutline, IoInformationCircleOutline } from 'react-icons/io5';
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

export const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);

  const {
    messages,
    addMessage,
    setMessages,
    setConnected,
  } = useChatStore();

  const sessionMessages = sessionId ? messages[Number(sessionId)] || [] : [];

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => apiService.getChatMessages(Number(sessionId!)),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(Number(sessionId!), [...messagesData.content].reverse()); // Reverse to show oldest first if paginated from top
    }
  }, [messagesData, sessionId, setMessages]);

  useEffect(() => {
    if (!sessionId || !currentUser) return;

    setIsConnecting(true);

    const handleMessage = (chatMessage: ChatMessage) => {
      addMessage(Number(sessionId), chatMessage);
      scrollToBottom();
    };

    const handleConnect = () => {
      setIsConnecting(false);
      setConnected(true);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
      setConnected(false);
      toast.error('Failed to connect to chat');
    };

    connectWebSocket(Number(sessionId), handleMessage, handleConnect, handleError);

    return () => {
      disconnectWebSocket();
      setConnected(false);
    };
  }, [sessionId, currentUser, addMessage, setConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !sessionId || !isConnected()) {
      if (!isConnected()) {
        toast.error('Not connected to chat');
      }
      return;
    }

    sendMessage(Number(sessionId), message);
    setMessage('');
  };

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Spinner size="lg" className="text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                  JS
                </div>
                {isConnected() && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#121212] rounded-full" />
                )}
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  Live Jam
                </h1>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isConnecting ? 'Connecting...' : isConnected() ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <IoCallOutline className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <IoVideocamOutline className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <IoInformationCircleOutline className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
        {sessionMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-gray-900 dark:text-white font-semibold">Wave to say hello!</p>
            <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sessionMessages.map((msg, index) => {
              const isOwnMessage = msg.userEmail === currentUser?.email;
              const showAvatar = !isOwnMessage && (index === sessionMessages.length - 1 || sessionMessages[index + 1]?.userEmail !== msg.userEmail);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  key={msg.id}
                  className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end`}
                >
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar
                        src={msg.userProfilePicture}
                        alt={msg.userName}
                        size="sm"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                  
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!isOwnMessage && showAvatar && (
                      <span className="text-xs text-gray-500 ml-1 mb-1">{msg.userName}</span>
                    )}
                    <div
                      className={`relative px-4 py-2.5 text-[0.95rem] leading-relaxed shadow-sm ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1 px-1">
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-white/5 p-4 z-20">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full border border-transparent focus-within:border-violet-500/50 focus-within:bg-white dark:focus-within:bg-[#1a1a1a] transition-all flex items-center px-4 py-1.5 shadow-inner">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 py-2 outline-none"
              disabled={!isConnected()}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !isConnected()}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-90 shadow-md"
          >
            <IoSend className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
