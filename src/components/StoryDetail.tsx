import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "@/user/UserContext";
import { Heart, MapPin, Star, Eye, MessageCircle, ArrowLeft } from 'lucide-react';

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      try {
        const stories = JSON.parse(localStorage.getItem('recits') || '[]');
        console.log('Available stories:', stories.map(s => ({ id: s.id, titre: s.titre })));
        console.log('Looking for story with id:', id);
        
        const foundStory = stories.find((s: any) => s.id.toString() === id.toString());
        console.log('Found story:', foundStory);
        
        if (foundStory) {
          // Increment view count
          foundStory.views = (foundStory.views || 0) + 1;
          
          // Load user's rating for this story
          const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
          const storyRatings = userRatings[foundStory.id] || {};
          const userRating = userConnecte?.id ? storyRatings[userConnecte.id] : null;
          
          foundStory.userRating = userRating;
          
          const updatedStories = stories.map((s: any) => s.id.toString() === id.toString() ? foundStory : s);
          localStorage.setItem('recits', JSON.stringify(updatedStories));
          setStory(foundStory);
        } else {
          console.error('Story not found with id:', id);
        }
      } catch (error) {
        console.error('Error loading story:', error);
      }
    }
  }, [id, userConnecte]);

  const toggleLike = () => {
    if (!userConnecte?.id || !story) {
      console.log('Cannot like: user not connected or story not found');
      return;
    }

    console.log('Toggle like for story:', story.id, 'by user:', userConnecte.id);
    
    // Ensure likes is always an array and filter out any invalid entries
    const currentLikes = Array.isArray(story.likes) ? story.likes.filter(id => id && id.toString().trim()) : [];
    const userId = userConnecte.id.toString();
    const hasLiked = currentLikes.includes(userId);
    
    console.log('Current likes:', currentLikes, 'User ID:', userId, 'Has liked:', hasLiked);
    
    let newLikes;
    if (hasLiked) {
      // Remove user's like
      newLikes = currentLikes.filter((uid: string) => uid.toString() !== userId);
    } else {
      // Add user's like
      newLikes = [...currentLikes, userId];
    }
    
    console.log('New likes:', newLikes);
    
    const updatedStory = { ...story, likes: newLikes };
    setStory(updatedStory);

    // Update localStorage immediately
    try {
      const stories = JSON.parse(localStorage.getItem('recits') || '[]');
      const updatedStories = stories.map((s: any) => 
        s.id.toString() === story.id.toString() ? updatedStory : s
      );
      localStorage.setItem('recits', JSON.stringify(updatedStories));
      console.log('Like successfully updated in localStorage. New count:', newLikes.length);
    } catch (error) {
      console.error('Error updating likes in localStorage:', error);
    }
  };

  const handleRating = (newRating: number) => {
    if (!userConnecte?.id) {
      alert('Vous devez être connecté pour noter un récit');
      return;
    }

    // Get or create user ratings
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    const storyRatings = userRatings[story.id] || {};
    
    if (newRating === 0) {
      // Remove user's rating
      delete storyRatings[userConnecte.id];
      if (Object.keys(storyRatings).length === 0) {
        delete userRatings[story.id];
      } else {
        userRatings[story.id] = storyRatings;
      }
    } else {
      // Add/update user's rating
      storyRatings[userConnecte.id] = newRating;
      userRatings[story.id] = storyRatings;
    }
    
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    // Calculate new average rating
    const ratings = Object.values(storyRatings) as number[];
    const newAverageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : story.rating || 0;
    
    // Update story with new rating
    const updatedStory = {
      ...story,
      rating: newAverageRating,
      userRating: newRating === 0 ? null : newRating,
      totalRatings: ratings.length
    };
    
    setStory(updatedStory);
    
    // Update localStorage
    const stories = JSON.parse(localStorage.getItem('recits') || '[]');
    const updatedStories = stories.map((s: any) => s.id.toString() === story.id.toString() ? updatedStory : s);
    localStorage.setItem('recits', JSON.stringify(updatedStories));
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !userConnecte) return;

    const newComment = {
      id: Date.now().toString(),
      auteur: userConnecte.pseudo,
      contenu: comment.trim(),
      date: new Date().toISOString()
    };

    const updatedStory = {
      ...story,
      comments: [...(story.comments || []), newComment]
    };
    
    setStory(updatedStory);
    setComment('');

    // Update localStorage
    const stories = JSON.parse(localStorage.getItem('recits') || '[]');
    const updatedStories = stories.map((s: any) => s.id === story.id ? updatedStory : s);
    localStorage.setItem('recits', JSON.stringify(updatedStories));
  };

  if (!story) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <h2>Récit non trouvé</h2>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#357edd',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const currentLikes = Array.isArray(story.likes) ? story.likes.filter(id => id && id.toString().trim()) : [];
  const hasLiked = userConnecte?.id ? currentLikes.includes(userConnecte.id.toString()) : false;
  const likesCount = currentLikes.length;
  const rating = story.rating || 0;
  const viewsCount = story.views || 0;
  const commentsCount = story.comments?.length || 0;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '900px',
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

      {/* Story Header */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '20px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: '0 0 15px 0',
              color: '#2c3e50',
              fontSize: '2.5rem',
              fontWeight: '700'
            }}>
              {story.titre}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={18} color="#7f8c8d" />
                <span style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                  {story.ville && `${story.ville}, `}{story.pays}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#3498db', fontSize: '1.1rem' }}>
                  Par {String(story.auteur?.pseudo || 'Anonyme')}
                </span>
              </div>
            </div>

            {/* Interactive Rating Section */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    fill={story.userRating && star <= story.userRating ? "#ffd700" : "none"}
                    color={story.userRating && star <= story.userRating ? "#ffd700" : "#ddd"}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => handleRating(star)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
                <span style={{ color: '#7f8c8d', fontSize: '1rem', marginLeft: '8px' }}>
                  {story.userRating ? `Votre note: ${story.userRating}/5` : `Note moyenne: ${rating.toFixed(1)}/5`}
                </span>
              </div>
              {story.userRating && (
                <button
                  onClick={() => handleRating(0)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #95a5a6',
                    color: '#95a5a6',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Supprimer ma note
                </button>
              )}
            </div>
          </div>
          
          {story.type && (
            <span style={{
              backgroundColor: '#3498db',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {story.type}
            </span>
          )}
        </div>

        {/* Images */}
        {((story.images && story.images.length > 0) || story.imageUrl) && (
          <div style={{ marginBottom: '25px' }}>
            {story.images && story.images.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: story.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {story.images.map((image: string, idx: number) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${story.titre} - ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '2px solid #ecf0f1'
                    }}
                  />
                ))}
              </div>
            ) : story.imageUrl && (
              <img
                src={story.imageUrl}
                alt={story.titre}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '2px solid #ecf0f1'
                }}
              />
            )}
          </div>
        )}

        {/* Story Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 0',
          borderTop: '1px solid #ecf0f1',
          borderBottom: '1px solid #ecf0f1',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={18} color="#95a5a6" />
              <span style={{ color: '#95a5a6' }}>{viewsCount} vues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={18} color="#95a5a6" />
              <span style={{ color: '#95a5a6' }}>{commentsCount} commentaires</span>
            </div>
            {(story.budget || story.duree) && (
              <div style={{ display: 'flex', gap: '15px' }}>
                {story.budget && (
                  <span style={{ color: '#95a5a6' }}>💰 {story.budget}€</span>
                )}
                {story.duree && (
                  <span style={{ color: '#95a5a6' }}>⏱️ {story.duree}</span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggleLike}
            style={{
              background: 'none',
              border: '2px solid #e74c3c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '30px',
              transition: 'all 0.3s ease',
              backgroundColor: hasLiked ? '#e74c3c' : 'white',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.2)',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <Heart
              size={22}
              fill={hasLiked ? "white" : "#e74c3c"}
              color={hasLiked ? "white" : "#e74c3c"}
            />
            <span style={{
              color: hasLiked ? "white" : "#e74c3c",
              fontWeight: "600"
            }}>
              {hasLiked ? "J'aime" : "J'aime"} ({likesCount})
            </span>
          </button>
        </div>

        {/* Story Content */}
        <div style={{
          color: '#34495e',
          lineHeight: '1.8',
          fontSize: '1.1rem',
          whiteSpace: 'pre-wrap'
        }}>
          {story.contenu}
        </div>

        <div style={{
          marginTop: '25px',
          color: '#95a5a6',
          fontSize: '0.9rem'
        }}>
          Publié le {new Date(story.dateCreation).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Comments Section */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#2c3e50',
          fontSize: '1.5rem'
        }}>
          💬 Commentaires ({commentsCount})
        </h3>

        {/* Add Comment Form */}
        {userConnecte && (
          <form onSubmit={addComment} style={{ marginBottom: '30px' }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre avis sur ce récit..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '10px'
              }}
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: comment.trim() ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: comment.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Publier le commentaire
            </button>
          </form>
        )}

        {/* Comments List */}
        {story.comments && story.comments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {story.comments.map((comment: any) => (
              <div
                key={comment.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#3498db'
                  }}>
                    {String(comment.auteur)}
                  </span>
                  <span style={{
                    color: '#95a5a6',
                    fontSize: '0.85rem'
                  }}>
                    {new Date(comment.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p style={{
                  margin: '0',
                  color: '#34495e',
                  lineHeight: '1.6'
                }}>
                  {comment.contenu}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            color: '#95a5a6',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px'
          }}>
            Aucun commentaire pour le moment. Soyez le premier à partager votre avis !
          </p>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;