import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Users, Clock, CheckCircle } from 'lucide-react';
import type { User } from '@/user/UserContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'join' | 'leave';
}

interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  messages: ChatMessage[];
  lastActivity: string;
  isActive: boolean;
}

interface ChatSystemV2Props {
  /** 'general' | 'sos' | 'expert' */
  type?: 'general' | 'sos' | 'expert';

  /** Utilisateur connecté */
  user: User;

  /** Affiche ou masque le chat */
  isVisible: boolean;

  /** Callback déclenché au clic sur la croix de fermeture */
  onClose: () => void;

  /** Optionnel : données de l’expert en mode expert */
  expert?: { id: string; name: string };
}

const ChatSystemV2: React.FC<ChatSystemV2Props> = ({
  type: conversationType = 'general',
  user,
  isVisible,
  onClose,
  expert
}) => {
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<{ [key: string]: ChatRoom }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser les salles de chat selon le contexte
  useEffect(() => {
    let defaultRooms: { [key: string]: ChatRoom } = {};

    if (conversationType === 'expert' && expert) {
      defaultRooms = {
        expert: {
          id: 'expert',
          name: `💼 Chat avec ${expert.name}`,
          participants: [],
          messages: [
            {
              id: 'welcome',
              senderId: 'system',
              senderPseudo: 'Système',
              message: `Conversation privée avec ${expert.name}. Posez vos questions !`,
              timestamp: new Date().toISOString(),
              type: 'system'
            }
          ],
          lastActivity: new Date().toISOString(),
          isActive: true
        }
      };
      setActiveRoom('expert');

    } else if (conversationType === 'sos') {
      defaultRooms = {
        sos: {
          id: 'sos',
          name: '🆘 Chat d\'urgence',
          participants: [],
          messages: [
            {
              id: 'sos_welcome',
              senderId: 'system',
              senderPseudo: 'Système',
              message: 'Canal d\'urgence activé. Décrivez votre situation, les aidants vont vous répondre.',
              timestamp: new Date().toISOString(),
              type: 'system'
            }
          ],
          lastActivity: new Date().toISOString(),
          isActive: true
        }
      };
      setActiveRoom('sos');

    } else {
      defaultRooms = {
        general: {
          id: 'general',
          name: '💬 Discussion générale',
          participants: [],
          messages: [],
          lastActivity: new Date().toISOString(),
          isActive: true
        },
        sos: {
          id: 'sos',
          name: '🆘 Aide d\'urgence',
          participants: [],
          messages: [],
          lastActivity: new Date().toISOString(),
          isActive: true
        },
        travel: {
          id: 'travel',
          name: '✈️ Conseils voyage',
          participants: [],
          messages: [],
          lastActivity: new Date().toISOString(),
          isActive: true
        }
      };
    }

    // Charger depuis localStorage
    const savedRooms = localStorage.getItem(`chatRooms_${conversationType}`);
    if (savedRooms) {
      try {
        const parsed = JSON.parse(savedRooms);
        setChatRooms({ ...defaultRooms, ...parsed });
      } catch {
        setChatRooms(defaultRooms);
      }
    } else {
      setChatRooms(defaultRooms);
    }
  }, [conversationType, expert]);

  // Sauvegarder les salles de chat selon le contexte
  useEffect(() => {
    if (Object.keys(chatRooms).length > 0) {
      localStorage.setItem(`chatRooms_${conversationType}`, JSON.stringify(chatRooms));
    }
  }, [chatRooms, conversationType]);

  // Simuler la présence en ligne
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const activeUsers = users
        .slice(0, Math.min(5, users.length))
        .map((u: any) => u.pseudo);
      setOnlineUsers(activeUsers);
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatRooms, activeRoom]);

  if (!isVisible || !user) return null;
  const currentRoom = chatRooms[activeRoom];

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim() || !chatRooms[activeRoom]) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderPseudo: user.pseudo,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatRooms(prev => ({
      ...prev,
      [activeRoom]: {
        ...prev[activeRoom],
        messages: [...prev[activeRoom].messages, message],
        lastActivity: new Date().toISOString(),
        participants: prev[activeRoom].participants.includes(user.id)
          ? prev[activeRoom].participants
          : [...prev[activeRoom].participants, user.id]
      }
    }));

    // Notifications aux autres participants
    const room = chatRooms[activeRoom];
    if (room) {
      room.participants.forEach(participantId => {
        if (participantId !== user.id) {
          const key = `notifications_${participantId}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const newNotif = {
            id: `chat_notif_${Date.now()}`,
            type: 'chat_message',
            title: `Nouveau message dans ${room.name}`,
            message: `${user.pseudo}: ${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
            timestamp: new Date().toISOString(),
            userId: participantId,
            roomId: activeRoom,
            read: false
          };

          const updated = [newNotif, ...existing];
          localStorage.setItem(key, JSON.stringify(updated));
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(updated)
          }));
        }
      });
    }

    setNewMessage('');
  };

  // Rejoindre une salle
  const joinRoom = (roomId: string) => {
    if (!chatRooms[roomId]) return;

    setActiveRoom(roomId);
    setChatRooms(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        participants: prev[roomId].participants.includes(user.id)
          ? prev[roomId].participants
          : [...prev[roomId].participants, user.id]
      }
    }));

    const joinMessage: ChatMessage = {
      id: `join_${Date.now()}`,
      senderId: 'system',
      senderPseudo: 'Système',
      message: `${user.pseudo} a rejoint la conversation`,
      timestamp: new Date().toISOString(),
      type: 'join'
    };

    setChatRooms(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        messages: [...prev[roomId].messages, joinMessage]
      }
    }));
  };

  // Formatage et couleur
  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

  const getUserColor = (userId: string) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    return colors[userId.charCodeAt(0) % colors.length];
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      border: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2500,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            {conversationType === 'expert'
              ? '💼 Chat Expert'
              : conversationType === 'sos'
              ? '🆘 Chat d\'Urgence'
              : '💬 Chat Communautaire'}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
            {conversationType === 'expert'
              ? `Conseil avec ${expert?.name}`
              : conversationType === 'sos'
              ? 'Canal d\'assistance d\'urgence'
              : `${onlineUsers.length} utilisateur(s) en ligne`}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Room Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #eee'
      }}>
        {Object.values(chatRooms).map(room => (
          <button
            key={room.id}
            onClick={() => joinRoom(room.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              backgroundColor: activeRoom === room.id ? 'white' : 'transparent',
              color: activeRoom === room.id ? '#667eea' : '#666',
              fontSize: '12px',
              cursor: 'pointer',
              borderBottom: activeRoom === room.id ? '2px solid #667eea' : 'none',
              fontWeight: activeRoom === room.id ? '600' : 'normal'
            }}
          >
            {room.name.split(' ')[0]}
            {room.participants.length > 0 && (
              <div style={{
                background: '#e74c3c',
                color: 'white',
                borderRadius: '10px',
                fontSize: '10px',
                padding: '2px 6px',
                marginTop: '2px'
              }}>
                {room.participants.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: '#f8f9fa'
      }}>
        {currentRoom?.messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            padding: '40px 20px'
          }}>
            <MessageCircle size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>
              Aucun message dans cette salle
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
              Soyez le premier à dire bonjour !
            </p>
          </div>
        ) : (
          currentRoom.messages.map(message => (
            <div
              key={message.id}
              style={{
                marginBottom: '12px',
                display: 'flex',
                flexDirection: message.senderId === user.id ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '8px'
              }}
            >
              {(message.type === 'system' || message.type === 'join') ? (
                <div style={{
                  width: '100%',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  margin: '5px 0'
                }}>
                  {message.message}
                </div>
              ) : (
                <>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: getUserColor(message.senderId),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {message.senderPseudo.charAt(0).toUpperCase()}
                  </div>

                  <div style={{
                    backgroundColor: message.senderId === user.id ? '#667eea' : 'white',
                    color: message.senderId === user.id ? 'white' : '#333',
                    padding: '10px 12px',
                    borderRadius: '15px',
                    maxWidth: '70%',
                    wordWrap: 'break-word',
                    border: message.senderId !== user.id ? '1px solid #eee' : 'none',
                    position: 'relative'
                  }}>
                    {message.senderId !== user.id && (
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: getUserColor(message.senderId),
                        marginBottom: '4px'
                      }}>
                        {message.senderPseudo}
                      </div>
                    )}

                    <div style={{ marginBottom: '4px' }}>
                      {message.message}
                    </div>

                    <div style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}>
                      {formatTime(message.timestamp)}
                      {message.senderId === user.id && <CheckCircle size={10} />}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Online Users */}
      <div style={{
        padding: '8px 15px',
        backgroundColor: '#f0f0f0',
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={12} />
          <span>En ligne :</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {onlineUsers.slice(0, 4).map((pseudo, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px'
                }}
              >
                {pseudo}
              </span>
            ))}
            {onlineUsers.length > 4 && (
              <span style={{ color: '#999' }}>+{onlineUsers.length - 4}</span>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #eee',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>  
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Écrivez dans ${currentRoom?.name}…`}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              resize: 'none',
              minHeight: '18px',
              maxHeight: '60px',
              fontFamily: 'inherit',
              fontSize: '14px',
              outline: 'none'
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              padding: '10px',
              backgroundColor: newMessage.trim() ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              height: '40px'
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '4px',
          textAlign: 'center'
        }}>
          Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
        </div>
      </div>
    </div>
  );
};

export default ChatSystemV2