import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from "@/user/UserContext";
import { AlertTriangle, MapPin, Clock, Users, MessageCircle, Phone, X, Camera, Mic, Send } from 'lucide-react';

interface SOSRequest {
  id: string;
  userId: string;
  userName: string;
  userPseudo?: string;
  message: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'active' | 'helped' | 'resolved';
  helpers: string[];
  responses: SOSResponse[];
  attachments?: {
    type: 'image' | 'audio';
    url: string;
    timestamp: string;
  }[];
}

interface SOSResponse {
  id: string;
  helperId: string;
  helperName: string;
  message: string;
  timestamp: string;
  isExpert?: boolean;
}

interface SOSSystemV2Props {
  onClose: () => void;
}

const SOS_CATEGORIES = [
  { id: 'medical', label: '🏥 Urgence médicale', color: '#e74c3c', description: 'Blessure, malaise, accident' },
  { id: 'security', label: '🚨 Sécurité', color: '#c0392b', description: 'Danger, vol, agression' },
  { id: 'transport', label: '🚗 Transport', color: '#f39c12', description: 'Panne, accident, perdu' },
  { id: 'language', label: '🗣️ Communication', color: '#3498db', description: 'Barrière linguistique' },
  { id: 'direction', label: '🗺️ Orientation', color: '#2ecc71', description: 'Perdu, direction' },
  { id: 'accommodation', label: '🏨 Hébergement', color: '#9b59b6', description: 'Logement d\'urgence' },
  { id: 'money', label: '💰 Financier', color: '#e67e22', description: 'Vol, carte bloquée' },
  { id: 'other', label: '❓ Autre', color: '#95a5a6', description: 'Autre type d\'urgence' }
];

const URGENCY_LEVELS = [
  { id: 'low', label: '🟢 Faible', description: 'Besoin d\'aide mais pas urgent', color: '#27ae60' },
  { id: 'medium', label: '🟡 Moyen', description: 'Besoin d\'aide rapidement', color: '#f39c12' },
  { id: 'high', label: '🟠 Élevé', description: 'Situation difficile, aide urgente', color: '#e67e22' },
  { id: 'critical', label: '🔴 Critique', description: 'URGENCE ABSOLUE', color: '#e74c3c' }
];

export const SOSSystemV2: React.FC<SOSSystemV2Props> = ({ onClose }) => {
  const { userConnecte } = useContext(UserContext);
  const [step, setStep] = useState<'request' | 'chat' | 'history'>('request');
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<SOSRequest | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  // Form states avec validation en temps réel
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Chat states V2
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load SOS requests
  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
    setSosRequests(savedRequests);
  }, []);

  // Geolocation moderne avec plus de précision
  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          // Simulation géocodage inverse (en vrai, utiliser une API)
          const mockAddress = `Position précise: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setLocationError('');
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          setLocationError('Impossible d\'obtenir votre position précise. Vous pouvez continuer sans géolocalisation.');
        },
        options
      );
    }
  }, []);

  // Validation en temps réel
  useEffect(() => {
    const errors: {[key: string]: string} = {};
    
    if (message.length > 0 && message.length < 10) {
      errors.message = 'Description trop courte (minimum 10 caractères)';
    }
    if (message.length > 500) {
      errors.message = 'Description trop longue (maximum 500 caractères)';
    }
    if (!category) {
      errors.category = 'Veuillez sélectionner une catégorie';
    }
    
    setFormErrors(errors);
  }, [message, category]);

  // Gestion upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission SOS moderne avec notifications améliorées
  const handleSubmitSOS = async () => {
    if (Object.keys(formErrors).length > 0 || !message.trim() || !category) {
      return;
    }

    setIsSubmitting(true);

    const newRequest: SOSRequest = {
      id: `sos_${Date.now()}`,
      userId: userConnecte?.id || 'anonymous',
      userName: userConnecte?.pseudo || 'Utilisateur anonyme',
      userPseudo: userConnecte?.pseudo || 'Utilisateur anonyme',
      message: message.trim(),
      description: message.trim(),
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `Position: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
      } : undefined,
      timestamp: new Date().toISOString(),
      urgencyLevel,
      priority: urgencyLevel,
      category,
      status: 'active',
      helpers: [],
      responses: [],
      attachments: selectedImage ? [{
        type: 'image',
        url: imagePreview,
        timestamp: new Date().toISOString()
      }] : []
    };

    // Sauvegarde
    const existingRequests = JSON.parse(localStorage.getItem('sosRequests') || '[]');
    const updatedRequests = [newRequest, ...existingRequests];
    setSosRequests(updatedRequests);
    localStorage.setItem('sosRequests', JSON.stringify(updatedRequests));

    // Notifications cross-onglets améliorées
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sosRequests',
      newValue: JSON.stringify(updatedRequests),
    }));

    // Notification système moderne
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🆘 Demande SOS envoyée', {
        body: `Votre demande "${category}" a été envoyée à la communauté`,
        icon: '/favicon.ico',
        tag: 'sos-sent',
        requireInteraction: false
      });
    }

    setCurrentRequest(newRequest);
    setStep('chat');
    setIsSubmitting(false);
  };

  // Chat en temps réel avec indicateur de frappe
  const sendChatMessage = () => {
    if (!chatMessage.trim() || !currentRequest) return;

    const response: SOSResponse = {
      id: `response_${Date.now()}`,
      helperId: userConnecte?.id || 'anonymous',
      helperName: userConnecte?.pseudo || 'Anonyme',
      message: chatMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedRequests = sosRequests.map(req => {
      if (req.id === currentRequest.id) {
        return {
          ...req,
          responses: [...req.responses, response]
        };
      }
      return req;
    });

    setSosRequests(updatedRequests);
    localStorage.setItem('sosRequests', JSON.stringify(updatedRequests));
    setChatMessage('');
    setIsTyping(false);
  };

  // Simulation indicateur "en train d'écrire"
  useEffect(() => {
    if (chatMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [chatMessage]);

  const renderSOSForm = () => (
    <div className="sos-form-v2">
      <div className="sos-header-v2">
        <AlertTriangle size={32} color="#e74c3c" />
        <div>
          <h2>🆘 Demande d'aide moderne</h2>
          <p>Interface 2024 • Géolocalisation précise • Notifications temps réel</p>
        </div>
      </div>

      {/* Status de géolocalisation moderne */}
      <div className={`location-status-v2 ${location ? 'success' : 'warning'}`}>
        <MapPin size={20} />
        <div>
          {location ? (
            <div>
              <strong>📍 Position détectée avec précision</strong>
              <p>Lat: {location.coords.latitude.toFixed(6)}, Lng: {location.coords.longitude.toFixed(6)}</p>
              <small>Précision: ±{location.coords.accuracy?.toFixed(0)}m</small>
            </div>
          ) : (
            <div>
              <strong>⚠️ Géolocalisation indisponible</strong>
              <p>{locationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sélection catégorie moderne */}
      <div className="form-group-v2">
        <label>Type d'urgence *</label>
        <div className="category-grid-v2">
          {SOS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-btn-v2 ${category === cat.id ? 'selected' : ''}`}
              onClick={() => setCategory(cat.id)}
              style={{ 
                borderColor: category === cat.id ? cat.color : '#ddd',
                backgroundColor: category === cat.id ? `${cat.color}15` : 'white'
              }}
            >
              <div className="category-header">
                {cat.label}
              </div>
              <div className="category-description">
                {cat.description}
              </div>
            </button>
          ))}
        </div>
        {formErrors.category && (
          <div className="error-message">{formErrors.category}</div>
        )}
      </div>

      {/* Niveau d'urgence moderne */}
      <div className="form-group-v2">
        <label>Niveau d'urgence *</label>
        <div className="urgency-selector-v2">
          {URGENCY_LEVELS.map(level => (
            <button
              key={level.id}
              className={`urgency-btn-v2 ${urgencyLevel === level.id ? 'selected' : ''}`}
              onClick={() => setUrgencyLevel(level.id as any)}
              style={{
                borderColor: urgencyLevel === level.id ? level.color : '#ddd',
                backgroundColor: urgencyLevel === level.id ? `${level.color}15` : 'white'
              }}
            >
              <div className="urgency-label">{level.label}</div>
              <div className="urgency-description">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload d'image moderne */}
      <div className="form-group-v2">
        <label>📸 Ajouter une photo (optionnel)</label>
        <div className="upload-zone">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload-v2"
          />
          <label htmlFor="image-upload-v2" className="upload-label">
            <Camera size={24} />
            <span>Cliquez pour ajouter une photo</span>
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Aperçu" />
              <button onClick={() => {setSelectedImage(null); setImagePreview('');}}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Description avec compteur */}
      <div className="form-group-v2">
        <label>Décrivez votre situation *</label>
        <div className="textarea-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez clairement votre problème et le type d'aide dont vous avez besoin..."
            rows={4}
            maxLength={500}
            className={formErrors.message ? 'error' : ''}
          />
          <div className="char-counter">
            <span className={message.length > 450 ? 'warning' : ''}>
              {message.length}/500
            </span>
          </div>
        </div>
        {formErrors.message && (
          <div className="error-message">{formErrors.message}</div>
        )}
      </div>

      {/* Contacts d'urgence */}
      <div className="emergency-info-v2">
        <h4>📞 En cas d'urgence vitale immédiate :</h4>
        <div className="emergency-contacts-v2">
          <div className="emergency-number">🚨 Police: 17</div>
          <div className="emergency-number">🚑 SAMU: 15</div>
          <div className="emergency-number">🚒 Pompiers: 18</div>
          <div className="emergency-number">🆘 Urgences: 112</div>
        </div>
      </div>

      {/* Bouton de soumission moderne */}
      <button
        className="sos-submit-btn-v2"
        onClick={handleSubmitSOS}
        disabled={isSubmitting || Object.keys(formErrors).length > 0 || !message.trim() || !category}
      >
        {isSubmitting ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Envoi en cours...</span>
          </div>
        ) : (
          <>
            <AlertTriangle size={20} />
            <span>Envoyer la demande d'aide</span>
          </>
        )}
      </button>

      <style>{`
        .sos-form-v2 {
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
        }

        .sos-header-v2 {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #fee, #fdd);
          border-radius: 12px;
          border: 1px solid #e74c3c;
        }

        .sos-header-v2 h2 {
          margin: 0;
          color: #c0392b;
          font-size: 1.5rem;
        }

        .sos-header-v2 p {
          margin: 4px 0 0 0;
          color: #e67e22;
          font-size: 0.9rem;
        }

        .location-status-v2 {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          border: 2px solid;
        }

        .location-status-v2.success {
          background: #f0fff4;
          border-color: #28a745;
          color: #155724;
        }

        .location-status-v2.warning {
          background: #fff3cd;
          border-color: #ffc107;
          color: #856404;
        }

        .form-group-v2 {
          margin-bottom: 24px;
        }

        .form-group-v2 label {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .category-grid-v2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .category-btn-v2 {
          padding: 16px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .category-btn-v2:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .category-btn-v2.selected {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .category-header {
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 1rem;
        }

        .category-description {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.3;
        }

        .urgency-selector-v2 {
          display: grid;
          gap: 10px;
        }

        .urgency-btn-v2 {
          padding: 16px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .urgency-btn-v2:hover {
          transform: translateX(4px);
        }

        .urgency-btn-v2.selected {
          transform: translateX(8px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .urgency-label {
          font-weight: 600;
          font-size: 1rem;
        }

        .urgency-description {
          font-size: 0.85rem;
          color: #666;
        }

        .upload-zone {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: #3498db;
          background: #f8f9ff;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #666;
        }

        .image-preview {
          position: relative;
          margin-top: 12px;
          display: inline-block;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 150px;
          border-radius: 8px;
          border: 2px solid #ddd;
        }

        .image-preview button {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
        }

        .textarea-container {
          position: relative;
        }

        .textarea-container textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid #ddd;
          border-radius: 12px;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .textarea-container textarea:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .textarea-container textarea.error {
          border-color: #e74c3c;
        }

        .char-counter {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 0.8rem;
          color: #999;
        }

        .char-counter .warning {
          color: #e67e22;
          font-weight: 600;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 4px;
          padding: 8px 12px;
          background: #fee;
          border-radius: 6px;
          border: 1px solid #e74c3c;
        }

        .emergency-info-v2 {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border: 2px solid #f39c12;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }

        .emergency-info-v2 h4 {
          margin: 0 0 12px 0;
          color: #d68910;
          font-size: 1.1rem;
        }

        .emergency-contacts-v2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
        }

        .emergency-number {
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          border: 1px solid #f39c12;
        }

        .sos-submit-btn-v2 {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        .sos-submit-btn-v2:hover:not(:disabled) {
          background: linear-gradient(135deg, #c0392b, #a93226);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
        }

        .sos-submit-btn-v2:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .category-grid-v2 {
            grid-template-columns: 1fr;
          }
          
          .emergency-contacts-v2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );

  const renderChatSOS = () => (
    <div className="sos-chat-v2">
      <div className="chat-header-v2">
        <div className="request-summary">
          <h3>🆘 {currentRequest?.category} • {currentRequest?.urgencyLevel.toUpperCase()}</h3>
          <p>{currentRequest?.message}</p>
        </div>
      </div>

      <div className="chat-messages-v2">
        {currentRequest?.responses.length === 0 ? (
          <div className="no-messages">
            <MessageCircle size={48} />
            <h4>En attente d'aide</h4>
            <p>Votre demande a été envoyée. Les membres de la communauté vont vous répondre.</p>
          </div>
        ) : (
          currentRequest?.responses.map((response) => (
            <div key={response.id} className="message-v2">
              <div className="message-author">{response.helperName}</div>
              <div className="message-content">{response.message}</div>
              <div className="message-time">
                {new Date(response.timestamp).toLocaleTimeString('fr-FR')}
              </div>
            </div>
          ))
        )}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>{typingUsers.join(', ')} en train d'écrire...</span>
          </div>
        )}
      </div>

      <div className="chat-input-v2">
        <div className="input-container">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Répondre ou donner des détails..."
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
          />
          <button onClick={sendChatMessage} disabled={!chatMessage.trim()}>
            <Send size={20} />
          </button>
        </div>
        
        {isTyping && (
          <div className="typing-status">Vous êtes en train d'écrire...</div>
        )}
      </div>

      <style>{`
        .sos-chat-v2 {
          display: flex;
          flex-direction: column;
          height: 70vh;
          padding: 20px;
        }

        .chat-header-v2 {
          background: linear-gradient(135deg, #fee, #fdd);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #e74c3c;
        }

        .request-summary h3 {
          margin: 0 0 8px 0;
          color: #c0392b;
        }

        .request-summary p {
          margin: 0;
          color: #666;
        }

        .chat-messages-v2 {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .no-messages {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .no-messages svg {
          opacity: 0.5;
          margin-bottom: 16px;
        }

        .message-v2 {
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid #ddd;
        }

        .message-author {
          font-weight: 600;
          color: #3498db;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .message-content {
          color: #333;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .message-time {
          color: #999;
          font-size: 0.8rem;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #e3f2fd;
          border-radius: 20px;
          color: #1976d2;
          font-size: 0.9rem;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #1976d2;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.2); opacity: 1; }
        }

        .chat-input-v2 {
          background: white;
          border-radius: 12px;
          border: 1px solid #ddd;
          padding: 16px;
        }

        .input-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .input-container input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 25px;
          outline: none;
          font-size: 1rem;
        }

        .input-container input:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .input-container button {
          padding: 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-container button:hover:not(:disabled) {
          background: #2980b9;
          transform: scale(1.05);
        }

        .input-container button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .typing-status {
          margin-top: 8px;
          color: #666;
          font-size: 0.85rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header avec navigation */}
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>
              {step === 'request' ? '🆘 SOS Moderne' : 
               step === 'chat' ? '💬 Chat d\'Assistance' : 
               '📋 Historique'}
            </h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              {step === 'request' ? 'Version 2024 • Interface moderne' :
               step === 'chat' ? 'Assistance en temps réel' :
               'Vos demandes précédentes'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Navigation tabs */}
            {currentRequest && (
              <button
                onClick={() => setStep(step === 'request' ? 'chat' : 'request')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {step === 'request' ? '💬 Voir Chat' : '📝 Modifier Demande'}
              </button>
            )}
            
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '28px',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {step === 'request' && renderSOSForm()}
          {step === 'chat' && renderChatSOS()}
        </div>
      </div>
    </div>
  );
};
export default SOSSystemV2;