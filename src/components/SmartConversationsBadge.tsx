// components/SmartConversationsBadge.tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useConversationsBadge } from '../hooks/useConversationsBadge';

interface SmartConversationsBadgeProps {
  userConnecte: any;
  onNavigateToConversations: () => void;
  variant?: 'navigation' | 'page' | 'mobile';
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SmartConversationsBadge: React.FC<SmartConversationsBadgeProps> = ({ 
  userConnecte, 
  onNavigateToConversations,
  variant = 'navigation',
  showText = true,
  size = 'medium'
}) => {
  const badgeData = useConversationsBadge(userConnecte);

  // 🎨 STYLES SELON LE VARIANT
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      borderRadius: variant === 'navigation' ? '20px' : '12px',
      border: 'none'
    };

    switch (variant) {
      case 'navigation':
        return {
          ...baseStyles,
          background: badgeData.totalCount > 0 
            ? `linear-gradient(135deg, ${badgeData.colorHex}, ${badgeData.colorHex}dd)` 
            : 'rgba(255,255,255,0.2)',
          color: 'white',
          padding: '10px 20px',
          fontSize: '14px',
          boxShadow: badgeData.totalCount > 0 
            ? `0 4px 15px ${badgeData.colorHex}40` 
            : '0 2px 8px rgba(0,0,0,0.1)',
          transform: badgeData.totalCount > 0 ? 'scale(1.02)' : 'scale(1)',
          animation: badgeData.priority === 'sos' ? 'urgentPulse 2s infinite' : 'none'
        };

      case 'page':
        return {
          ...baseStyles,
          background: 'white',
          color: badgeData.colorHex,
          padding: '12px 16px',
          fontSize: '16px',
          border: `2px solid ${badgeData.colorHex}`,
          boxShadow: `0 4px 12px ${badgeData.colorHex}20`
        };

      case 'mobile':
        return {
          ...baseStyles,
          background: badgeData.totalCount > 0 
            ? badgeData.colorHex 
            : 'rgba(255,255,255,0.2)',
          color: 'white',
          padding: '8px 12px',
          fontSize: '12px',
          borderRadius: '16px'
        };

      default:
        return baseStyles;
    }
  };

  // 📱 TAILLES D'ICÔNES
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 18;
      case 'large': return 20;
      default: return 18;
    }
  };

  // 🎯 TEXTE DU BADGE
  const getBadgeText = () => {
    if (!showText) return null;

    switch (variant) {
      case 'navigation':
        return 'Conversations';
      case 'page':
        return 'Conversations';
      case 'mobile':
        return 'Chat';
      default:
        return 'Conversations';
    }
  };

  // 🔥 TOOLTIP INFORMATIF
  const getTooltip = () => {
    if (badgeData.totalCount === 0) {
      return 'Aucun nouveau message';
    }

    const parts = [];
    if (badgeData.sosCount > 0) {
      parts.push(`🆘 ${badgeData.sosCount} SOS urgent${badgeData.sosCount > 1 ? 's' : ''}`);
    }
    if (badgeData.expertCount > 0) {
      parts.push(`👨‍🎓 ${badgeData.expertCount} expert${badgeData.expertCount > 1 ? 's' : ''}`);
    }
    if (badgeData.socialCount > 0) {
      parts.push(`💬 ${badgeData.socialCount} social${badgeData.socialCount > 1 ? 'aux' : ''}`);
    }

    return `${badgeData.totalCount} nouveau${badgeData.totalCount > 1 ? 'x' : ''} message${badgeData.totalCount > 1 ? 's' : ''}\n${parts.join('\n')}`;
  };

  return (
    <>
      <button
        onClick={onNavigateToConversations}
        style={getVariantStyles()}
        title={getTooltip()}
        onMouseEnter={(e) => {
          if (variant === 'navigation' && badgeData.totalCount === 0) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }
          e.currentTarget.style.transform = badgeData.totalCount > 0 ? 'scale(1.05)' : 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          if (variant === 'navigation') {
            e.currentTarget.style.background = badgeData.totalCount > 0 
              ? `linear-gradient(135deg, ${badgeData.colorHex}, ${badgeData.colorHex}dd)` 
              : 'rgba(255,255,255,0.2)';
          }
          e.currentTarget.style.transform = badgeData.totalCount > 0 ? 'scale(1.02)' : 'scale(1)';
        }}
      >
        <MessageCircle size={getIconSize()} />
        
        {showText && <span>{getBadgeText()}</span>}
        
        {/* 🎯 BADGE NUMÉRIQUE INTELLIGENT */}
        {badgeData.totalCount > 0 && (
          <span style={{
            position: variant === 'page' ? 'static' : 'absolute',
            top: variant === 'page' ? 'auto' : '-8px',
            right: variant === 'page' ? 'auto' : '-8px',
            backgroundColor: variant === 'page' ? badgeData.colorHex : '#fff',
            color: variant === 'page' ? 'white' : badgeData.colorHex,
            borderRadius: '50%',
            width: variant === 'page' ? 'auto' : '22px',
            height: variant === 'page' ? 'auto' : '22px',
            fontSize: variant === 'page' ? '14px' : '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: variant === 'page' ? 'none' : '2px solid white',
            minWidth: variant === 'page' ? '20px' : '22px',
            padding: variant === 'page' ? '2px 6px' : '0',
            animation: badgeData.priority === 'sos' ? 'urgentBounce 1s infinite' : 
                     badgeData.priority === 'expert' ? 'expertPulse 2s infinite' : 
                     'socialGlow 3s infinite',
            boxShadow: `0 2px 8px ${badgeData.colorHex}40`
          }}>
            {badgeData.totalCount > 99 ? '99+' : badgeData.totalCount}
          </span>
        )}

        {/* 🔴 INDICATEUR D'URGENCE (SOS uniquement) */}
        {badgeData.priority === 'sos' && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            border: '2px solid #e74c3c',
            animation: 'urgentBlink 1s infinite'
          }} />
        )}
      </button>

      {/* 🎨 ANIMATIONS CSS INTELLIGENTES */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes urgentPulse {
            0%, 50% { 
              transform: scale(1.02); 
              box-shadow: 0 4px 15px #e74c3c40;
            }
            25%, 75% { 
              transform: scale(1.05); 
              box-shadow: 0 6px 20px #e74c3c60;
            }
          }
          
          @keyframes urgentBounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-3px) scale(1.1); }
            60% { transform: translateY(-1px) scale(1.05); }
          }
          
          @keyframes urgentBlink {
            0%, 50% { opacity: 1; }
            25%, 75% { opacity: 0.3; }
          }
          
          @keyframes expertPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          @keyframes socialGlow {
            0%, 100% { box-shadow: 0 2px 8px #3498db40; }
            50% { box-shadow: 0 4px 12px #3498db60; }
          }
        `
      }} />
    </>
  );
};

export default SmartConversationsBadge;