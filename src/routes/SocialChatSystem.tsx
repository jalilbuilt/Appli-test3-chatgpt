import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from "@/user/UserContext";
import { MessageCircle, Send, User, Clock, X, Check, UserPlus, Heart } from 'lucide-react';

interface ContactRequest {
  id: string;
  fromUserId: string;
  fromUserPseudo: string;
  toUserId: string;
  toUserPseudo: string;
  message: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system';
}

interface Conversation {
  id: string;
  participants: string[];
  participantsPseudos: string[];
  title: string;
  lastMessage?: ChatMessage;
  timestamp: string;
  status: 'active' | 'archived';
}

interface SocialChatSystemProps {
  targetUserId: string;
  targetUserPseudo: string;
  onClose: () => void;
}

interface ContactRequestModalProps {
  targetUserPseudo: string;
  onSendRequest: (reason: string, message: string) => void;
  onClose: () => void;
}

// Composant de demande de contact
const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  targetUserPseudo,
  onSendRequest,
  onClose
}) => {
  const [reason, setReason] = useState('question_recit');
  const [message, setMessage] = useState('');

  const CONTACT_REASONS = [
    { id: 'question_recit', label: '❓ Question sur un récit', description: 'Poser une question sur une destination' },
    { id: 'conseil_voyage', label: '💡 Demander un conseil', description: 'Obtenir des conseils pour mon voyage' },
    { id: 'partage_experience', label: '🗣️ Partager une expérience', description: 'Échanger sur nos voyages' },
    { id: 'rencontre', label: '🤝 Proposition de rencontre', description: 'Se rencontrer lors d\'un voyage' },
    { id: 'autre', label: '💬 Autre', description: 'Discussion générale sur le voyage' }
  ];

  const selectedReason = CONTACT_REASONS.find(r => r.id === reason);

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSendRequest(reason, message.trim());
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
      zIndex: 2000,
      padding: '10px'  // Réduit le padding
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',  // Réduit le padding
        maxWidth: '450px',  // Réduit la largeur
        width: '100%',
        maxHeight: '85vh',  // Limite la hauteur
        overflowY: 'auto',  // Active le scroll
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          position: 'sticky',  // Header fixe
          top: 0,
          backgroundColor: 'white',
          paddingBottom: '10px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
            💬 Contacter {targetUserPseudo}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Motif de contact
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CONTACT_REASONS.map(reasonOption => (
              <label
                key={reasonOption.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px',
                  border: '2px solid',
                  borderColor: reason === reasonOption.id ? '#357edd' : '#e1e5e9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: reason === reasonOption.id ? '#f8f9ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reasonOption.id}
                  checked={reason === reasonOption.id}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '14px' }}>
                    {reasonOption.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {reasonOption.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Votre message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Bonjour ${targetUserPseudo} ! ${selectedReason?.description}...`}
            rows={3}  // Réduit la hauteur
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            maxLength={300}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            {message.length}/300 caractères
          </small>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>ℹ️ Information :</strong> {targetUserPseudo} recevra une notification et pourra accepter ou décliner votre demande.
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          position: 'sticky',  // Boutons fixes en bas
          bottom: 0,
          backgroundColor: 'white',
          paddingTop: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            style={{
              padding: '10px 16px',
              backgroundColor: message.trim() ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            📨 Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal SocialChat
export const SocialChatSystem: React.FC<SocialChatSystemProps> = ({
  targetUserId,
  targetUserPseudo,
  onClose
}) => {
  const { userConnecte } = useContext(UserContext);
  const [showRequestModal, setShowRequestModal] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = `social_${[userConnecte?.id, targetUserId].sort().join('_')}`;

  // Charger la conversation existante
  useEffect(() => {
    const existingConversation = localStorage.getItem(`conversation_${conversationId}`);
    if (existingConversation) {
      const conv = JSON.parse(existingConversation);
      setConversation(conv);
      setShowRequestModal(false);
      
      // Charger les messages
      const savedMessages = JSON.parse(localStorage.getItem(`messages_${conversationId}`) || '[]');
      setMessages(savedMessages);
    }
  }, [conversationId]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendContactRequest = (reason: string, message: string) => {
    if (!userConnecte) return;

    const request: ContactRequest = {
      id: `request_${Date.now()}`,
      fromUserId: userConnecte.id,
      fromUserPseudo: userConnecte.pseudo,
      toUserId: targetUserId,
      toUserPseudo: targetUserPseudo,
      message,
      reason,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Sauvegarder la demande
    const existingRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    const updatedRequests = [request, ...existingRequests];
    localStorage.setItem('contactRequests', JSON.stringify(updatedRequests));

    // Créer notification pour le destinataire
    const notificationsKey = `notifications_${targetUserId}`;
    const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const newNotification = {
      id: `notif_${Date.now()}`,
      type: 'contact_request',
      title: 'Nouvelle demande de contact',
      message: `${userConnecte.pseudo} souhaite échanger avec vous sur vos voyages.`,
      timestamp: new Date().toISOString(),
      userId: targetUserId,
      requestId: request.id,
      read: false
    };
    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

    // Déclencher événement storage
    window.dispatchEvent(new StorageEvent('storage', {
      key: notificationsKey,
      newValue: JSON.stringify(updatedNotifications)
    }));

    setShowRequestModal(false);
    alert('✅ Demande envoyée ! Vous serez notifié si elle est acceptée.');
    onClose();
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !userConnecte || !conversation) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: userConnecte.id,
      senderPseudo: userConnecte.pseudo,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));

    // Mettre à jour la conversation
    const updatedConversation = {
      ...conversation,
      lastMessage: message,
      timestamp: message.timestamp
    };
    setConversation(updatedConversation);
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(updatedConversation));

    // Notification pour l'autre utilisateur
    const otherUserId = conversation.participants.find(id => id !== userConnecte.id);
    if (otherUserId) {
      const notificationsKey = `notifications_${otherUserId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'chat_message',
        title: 'Nouveau message',
        message: `${userConnecte.pseudo}: ${message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message}`,
        timestamp: new Date().toISOString(),
        userId: otherUserId,
        conversationId: conversationId,
        read: false
      };
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

      window.dispatchEvent(new StorageEvent('storage', {
        key: notificationsKey,
        newValue: JSON.stringify(updatedNotifications)
      }));
    }

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simuler acceptation automatique pour test (à remplacer par vraie logique)
  const simulateAcceptance = () => {
    if (!userConnecte) return;

    const newConversation: Conversation = {
      id: conversationId,
      participants: [userConnecte.id, targetUserId],
      participantsPseudos: [userConnecte.pseudo, targetUserPseudo],
      title: `Chat avec ${targetUserPseudo}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    setConversation(newConversation);
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(newConversation));

    // Message système de bienvenue
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderPseudo: 'Système',
      message: `🎉 Conversation démarrée avec ${targetUserPseudo} ! Échangez en toute convivialité sur vos expériences de voyage.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    setMessages([welcomeMessage]);
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify([welcomeMessage]));
  };

  if (showRequestModal) {
    return (
      <div>
        <ContactRequestModal
          targetUserPseudo={targetUserPseudo}
          onSendRequest={sendContactRequest}
          onClose={onClose}
        />
        
        {/* Bouton test pour simuler l'acceptation */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 2001
        }}>
          <button
            onClick={simulateAcceptance}
            style={{
              padding: '10px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            🧪 Test: Simuler acceptation
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
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
        zIndex: 2000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <Clock size={48} color="#ffc107" style={{ marginBottom: '20px' }} />
          <h3 style={{ margin: '0 0 15px 0' }}>En attente de réponse</h3>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            Votre demande a été envoyée à {targetUserPseudo}. Vous serez notifié dès qu'il/elle acceptera.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Interface de chat
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
      zIndex: 2000,
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <MessageCircle size={20} />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Chat voyage</h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              Avec {targetUserPseudo}
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

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: message.type === 'system' ? 'column' : 
                  (message.senderId === userConnecte?.id ? 'row-reverse' : 'row'),
                marginBottom: '12px',
                alignItems: message.type === 'system' ? 'center' : 'flex-end',
                gap: '8px'
              }}
            >
              {message.type === 'system' ? (
                <div style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  textAlign: 'center',
                  maxWidth: '80%'
                }}>
                  {message.message}
                </div>
              ) : (
                <div style={{
                  backgroundColor: message.senderId === userConnecte?.id ? '#667eea' : 'white',
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
                      color: '#667eea',
                      marginBottom: '4px'
                    }}>
                      {message.senderPseudo}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '4px' }}>
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
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
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
              placeholder="Partagez vos expériences de voyage..."
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
                backgroundColor: newMessage.trim() ? '#667eea' : '#ccc',
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
            Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialChatSystem;