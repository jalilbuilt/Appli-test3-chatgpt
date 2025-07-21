import React from 'react';

interface ExpertPanelProps {
  onClose: () => void;
}

const ExpertPanel: React.FC<ExpertPanelProps> = ({ onClose }) => {
  return (
    <div className="panel">
      <h2>Recherche Expert</h2>
      <p>Exploration des profils experts ici.</p>
      <button onClick={onClose}>Fermer</button>
    </div>
  );
};

export default ExpertPanel;