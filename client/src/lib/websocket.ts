import { useState, useEffect, useCallback, useRef } from 'react';

// WebSocket client singleton
let wsInstance: WebSocket | null = null;
let wsListeners: Map<string, Set<(data: any) => void>> = new Map();

export type WebSocketMessage = {
  type: string;
  payload?: any;
};

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  if (wsInstance && wsInstance.readyState <= 1) {
    return wsInstance; // Return existing connection if open or connecting
  }

  const wsUrl = 'ws://localhost:5000';
  wsInstance = new WebSocket(wsUrl);

  wsInstance.onopen = () => {
    console.log('WebSocket connection established');
  };

  wsInstance.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      const { type, payload } = message;
      
      // Notify all listeners for this message type
      if (wsListeners.has(type)) {
        wsListeners.get(type)?.forEach(listener => listener(payload));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  wsInstance.onclose = () => {
    console.log('WebSocket connection closed');
    wsInstance = null;
  };

  wsInstance.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return wsInstance;
};

// Send a message through WebSocket
export const sendWebSocketMessage = (type: string, payload?: any) => {
  if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) {
    initializeWebSocket();
    
    // Queue the message to be sent when connection is established
    setTimeout(() => sendWebSocketMessage(type, payload), 1000);
    return;
  }

  const message: WebSocketMessage = { type, payload };
  wsInstance.send(JSON.stringify(message));
};

// Subscribe to a specific message type
export const subscribeToWebSocketEvent = (type: string, callback: (data: any) => void) => {
  if (!wsListeners.has(type)) {
    wsListeners.set(type, new Set());
  }
  
  wsListeners.get(type)?.add(callback);
  
  return () => {
    const listeners = wsListeners.get(type);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        wsListeners.delete(type);
      }
    }
  };
};

// React hook for using WebSocket in components
export const useWebSocket = (messageType: string) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Handle connection status changes
  useEffect(() => {
    const ws = initializeWebSocket();
    
    const handleOpen = () => setIsConnected(true);
    const handleClose = () => {
      setIsConnected(false);
      
      // Attempt to reconnect after a delay
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = window.setTimeout(initializeWebSocket, 3000);
    };
    
    ws.addEventListener('open', handleOpen);
    ws.addEventListener('close', handleClose);
    
    // Set initial connection state
    setIsConnected(ws.readyState === WebSocket.OPEN);
    
    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  // Subscribe to specific message type
  useEffect(() => {
    const handleMessage = (payload: any) => {
      setData(payload);
    };
    
    const unsubscribe = subscribeToWebSocketEvent(messageType, handleMessage);
    return unsubscribe;
  }, [messageType]);

  // Send message function
  const sendMessage = useCallback((payload?: any) => {
    sendWebSocketMessage(messageType, payload);
  }, [messageType]);

  return { data, isConnected, sendMessage };
}; 