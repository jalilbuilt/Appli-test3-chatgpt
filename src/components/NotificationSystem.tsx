import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "@/user/UserContext";
import { Bell, X, MessageCircle, AlertTriangle, User } from 'lucide-react';

interface Notification {
  id: string;
  type: 'sos_message' | 'sos_request' | 'expert_response' | 'chat_message' | 'contact_accepted';
  title: string;
  message: string;
  timestamp: string;
  userId: string;
  requestId?: string;
  conversationId?: string;
  read: boolean;
}

interface NotificationSystemProps {
  onOpenSOSChat?: (requestId: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ onOpenSOSChat }) => {
  const { userConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Charger + Écouter storage changes
  useEffect(() => {
    if (!userConnecte) return;
    
    const notificationsKey = `notifications_${userConnecte.id}`;
    
    // Fonction pour charger les notifications
    const loadNotifications = () => {
      const stored = localStorage.getItem(notificationsKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('🔔 Notifications chargées pour', userConnecte.pseudo, ':', parsed.length);
          setNotifications(parsed);
        } catch (e) {
          console.warn("Erreur parsing notifications:", e);
        }
      }
    };

    // Charger au démarrage
    loadNotifications();

    // Listener storage
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 Storage event détecté:', e.key);
      
      if (e.key === notificationsKey && e.newValue) {
        try {
          const newNotifications = JSON.parse(e.newValue);
          console.log('🆕 Nouvelles notifications reçues:', newNotifications.length);
          setNotifications(newNotifications);
          
          // Notification browser pour nouvelle notif
          const currentCount = notifications.length;
          if (newNotifications.length > currentCount) {
            const latestNotif = newNotifications[0];
            console.log('🔥 Nouvelle notification:', latestNotif.title);
            
            // Notification système
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🚨 ' + latestNotif.title, {
                body: latestNotif.message,
                icon: '/favicon.ico',
                tag: 'urgent-help',
                requireInteraction: true
              });
            }
            
            // Vibration mobile
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
          }
        } catch (error) {
          console.error('Erreur parsing storage notifications:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling de sécurité
    const pollInterval = setInterval(() => {
      const current = localStorage.getItem(notificationsKey);
      if (current) {
        try {
          const parsed = JSON.parse(current);
          if (parsed.length !== notifications.length) {
            console.log('🔄 Polling détecte changement notifications');
            setNotifications(parsed);
          }
        } catch (e) {
          // Ignore
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [userConnecte, notifications.length]);

  // Demander la permission pour les notifications du navigateur
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    if (userConnecte) {
      localStorage.setItem(`notifications_${userConnecte.id}`, JSON.stringify(updatedNotifications));
    }
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    if (userConnecte) {
      localStorage.setItem(`notifications_${userConnecte.id}`, JSON.stringify(updatedNotifications));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    console.log('🔔 Traitement notification:', notification);
    
    // Marquer comme lue
    markAsRead(notification.id);
    setShowNotifications(false);
    
    // **NOUVELLE LOGIQUE : Redirection intelligente**
    if (notification.type === 'chat_message' || notification.type === 'contact_accepted') {
      // ✅ Rediriger vers la page des conversations
      console.log('💬 Redirection vers /conversations pour type:', notification.type);
      navigate('/conversations');
    } else if (notification.type === 'sos_message' && notification.requestId && onOpenSOSChat) {
      // ✅ Ouvrir le chat SOS
      console.log('🆘 Ouverture chat SOS pour:', notification.requestId);
      onOpenSOSChat(notification.requestId);
    } else if (notification.type === 'sos_request') {
      // ✅ Pour les demandes SOS, alerter l'utilisateur
      console.log('🆘 Notification de demande SOS - ouverture du centre SOS');
      alert(`Nouvelle demande SOS: ${notification.title}\n${notification.message}`);
    } else {
      // ✅ Fallback: afficher une alerte
      console.log('⚠️ Type de notification non géré:', notification.type);
      alert(`Notification: ${notification.title}\n${notification.message}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_message': return '💬';
      case 'contact_accepted': return '✅';
      case 'sos_message': return '💬';
      case 'sos_request': return '🆘';
      case 'expert_response': return '👨‍🎓';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  if (!userConnecte) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bouton de notification */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Bell size={20} color="#666" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: '350px',
          maxHeight: '400px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Liste des notifications */}
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#666'
              }}>
                <Bell size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      console.log('🔔 Notification cliquée:', notification, 'à', new Date().toLocaleTimeString());
                      handleNotificationClick(notification);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: notification.read ? 'white' : '#f8f9ff',
                      transition: 'background-color 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f8f9ff'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <span style={{
                          fontWeight: notification.read ? 'normal' : 600,
                          fontSize: '14px',
                          color: '#333'
                        }}>
                          {notification.title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 0.5,
                          padding: '2px'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    
                    <p style={{
                      margin: '0 0 8px 24px',
                      fontSize: '13px',
                      color: '#666',
                      lineHeight: 1.4
                    }}>
                      {notification.message}
                    </p>
                    
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      marginLeft: '24px'
                    }}>
                      {formatTime(notification.timestamp)}
                    </div>

                    {!notification.read && (
                      <div style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#e74c3c',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #eee',
              backgroundColor: '#f8f9fa',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
                  setNotifications(updatedNotifications);
                  localStorage.setItem(`notifications_${userConnecte.id}`, JSON.stringify(updatedNotifications));
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                Marquer toutes comme lues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;