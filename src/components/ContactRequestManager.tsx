import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/user/UserContext';
import { MessageCircle, Check, X, Clock, User, Heart } from 'lucide-react';

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

interface ContactRequestManagerProps {
  onClose: () => void;
  onAcceptRequest?: (requestId: string) => void;
}

export const ContactRequestManager: React.FC<ContactRequestManagerProps> = ({ 
  onClose, 
  onAcceptRequest 
}) => {
  const { userConnecte } = useContext(UserContext);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Charger les demandes
  useEffect(() => {
    if (!userConnecte) return;

    const allRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    setRequests(allRequests);
  }, [userConnecte]);

  // Filtrer les demandes selon l'onglet
  const getFilteredRequests = () => {
    if (!userConnecte) return [];
    
    return requests.filter(req => {
      if (activeTab === 'received') {
        return req.toUserId === userConnecte.id;
      } else {
        return req.fromUserId === userConnecte.id;
      }
    });
  };

  // Accepter une demande
  const handleAcceptRequest = (request: ContactRequest) => {
    // Mettre à jour le statut de la demande
    const updatedRequests = requests.map(req => 
      req.id === request.id ? { ...req, status: 'accepted' as const } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('contactRequests', JSON.stringify(updatedRequests));

    // Créer la conversation
    const conversationId = `social_${[request.fromUserId, request.toUserId].sort().join('_')}`;
    const newConversation = {
      id: conversationId,
      participants: [request.fromUserId, request.toUserId],
      participantsPseudos: [request.fromUserPseudo, request.toUserPseudo],
      title: `Chat avec ${request.fromUserPseudo}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(newConversation));

    // Message système de bienvenue
    const welcomeMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderPseudo: 'Système',
      message: `🎉 ${request.toUserPseudo} a accepté votre demande ! Vous pouvez maintenant échanger librement.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify([welcomeMessage]));

    // Notification à l'expéditeur original
    const notificationsKey = `notifications_${request.fromUserId}`;
    const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const acceptNotification = {
      id: `notif_${Date.now()}`,
      type: 'contact_accepted',
      title: 'Demande acceptée !',
      message: `${request.toUserPseudo} a accepté votre demande d'échange. Vous pouvez maintenant discuter !`,
      timestamp: new Date().toISOString(),
      userId: request.fromUserId,
      conversationId: conversationId,
      read: false
    };
    const updatedNotifications = [acceptNotification, ...existingNotifications];
    localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

    // Déclencher événement storage
    window.dispatchEvent(new StorageEvent('storage', {
      key: notificationsKey,
      newValue: JSON.stringify(updatedNotifications)
    }));

    alert('✅ Demande acceptée ! Une conversation a été créée.');
    
    if (onAcceptRequest) {
      onAcceptRequest(request.id);
    }
  };

  // Refuser une demande
  const handleDeclineRequest = (requestId: string) => {
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status: 'declined' as const } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('contactRequests', JSON.stringify(updatedRequests));

    alert('❌ Demande refusée.');
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const getReasonLabel = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'question_recit': '❓ Question sur un récit',
      'conseil_voyage': '💡 Demander un conseil',
      'partage_experience': '🗣️ Partager une expérience',
      'rencontre': '🤝 Proposition de rencontre',
      'autre': '💬 Autre'
    };
    return reasonMap[reason] || '💬 Autre';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'declined': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ En attente';
      case 'accepted': return '✅ Acceptée';
      case 'declined': return '❌ Refusée';
      default: return '❓ Inconnu';
    }
  };

  const filteredRequests = getFilteredRequests();
  const pendingCount = requests.filter(r => r.toUserId === userConnecte?.id && r.status === 'pending').length;

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
        maxWidth: '700px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px' }}>💬 Demandes de contact</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              Gérez vos demandes d'échange voyage
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <button
            onClick={() => setActiveTab('received')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              backgroundColor: activeTab === 'received' ? 'white' : 'transparent',
              color: activeTab === 'received' ? '#667eea' : '#666',
              fontWeight: activeTab === 'received' ? 600 : 'normal',
              cursor: 'pointer',
              borderBottom: activeTab === 'received' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📥 Reçues
            {pendingCount > 0 && (
              <span style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              backgroundColor: activeTab === 'sent' ? 'white' : 'transparent',
              color: activeTab === 'sent' ? '#667eea' : '#666',
              fontWeight: activeTab === 'sent' ? 600 : 'normal',
              cursor: 'pointer',
              borderBottom: activeTab === 'sent' ? '3px solid #667eea' : 'none'
            }}
          >
            📤 Envoyées
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {filteredRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <MessageCircle size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
              <h3>
                {activeTab === 'received' ? 'Aucune demande reçue' : 'Aucune demande envoyée'}
              </h3>
              <p>
                {activeTab === 'received' 
                  ? 'Vous n\'avez pas encore reçu de demande d\'échange.'
                  : 'Vous n\'avez pas encore envoyé de demande d\'échange.'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredRequests.map(request => (
                <div
                  key={request.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: request.status === 'pending' ? '0 2px 8px rgba(102, 126, 234, 0.1)' : 'none'
                  }}
                >
                  {/* Header de la demande */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {(activeTab === 'received' ? request.fromUserPseudo : request.toUserPseudo).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '16px' }}>
                          {activeTab === 'received' 
                            ? `De ${request.fromUserPseudo}` 
                            : `À ${request.toUserPseudo}`
                          }
                        </h4>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {formatTime(request.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <span style={{
                      backgroundColor: getStatusColor(request.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  {/* Motif */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {getReasonLabel(request.reason)}
                    </span>
                  </div>

                  {/* Message */}
                  <p style={{
                    margin: '0 0 15px 0',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontStyle: 'italic',
                    lineHeight: 1.5
                  }}>
                    "{request.message}"
                  </p>

                  {/* Actions pour demandes reçues en attente */}
                  {activeTab === 'received' && request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={16} />
                        Refuser
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(request)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Check size={16} />
                        Accepter
                      </button>
                    </div>
                  )}

                  {/* Message pour demandes acceptées */}
                  {request.status === 'accepted' && (
                    <div style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      ✅ Demande acceptée ! Vous pouvez maintenant échanger librement.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactRequestManager;