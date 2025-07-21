import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from "@/user/UserContext";
import { MessageCircle, Send, User, Clock, X, Phone, MapPin } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  message: string;
  timestamp: string;
  type: 'text' | 'location' | 'contact';
}

interface SOSChatProps {
  request: any;
  onClose: () => void;
}

const SOSChat: React.FC<SOSChatProps> = ({ request, onClose }) => {
  const { userConnecte } = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatKey = `chat_${request.id}`;

  // Charger les messages du chat
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    setMessages(savedMessages);
  }, [chatKey]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sauvegarder les messages
  const saveMessages = (updatedMessages: ChatMessage[]) => {
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim() || !userConnecte) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: userConnecte.id,
      senderPseudo: userConnecte.pseudo,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);

    // Ajouter une notification pour le destinataire (si ce n'est pas l'auteur du message)
    if (request.userId !== userConnecte.id) {
      const notificationsKey = `notifications_${request.userId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'chat_message',
        title: 'Nouveau message dans le chat SOS',
        message: `${userConnecte.pseudo} a envoyé un message dans votre demande SOS.`,
        timestamp: new Date().toISOString(),
        userId: request.userId,
        requestId: request.id,
        read: false
      };
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

      // Déclencher un événement de stockage
      window.dispatchEvent(new StorageEvent('storage', {
        key: notificationsKey,
        newValue: JSON.stringify(updatedNotifications)
      }));
    }

    setNewMessage('');

    // Simuler la notification
    console.log(`📱 Nouveau message de ${userConnecte.pseudo} dans le chat SOS ${request.id}`);
  };

  // Partager sa position
  const shareLocation = () => {
    if (!userConnecte) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: userConnecte.id,
            senderPseudo: userConnecte.pseudo,
            message: `📍 Position partagée: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            timestamp: new Date().toISOString(),
            type: 'location'
          };

          const updatedMessages = [...messages, locationMessage];
          saveMessages(updatedMessages);

    // Ajouter une notification pour le destinataire (si ce n'est pas l'auteur du message)
    if (request.userId !== userConnecte.id) {
      const notificationsKey = `notifications_${request.userId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'chat_message',
        title: 'Nouveau message dans le chat SOS',
        message: `${userConnecte.pseudo} a envoyé un message dans votre demande SOS.`,
        timestamp: new Date().toISOString(),
        userId: request.userId,
        requestId: request.id,
        read: false
      };
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

      // Déclencher un événement de stockage
      window.dispatchEvent(new StorageEvent('storage', {
        key: notificationsKey,
        newValue: JSON.stringify(updatedNotifications)
      }));
    }

        },
        (error) => {
          alert('Impossible d\'obtenir votre position');
        }
      );
    }
  };

  // Partager ses coordonnées
  const shareContact = () => {
    if (!userConnecte) return;

    const contactMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: userConnecte.id,
      senderPseudo: userConnecte.pseudo,
      message: `📞 Contact partagé: ${userConnecte.pseudo} - Disponible pour vous aider`,
      timestamp: new Date().toISOString(),
      type: 'contact'
    };

    const updatedMessages = [...messages, contactMessage];
    saveMessages(updatedMessages);

    // Ajouter une notification pour le destinataire (si ce n'est pas l'auteur du message)
    if (request.userId !== userConnecte.id) {
      const notificationsKey = `notifications_${request.userId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'chat_message',
        title: 'Nouveau message dans le chat SOS',
        message: `${userConnecte.pseudo} a envoyé un message dans votre demande SOS.`,
        timestamp: new Date().toISOString(),
        userId: request.userId,
        requestId: request.id,
        read: false
      };
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

      // Déclencher un événement de stockage
      window.dispatchEvent(new StorageEvent('storage', {
        key: notificationsKey,
        newValue: JSON.stringify(updatedNotifications)
      }));
    }

  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'security': return '🚨';
      case 'transport': return '🚗';
      case 'language': return '🗣️';
      case 'accommodation': return '🏨';
      case 'money': return '💰';
      case 'legal': return '⚖️';
      case 'other': return '❓';
      default: return '🆘';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        height: '80vh',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #17a2b8, #138496)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{getCategoryEmoji(request.category)}</span>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Chat d'assistance</h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {userConnecte?.id === request.userId ? 
                'Communiquez avec vos aidants' : 
                `Aidez ${request.userPseudo || request.userName}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Contexte de la demande */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #eee'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            <strong>Demande SOS:</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#333' }}>
            {request.description || request.message}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px 20px'
            }}>
              <MessageCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Aucun message pour le moment</p>
              <p style={{ fontSize: '14px' }}>
                {userConnecte?.id === request.userId ? 
                  'Attendez les messages de vos aidants' : 
                  'Envoyez un message pour commencer à aider'
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: message.senderId === userConnecte?.id ? 'row-reverse' : 'row',
                  marginBottom: '12px',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
              >
                <div style={{
                  backgroundColor: message.senderId === userConnecte?.id ? '#17a2b8' : 'white',
                  color: message.senderId === userConnecte?.id ? 'white' : '#333',
                  padding: '12px',
                  borderRadius: '16px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  border: message.senderId !== userConnecte?.id ? '1px solid #eee' : 'none',
                  position: 'relative'
                }}>
                  {message.senderId !== userConnecte?.id && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#17a2b8',
                      marginBottom: '4px'
                    }}>
                      {message.senderPseudo}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '4px' }}>
                    {message.type === 'location' && '📍 '}
                    {message.type === 'contact' && '📞 '}
                    {message.message}
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Actions rapides */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #eee',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={shareLocation}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MapPin size={14} />
              Position
            </button>
            <button
              onClick={shareContact}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ffc107',
                color: '#333',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Phone size={14} />
              Contact
            </button>
          </div>
        </div>

        {/* Zone de saisie */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #eee',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tapez votre message..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                resize: 'none',
                minHeight: '20px',
                maxHeight: '60px',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{
                padding: '12px',
                backgroundColor: newMessage.trim() ? '#17a2b8' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                height: '44px'
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '4px',
            textAlign: 'center'
          }}>
            Appuyez sur Entrée pour envoyer
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSChat;