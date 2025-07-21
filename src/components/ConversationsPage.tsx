// ConversationsPage.tsx — version refondue complète avec logique de priorité, alias corrects et scalabilité

import React, { useContext, useState } from 'react';
import { UserContext } from '@/UserContext';
import ChatSystemV2 from '@/ChatSystemV2';
import ExpertMatchingImproved from '@/ExpertMatchingImproved';
import SocialChatSystem from '@/SocialChatSystem';
import { useConversationsBadge } from '@/useConversationsBadge';
import '@/ConversationsPage.css';

const ConversationsPage = () => {
  const { currentUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'sos' | 'expert' | 'social'>('sos');

  const { sosCount, expertCount, socialCount } = useConversationsBadge();

  const renderChatComponent = () => {
    switch (activeTab) {
      case 'sos':
        return <ChatSystemV2 type="sos" user={currentUser} />;
      case 'expert':
        return <ExpertMatchingImproved user={currentUser} />;
      case 'social':
        return <SocialChatSystem user={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="conversations-container">
      <h2 className="conversations-title">📬 Mes Conversations</h2>

      <div className="conversations-tabs">
        <button
          className={`tab-button sos ${activeTab === 'sos' ? 'active' : ''}`}
          onClick={() => setActiveTab('sos')}
        >
          🆘 Urgences
          {sosCount > 0 && <span className="badge red">{sosCount}</span>}
        </button>

        <button
          className={`tab-button expert ${activeTab === 'expert' ? 'active' : ''}`}
          onClick={() => setActiveTab('expert')}
        >
          👨‍🎓 Experts
          {expertCount > 0 && <span className="badge violet">{expertCount}</span>}
        </button>

        <button
          className={`tab-button social ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          💬 Échanges
          {socialCount > 0 && <span className="badge blue">{socialCount}</span>}
        </button>
      </div>

      <div className="conversations-panel">
        {renderChatComponent()}
      </div>
    </div>
  );
};

export default ConversationsPage;
