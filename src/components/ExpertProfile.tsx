import React, { useState } from 'react';
import { Star, MapPin, Award, MessageCircle, Calendar, Users, Globe } from 'lucide-react';

interface ExpertProfileProps {
  expert: Expert;
  onContactExpert?: (expertId: string) => void;
  isCompact?: boolean;
}

interface Expert {
  id: string;
  pseudo: string;
  avatar?: string;
  specializations: string[];
  destinations: string[];
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  languages: string[];
  certifications: string[];
  description: string;
  priceRange: string;
  responseTime: string;
  expertise: {
    category: string;
    level: number; // 1-5
    icon: string;
  }[];
  badges: string[];
  joinDate: string;
  lastActive: string;
  totalClients: number;
}

export const ExpertProfile: React.FC<ExpertProfileProps> = ({ 
  expert, 
  onContactExpert,
  isCompact = false 
}) => {
  const [showFullProfile, setShowFullProfile] = useState(false);

  const handleContact = () => {
    if (onContactExpert) {
      onContactExpert(expert.id);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? "#ffd700" : "none"}
            color={star <= rating ? "#ffd700" : "#ddd"}
          />
        ))}
        <span style={{ marginLeft: '6px', color: '#666', fontSize: '0.9rem' }}>
          {rating.toFixed(1)} ({expert.reviewsCount} avis)
        </span>
      </div>
    );
  };

  const renderExpertiseLevel = (level: number) => {
    const bars = [];
    for (let i = 1; i <= 5; i++) {
      bars.push(
        <div
          key={i}
          style={{
            width: '8px',
            height: '12px',
            backgroundColor: i <= level ? '#28a745' : '#e9ecef',
            borderRadius: '2px'
          }}
        />
      );
    }
    return <div style={{ display: 'flex', gap: '2px' }}>{bars}</div>;
  };

  if (isCompact) {
    return (
      <div style={{
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: 'white',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => setShowFullProfile(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#357edd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            {expert.avatar || expert.pseudo.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#333' }}>
              {expert.pseudo}
            </h3>
            {renderRating(expert.rating)}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Globe size={14} color="#666" />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {expert.destinations.slice(0, 3).join(', ')}
              {expert.destinations.length > 3 && ` +${expert.destinations.length - 3}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="#666" />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {expert.totalClients} clients • {expert.experienceYears} ans d'expérience
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {expert.specializations.slice(0, 3).map((spec, index) => (
            <span key={index} style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {spec}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleContact();
          }}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
        >
          💬 Contacter
        </button>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #eaeaea',
      borderRadius: '15px',
      padding: '24px',
      backgroundColor: 'white',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Header avec photo et infos principales */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#357edd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '28px'
        }}>
          {expert.avatar || expert.pseudo.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ margin: '0', fontSize: '24px', color: '#333' }}>{expert.pseudo}</h2>
            {expert.badges.includes('verified') && (
              <span title="Expert vérifié">
              <Award size={20} color="#28a745" />
              </span>
            )}
          </div>
          
          {renderRating(expert.rating)}
          
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              📅 {expert.experienceYears} ans d'expérience
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              👥 {expert.totalClients} clients
            </span>
            <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '600' }}>
              ⚡ Répond en {expert.responseTime}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
            {expert.priceRange}
          </div>
          <button
            onClick={handleContact}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            💬 Contacter
          </button>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#555', lineHeight: '1.6', margin: '0' }}>
          {expert.description}
        </p>
      </div>

      {/* Spécialisations */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#333' }}>
          🎯 Spécialisations
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {expert.specializations.map((spec, index) => (
            <span key={index} style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Destinations */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#333' }}>
          🌍 Destinations expertes
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {expert.destinations.map((dest, index) => (
            <span key={index} style={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <MapPin size={12} />
              {dest}
            </span>
          ))}
        </div>
      </div>

      {/* Niveaux d'expertise */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#333' }}>
          📊 Niveaux d'expertise
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {expert.expertise.map((skill, index) => (
            <div key={index} style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{skill.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{skill.category}</span>
              </span>
              {renderExpertiseLevel(skill.level)}
            </div>
          ))}
        </div>
      </div>

      {/* Langues et certifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#333' }}>
            🗣️ Langues parlées
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {expert.languages.map((lang, index) => (
              <span key={index} style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#333' }}>
            🏆 Certifications
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {expert.certifications.map((cert, index) => (
              <span key={index} style={{
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { Expert };
export default ExpertProfile;
