import React from 'react';

type Props = {
  userId: string;
};

const ConversationSummaryPanel = ({ userId }: Props) => {
  return (
    <section className="conversation-summary-panel">
      <p>💬 Résumé des conversations actives (userId: {userId})</p>
      {/* TODO: Intégrer le résumé avec badges intelligents */}
    </section>
  );
};

export default ConversationSummaryPanel;