export type BadgeType = 'user' | 'expert' | 'sos';

export const getBadgeStyle = (type: BadgeType) => {
  switch (type) {
    case 'user':
      return { color: '#3498db', label: 'Échange' }; // bleu
    case 'expert':
      return { color: '#9b59b6', label: 'Expert' };  // violet
    case 'sos':
      return { color: '#e74c3c', label: 'SOS' };     // rouge
    default:
      return { color: '#bdc3c7', label: 'Autre' };   // gris
  }
};