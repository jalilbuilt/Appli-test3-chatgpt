import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Users } from 'lucide-react';
import ExpertProfile, { Expert } from '@/components/ExpertProfile';

interface ExpertSearchProps {
  onContactExpert?: (expertId: string) => void;
}

// Données d'exemple des experts
const SAMPLE_EXPERTS: Expert[] = [
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
    description: 'Passionnée par l\'Asie depuis plus de 8 ans, je vous aide à découvrir les secrets du Japon et de la Corée du Sud. Spécialiste des voyages solo pour femmes.',
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
    description: 'Photographe et guide de montagne, j\'organise des trekkings inoubliables en Amérique du Sud. Expert du Machu Picchu et des Andes.',
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
    specializations: ['Voyage Famille', 'Budget Serré', 'Enfants'],
    destinations: ['Espagne', 'Portugal', 'Italie', 'Grèce', 'France'],
    rating: 4.7,
    reviewsCount: 203,
    experienceYears: 6,
    languages: ['Français', 'Espagnol', 'Italien'],
    certifications: ['Animatrice Enfants', 'Voyage Responsable'],
    description: 'Maman de 3 enfants, j\'aide les familles à voyager sans se ruiner en Europe. Mes conseils pratiques vous feront économiser temps et argent.',
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
    description: 'Instructeur de plongée professionnel, je vous guide vers les plus beaux spots sous-marins d\'Asie du Sud-Est et de l\'océan Indien.',
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

const SPECIALIZATIONS = [
  'Voyage Solo', 'Famille', 'Aventure', 'Culture', 'Gastronomie', 
  'Plongée', 'Trekking', 'Budget Serré', 'Luxe', 'Photographie'
];

const DESTINATIONS = [
  'Japon', 'Thaïlande', 'Pérou', 'Espagne', 'Italie', 'Grèce', 
  'Maldives', 'Corée du Sud', 'Portugal', 'Chili'
];

export const ExpertSearch: React.FC<ExpertSearchProps> = ({ onContactExpert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrage des experts
  const filteredExperts = useMemo(() => {
    let filtered = [...SAMPLE_EXPERTS];

    // Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expert => 
        expert.pseudo.toLowerCase().includes(query) ||
        expert.description.toLowerCase().includes(query) ||
        expert.specializations.some(spec => spec.toLowerCase().includes(query)) ||
        expert.destinations.some(dest => dest.toLowerCase().includes(query))
      );
    }

    // Filtrage par spécialisations
    if (selectedSpecializations.length > 0) {
      filtered = filtered.filter(expert =>
        selectedSpecializations.some(spec =>
          expert.specializations.includes(spec)
        )
      );
    }

    // Filtrage par destinations
    if (selectedDestinations.length > 0) {
      filtered = filtered.filter(expert =>
        selectedDestinations.some(dest =>
          expert.destinations.includes(dest)
        )
      );
    }

    // Filtrage par note minimale
    if (minRating > 0) {
      filtered = filtered.filter(expert => expert.rating >= minRating);
    }

    // Filtrage par prix
    if (priceRange) {
      // Logique de filtrage par prix (simplifié)
      filtered = filtered.filter(expert => {
        if (priceRange === 'low') return expert.priceRange.includes('35') || expert.priceRange.includes('45');
        if (priceRange === 'medium') return expert.priceRange.includes('50') || expert.priceRange.includes('60');
        if (priceRange === 'high') return expert.priceRange.includes('70') || expert.priceRange.includes('75');
        return true;
      });
    }

    // Tri
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'experience':
        filtered.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = parseInt(a.priceRange.split('-')[0]);
          const priceB = parseInt(b.priceRange.split('-')[0]);
          return priceA - priceB;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedSpecializations, selectedDestinations, priceRange, minRating, sortBy]);

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const toggleDestination = (dest: string) => {
    setSelectedDestinations(prev =>
      prev.includes(dest)
        ? prev.filter(d => d !== dest)
        : [...prev, dest]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecializations([]);
    setSelectedDestinations([]);
    setPriceRange('');
    setMinRating(0);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '10px' }}>
          🎯 Trouvez votre expert voyage
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Connectez-vous avec des experts locaux pour des conseils personnalisés
        </p>
      </div>

      {/* Barre de recherche principale */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} 
          />
          <input
            type="text"
            placeholder="Rechercher un expert, une destination, une spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '45px',
              paddingRight: '20px',
              paddingTop: '15px',
              paddingBottom: '15px',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#357edd'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        {/* Filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Spécialisations */}
          <div>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>🎯 Spécialisations</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: '2px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedSpecializations.includes(spec) ? '#e3f2fd' : '#f8f9fa',
                    color: selectedSpecializations.includes(spec) ? '#1976d2' : '#666',
                    borderColor: selectedSpecializations.includes(spec) ? '#2196f3' : 'transparent'
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>🌍 Destinations</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DESTINATIONS.map(dest => (
                <button
                  key={dest}
                  onClick={() => toggleDestination(dest)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: '2px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedDestinations.includes(dest) ? '#e8f5e8' : '#f8f9fa',
                    color: selectedDestinations.includes(dest) ? '#2e7d32' : '#666',
                    borderColor: selectedDestinations.includes(dest) ? '#4caf50' : 'transparent'
                  }}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Prix et Note */}
          <div>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>💰 Prix & Note</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e1e5e9',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="">Tous les prix</option>
                <option value="low">€ (30-50€/h)</option>
                <option value="medium">€€ (50-65€/h)</option>
                <option value="high">€€€ (65€+/h)</option>
              </select>
              
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e1e5e9',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value={0}>Toutes les notes</option>
                <option value={4}>4+ étoiles</option>
                <option value={4.5}>4.5+ étoiles</option>
                <option value={4.8}>4.8+ étoiles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions et tri */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eaeaea'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {filteredExperts.length} expert{filteredExperts.length !== 1 ? 's' : ''} trouvé{filteredExperts.length !== 1 ? 's' : ''}
            </span>
            
            {(selectedSpecializations.length > 0 || selectedDestinations.length > 0 || priceRange || minRating > 0) && (
              <button
                onClick={clearFilters}
                style={{
                  fontSize: '14px',
                  color: '#357edd',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Effacer les filtres
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '2px solid #e1e5e9',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="rating">Mieux notés</option>
              <option value="reviews">Plus d'avis</option>
              <option value="experience">Plus d'expérience</option>
              <option value="price-low">Prix croissant</option>
            </select>

            <div style={{ display: 'flex', border: '2px solid #e1e5e9', borderRadius: '8px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#357edd' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#666',
                  cursor: 'pointer',
                  borderRadius: '6px 0 0 6px'
                }}
              >
                ⊞ Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#357edd' : 'white',
                  color: viewMode === 'list' ? 'white' : '#666',
                  cursor: 'pointer',
                  borderRadius: '0 6px 6px 0'
                }}
              >
                ☰ Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : 'none',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gap: '20px'
      }}>
        {filteredExperts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Aucun expert trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          filteredExperts.map(expert => (
            <ExpertProfile
              key={expert.id}
              expert={expert}
              onContactExpert={onContactExpert}
              isCompact={viewMode === 'grid'}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default ExpertSearch;