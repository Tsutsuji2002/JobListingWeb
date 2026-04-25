import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (hubUrl, onReceiveMessage, onMessagesRead, onTyping) => {
  const connectionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token'),
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryAttempt) => {
          return Math.min(1000 * Math.pow(2, retryAttempt), 30000);
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => {
        console.log('SignalR Connected');
        setIsConnected(true);
        setConnectionId(connection.connectionId);
      })
      .catch((err) => {
        console.error('SignalR Connection Error:', err);
        setIsConnected(false);
      });

    connection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log('SignalR Disconnected');
      setIsConnected(false);
    });

    connection.on('ReceiveMessage', (data) => {
      console.log('Message received:', data);
      if (onReceiveMessage) {
        onReceiveMessage(data);
      }
    });

    connection.on('MessagesMarkedAsRead', (data) => {
      console.log('Messages marked as read:', data);
      if (onMessagesRead) {
        onMessagesRead(data);
      }
    });

    connection.on('UserTyping', (data) => {
      console.log('User typing:', data);
      if (onTyping) {
        onTyping(data);
      }
    });

    connection.on('UserOnline', (data) => {
      console.log('User online:', data);
    });

    connection.on('UserOffline', (data) => {
      console.log('User offline:', data);
    });

    connection.on('UserJoinedRoom', (data) => {
      console.log('User joined room:', data);
    });

    connection.on('UserLeftRoom', (data) => {
      console.log('User left room:', data);
    });

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch((err) => console.error('Error stopping connection:', err));
      }
    };
  }, [hubUrl]);

  const joinRoom = async (roomId) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('JoinRoom', roomId);
        console.log(`Joined room: ${roomId}`);
      } catch (err) {
        console.error('Error joining room:', err);
      }
    }
  };

  const leaveRoom = async (roomId) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('LeaveRoom', roomId);
        console.log(`Left room: ${roomId}`);
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }
  };

  const sendMessage = async (roomId, message) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('SendMessage', roomId, message);
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    }
  };

  const markAsRead = async (roomId) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('MarkMessagesAsRead', roomId);
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const sendTyping = async (roomId, isTyping) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('SendTyping', roomId, isTyping);
      } catch (err) {
        console.error('Error sending typing:', err);
      }
    }
  };

  const getOnlineUsers = async (roomId) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('GetOnlineUsers', roomId);
      } catch (err) {
        console.error('Error getting online users:', err);
      }
    }
  };

  return {
    connection: connectionRef.current,
    isConnected,
    connectionId,
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    sendTyping,
    getOnlineUsers
  };
};
