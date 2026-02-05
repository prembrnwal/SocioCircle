import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoArrowBack, IoSend } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { apiService } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Loading';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { connectWebSocket, disconnectWebSocket, sendMessage, isConnected } from '../services/websocket';
import type { ChatMessage } from '../types';
import { ROUTES } from '../config/constants';
import { toast } from 'react-toastify';

export const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);

  const {
    messages,
    addMessage,
    setMessages,
    setConnected,
  } = useChatStore();

  const sessionMessages = sessionId ? messages[Number(sessionId)] || [] : [];

  // Load message history
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
      setMessages(Number(sessionId!), messagesData.content);
    }
  }, [messagesData, sessionId, setMessages]);

  // WebSocket connection
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

  // Auto-scroll to bottom
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Chat Session
          </h1>
          {isConnecting && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full"
      >
        {sessionMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessionMessages.map((msg) => {
              const isOwnMessage = msg.userEmail === currentUser?.email;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar
                    src={msg.userProfilePicture}
                    alt={msg.userName}
                    size="sm"
                  />
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {msg.userName}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected()}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected()}
            className="bg-primary text-white rounded-lg px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <IoSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
