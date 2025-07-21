import React, { useState } from 'react';
import ConversationCard from './ConversationCard';
import { BadgeType } from './Badges';

type Conversation = {
  id: string;
  avatar: string;
  pseudo: string;
  type: BadgeType;
  lastMessage?: string;
};

type Props = {
  conversations: Conversation[];
  onSelect: (id: string) => void;
};

const ConversationManager: React.FC<Props> = ({ conversations, onSelect }) => {
  const [filter, setFilter] = useState<BadgeType | 'all'>('all');

  const filtered = filter === 'all'
    ? conversations
    : conversations.filter(conv => conv.type === filter);

  return (
    <div className="conversation-manager">
      <div className="filters">
        <button onClick={() => setFilter('all')}>Tous</button>
        <button onClick={() => setFilter('user')}>Échanges</button>
        <button onClick={() => setFilter('expert')}>Experts</button>
        <button onClick={() => setFilter('sos')}>SOS</button>
      </div>

      {filtered.map(conv => (
        <ConversationCard key={conv.id} {...conv} onClick={() => onSelect(conv.id)} />
      ))}
    </div>
  );
};

export default ConversationManager;