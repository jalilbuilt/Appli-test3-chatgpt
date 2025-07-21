import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from "@/user/UserContext";
import { User, MapPin, Calendar, Heart, Eye, ArrowLeft, Settings, MessageCircle, Globe, Edit3, Save, X } from 'lucide-react';
import SocialChatSystem from "@/routes/SocialChatSystem";

interface VoyageurProfile {
  isActive: boolean;
  bio: string;
  voyageurType: string;
  languesParlees: string[];
  specialites: string[];
  prochainVoyage: {
    destination: string;
    date: string;
  } | null;
  disponiblePourEchange: boolean;
  accepteQuestions: boolean;
  accepteConseils: boolean;
  accepteRencontres: boolean;
  reponseTypique: string;
}

const VOYAGEUR_TYPES = [
  'Aventurier solo',
  'Voyageur famille',
  'Couple voyageur',
  'Backpacker budget',
  'Voyageur luxe',
  'Digital nomad',
  'Voyageur culturel',
  'Sportif/Outdoor'
];

const SPECIALITES_OPTIONS = [
  'Trek montagne',
  'Plongée sous-marine',
  'Voyage solo féminin',
  'Famille avec enfants',
  'Budget serré',
  'Voyage luxe',
  'Culture locale',
  'Gastronomie',
  'Photographie',
  'Histoire/Patrimoine',
  'Vie nocturne',
  'Nature/Wildlife',
  'Sports extrêmes',
  'Slow travel'
];

const LANGUES_OPTIONS = [
  'Français',
  'Anglais',
  'Espagnol',
  'Italien',
  'Allemand',
  'Portugais',
  'Japonais',
  'Chinois',
  'Arabe',
  'Russe',
  'Hindi',
  'Thaï'
];

const UserProfile: React.FC = () => {
  const { userConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userStories, setUserStories] = useState<any[]>([]);
  const [profileUser, setProfileUser] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showVoyageurSettings, setShowVoyageurSettings] = useState(false);
  const [isEditingVoyageur, setIsEditingVoyageur] = useState(false);
  const [showSocialChat, setShowSocialChat] = useState(false);

  // Profil voyageur state
  const [voyageurProfile, setVoyageurProfile] = useState<VoyageurProfile>({
    isActive: false,
    bio: '',
    voyageurType: '',
    languesParlees: [],
    specialites: [],
    prochainVoyage: null,
    disponiblePourEchange: true,
    accepteQuestions: true,
    accepteConseils: true,
    accepteRencontres: false,
    reponseTypique: 'Dans la journée'
  });

  useEffect(() => {
    const targetUser = searchParams.get('user') || userConnecte?.pseudo || '';
    setProfileUser(targetUser);
    setIsOwnProfile(targetUser === userConnecte?.pseudo);
    
    if (targetUser) {
      const stories = JSON.parse(localStorage.getItem('recits') || '[]');
      const filteredStories = stories.filter((story: any) => 
        story.auteur?.pseudo === targetUser
      );
      setUserStories(filteredStories);

      // Trouver l'ID réel de l'utilisateur cible
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const targetUserData = users.find((u: any) => u.pseudo === targetUser);
      
      if (targetUserData) {
        setTargetUserId(targetUserData.id);
        console.log('👤 Utilisateur cible:', targetUser, 'ID réel:', targetUserData.id);
      } else {
        console.warn('⚠️ Utilisateur non trouvé:', targetUser);
      }

      // Charger le profil voyageur si il existe
      const savedVoyageurProfile = localStorage.getItem(`voyageurProfile_${targetUser}`);
      if (savedVoyageurProfile) {
        setVoyageurProfile(JSON.parse(savedVoyageurProfile));
      }
    }
  }, [searchParams, userConnecte]);

  const saveVoyageurProfile = () => {
    if (profileUser) {
      localStorage.setItem(`voyageurProfile_${profileUser}`, JSON.stringify(voyageurProfile));
      setIsEditingVoyageur(false);
    }
  };

  const toggleVoyageurProfile = () => {
    const updatedProfile = { ...voyageurProfile, isActive: !voyageurProfile.isActive };
    setVoyageurProfile(updatedProfile);
    localStorage.setItem(`voyageurProfile_${profileUser}`, JSON.stringify(updatedProfile));
  };

  const handleLangueToggle = (langue: string) => {
    const updatedLangues = voyageurProfile.languesParlees.includes(langue)
      ? voyageurProfile.languesParlees.filter(l => l !== langue)
      : [...voyageurProfile.languesParlees, langue];
    
    setVoyageurProfile({ ...voyageurProfile, languesParlees: updatedLangues });
  };

  const handleSpecialiteToggle = (specialite: string) => {
    const updatedSpecialites = voyageurProfile.specialites.includes(specialite)
      ? voyageurProfile.specialites.filter(s => s !== specialite)
      : [...voyageurProfile.specialites, specialite];
    
    setVoyageurProfile({ ...voyageurProfile, specialites: updatedSpecialites });
  };

  const totalLikes = userStories.reduce((total, story) => 
    total + (story.likes?.length || 0), 0
  );
  
  const totalViews = userStories.reduce((total, story) => 
    total + (story.views || 0), 0
  );

  const averageRating = userStories.length > 0 
    ? userStories.reduce((total, story) => total + (story.rating || 0), 0) / userStories.length
    : 0;

  const uniqueCountries = [...new Set(userStories.map(story => story.pays).filter(Boolean))];

  const canContact = voyageurProfile.isActive && voyageurProfile.disponiblePourEchange && !isOwnProfile && targetUserId;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s ease'
        }}
      >
        <ArrowLeft size={16} />
        Retour aux récits
      </button>

      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <User size={50} />
        </div>
        
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          {profileUser}
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          opacity: '0.9',
          margin: '0'
        }}>
          {voyageurProfile.isActive && voyageurProfile.voyageurType 
            ? `${voyageurProfile.voyageurType} • ${uniqueCountries.length} pays visités`
            : `Explorateur passionné • ${uniqueCountries.length} pays visités`
          }
        </p>

        {/* Debug Info - À supprimer après test */}
        {!isOwnProfile && (
          <div style={{
            fontSize: '12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '5px 10px',
            borderRadius: '15px',
            marginTop: '10px',
            fontFamily: 'monospace'
          }}>
            Debug: targetUserId = {targetUserId || 'MANQUANT'} | canContact = {canContact.toString()}
          </div>
        )}

        {/* Contact Button for visitors */}
        {canContact && (
          <button
            onClick={() => setShowSocialChat(true)}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '30px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '20px auto 0 auto',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            <MessageCircle size={20} />
            Échanger avec {profileUser}
          </button>
        )}
      </div>

      {/* Voyageur Profile Section */}
      {isOwnProfile && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🎒 Profil Voyageur
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={voyageurProfile.isActive}
                  onChange={toggleVoyageurProfile}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 500 }}>
                  {voyageurProfile.isActive ? 'Activé' : 'Désactivé'}
                </span>
              </label>
              {voyageurProfile.isActive && (
                <button
                  onClick={() => setIsEditingVoyageur(!isEditingVoyageur)}
                  style={{
                    background: 'none',
                    border: '1px solid #357edd',
                    color: '#357edd',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px'
                  }}
                >
                  {isEditingVoyageur ? <X size={14} /> : <Edit3 size={14} />}
                  {isEditingVoyageur ? 'Annuler' : 'Modifier'}
                </button>
              )}
            </div>
          </div>

          {!voyageurProfile.isActive ? (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <Globe size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
              <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>
                Profil voyageur désactivé
              </h4>
              <p style={{ margin: '0 0 15px 0' }}>
                Activez votre profil voyageur pour permettre aux autres de vous contacter et échanger sur vos expériences.
              </p>
              <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic' }}>
                Vous gardez le contrôle total sur vos informations personnelles.
              </p>
            </div>
          ) : (
            <div>
              {/* Bio Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Bio personnelle
                </label>
                {isEditingVoyageur ? (
                  <textarea
                    value={voyageurProfile.bio}
                    onChange={(e) => setVoyageurProfile({ ...voyageurProfile, bio: e.target.value })}
                    placeholder="Parlez de votre passion pour le voyage..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                ) : (
                  <p style={{
                    margin: '0',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontStyle: voyageurProfile.bio ? 'normal' : 'italic',
                    color: voyageurProfile.bio ? '#333' : '#666'
                  }}>
                    {voyageurProfile.bio || 'Aucune bio définie'}
                  </p>
                )}
              </div>

              {/* Type voyageur */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Type de voyageur
                </label>
                {isEditingVoyageur ? (
                  <select
                    value={voyageurProfile.voyageurType}
                    onChange={(e) => setVoyageurProfile({ ...voyageurProfile, voyageurType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Choisir un type</option>
                    {VOYAGEUR_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p style={{
                    margin: '0',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontStyle: voyageurProfile.voyageurType ? 'normal' : 'italic',
                    color: voyageurProfile.voyageurType ? '#333' : '#666'
                  }}>
                    {voyageurProfile.voyageurType || 'Non défini'}
                  </p>
                )}
              </div>

              {/* Langues */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Langues parlées
                </label>
                {isEditingVoyageur ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    {LANGUES_OPTIONS.map(langue => (
                      <label key={langue} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        padding: '4px'
                      }}>
                        <input
                          type="checkbox"
                          checked={voyageurProfile.languesParlees.includes(langue)}
                          onChange={() => handleLangueToggle(langue)}
                        />
                        <span style={{ fontSize: '14px' }}>{langue}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {voyageurProfile.languesParlees.length > 0 ? (
                      voyageurProfile.languesParlees.map(langue => (
                        <span key={langue} style={{
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {langue}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Aucune langue définie</span>
                    )}
                  </div>
                )}
              </div>

              {/* Spécialités */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Spécialités voyage
                </label>
                {isEditingVoyageur ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {SPECIALITES_OPTIONS.map(specialite => (
                      <label key={specialite} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        padding: '4px'
                      }}>
                        <input
                          type="checkbox"
                          checked={voyageurProfile.specialites.includes(specialite)}
                          onChange={() => handleSpecialiteToggle(specialite)}
                        />
                        <span style={{ fontSize: '14px' }}>{specialite}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {voyageurProfile.specialites.length > 0 ? (
                      voyageurProfile.specialites.map(specialite => (
                        <span key={specialite} style={{
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {specialite}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Aucune spécialité définie</span>
                    )}
                  </div>
                )}
              </div>

              {/* Prochain voyage */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Prochain voyage prévu
                </label>
                {isEditingVoyageur ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Destination"
                      value={voyageurProfile.prochainVoyage?.destination || ''}
                      onChange={(e) => setVoyageurProfile({
                        ...voyageurProfile,
                        prochainVoyage: {
                          destination: e.target.value,
                          date: voyageurProfile.prochainVoyage?.date || ''
                        }
                      })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Date (ex: Mars 2024)"
                      value={voyageurProfile.prochainVoyage?.date || ''}
                      onChange={(e) => setVoyageurProfile({
                        ...voyageurProfile,
                        prochainVoyage: {
                          destination: voyageurProfile.prochainVoyage?.destination || '',
                          date: e.target.value
                        }
                      })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                ) : (
                  <p style={{
                    margin: '0',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontStyle: voyageurProfile.prochainVoyage?.destination ? 'normal' : 'italic',
                    color: voyageurProfile.prochainVoyage?.destination ? '#333' : '#666'
                  }}>
                    {voyageurProfile.prochainVoyage?.destination ? 
                      `${voyageurProfile.prochainVoyage.destination} (${voyageurProfile.prochainVoyage.date})` : 
                      'Aucun voyage prévu'
                    }
                  </p>
                )}
              </div>

              {/* Préférences de contact */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>
                  Préférences de contact
                </label>
                <div style={{
                  display: 'grid',
                  gap: '10px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  {[
                    { key: 'accepteQuestions', label: 'Questions sur mes récits' },
                    { key: 'accepteConseils', label: 'Demandes de conseils voyage' },
                    { key: 'accepteRencontres', label: 'Propositions de rencontre (même destination)' }
                  ].map(option => (
                    <label key={option.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isEditingVoyageur ? 'pointer' : 'default'
                    }}>
                      <input
                        type="checkbox"
                        checked={voyageurProfile[option.key as keyof VoyageurProfile] as boolean}
                        onChange={(e) => setVoyageurProfile({
                          ...voyageurProfile,
                          [option.key]: e.target.checked
                        })}
                        disabled={!isEditingVoyageur}
                        style={{ transform: 'scale(1.1)' }}
                      />
                      <span style={{ fontSize: '14px' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Temps de réponse */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Temps de réponse habituel
                </label>
                {isEditingVoyageur ? (
                  <select
                    value={voyageurProfile.reponseTypique}
                    onChange={(e) => setVoyageurProfile({ ...voyageurProfile, reponseTypique: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="Dans l'heure">Dans l'heure</option>
                    <option value="Dans la journée">Dans la journée</option>
                    <option value="Quelques jours">Quelques jours</option>
                    <option value="Quand j'ai le temps">Quand j'ai le temps</option>
                  </select>
                ) : (
                  <p style={{
                    margin: '0',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    {voyageurProfile.reponseTypique}
                  </p>
                )}
              </div>

              {/* Save button */}
              {isEditingVoyageur && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={saveVoyageurProfile}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <Save size={16} />
                    Sauvegarder les modifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Visitor view of voyageur profile */}
      {!isOwnProfile && voyageurProfile.isActive && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#2c3e50',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎒 Profil Voyageur
          </h3>

          {voyageurProfile.bio && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
                À propos
              </h4>
              <p style={{
                margin: '0',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                lineHeight: '1.6'
              }}>
                {voyageurProfile.bio}
              </p>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {voyageurProfile.voyageurType && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  Type de voyageur
                </h4>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: 500 }}>
                  {voyageurProfile.voyageurType}
                </p>
              </div>
            )}

            {voyageurProfile.languesParlees.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  Langues parlées
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {voyageurProfile.languesParlees.map(langue => (
                    <span key={langue} style={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {langue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {voyageurProfile.specialites.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  Spécialités
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {voyageurProfile.specialites.map(specialite => (
                    <span key={specialite} style={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {specialite}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {voyageurProfile.prochainVoyage?.destination && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  Prochain voyage
                </h4>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: 500 }}>
                  ✈️ {voyageurProfile.prochainVoyage.destination} ({voyageurProfile.prochainVoyage.date})
                </p>
              </div>
            )}

            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                Temps de réponse
              </h4>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 500 }}>
                ⏱️ {voyageurProfile.reponseTypique}
              </p>
            </div>
          </div>

          {/* Contact preferences */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#666' }}>
              Accepte les contacts pour
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {voyageurProfile.accepteQuestions && (
                <span style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  ❓ Questions sur récits
                </span>
              )}
              {voyageurProfile.accepteConseils && (
                <span style={{
                  backgroundColor: '#d1ecf1',
                  color: '#0c5460',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  💡 Conseils voyage
                </span>
              )}
              {voyageurProfile.accepteRencontres && (
                <span style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  🤝 Rencontres IRL
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
            {userStories.length}
          </h3>
          <p style={{ margin: '0', color: '#7f8c8d' }}>
            Récits publiés
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>❤️</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
            {totalLikes}
          </h3>
          <p style={{ margin: '0', color: '#7f8c8d' }}>
            Likes reçus
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👁️</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
            {totalViews}
          </h3>
          <p style={{ margin: '0', color: '#7f8c8d' }}>
            Vues totales
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </h3>
          <p style={{ margin: '0', color: '#7f8c8d' }}>
            Note moyenne
          </p>
        </div>
      </div>

      {/* Countries Visited */}
      {uniqueCountries.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#2c3e50',
            fontSize: '1.5rem'
          }}>
            🗺️ Pays explorés
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {uniqueCountries.map((country, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* User Stories */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <h3 style={{
          margin: '0 0 25px 0',
          color: '#2c3e50',
          fontSize: '1.5rem'
        }}>
          📚 Récits de {profileUser}
        </h3>

        {userStories.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {userStories.map((story) => (
              <div
                key={story.id}
                style={{
                  border: '1px solid #e1e5e9',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/recit/${story.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    margin: '0',
                    color: '#2c3e50',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    {story.titre}
                  </h4>
                  {story.type && (
                    <span style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}>
                      {story.type}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <MapPin size={14} color="#7f8c8d" />
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {story.ville && `${story.ville}, `}{story.pays}
                  </span>
                </div>

                <p style={{
                  color: '#34495e',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  marginBottom: '15px'
                }}>
                  {story.description || (story.contenu.length > 100 
                    ? `${story.contenu.substring(0, 100)}...` 
                    : story.contenu)}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: '#95a5a6'
                }}>
                  <span>
                    {new Date(story.dateCreation).toLocaleDateString('fr-FR')}
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} />
                      <span>{story.views || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Heart size={14} />
                      <span>{story.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: '#95a5a6'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✈️</div>
            <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>
              Aucun récit publié
            </h4>
            <p style={{ margin: '0' }}>
              {profileUser === userConnecte?.pseudo 
                ? "Commencez à partager vos aventures !" 
                : `${profileUser} n'a pas encore partagé de récits.`}
            </p>
            {profileUser === userConnecte?.pseudo && (
              <button
                onClick={() => navigate('/ajouter')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Publier mon premier récit
              </button>
            )}
          </div>
        )}
      </div>

      {/* SocialChat Modal */}
      {showSocialChat && targetUserId && (
        <SocialChatSystem
          targetUserId={targetUserId}
          targetUserPseudo={profileUser}
          onClose={() => setShowSocialChat(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
                