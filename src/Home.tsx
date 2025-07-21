import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/user/UserContext";
import { Heart, MapPin, Star, User, Eye, MessageCircle } from "lucide-react";
import { AdvancedSearchFilters, FilterState } from "@/components/AdvancedSearchFilters";
import { ExpertSearch } from "@/routes/ExpertSearch";
import { ExpertMatchingImproved } from "@/routes/ExpertMatchingImproved";
import SOSNotificationCenter from "@/routes/SOSNotificationCenter";
import NotificationSystem from "@/components/NotificationSystem";
import SOSChat from "@/routes/SOSChat";
import ContactRequestManager from "@/components/ContactRequestManager";
import ChatSystemV2 from "@/routes/ChatSystemV2";
import { SOSSystemV2 } from "@/routes/SOSSystemV2";

// Composant de debug
const DebugInfo = () => {
  const { userConnecte } = useContext(UserContext);
  const [debugData, setDebugData] = useState<any>({});
  
  useEffect(() => {
    const updateDebugData = () => {
      if (!userConnecte) return;
      
      const sosRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
      const notifications = JSON.parse(localStorage.getItem(`notifications_${userConnecte.id}`) || '[]');
      
      const userRequests = sosRequests.filter((req: any) => req.userId === userConnecte.id);
      const userResponses = sosRequests.filter((req: any) => 
        req.responses && req.responses.some((resp: any) => resp.helperId === userConnecte.id)
      );
      
      setDebugData({
        currentUser: userConnecte,
        totalSOSRequests: sosRequests.length,
        userRequests: userRequests.length,
        userResponses: userResponses.length,
        notifications: notifications.length,
        lastUpdate: new Date().toLocaleTimeString(),
        sosRequests: sosRequests.slice(0, 3), // Premiers 3 pour debug
        notificationsList: notifications.slice(0, 3)
      });
    };
    
    updateDebugData();
    const interval = setInterval(updateDebugData, 2000);
    return () => clearInterval(interval);
  }, [userConnecte]);
  
  if (!userConnecte) return <div>Utilisateur non connecté</div>;
  
  return (
    <div>
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>👤 Utilisateur actuel:</strong> {userConnecte.pseudo} (ID: {userConnecte.id})
      </div>
      
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
        <strong>📊 Statistiques:</strong><br/>
        • Total demandes SOS: {debugData.totalSOSRequests}<br/>
        • Mes demandes: {debugData.userRequests}<br/>
        • Mes réponses: {debugData.userResponses}<br/>
        • Notifications: {debugData.notifications}<br/>
        • Dernière maj: {debugData.lastUpdate}
      </div>
      
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <strong>🆘 Dernières demandes SOS:</strong><br/>
        {debugData.sosRequests?.map((req: any, i: number) => (
          <div key={i} style={{ fontSize: '11px', margin: '4px 0', padding: '4px', backgroundColor: 'white', borderRadius: '2px' }}>
            • ID: {req.id?.substring(0, 12)}...<br/>
            • User: {req.userName} (ID: {req.userId})<br/>
            • Réponses: {req.responses?.length || 0}<br/>
            • Status: {req.status}
          </div>
        )) || 'Aucune demande'}
      </div>
      
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <strong>🔔 Notifications:</strong><br/>
        {debugData.notificationsList?.map((notif: any, i: number) => (
          <div key={i} style={{ fontSize: '11px', margin: '4px 0', padding: '4px', backgroundColor: 'white', borderRadius: '2px' }}>
            • {notif.title}<br/>
            • Type: {notif.type}<br/>
            • Lu: {notif.read ? 'Oui' : 'Non'}
          </div>
        )) || 'Aucune notification'}
      </div>
      
      <button
        onClick={() => {
          localStorage.removeItem(`notifications_${userConnecte.id}`);
          alert('Notifications effacées pour ' + userConnecte.pseudo);
        }}
        style={{
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          width: '100%'
        }}
      >
        🗑️ Effacer mes notifications
      </button>
    </div>
  );
};

interface Author {
  id: string;
  pseudo: string;
  email?: string;
}

interface TravelStory {
  id: string;
  titre: string;
  ville?: string;
  pays?: string;
  contenu: string;
  imageUrl?: string;
  images?: string[];
  auteur?: Author;
  dateCreation: string;
  likes?: string[];
  rating?: number;
  views?: number;
  comments?: any[];
  type?: string;
  budget?: number;
  duree?: string;
  description?: string;
}

const Home: React.FC = () => {
  const { userConnecte, setUserConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState<string>("");
  const [recits, setRecits] = useState<TravelStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    budgetRange: [],
    suggestions: [],
    showSuggestions: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showExpertSearch, setShowExpertSearch] = useState(false);
  const [showExpertMatching, setShowExpertMatching] = useState(false);
  const [showSOSSystemV2, setShowSOSSystemV2] = useState(false);
  const [showSOSCenter, setShowSOSCenter] = useState(false);
  const [showSOSChat, setShowSOSChat] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showContactManager, setShowContactManager] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showChatSystem, setShowChatSystem] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      setIsLoading(true);
      const data = JSON.parse(localStorage.getItem("recits") || "[]") as TravelStory[];
      setRecits(data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des récits:", err);
      setError("Impossible de charger les récits. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userConnecte) return;
    
    const updatePendingCount = () => {
      const allRequests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
      const pendingCount = allRequests.filter((req: any) => 
        req.toUserId === userConnecte.id && req.status === 'pending'
      ).length;
      setPendingRequestsCount(pendingCount);
    };
    
    updatePendingCount();
    
    // Écouter les changements de demandes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contactRequests') {
        updatePendingCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(updatePendingCount, 2000); // Check toutes les 2s
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userConnecte]);
  
  const handleDeconnexion = useCallback(() => {
    setUserConnecte(null);
    navigate("/welcome");
  }, [setUserConnecte, navigate]);

  const openSOSChatFromNotification = (requestId: string) => {
    const sosRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
    const request = sosRequests.find((r: any) => r.id === requestId);
    
    if (request) {
      setChatRequestId(requestId);
      setShowSOSChat(true);
      
      // Fermer les autres modales
      setShowExpertSearch(false);
      setShowExpertMatching(false);
      setShowSOSSystemV2(false);
      setShowSOSCenter(false);
      setShowChatSystem(false);
    }
  };

  // Fonction pour gérer le contact expert (V2 uniquement)
  const handleContactExpert = (expertId: string) => {
    console.log('🎯 Contact expert:', expertId);
    
    // Ouvrir le chat moderne V2
    setSelectedExpert(expertId);
    setShowChatSystem(true);
    
    // Fermer les autres modales
    setShowExpertSearch(false);
    setShowExpertMatching(false);
    setShowSOSSystemV2(false);
    setShowSOSCenter(false);
  };

  // Fonction pour SOS V2 uniquement
  const handleSOSAction = () => {
    console.log('🆘 SOS Action - Version V2');
    
    // Ouvrir le système SOS moderne V2
    setShowSOSSystemV2(true);
    
    // Fermer les autres modales
    setShowExpertSearch(false);
    setShowExpertMatching(false);
    setShowSOSCenter(false);
  };
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);
  
  const handleAddStory = useCallback(() => {
    navigate("/ajouter");
  }, [navigate]);
  
  const handleReadStory = useCallback((storyId: string) => {
    console.log('Navigating to story with ID:', storyId);
    navigate(`/recit/${storyId}`);
  }, [navigate]);
  
  const toggleLike = useCallback((recitId: string) => {
    if (!userConnecte?.id) return;

    setRecits(prevRecits => 
      prevRecits.map(recit => {
        if (recit.id === recitId) {
          const likes = Array.isArray(recit.likes) ? recit.likes : [];
          const hasLiked = likes.includes(userConnecte.id);
          
          const newLikes = hasLiked 
            ? likes.filter(id => id !== userConnecte.id)
            : [...likes, userConnecte.id];
          
          const updatedRecit = { ...recit, likes: newLikes };
          
          const savedRecits = JSON.parse(localStorage.getItem('recits') || '[]');
          const updatedSavedRecits = savedRecits.map((savedRecit: any) => 
            savedRecit.id === recitId ? updatedRecit : savedRecit
          );
          localStorage.setItem('recits', JSON.stringify(updatedSavedRecits));
          
          return updatedRecit;
        }
        return recit;
      })
    );
  }, [userConnecte]);
  
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setSearch(newFilters.searchQuery);
  }, []);

  const recitsFiltres = useMemo(() => {
    let filtered = [...recits];

    const searchTerm = showAdvancedFilters ? filters.searchQuery : search;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recit) =>
          recit.titre.toLowerCase().includes(query) ||
          recit.ville?.toLowerCase().includes(query) ||
          recit.pays?.toLowerCase().includes(query) ||
          recit.contenu.toLowerCase().includes(query)
      );
    }

    if (showAdvancedFilters) {
      if (filters.categories.length > 0) {
        filtered = filtered.filter(recit => {
          const storyType = recit.type?.toLowerCase() || '';
          return filters.categories.some(cat => {
            switch (cat) {
              case 'culture': return storyType.includes('culture') || storyType.includes('histoire');
              case 'adventure': return storyType.includes('aventure') || storyType.includes('nature');
              case 'beach': return storyType.includes('plage') || storyType.includes('détente');
              case 'budget': return (recit.budget || 0) <= 50;
              default: return true;
            }
          });
        });
      }

      if (filters.budgetRange.length > 0) {
        filtered = filtered.filter(recit => {
          const budget = recit.budget || 0;
          return filters.budgetRange.some(range => {
            switch (range) {
              case 'low': return budget <= 50;
              case 'medium': return budget > 50 && budget <= 100;
              case 'high': return budget > 100;
              default: return true;
            }
          });
        });
      }
    }

    return filtered;
  }, [recits, search, filters, showAdvancedFilters]);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            color: '#333'
          }}>🌍 Récits de voyage partagés</h2>
          {userConnecte && (
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#666'
            }}>
              Bonjour <strong style={{ color: '#357edd' }}>{userConnecte.pseudo}</strong> ! 👋
            </p>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <NotificationSystem onOpenSOSChat={openSOSChatFromNotification} />
                              
          <button 
            onClick={() => setShowSOSCenter(true)}
            style={{
              background: 'linear-gradient(135deg, #17a2b8, #138496)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '25px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)',
              transition: 'all 0.3s ease',
              marginRight: '10px'
            }}
            title="Centre SOS - Voir les demandes d'aide"
          >
            🌍 Centre SOS
          </button>

          <button 
            onClick={() => setShowContactManager(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '25px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              marginRight: '10px',
              position: 'relative'
            }}
            title="Gérer mes demandes de contact voyage"
          >
            💬 Demandes
            {pendingRequestsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </span>
            )}
          </button>

          <button 
            onClick={handleSOSAction}
            style={{
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '25px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
              transition: 'all 0.3s ease'
            }}
            title="Demander de l'aide d'urgence (Version V2)"
          >
            🆘 SOS
          </button>

          <button 
            onClick={handleDeconnexion} 
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              fontSize: '14px',
              backgroundColor: '#dc3545',
              color: 'white'
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Rechercher une ville, un pays..."
          value={search}
          onChange={handleSearchChange}
          style={{
            flex: 1,
            padding: '10px 12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '200px'
          }}
          aria-label="Recherche"
        />
        
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            fontSize: '14px',
            backgroundColor: showAdvancedFilters ? '#357edd' : '#6c757d',
            color: 'white'
          }}
        >
          🔍 Filtres {showAdvancedFilters ? '✓' : ''}
        </button>
        
        <button
          onClick={() => setShowExpertMatching(true)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            fontSize: '14px',
            backgroundColor: '#357edd',
            color: 'white'
          }}
        >
          🎯 Matching Expert Amélioré
        </button>
        
        <button
          onClick={() => setShowExpertSearch(true)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            fontSize: '14px',
            backgroundColor: '#17a2b8',
            color: 'white'
          }}
        >
          👨‍🎓 Chercher Expert
        </button>

        <button 
          onClick={handleAddStory} 
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            fontSize: '14px',
            backgroundColor: '#28a745',
            color: 'white'
          }}
        >
          + Partager une expérience
        </button>
      </div>

      {showAdvancedFilters && (
        <AdvancedSearchFilters 
          onFiltersChange={handleFiltersChange}
          totalResults={recitsFiltres.length}
          currentSearch={search}
        />
      )}

      {isLoading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 0',
          color: '#666'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #357edd',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            marginBottom: '15px'
          }}></div>
          <p>Chargement des récits...</p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          color: '#dc3545'
        }}>
          <p style={{ marginBottom: '15px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              fontSize: '14px',
              backgroundColor: '#357edd',
              color: 'white'
            }}
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {recitsFiltres.length === 0 ? (
            <p style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '30px',
              color: '#666',
              fontStyle: 'italic'
            }}>Aucun récit trouvé.</p>
          ) : (
            recitsFiltres.map((recit) => {
              const hasLiked = Array.isArray(recit.likes) && recit.likes.includes(userConnecte?.id || '');
              const likesCount = Array.isArray(recit.likes) ? recit.likes.length : 0;
              const rating = recit.rating || 0;
              const viewsCount = recit.views || 0;
              const commentsCount = recit.comments?.length || 0;

              return (
                <article key={recit.id} style={{
                  border: '1px solid #eaeaea',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <h3 
                      style={{
                        margin: 0,
                        fontSize: '20px',
                        color: '#333',
                        cursor: 'pointer',
                        flex: 1,
                        marginRight: '10px'
                      }}
                      onClick={() => handleReadStory(recit.id)}
                    >
                      {recit.titre}
                    </h3>
                    
                    {recit.type && (
                      <span style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        {recit.type}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '6px',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      <MapPin size={14} />
                      <span>
                        {recit.ville || "Non précisé"}, {recit.pays || "Non précisé"}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '6px',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      <User size={14} />
                      <span 
                        style={{
                          color: '#3498db',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profil?user=${recit.auteur?.pseudo || 'Anonyme'}`);
                        }}
                      >
                        Par {String(recit.auteur?.pseudo || "Anonyme")}
                      </span>
                    </div>

                    {rating > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        margin: '8px 0'
                      }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= rating ? "#ffd700" : "none"}
                            color={star <= rating ? "#ffd700" : "#ddd"}
                          />
                        ))}
                        <span style={{
                          color: '#7f8c8d',
                          fontSize: '0.9rem',
                          marginLeft: '4px'
                        }}>({rating.toFixed(1)})</span>
                      </div>
                    )}

                    {recit.dateCreation && (
                      <p style={{
                        color: '#888',
                        marginTop: '8px',
                        fontSize: '0.85rem'
                      }}>
                        <small>Publié le {new Date(recit.dateCreation).toLocaleDateString('fr-FR')}</small>
                      </p>
                    )}
                  </div>
                
                  {((recit.images && recit.images.length > 0) || recit.imageUrl) && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      margin: '15px 0',
                      cursor: 'pointer',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      padding: '8px 0'
                    }}>
                      {recit.images && recit.images.length > 0 ? (
                        <>
                          {recit.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${recit.titre} - ${idx + 1}`}
                              style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #ecf0f1',
                                flexShrink: 0,
                                transition: 'transform 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadStory(recit.id);
                              }}
                            />
                          ))}
                          {recit.images.length > 5 && (
                            <div style={{
                              width: 'auto',
                              height: '60px',
                              backgroundColor: '#e3f2fd',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #2196f3',
                              color: '#1976d2',
                              fontSize: '0.8rem',
                              padding: '0 12px',
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                              fontWeight: 500
                            }}>
                              📸 {recit.images.length} photos
                            </div>
                          )}
                        </>
                      ) : recit.imageUrl && (
                        <img 
                          src={recit.imageUrl} 
                          alt={`Illustration pour ${recit.titre}`} 
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #ecf0f1',
                            flexShrink: 0,
                            transition: 'transform 0.2s ease'
                          }}
                          loading="lazy"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadStory(recit.id);
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = '/images/fallback.png';
                          }}
                        />
                      )}
                    </div>
                  )}
                
                  <p style={{
                    color: '#333',
                    lineHeight: 1.6,
                    marginBottom: '15px',
                    cursor: 'pointer'
                  }} onClick={() => handleReadStory(recit.id)}>
                    {recit.description || (recit.contenu.length > 150 
                      ? `${recit.contenu.substring(0, 150)}...` 
                      : recit.contenu)}
                  </p>

                  {(recit.budget || recit.duree) && (
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      {recit.budget && (
                        <span style={{
                          backgroundColor: '#f8f9fa',
                          color: '#666',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.85rem'
                        }}>💰 {recit.budget}€</span>
                      )}
                      {recit.duree && (
                        <span style={{
                          backgroundColor: '#f8f9fa',
                          color: '#666',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.85rem'
                        }}>⏱️ {recit.duree}</span>
                      )}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '15px',
                    borderTop: '1px solid #ecf0f1'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#95a5a6',
                        fontSize: '0.9rem'
                      }}>
                        <Eye size={16} />
                        <span>{viewsCount}</span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#95a5a6',
                        fontSize: '0.9rem'
                      }}>
                        <MessageCircle size={16} />
                        <span>{commentsCount}</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <button
                        style={{
                          background: hasLiked ? '#fee' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          color: hasLiked ? '#e74c3c' : 'inherit',
                          fontWeight: hasLiked ? 600 : 'normal'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(recit.id);
                        }}
                      >
                        <Heart
                          size={16}
                          fill={hasLiked ? "#e74c3c" : "none"}
                          color={hasLiked ? "#e74c3c" : "#95a5a6"}
                        />
                        <span>{likesCount}</span>
                      </button>

                      <button 
                        onClick={() => handleReadStory(recit.id)} 
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          fontSize: '13px',
                          backgroundColor: '#357edd',
                          color: 'white'
                        }}
                      >
                        Lire la suite
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Expert Search Modal */}
      {showExpertSearch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '0',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowExpertSearch(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 1001
              }}
            >
              ×
            </button>
            
            <ExpertSearch 
              onContactExpert={handleContactExpert}
            />
          </div>
        </div>
      )}

      {/* Expert Matching Modal */}
      {showExpertMatching && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <ExpertMatchingImproved
            experts={[]} // Les experts par défaut sont déjà dans le composant
            onSelectExpert={handleContactExpert}
            onClose={() => setShowExpertMatching(false)}
          />
        </div>
      )}

      {/* Contact Request Manager */}
      {showContactManager && (
        <ContactRequestManager
          onClose={() => setShowContactManager(false)}
          onAcceptRequest={(requestId) => {
            console.log('Demande acceptée:', requestId);
          }}
        />
      )}

      {/* SOS System V2 */}
      {showSOSSystemV2 && (
        <SOSSystemV2 onClose={() => setShowSOSSystemV2(false)} />
      )}

      {/* SOS Center */}
      {showSOSCenter && (
        <SOSNotificationCenter onClose={() => setShowSOSCenter(false)} />
      )}

      {/* SOS Chat */}
      {showSOSChat && chatRequestId && (
        <SOSChat
          request={JSON.parse(localStorage.getItem('sosRequests') || '[]').find((r: any) => r.id === chatRequestId)}
          onClose={() => {
            setShowSOSChat(false);
            setChatRequestId(null);
          }}
        />
      )}

      {/* Chat System V2 */}
      {showChatSystem && (
        <ChatSystemV2
          isVisible={true}
          onClose={() => {
            setShowChatSystem(false);
            setSelectedExpert(null);
          }}
          conversationType={selectedExpert ? 'expert' : 'sos'}
          expert={selectedExpert ? { id: selectedExpert, name: `Expert ${selectedExpert}` } : undefined}
        />
      )}

      {/* Debug Panel */}
      {showDebugPanel && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '400px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          border: '2px solid #9b59b6',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 3000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#9b59b6',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>🔧 Debug Notifications</h3>
            <button
              onClick={() => setShowDebugPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{
            padding: '16px',
            maxHeight: 'calc(80vh - 60px)',
            overflowY: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <DebugInfo />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;