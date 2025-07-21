import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/user/UserContext';
import { MessageCircle, ArrowLeft, User, Clock, CheckCircle } from 'lucide-react';
import SocialChatSystem from '@/routes/SocialChatSystem';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserPseudo: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
  isActive: boolean;
  requestStatus: 'accepted' | 'pending' | 'rejected';
}

const ConversationsManager: React.FC = () => {
  const { userConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!userConnecte) return;

    const loadConversations = () => {
      // Charger les demandes de contact acceptées
      const contactRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
      const messages = JSON.parse(localStorage.getItem('socialMessages') || '[]');

      // Trouver toutes les conversations actives
      const activeConversations: Conversation[] = [];

      // 1. Conversations depuis les demandes acceptées
      contactRequests
        .filter((req: any) => 
          req.status === 'accepted' && 
          (req.fromUserId === userConnecte.id || req.toUserId === userConnecte.id)
        )
        .forEach((req: any) => {
          const otherUserId = req.fromUserId === userConnecte.id ? req.toUserId : req.fromUserId;
          const otherUserPseudo = req.fromUserId === userConnecte.id ? req.toUserPseudo : req.fromUserPseudo;

          // Chercher les messages de cette conversation
          const conversationMessages = messages.filter((msg: any) => 
            (msg.fromUserId === userConnecte.id && msg.toUserId === otherUserId) ||
            (msg.fromUserId === otherUserId && msg.toUserId === userConnecte.id)
          );

          // Compter les messages non lus
          const unreadCount = conversationMessages.filter((msg: any) => 
            msg.toUserId === userConnecte.id && !msg.read
          ).length;

          // Dernier message
          const lastMessage = conversationMessages
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          activeConversations.push({
            id: `${userConnecte.id}-${otherUserId}`,
            otherUserId,
            otherUserPseudo,
            lastMessage: lastMessage?.content || 'Aucun message',
            lastMessageDate: lastMessage?.timestamp,
            unreadCount,
            isActive: true,
            requestStatus: 'accepted'
          });
        });

      // Trier par dernière activité
      activeConversations.sort((a, b) => {
        const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
        const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(activeConversations);
    };

    loadConversations();

    // Actualiser toutes les 5 secondes
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [userConnecte]);

  const handleOpenConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.otherUserId);
    setShowChat(true);

    // Marquer les messages comme lus
    const messages = JSON.parse(localStorage.getItem('socialMessages') || '[]');
    const updatedMessages = messages.map((msg: any) => {
      if (msg.fromUserId === conversation.otherUserId && msg.toUserId === userConnecte?.id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    localStorage.setItem('socialMessages', JSON.stringify(updatedMessages));

    // Recharger les conversations pour mettre à jour le compteur
    setTimeout(() => {
      const event = new Event('storage');
      window.dispatchEvent(event);
    }, 100);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div>
          <h1 style={{
            margin: '0',
            fontSize: '2rem',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💬 Mes Conversations
            {totalUnreadMessages > 0 && (
              <span style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
              </span>
            )}
          </h1>
          <p style={{
            margin: '5px 0 0 0',
            color: '#666',
            fontSize: '16px'
          }}>
            Toutes vos conversations actives avec d'autres voyageurs
          </p>
        </div>
      </div>

      {/* Liste des conversations */}
      {conversations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '15px',
          color: '#666'
        }}>
          <MessageCircle size={64} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>
            Aucune conversation active
          </h3>
          <p style={{ margin: '0 0 20px 0' }}>
            Commencez par explorer les profils et demander des échanges !
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Explorer les récits
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: conversation.unreadCount > 0 
                  ? '0 4px 15px rgba(52, 152, 219, 0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
                border: conversation.unreadCount > 0 
                  ? '2px solid #3498db' 
                  : '1px solid #e1e5e9'
              }}
              onClick={() => handleOpenConversation(conversation)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = conversation.unreadCount > 0 
                  ? '0 4px 15px rgba(52, 152, 219, 0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#3498db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    <User size={24} />
                  </div>

                  <div>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '18px',
                      color: '#2c3e50',
                      fontWeight: conversation.unreadCount > 0 ? '700' : '600'
                    }}>
                      {conversation.otherUserPseudo}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#27ae60',
                      fontSize: '14px'
                    }}>
                      <CheckCircle size={14} />
                      <span>Contact accepté</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {conversation.unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}

                  {conversation.lastMessageDate && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#95a5a6',
                      fontSize: '13px'
                    }}>
                      <Clock size={12} />
                      <span>{formatRelativeTime(conversation.lastMessageDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                borderLeft: conversation.unreadCount > 0 ? '4px solid #3498db' : '4px solid transparent'
              }}>
                <p style={{
                  margin: '0',
                  color: '#666',
                  fontSize: '14px',
                  fontStyle: conversation.lastMessage === 'Aucun message' ? 'italic' : 'normal',
                  fontWeight: conversation.unreadCount > 0 ? '500' : 'normal'
                }}>
                  <strong>Dernier message:</strong> {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedConversation && (
        <SocialChatSystem
          targetUserId={selectedConversation}
          targetUserPseudo={conversations.find(c => c.otherUserId === selectedConversation)?.otherUserPseudo || ''}
          onClose={() => {
            setShowChat(false);
            setSelectedConversation(null);
          }}
        />
      )}
    </div>
  );
};

export default ConversationsManager;