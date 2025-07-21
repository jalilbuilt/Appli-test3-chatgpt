import React from 'react';
import { BadgeType, getBadgeStyle } from './Badges';
import '@/styles/conversations.css';

type ConversationCardProps = {
  avatar: string;
  pseudo: string;
  type: BadgeType;
  lastMessage?: string;
  onClick: () => void;
};

const ConversationCard: React.FC<ConversationCardProps> = ({ avatar, pseudo, type, lastMessage, onClick }) => {
  const badgeStyle = getBadgeStyle(type);

  return (
    <div className="conversation-card" onClick={onClick}>
      <img src={avatar} alt={pseudo} className="avatar" />
      <div className="conversation-info">
        <div className="conversation-header">
          <strong>{pseudo}</strong>
          <span className="badge" style={{ backgroundColor: badgeStyle.color }}>{badgeStyle.label}</span>
        </div>
        {lastMessage && <p className="last-message">{lastMessage}</p>}
      </div>
    </div>
  );
};

export default ConversationCard;