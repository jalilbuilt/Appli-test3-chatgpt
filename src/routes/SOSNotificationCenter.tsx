import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from "@/user/UserContext";
import { MapPin, Clock, AlertTriangle, MessageCircle, User, Phone } from 'lucide-react';
import SOSChat from './SOSChat';

interface SOSRequest {
  id: string;
  userId: string;
  userName?: string;
  userPseudo?: string;
  message?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'active' | 'in_progress' | 'resolved' | 'helped';
  helperId?: string;
  helperPseudo?: string;
  helpers?: string[];
  responses: Array<{
    helperId: string;
    helperPseudo: string;
    message: string;
    timestamp: string;
  }>;
}

interface SOSNotificationCenterProps {
  onClose: () => void;
}

const SOSNotificationCenter: React.FC<SOSNotificationCenterProps> = ({ onClose }) => {
  const { userConnecte } = useContext(UserContext);
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SOSRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'community' | 'my_requests' | 'my_help'>('community');
  const [showChat, setShowChat] = useState(false);
  const [chatRequest, setChatRequest] = useState<SOSRequest | null>(null);

  // Charger les demandes SOS depuis localStorage
  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
    setSOSRequests(savedRequests);
  }, []);

  // Sauvegarder les demandes SOS
  const saveRequests = (requests: SOSRequest[]) => {
    localStorage.setItem('sosRequests', JSON.stringify(requests));
    setSOSRequests(requests);
  };

  // Calculer la distance approximative (formule haversine simplifiée)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtenir la position actuelle de l'utilisateur
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.log('Erreur géolocalisation:', error)
      );
    }
  }, []);

  // Proposer son aide
  const offerHelp = (requestId: string) => {
    if (!userConnecte) return;

    const updatedRequests = sosRequests.map(request => {
      if (request.id === requestId) {
        const newResponse = {
          helperId: userConnecte.id,
          helperPseudo: userConnecte.pseudo,
          message: responseMessage || `${userConnecte.pseudo} propose son aide !`,
          timestamp: new Date().toISOString()
        };

        return {
          ...request,
          responses: [...request.responses, newResponse],
          status: 'in_progress' as const,
          helperId: userConnecte.id,
          helperPseudo: userConnecte.pseudo
        };
      }
      return request;
    });

    saveRequests(updatedRequests);
    setResponseMessage('');
    setSelectedRequest(null);
    
    // Ouvrir directement le chat
    const request = sosRequests.find(r => r.id === requestId);
    if (request) {
      setChatRequest({
        ...request,
        status: 'in_progress' as const,
        helperId: userConnecte.id,
        helperPseudo: userConnecte.pseudo
      });
      setShowChat(true);
    }
  };

  // Ouvrir le chat
  const openChat = (request: SOSRequest) => {
    setChatRequest(request);
    setShowChat(true);
  };

  // Marquer comme résolu
  const markAsResolved = (requestId: string) => {
    const updatedRequests = sosRequests.map(request => {
      if (request.id === requestId) {
        return { ...request, status: 'resolved' as const };
      }
      return request;
    });
    saveRequests(updatedRequests);
  };

  // Filtrer les demandes selon l'onglet actif
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'community':
        return sosRequests.filter(req => 
          req.userId !== userConnecte?.id && 
          (req.status === 'active' || req.status === 'in_progress')
        );
      case 'my_requests':
        return sosRequests.filter(req => req.userId === userConnecte?.id);
      case 'my_help':
        return sosRequests.filter(req => req.helperId === userConnecte?.id);
      default:
        return [];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'CRITIQUE';
      case 'high': return 'URGENT';
      case 'medium': return 'MODÉRÉ';
      case 'low': return 'FAIBLE';
      default: return 'NORMAL';
    }
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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>🆘 Centre SOS Communautaire</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Entraide et assistance d'urgence
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
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
          {[
            { key: 'community', label: '🌍 Communauté', count: sosRequests.filter(r => r.userId !== userConnecte?.id && r.status !== 'resolved').length },
            { key: 'my_requests', label: '📤 Mes demandes', count: sosRequests.filter(r => r.userId === userConnecte?.id).length },
            { key: 'my_help', label: '🤝 Mes aides', count: sosRequests.filter(r => r.helperId === userConnecte?.id).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                color: activeTab === tab.key ? '#e74c3c' : '#666',
                fontWeight: activeTab === tab.key ? 600 : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '3px solid #e74c3c' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {getFilteredRequests().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                {activeTab === 'community' ? '🌍' : activeTab === 'my_requests' ? '📤' : '🤝'}
              </div>
              <h3>
                {activeTab === 'community' ? 'Aucune demande SOS active' : 
                 activeTab === 'my_requests' ? 'Aucune demande envoyée' : 
                 'Aucune aide apportée'}
              </h3>
              <p>
                {activeTab === 'community' ? 'La communauté est tranquille pour le moment.' : 
                 activeTab === 'my_requests' ? 'Vous n\'avez pas encore envoyé de demande SOS.' : 
                 'Vous n\'avez pas encore aidé d\'autres membres.'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: selectedRequest ? '1fr 400px' : '1fr'
            }}>
              {/* Liste des demandes */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {getFilteredRequests().map(request => {
                  const distance = userLocation && request.location ? 
                    calculateDistance(userLocation.lat, userLocation.lon, request.location.latitude, request.location.longitude) : 
                    null;

                  const timeAgo = Math.max(1, Math.floor((Date.now() - new Date(request.timestamp).getTime()) / (1000 * 60)));

                  return (
                    <div
                      key={request.id}
                      style={{
                        border: `2px solid ${getPriorityColor(request.priority || request.urgencyLevel || 'medium')}`,
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: request.status === 'resolved' ? '#f8f9fa' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: request.status === 'resolved' ? 0.7 : 1
                      }}
                      onClick={() => setSelectedRequest(request)}
                    >
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>
                            {getCategoryEmoji(request.category)}
                          </span>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              <User size={16} color="#666" />
                              <span style={{ fontWeight: 600 }}>{request.userPseudo || request.userName || 'Utilisateur'}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              <Clock size={14} />
                              <span>Il y a {timeAgo} min</span>
                              {distance && (
                                <>
                                  <MapPin size={14} />
                                  <span>~{distance.toFixed(1)} km</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '8px'
                        }}>
                          <span style={{
                            backgroundColor: getPriorityColor(request.priority || request.urgencyLevel || 'medium'),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {getPriorityLabel(request.priority || request.urgencyLevel || 'medium')}
                          </span>

                          <span style={{
                            backgroundColor: request.status === 'active' ? '#ffc107' : 
                                           request.status === 'in_progress' ? '#17a2b8' : '#28a745',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {request.status === 'active' ? 'EN ATTENTE' : 
                             request.status === 'in_progress' ? 'EN COURS' : 'RÉSOLU'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        lineHeight: 1.5
                      }}>
                        {request.description || request.message || 'Pas de description disponible'}
                      </p>

                      {/* Location */}
                      {request.location?.address && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#666',
                          fontSize: '14px',
                          marginBottom: '15px'
                        }}>
                          <MapPin size={16} />
                          <span>{request.location.address}</span>
                        </div>
                      )}

                      {/* Responses */}
                      {(request.responses?.length > 0 || request.helpers?.length > 0) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#17a2b8',
                          fontSize: '14px'
                        }}>
                          <MessageCircle size={16} />
                          <span>{(request.responses?.length || 0) + (request.helpers?.length || 0)} personne(s) ont répondu</span>
                        </div>
                      )}

                      {/* Actions pour les demandes communautaires */}
                      {activeTab === 'community' && request.status === 'active' && (
                        <div style={{
                          marginTop: '15px',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              offerHelp(request.id);
                            }}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            🤝 Proposer mon aide
                          </button>
                        </div>
                      )}

                      {/* Actions pour les demandes communautaires en cours */}
                      {activeTab === 'community' && request.status === 'in_progress' && request.helperId === userConnecte?.id && (
                        <div style={{
                          marginTop: '15px',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat(request);
                            }}
                            style={{
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            💬 Continuer le chat
                          </button>
                        </div>
                      )}

                      {/* Actions pour mes demandes */}
                      {activeTab === 'my_requests' && request.status === 'in_progress' && (
                        <div style={{
                          marginTop: '15px',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat(request);
                            }}
                            style={{
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600,
                              marginRight: '8px'
                            }}
                          >
                            💬 Chat avec aidant
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsResolved(request.id);
                            }}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            ✅ Marquer comme résolu
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Panel de détail */}
              {selectedRequest && (
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  height: 'fit-content'
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>Détails de la demande</h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Utilisateur:</strong> {selectedRequest.userPseudo}<br/>
                    <strong>Catégorie:</strong> {getCategoryEmoji(selectedRequest.category)} {selectedRequest.category}<br/>
                    <strong>Priorité:</strong> <span style={{color: getPriorityColor(selectedRequest.priority)}}>{getPriorityLabel(selectedRequest.priority)}</span><br/>
                    <strong>Statut:</strong> {selectedRequest.status}<br/>
                    <strong>Créé:</strong> {new Date(selectedRequest.timestamp).toLocaleString('fr-FR')}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <strong>Description:</strong>
                    <p style={{ 
                      backgroundColor: 'white', 
                      padding: '10px', 
                      borderRadius: '8px',
                      margin: '8px 0'
                    }}>
                      {selectedRequest.description}
                    </p>
                  </div>

                  {selectedRequest.responses.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <strong>Réponses ({selectedRequest.responses.length}):</strong>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                        {selectedRequest.responses.map((response, idx) => (
                          <div key={idx} style={{
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid #eee'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '5px'
                            }}>
                              <strong style={{ color: '#17a2b8' }}>{response.helperPseudo}</strong>
                              <small style={{ color: '#666' }}>
                                {new Date(response.timestamp).toLocaleTimeString('fr-FR')}
                              </small>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px' }}>{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'community' && selectedRequest.status === 'active' && (
                    <div>
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Écrivez votre message d'aide..."
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          resize: 'vertical',
                          marginBottom: '10px'
                        }}
                      />
                      <button
                        onClick={() => offerHelp(selectedRequest.id)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          width: '100%'
                        }}
                      >
                        🤝 Proposer mon aide
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedRequest(null)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      width: '100%'
                    }}
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && chatRequest && (
        <SOSChat
          request={chatRequest}
          onClose={() => {
            setShowChat(false);
            setChatRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default SOSNotificationCenter;