import React, { useState, useMemo } from 'react';
import { Heart, MapPin, Star, Calendar, Users, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Expert } from '@/components/ExpertProfile';

interface MatchingCriteria {
  destination: string;
  isDestinationFlexible: boolean;
  travelTypes: string[];
  isTypeFlexible: boolean;
  interests: string[];
  isInterestFlexible: boolean;
  budget: string;
  isBudgetFlexible: boolean;
  experience: string;
  isExperienceFlexible: boolean;
  groupSize: number;
  travelDates: string;
}

interface ExpertMatchingImprovedProps {
  experts: Expert[];
  onSelectExpert?: (expertId: string) => void;
  onClose?: () => void;
}

const TRAVEL_TYPES = [
  { id: 'solo', label: 'Voyage Solo', icon: '🚶‍♂️' },
  { id: 'couple', label: 'En Couple', icon: '💑' },
  { id: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Entre Amis', icon: '👥' },
  { id: 'business', label: 'Professionnel', icon: '💼' }
];

const INTERESTS = [
  { id: 'culture', label: 'Culture & Histoire', icon: '🏛️' },
  { id: 'adventure', label: 'Aventure', icon: '🏔️' },
  { id: 'gastronomy', label: 'Gastronomie', icon: '🍜' },
  { id: 'photography', label: 'Photographie', icon: '📸' },
  { id: 'diving', label: 'Plongée', icon: '🤿' },
  { id: 'trekking', label: 'Randonnée', icon: '🥾' },
  { id: 'beach', label: 'Plage & Détente', icon: '🏖️' },
  { id: 'nightlife', label: 'Vie Nocturne', icon: '🌃' }
];

// Données d'experts étendues (combinaison des deux systèmes)
const EXTENDED_EXPERTS: Expert[] = [
  {
    id: '1',
    pseudo: 'Marie-Claire',
    specializations: ['Voyage Solo', 'Sécurité', 'Culture Locale'],
    destinations: ['Japon', 'Corée du Sud', 'Taiwan', 'Singapour'],
    rating: 4.9,
    reviewsCount: 127,
    experienceYears: 8,
    languages: ['Français', 'Anglais', 'Japonais'],
    certifications: ['Guide Touristique', 'Premier Secours', 'Culture Asiatique'],
    description: 'Passionnée par l\'Asie depuis plus de 8 ans, je vous aide à découvrir les secrets du Japon et de la Corée du Sud.',
    priceRange: '45-60€/h',
    responseTime: '2h',
    expertise: [
      { category: 'Culture', level: 5, icon: '🏛️' },
      { category: 'Gastronomie', level: 4, icon: '🍜' },
      { category: 'Transport', level: 5, icon: '🚅' },
      { category: 'Hébergement', level: 4, icon: '🏨' }
    ],
    badges: ['verified', 'top-rated'],
    joinDate: '2019-03-15',
    lastActive: '2024-07-01',
    totalClients: 89
  },
  {
    id: '2',
    pseudo: 'Alexandre',
    specializations: ['Aventure', 'Trekking', 'Photo Nature'],
    destinations: ['Pérou', 'Bolivie', 'Équateur', 'Chili', 'Argentine'],
    rating: 4.8,
    reviewsCount: 94,
    experienceYears: 12,
    languages: ['Français', 'Espagnol', 'Anglais'],
    certifications: ['Guide Montagne', 'Photographe Pro', 'Premiers Secours'],
    description: 'Photographe et guide de montagne, j\'organise des trekkings inoubliables en Amérique du Sud.',
    priceRange: '50-70€/h',
    responseTime: '4h',
    expertise: [
      { category: 'Montagne', level: 5, icon: '⛰️' },
      { category: 'Photographie', level: 5, icon: '📸' },
      { category: 'Survie', level: 4, icon: '🏕️' },
      { category: 'Histoire', level: 3, icon: '📚' }
    ],
    badges: ['verified', 'adventure-specialist'],
    joinDate: '2017-08-22',
    lastActive: '2024-06-30',
    totalClients: 156
  },
  {
    id: '3',
    pseudo: 'Sophie',
    specializations: ['Famille', 'Budget Serré', 'Enfants'],
    destinations: ['Espagne', 'Portugal', 'Italie', 'Grèce', 'France'],
    rating: 4.7,
    reviewsCount: 203,
    experienceYears: 6,
    languages: ['Français', 'Espagnol', 'Italien'],
    certifications: ['Animatrice Enfants', 'Voyage Responsable'],
    description: 'Maman de 3 enfants, j\'aide les familles à voyager sans se ruiner en Europe.',
    priceRange: '35-45€/h',
    responseTime: '1h',
    expertise: [
      { category: 'Budget', level: 5, icon: '💰' },
      { category: 'Famille', level: 5, icon: '👨‍👩‍👧‍👦' },
      { category: 'Logistique', level: 4, icon: '📋' },
      { category: 'Activités', level: 4, icon: '🎪' }
    ],
    badges: ['verified', 'family-expert'],
    joinDate: '2020-01-10',
    lastActive: '2024-07-01',
    totalClients: 234
  },
  {
    id: '4',
    pseudo: 'Thomas',
    specializations: ['Plongée', 'Sports Nautiques', 'Îles Tropicales'],
    destinations: ['Maldives', 'Seychelles', 'Thaïlande', 'Philippines', 'Indonésie'],
    rating: 4.9,
    reviewsCount: 76,
    experienceYears: 10,
    languages: ['Français', 'Anglais', 'Thaï'],
    certifications: ['Instructor PADI', 'Rescue Diver', 'Boat Captain'],
    description: 'Instructeur de plongée professionnel, je vous guide vers les plus beaux spots sous-marins d\'Asie du Sud-Est.',
    priceRange: '55-75€/h',
    responseTime: '3h',
    expertise: [
      { category: 'Plongée', level: 5, icon: '🤿' },
      { category: 'Sports Nautiques', level: 5, icon: '🏄‍♂️' },
      { category: 'Îles', level: 4, icon: '🏝️' },
      { category: 'Faune Marine', level: 5, icon: '🐠' }
    ],
    badges: ['verified', 'diving-expert'],
    joinDate: '2018-05-30',
    lastActive: '2024-06-29',
    totalClients: 67
  }
];

export const ExpertMatchingImproved: React.FC<ExpertMatchingImprovedProps> = ({ 
  experts = EXTENDED_EXPERTS, 
  onSelectExpert,
  onClose 
}) => {
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    destination: '',
    isDestinationFlexible: false,
    travelTypes: [],
    isTypeFlexible: false,
    interests: [],
    isInterestFlexible: false,
    budget: '',
    isBudgetFlexible: false,
    experience: '',
    isExperienceFlexible: false,
    groupSize: 1,
    travelDates: ''
  });

  // ✅ Algorithme de matching amélioré et corrigé
  const matchedExperts = useMemo(() => {
    if (!showResults) return [];

    return experts.map(expert => {
      let score = 0;
      let matchReasons: string[] = [];

      // ✅ Score pour la destination (poids: 30%)
      if (criteria.isDestinationFlexible || !criteria.destination) {
        score += 30;
        matchReasons.push('Ouvert à toutes destinations');
      } else if (criteria.destination && expert.destinations.some(dest => 
        dest.toLowerCase().includes(criteria.destination.toLowerCase()) ||
        criteria.destination.toLowerCase().includes(dest.toLowerCase())
      )) {
        score += 30;
        matchReasons.push(`Expert en ${criteria.destination}`);
      } else {
        // Recherche plus large pour destination
        const found = expert.destinations.some(dest => {
          const destWords = dest.toLowerCase().split(' ');
          const searchWords = criteria.destination.toLowerCase().split(' ');
          return destWords.some(dw => searchWords.some(sw => dw.includes(sw) || sw.includes(dw)));
        });
        if (found) {
          score += 20; // Score partiel pour correspondance approximative
          matchReasons.push(`Destinations similaires`);
        }
      }

      // ✅ Score pour le type de voyage (poids: 25%) - CORRIGÉ
      if (criteria.isTypeFlexible || criteria.travelTypes.length === 0) {
        score += 25;
        matchReasons.push('Adapté à tous types de voyage');
      } else {
        const travelTypeMap: { [key: string]: string[] } = {
          'solo': ['Solo', 'Sécurité', 'Voyage Solo'],
          'family': ['Famille', 'Enfants', 'Voyage Famille'],
          'friends': ['Groupe', 'Amis', 'Entre Amis'],
          'business': ['Professionnel', 'Business', 'Affaires'],
          'couple': ['Romantique', 'Lune de miel', 'Couple'],
          'adventure': ['Aventure', 'Trekking', 'Nature']
        };
        
        const matchingTypes = criteria.travelTypes.filter(type =>
          travelTypeMap[type] && expert.specializations.some(spec =>
            travelTypeMap[type].some(keyword => 
              spec.toLowerCase().includes(keyword.toLowerCase())
            )
          )
        );
        
        if (matchingTypes.length > 0) {
          score += (matchingTypes.length / criteria.travelTypes.length) * 25;
          matchReasons.push(`Spécialisé ${matchingTypes.join(', ')}`);
        }
      }

      // ✅ Score pour les intérêts (poids: 20%) - CORRIGÉ
      if (criteria.isInterestFlexible || criteria.interests.length === 0) {
        score += 20;
        matchReasons.push('Recommandations personnalisées');
      } else {
        const interestMap: { [key: string]: string[] } = {
          'culture': ['Culture', 'Histoire', 'Patrimoine', 'Musée'],
          'adventure': ['Aventure', 'Trekking', 'Randonnée', 'Sport'],
          'gastronomy': ['Gastronomie', 'Cuisine', 'Nourriture', 'Restaurant'],
          'photography': ['Photo', 'Photographe', 'Photographie'],
          'diving': ['Plongée', 'Sous-marin', 'Aquatique'],
          'trekking': ['Trekking', 'Randonnée', 'Montagne', 'Marche'],
          'beach': ['Plage', 'Détente', 'Mer', 'Ocean', 'Côte'],
          'nightlife': ['Vie Nocturne', 'Nuit', 'Bar', 'Club', 'Sortie']
        };
        
        const matchingInterests = criteria.interests.filter(interest => {
          return expert.specializations.some(spec =>
            interestMap[interest]?.some(keyword =>
              spec.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        });

        if (matchingInterests.length > 0) {
          score += (matchingInterests.length / criteria.interests.length) * 20;
          matchReasons.push(`Intérêts: ${matchingInterests.length}/${criteria.interests.length}`);
        }
      }

      // ✅ Score pour le budget (poids: 15%) - CORRIGÉ
      if (criteria.isBudgetFlexible || !criteria.budget) {
        score += 15;
        matchReasons.push('Budget flexible');
      } else {
        // Extraction du prix minimum de la fourchette de l'expert
        const priceMatch = expert.priceRange.match(/(\d+)/);
        const expertMinPrice = priceMatch ? parseInt(priceMatch[1]) : 50;
        
        let budgetMatch = false;
        switch (criteria.budget) {
          case 'low':
            budgetMatch = expertMinPrice <= 50;
            break;
          case 'medium':
            budgetMatch = expertMinPrice >= 45 && expertMinPrice <= 70;
            break;
          case 'high':
            budgetMatch = expertMinPrice >= 60;
            break;
        }
        
        if (budgetMatch) {
          score += 15;
          matchReasons.push('Budget compatible');
        } else {
          // Score partiel si pas trop loin
          const distance = Math.abs(expertMinPrice - (criteria.budget === 'low' ? 40 : criteria.budget === 'medium' ? 60 : 80));
          if (distance <= 20) {
            score += 7;
            matchReasons.push('Budget proche');
          }
        }
      }

      // ✅ Score pour l'expérience (poids: 10%) - CORRIGÉ
      if (criteria.isExperienceFlexible || !criteria.experience) {
        score += 10;
        matchReasons.push('Tous niveaux d\'expérience');
      } else {
        let expMatch = false;
        switch (criteria.experience) {
          case 'beginner':
            expMatch = expert.experienceYears >= 3 && expert.experienceYears <= 7;
            break;
          case 'intermediate':
            expMatch = expert.experienceYears >= 5 && expert.experienceYears <= 10;
            break;
          case 'expert':
            expMatch = expert.experienceYears >= 8;
            break;
        }
        
        if (expMatch) {
          score += 10;
          matchReasons.push(`${expert.experienceYears} ans d'expérience`);
        } else {
          // Score partiel pour expérience proche
          score += 5;
          matchReasons.push(`Expérience: ${expert.experienceYears} ans`);
        }
      }

      // ✅ Bonus pour note élevée (poids: 5%)
      if (expert.rating >= 4.8) {
        score += 5;
        matchReasons.push('Excellentes évaluations');
      } else if (expert.rating >= 4.5) {
        score += 3;
        matchReasons.push('Très bonnes évaluations');
      }

      // ✅ Bonus pour réactivité (poids: 3%)
      const responseHours = parseInt(expert.responseTime);
      if (responseHours <= 2) {
        score += 3;
        matchReasons.push('Très réactif');
      } else if (responseHours <= 4) {
        score += 1;
      }

      // ✅ Bonus pour nombre de clients (poids: 2%)
      if (expert.totalClients >= 100) {
        score += 2;
        matchReasons.push('Très expérimenté');
      } else if (expert.totalClients >= 50) {
        score += 1;
      }

      return {
        expert,
        score: Math.min(score, 100),
        matchReasons,
        matchPercentage: Math.min(Math.round(score), 100)
      };
    }).sort((a, b) => b.score - a.score);
  }, [criteria, experts, showResults]);

  const handleInputChange = (field: keyof MatchingCriteria, value: any) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleInterest = (interestId: string) => {
    setCriteria(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleTravelType = (typeId: string) => {
    setCriteria(prev => ({
      ...prev,
      travelTypes: prev.travelTypes.includes(typeId)
        ? prev.travelTypes.filter(id => id !== typeId)
        : [...prev.travelTypes, typeId]
    }));
  };

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return criteria.isDestinationFlexible || criteria.destination.trim();
      case 2:
        return criteria.isTypeFlexible || criteria.travelTypes.length > 0;
      case 3:
        return criteria.isInterestFlexible || criteria.interests.length > 0;
      case 4:
        return true; // Budget et expérience sont optionnels
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
              📍 Où souhaitez-vous voyager ?
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '15px',
                cursor: 'pointer',
                padding: '12px',
                border: '2px solid',
                borderRadius: '8px',
                borderColor: criteria.isDestinationFlexible ? '#28a745' : '#ddd',
                backgroundColor: criteria.isDestinationFlexible ? '#f8fff9' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={criteria.isDestinationFlexible}
                  onChange={(e) => handleInputChange('isDestinationFlexible', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600 }}>🌍 Je suis flexible sur la destination</span>
              </label>
            </div>

            {!criteria.isDestinationFlexible && (
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Ex: Japon, Thaïlande, Pérou..."
                  value={criteria.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '10px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
              👥 Type de voyage
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '15px',
                cursor: 'pointer',
                padding: '12px',
                border: '2px solid',
                borderRadius: '8px',
                borderColor: criteria.isTypeFlexible ? '#28a745' : '#ddd',
                backgroundColor: criteria.isTypeFlexible ? '#f8fff9' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={criteria.isTypeFlexible}
                  onChange={(e) => handleInputChange('isTypeFlexible', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600 }}>✨ Tous types de voyage m'intéressent</span>
              </label>
            </div>

            {!criteria.isTypeFlexible && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {TRAVEL_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleTravelType(type.id)}
                    style={{
                      padding: '15px',
                      border: '2px solid',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      backgroundColor: criteria.travelTypes.includes(type.id) ? '#e3f2fd' : 'white',
                      borderColor: criteria.travelTypes.includes(type.id) ? '#2196f3' : '#e1e5e9',
                      color: criteria.travelTypes.includes(type.id) ? '#1976d2' : '#333'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
              🎨 Centres d'intérêt
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '15px',
                cursor: 'pointer',
                padding: '12px',
                border: '2px solid',
                borderRadius: '8px',
                borderColor: criteria.isInterestFlexible ? '#28a745' : '#ddd',
                backgroundColor: criteria.isInterestFlexible ? '#f8fff9' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={criteria.isInterestFlexible}
                  onChange={(e) => handleInputChange('isInterestFlexible', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600 }}>🎲 Recommandez-moi selon mes besoins</span>
              </label>
            </div>
            
            {!criteria.isInterestFlexible && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                {INTERESTS.map(interest => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    style={{
                      padding: '15px',
                      border: '2px solid',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      backgroundColor: criteria.interests.includes(interest.id) ? '#e8f5e8' : 'white',
                      borderColor: criteria.interests.includes(interest.id) ? '#4caf50' : '#e1e5e9',
                      color: criteria.interests.includes(interest.id) ? '#2e7d32' : '#333'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{interest.icon}</span>
                    <span>{interest.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
              💰 Budget & Expérience
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Budget par consultation :</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '8px',
                    border: '2px solid',
                    borderRadius: '8px',
                    borderColor: criteria.isBudgetFlexible ? '#28a745' : '#ddd',
                    backgroundColor: criteria.isBudgetFlexible ? '#f8fff9' : 'white'
                  }}>
                    <input
                      type="checkbox"
                      checked={criteria.isBudgetFlexible}
                      onChange={(e) => handleInputChange('isBudgetFlexible', e.target.checked)}
                    />
                    <span>💸 Budget flexible</span>
                  </label>
                </div>

                {!criteria.isBudgetFlexible && (
                  <select
                    value={criteria.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Sélectionner un budget</option>
                    <option value="low">€ Budget serré (30-50€/h)</option>
                    <option value="medium">€€ Moyen (50-65€/h)</option>
                    <option value="high">€€€ Élevé (65€+/h)</option>
                  </select>
                )}
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Expérience souhaitée :</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '8px',
                    border: '2px solid',
                    borderRadius: '8px',
                    borderColor: criteria.isExperienceFlexible ? '#28a745' : '#ddd',
                    backgroundColor: criteria.isExperienceFlexible ? '#f8fff9' : 'white'
                  }}>
                    <input
                      type="checkbox"
                      checked={criteria.isExperienceFlexible}
                      onChange={(e) => handleInputChange('isExperienceFlexible', e.target.checked)}
                    />
                    <span>🎯 Tous niveaux</span>
                  </label>
                </div>

                {!criteria.isExperienceFlexible && (
                  <select
                    value={criteria.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Sélectionner le niveau</option>
                    <option value="beginner">🌱 Expert débutant (3-7 ans)</option>
                    <option value="intermediate">🌿 Expert confirmé (5-10 ans)</option>
                    <option value="expert">🌳 Expert chevronné (8+ ans)</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>
          🎉 Vos experts recommandés
        </h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          {matchedExperts.length} expert{matchedExperts.length > 1 ? 's' : ''} correspond{matchedExperts.length > 1 ? 'ent' : ''} à vos critères
        </p>
        <button
          onClick={() => setShowResults(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Modifier mes critères
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {matchedExperts.slice(0, 5).map(({ expert, score, matchReasons, matchPercentage }) => (
          <div
            key={expert.id}
            style={{
              border: '2px solid #e1e5e9',
              borderRadius: '15px',
              padding: '20px',
              backgroundColor: 'white',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Badge de matching */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '20px',
              backgroundColor: matchPercentage >= 80 ? '#28a745' : matchPercentage >= 60 ? '#ffc107' : '#17a2b8',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {matchPercentage}% Match
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#357edd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {expert.pseudo.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h4 style={{ margin: '0', fontSize: '20px', color: '#333' }}>{expert.pseudo}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= expert.rating ? "#ffd700" : "none"}
                        color={star <= expert.rating ? "#ffd700" : "#ddd"}
                      />
                    ))}
                    <span style={{ marginLeft: '6px', color: '#666', fontSize: '14px' }}>
                      {expert.rating} ({expert.reviewsCount} avis)
                    </span>
                  </div>
                </div>

                <p style={{ color: '#666', marginBottom: '12px', fontSize: '15px' }}>
                  {expert.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
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

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#333', fontSize: '14px' }}>Pourquoi cet expert :</strong>
                  <ul style={{ margin: '4px 0 0 20px', padding: '0', color: '#666', fontSize: '13px' }}>
                    {matchReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  {expert.priceRange}
                </div>
                <button
                  onClick={() => onSelectExpert && onSelectExpert(expert.id)}
                  style={{
                    padding: '10px 20px',
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
            </div>
          </div>
        ))}
      </div>

      {matchedExperts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😔</div>
          <h4>Aucun expert trouvé</h4>
          <p>Essayez de modifier vos critères de recherche</p>
          <button
            onClick={() => {
              setStep(1);
              setShowResults(false);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#357edd',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      padding: '20px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Bouton de fermeture repositionné */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #ddd',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10
          }}
          title="Fermer"
        >
          ×
        </button>
      )}

      {!showResults ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '20px', padding: '0 20px', paddingTop: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              {[1, 2, 3, 4].map(stepNum => (
                <div
                  key={stepNum}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: step >= stepNum ? '#28a745' : '#e1e5e9',
                    color: step >= stepNum ? 'white' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  {stepNum}
                </div>
              ))}
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e1e5e9',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((step - 1) / 3) * 100}%`,
                height: '100%',
                backgroundColor: '#28a745',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Contenu avec scroll */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px',
            maxHeight: '60vh'
          }}>
            {renderStep()}
          </div>

          {/* Navigation avec bouton Annuler */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderTop: '1px solid #eaeaea',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setStep(1);
                  setShowResults(false);
                  onClose && onClose();
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✕ Annuler
              </button>
              
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                style={{
                  padding: '10px 20px',
                  backgroundColor: step === 1 ? '#e1e5e9' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: step === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ArrowLeft size={16} />
                Précédent
              </button>
            </div>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed(step)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !canProceed(step) ? '#e1e5e9' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !canProceed(step) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
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
                  gap: '8px'
                }}
              >
                <Target size={20} />
                Voir mes experts recommandés
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          maxHeight: '90vh'
        }}>
          {renderResults()}
        </div>
      )}
    </div>
  );
};
export default ExpertMatchingImproved;