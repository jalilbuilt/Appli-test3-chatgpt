// hooks/useConversationsBadge.ts
import { useState, useEffect } from 'react';

interface BadgeData {
  color: 'red' | 'purple' | 'blue' | 'gray';
  totalCount: number;
  sosCount: number;
  expertCount: number;
  socialCount: number;
  priority: 'sos' | 'expert' | 'social' | 'none';
  colorHex: string;
  backgroundHex: string;
}

export const useConversationsBadge = (userConnecte: any): BadgeData => {
  const [badgeData, setBadgeData] = useState<BadgeData>({
    color: 'gray',
    totalCount: 0,
    sosCount: 0,
    expertCount: 0,
    socialCount: 0,
    priority: 'none',
    colorHex: '#6c757d',
    backgroundHex: '#f8f9fa'
  });

  const calculateBadgeData = (): BadgeData => {
    if (!userConnecte) {
      return {
        color: 'gray',
        totalCount: 0,
        sosCount: 0,
        expertCount: 0,
        socialCount: 0,
        priority: 'none',
        colorHex: '#6c757d',
        backgroundHex: '#f8f9fa'
      };
    }

    // 🆘 COMPTER LES SOS NON LUS
    const sosRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
    const sosCount = sosRequests.filter((req: any) => {
      // SOS où je suis aidant ET il y a de nouveaux messages
      if (req.helperId === userConnecte.id || (req.helpers && req.helpers.includes(userConnecte.id))) {
        const chatKey = `chat_${req.id}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        return messages.filter((msg: any) => msg.senderId !== userConnecte.id && !msg.read).length > 0;
      }
      // SOS que j'ai créé ET il y a des réponses non lues
      if (req.userId === userConnecte.id) {
        const chatKey = `chat_${req.id}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        return messages.filter((msg: any) => msg.senderId !== userConnecte.id && !msg.read).length > 0;
      }
      return false;
    }).length;

    // 👨‍🎓 COMPTER LES EXPERTS NON LUS
    const expertChats = JSON.parse(localStorage.getItem('chatRooms_expert') || '{}');
    let expertCount = 0;
    Object.values(expertChats).forEach((room: any) => {
      if (room.participants && room.participants.includes(userConnecte.id)) {
        expertCount += room.messages?.filter((msg: any) => 
          msg.senderId !== userConnecte.id && !msg.read
        ).length || 0;
      }
    });

    // 💬 COMPTER LES MESSAGES SOCIAUX NON LUS
    const socialMessages = JSON.parse(localStorage.getItem('socialMessages') || '[]');
    const socialCount = socialMessages.filter((msg: any) => 
      msg.toUserId === userConnecte.id && !msg.read
    ).length;

    // 📩 COMPTER LES DEMANDES DE CONTACT EN ATTENTE
    const contactRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    const pendingContactsCount = contactRequests.filter((req: any) => 
      req.toUserId === userConnecte.id && req.status === 'pending'
    ).length;

    const totalSocialCount = socialCount + pendingContactsCount;
    const totalCount = sosCount + expertCount + totalSocialCount;

    // 🎯 LOGIQUE DE PRIORITÉ INTELLIGENTE
    let priority: 'sos' | 'expert' | 'social' | 'none' = 'none';
    let color: 'red' | 'purple' | 'blue' | 'gray' = 'gray';
    let colorHex = '#6c757d';
    let backgroundHex = '#f8f9fa';

    if (sosCount > 0) {
      // 🆘 PRIORITÉ 1 : SOS = ROUGE
      priority = 'sos';
      color = 'red';
      colorHex = '#e74c3c';
      backgroundHex = '#fee';
    } else if (expertCount > 0) {
      // 👨‍🎓 PRIORITÉ 2 : EXPERT = VIOLET
      priority = 'expert';
      color = 'purple';
      colorHex = '#9b59b6';
      backgroundHex = '#f8f0ff';
    } else if (totalSocialCount > 0) {
      // 💬 PRIORITÉ 3 : SOCIAL = BLEU
      priority = 'social';
      color = 'blue';
      colorHex = '#3498db';
      backgroundHex = '#e3f2fd';
    }

    return {
      color,
      totalCount,
      sosCount,
      expertCount,
      socialCount: totalSocialCount,
      priority,
      colorHex,
      backgroundHex
    };
  };

  useEffect(() => {
    const updateBadgeData = () => {
      setBadgeData(calculateBadgeData());
    };

    // Mise à jour initiale
    updateBadgeData();

    // Écouter les changements de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (
        e.key === 'sosRequests' ||
        e.key === 'socialMessages' ||
        e.key === 'contactRequests' ||
        e.key.startsWith('chat_') ||
        e.key.startsWith('chatRooms_')
      )) {
        updateBadgeData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling de sécurité toutes les 3 secondes
    const interval = setInterval(updateBadgeData, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userConnecte]);

  return badgeData;
};