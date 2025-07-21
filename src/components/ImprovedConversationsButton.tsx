import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface ImprovedConversationsButtonProps {
  userConnecte: any;
  onNavigateToConversations: () => void;
}

const ImprovedConversationsButton: React.FC<ImprovedConversationsButtonProps> = ({ 
  userConnecte, 
  onNavigateToConversations 
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Simulation d'un utilisateur pour la démo
  const user = userConnecte || { id: '1', pseudo: 'Demo' };

  // Compter les messages non lus
  useEffect(() => {
    if (!user) return;

    const updateUnreadCount = () => {
      try {
        // Compter les demandes de contact en attente
        const contactRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
        const pendingRequests = contactRequests.filter((req: any) => 
          req.toUserId === user.id && req.status === 'pending'
        ).length;

        // Compter les messages non lus dans les conversations
        const socialMessages = JSON.parse(localStorage.getItem('socialMessages') || '[]');
        const unreadSocialMessages = socialMessages.filter((msg: any) => 
          msg.toUserId === user.id && !msg.read
        ).length;

        const totalUnread = pendingRequests + unreadSocialMessages;
        setUnreadCount(totalUnread);
        setHasNewMessages(totalUnread > 0);
      } catch (error) {
        console.log('Erreur lors du calcul des messages non lus:', error);
        setUnreadCount(0);
        setHasNewMessages(false);
      }
    };

    updateUnreadCount();

    // Écouter les changements de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contactRequests' || e.key === 'socialMessages' || 
          (e.key && e.key.startsWith('notifications_'))) {
        updateUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(updateUnreadCount, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleClick = () => {
    if (onNavigateToConversations) {
      onNavigateToConversations();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          background: hasNewMessages 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'rgba(255,255,255,0.2)',
          border: hasNewMessages ? 'none' : '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          position: 'relative',
          transition: 'all 0.3s ease',
          boxShadow: hasNewMessages 
            ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
          transform: hasNewMessages ? 'scale(1.02)' : 'scale(1)',
          animation: hasNewMessages ? 'pulse 2s infinite' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!hasNewMessages) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = hasNewMessages 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = hasNewMessages ? 'scale(1.02)' : 'scale(1)';
        }}
        title="Accéder à vos conversations voyage"
      >
        <MessageCircle size={18} />
        <span>Conversations</span>
        
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white',
            animation: 'bounce 1s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Indicateur de nouveaux messages */}
        {hasNewMessages && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#28a745',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'blink 1.5s infinite'
          }} />
        )}
      </button>

      {/* Styles CSS pour les animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { transform: scale(1.02); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
            60% { transform: translateY(-2px); }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            25%, 75% { opacity: 0.3; }
          }
        `
      }} />
    </>
  );
};

export default ImprovedConversationsButton;