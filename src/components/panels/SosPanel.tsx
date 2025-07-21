import React from 'react';
import SOSSystemV2 from '@/routes/SOSSystemV2';
import SOSChat from '@/routes/SOSChat';
import SOSNotificationCenter from '@/routes/SOSNotificationCenter';

type Props = {
  userId: string;
  showSOSSystemV2: boolean;
  showSOSChat: boolean;
  showSOSNotifications: boolean;
  onCloseSOS: () => void;
  onCloseChat: () => void;
  onCloseNotifications: () => void;
};

const SosPanel = ({
  userId,
  showSOSSystemV2,
  showSOSChat,
  showSOSNotifications,
  onCloseSOS,
  onCloseChat,
  onCloseNotifications,
}: Props) => {
  return (
    <>
      {showSOSSystemV2 && (
        <div className="modal urgent">
          <SOSSystemV2 userId={userId} onClose={onCloseSOS} />
        </div>
      )}
      {showSOSChat && (
        <div className="modal urgent">
          <SOSChat userId={userId} onClose={onCloseChat} />
        </div>
      )}
      {showSOSNotifications && (
        <div className="modal urgent">
          <SOSNotificationCenter userId={userId} onClose={onCloseNotifications} />
        </div>
      )}
    </>
  );
};

export default SosPanel;