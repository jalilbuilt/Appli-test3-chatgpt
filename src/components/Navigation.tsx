// components/Navigation.tsx - VERSION AMÉLIORÉE
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "@/user/UserContext";
import SmartConversationsBadge from './SmartConversationsBadge';

const Navigation: React.FC = () => {
  const { userConnecte, setUserConnecte } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserConnecte(null);
    navigate('/welcome');
  };

  if (!userConnecte) {
    return null;
  }

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 2rem',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          cursor: 'pointer'
        }} onClick={() => navigate('/home')}>
          🌍 Carnet de Voyage
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Accueil
          </button>

          {/* 🎯 BADGE INTELLIGENT - REMPLACE L'ANCIEN BOUTON */}
          <SmartConversationsBadge
            userConnecte={userConnecte}
            onNavigateToConversations={() => navigate('/conversations')}
            variant="navigation"
            showText={true}
            size="medium"
          />
          
          <button
            onClick={() => navigate('/ajouter')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Ajouter
          </button>
          
          <button
            onClick={() => navigate('/profil')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            👤 {userConnecte?.pseudo || userConnecte?.email?.split('@')[0] || 'Profil'}
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(220,53,69,0.8)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,53,69,1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,53,69,0.8)'}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;