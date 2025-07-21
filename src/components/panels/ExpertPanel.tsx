import React from 'react';
import ExpertSearch from '@/routes/ExpertSearch';
import ExpertMatchingImproved from '@/routes/ExpertMatchingImproved';

type Props = {
  userId: string;
  showExpertSearch: boolean;
  showExpertMatching: boolean;
  onCloseSearch: () => void;
  onCloseMatching: () => void;
};

const ExpertPanel = ({
  userId,
  showExpertSearch,
  showExpertMatching,
  onCloseSearch,
  onCloseMatching,
}: Props) => {
  return (
    <>
      {showExpertSearch && (
        <div className="modal expert">
          <ExpertSearch userId={userId} onClose={onCloseSearch} />
        </div>
      )}
      {showExpertMatching && (
        <div className="modal expert">
          <ExpertMatchingImproved userId={userId} onClose={onCloseMatching} />
        </div>
      )}
    </>
  );
};

export default ExpertPanel;