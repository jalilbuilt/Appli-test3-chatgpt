import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/user/UserContext';

const AddBonPlanForm: React.FC = () => {
  const { userConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titre: '',
    ville: '',
    pays: '',
    contenu: '',
    type: 'Aventure',
    budget: '',
    duree: '',
    imageUrl: '',
    selectedImages: [] as File[]
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new story
    const newStory = {
      id: Date.now().toString(),
      ...formData,
      budget: parseInt(formData.budget) || 0,
      description: formData.contenu.substring(0, 150) + '...',
      auteur: { id: userConnecte?.id || '', pseudo: userConnecte?.pseudo || 'Anonyme' },
      dateCreation: new Date().toISOString(),
      likes: [],
      rating: 0,
      views: 0,
      comments: [],
      images: imagePreview.length > 0 ? imagePreview : (formData.imageUrl ? [formData.imageUrl] : [])
    };

    // Save to localStorage
    const existingStories = JSON.parse(localStorage.getItem('recits') || '[]');
    existingStories.unshift(newStory);
    localStorage.setItem('recits', JSON.stringify(existingStories));

    // Redirect to home
    navigate('/home');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limiter à 10 images maximum
      const selectedFiles = files.slice(0, 10);
      
      setFormData({
        ...formData,
        selectedImages: [...formData.selectedImages, ...selectedFiles].slice(0, 10)
      });

      // Créer des aperçus
      const newPreviews: string[] = [];
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string);
            if (newPreviews.length === selectedFiles.length) {
              setImagePreview(prev => [...prev, ...newPreviews].slice(0, 10));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      selectedImages: newImages
    });
    setImagePreview(newPreviews);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '30px',
          fontSize: '2rem',
          textAlign: 'center'
        }}>
          ✈️ Partager votre expérience de voyage
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Titre du récit *
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              placeholder="Ex: Mon aventure en Patagonie"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Ville
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ex: Buenos Aires"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Pays *
              </label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                required
                placeholder="Ex: Argentine"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Type de voyage
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="Aventure">Aventure</option>
              <option value="Culture">Culture</option>
              <option value="Safari">Safari</option>
              <option value="Plage">Plage</option>
              <option value="Montagne">Montagne</option>
              <option value="Ville">Ville</option>
              <option value="Nature">Nature</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Budget (€)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="1500"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Durée
              </label>
              <input
                type="text"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                placeholder="10 jours"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Section d'upload d'images */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '600',
              color: '#333'
            }}>
              📸 Ajouter des photos (max 10)
            </label>
            
            <div style={{
              border: '2px dashed #e1e5e9',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                style={{ 
                  cursor: 'pointer',
                  display: 'block',
                  color: '#666'
                }}
              >
                <div style={{ marginBottom: '8px', fontSize: '24px' }}>📁</div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  Cliquez pour sélectionner des images
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  JPG, PNG, GIF jusqu'à 5MB chacune
                </div>
              </label>
            </div>

            {/* Aperçu des images */}
            {imagePreview.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  Images sélectionnées ({imagePreview.length}/10):
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px'
                }}>
                  {imagePreview.map((preview, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #e1e5e9'
                    }}>
                      <img
                        src={preview}
                        alt={`Aperçu ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220, 53, 69, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alternative: URL d'image */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              🔗 Ou URL d'une image (alternative)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <small style={{ color: '#666', fontSize: '14px', marginTop: '4px', display: 'block' }}>
              Si vous n'avez pas d'images à uploader, vous pouvez utiliser une URL
            </small>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Votre récit *
            </label>
            <textarea
              name="contenu"
              value={formData.contenu}
              onChange={handleChange}
              required
              rows={8}
              placeholder="Racontez votre expérience de voyage..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/home')}
              style={{
                padding: '12px 24px',
                border: '2px solid #6c757d',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#6c757d',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📝 Publier mon récit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBonPlanForm;