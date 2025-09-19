import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createSimpleXMPPManager, type SimpleXMPPMessage, type SimpleXMPPManager } from '../lib/xmpp-simple';

interface XMPPContextType {
  isConnected: boolean;
  messages: SimpleXMPPMessage[];
  contacts: any[];
  sendMessage: (to: string, body: string) => Promise<void>;
  sendGroupMessage: (roomJid: string, body: string) => Promise<void>;
  connect: (username: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
  joinRoom: (roomJid: string, nickname: string) => Promise<void>;
  leaveRoom: (roomJid: string, nickname: string) => Promise<void>;
}

const XMPPContext = createContext<XMPPContextType>({
  isConnected: false,
  messages: [],
  contacts: [],
  sendMessage: async () => {},
  sendGroupMessage: async () => {},
  connect: async () => {},
  disconnect: async () => {},
  joinRoom: async () => {},
  leaveRoom: async () => {},
});

export const useXMPP = () => useContext(XMPPContext);

export const XMPPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<SimpleXMPPMessage[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const xmppManagerRef = useRef<SimpleXMPPManager | null>(null);

  useEffect(() => {
    // Set up message handler
    if (xmppManagerRef.current) {
      const unsubscribe = xmppManagerRef.current.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });

      const unsubscribeRoster = xmppManagerRef.current.onRoster((rosterContacts) => {
        setContacts(rosterContacts);
      });

      return () => {
        unsubscribe();
        unsubscribeRoster();
      };
    }
  }, []);

  const connect = async (username: string, password: string) => {
    try {
      const manager = createSimpleXMPPManager(username, password);
      xmppManagerRef.current = manager;

      await manager.authenticate(username, password);
      await manager.connect();

      setIsConnected(true);
      console.log('XMPP connected successfully');
    } catch (error) {
      console.error('XMPP connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (xmppManagerRef.current) {
      await xmppManagerRef.current.disconnect();
      xmppManagerRef.current = null;
    }
    setIsConnected(false);
    setMessages([]);
    setContacts([]);
  };

  const sendMessage = async (to: string, body: string) => {
    if (!xmppManagerRef.current) {
      throw new Error('XMPP not connected');
    }

    await xmppManagerRef.current.sendMessage(to, body);
  };

  const sendGroupMessage = async (roomJid: string, body: string) => {
    if (!xmppManagerRef.current) {
      throw new Error('XMPP not connected');
    }

    await xmppManagerRef.current.sendGroupMessage(roomJid, body);
  };

  const joinRoom = async (roomJid: string, nickname: string) => {
    if (!xmppManagerRef.current) {
      throw new Error('XMPP not connected');
    }

    await xmppManagerRef.current.joinRoom(roomJid, nickname);
  };

  const leaveRoom = async (roomJid: string, nickname: string) => {
    if (!xmppManagerRef.current) {
      throw new Error('XMPP not connected');
    }

    await xmppManagerRef.current.leaveRoom(roomJid, nickname);
  };

  return (
    <XMPPContext.Provider value={{ 
      isConnected, 
      messages, 
      contacts,
      sendMessage, 
      sendGroupMessage,
      connect,
      disconnect,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </XMPPContext.Provider>
  );
};