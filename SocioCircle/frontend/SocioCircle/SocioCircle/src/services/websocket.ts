import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL, STORAGE_KEYS } from '../config/constants';
import type { ChatMessage } from '../types';

let stompClient: Client | null = null;

export const connectWebSocket = (
  sessionId: number,
  onMessage: (message: ChatMessage) => void,
  onConnect: () => void,
  onError: (error: any) => void
): Client => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  if (stompClient && stompClient.connected) {
    return stompClient;
  }

  const socket = new SockJS(`${WS_BASE_URL}`);
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log('WebSocket connected:', frame);
      
      // Subscribe to session messages
      stompClient?.subscribe(`/topic/session/${sessionId}`, (message: IMessage) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          onMessage(chatMessage);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      onConnect();
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
      onError(frame);
    },
    onWebSocketError: (event) => {
      console.error('WebSocket error:', event);
      onError(event);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const sendMessage = (sessionId: number, content: string) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/${sessionId}`,
      body: JSON.stringify({ content }),
    });
  } else {
    console.error('WebSocket not connected');
  }
};

export const isConnected = (): boolean => {
  return stompClient?.connected || false;
};
