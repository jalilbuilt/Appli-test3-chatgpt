import React, { useState, useEffect } from 'react';

interface FilterState {
  searchQuery: string;
  categories: string[];
  budgetRange: string[];
  suggestions: string[];
  showSuggestions: boolean;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  currentSearch: string;
}

const CATEGORIES = [
  { id: 'culture', label: 'Culture & Histoire', icon: '🏛️' },
  { id: 'adventure', label: 'Aventure & Nature', icon: '🏔️' },
  { id: 'beach', label: 'Plage & Détente', icon: '🏖️' },
  { id: 'budget', label: 'Budget & Économique', icon: '💰' }
];

const BUDGET_RANGES = [
  { id: 'low', label: '€ (0-50€/jour)', range: [0, 50] },
  { id: 'medium', label: '€€ (50-100€/jour)', range: [50, 100] },
  { id: 'high', label: '€€€ (100€+/jour)', range: [100, 999] }
];

// Données pour l'autocomplétion
const DESTINATIONS = [
  'Paris', 'Rome', 'Bangkok', 'Tokyo', 'Londres', 'New York', 'Barcelona', 'Amsterdam',
  'Berlin', 'Prague', 'Lisbonne', 'Madrid', 'Florence', 'Venise', 'Kyoto', 'Séoul',
  'Marrakech', 'Le Caire', 'Istanbul', 'Athènes', 'Santorini', 'Mykonos', 'Bali',
  'Phuket', 'Sydney', 'Melbourne', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Cusco',
  'France', 'Italie', 'Espagne', 'Grèce', 'Thaïlande', 'Japon', 'Corée du Sud',
  'Maroc', 'Turquie', 'Égypte', 'Indonésie', 'Australie', 'Brésil', 'Argentine', 'Pérou'
];

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({ 
  onFiltersChange, 
  totalResults, 
  currentSearch 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: currentSearch,
    categories: [],
    budgetRange: [],
    suggestions: [],
    showSuggestions: false
  });

  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);

  // Synchroniser avec la recherche externe
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery: currentSearch
    }));
  }, [currentSearch]);

  // Mise à jour des suggestions
  useEffect(() => {
    if (filters.searchQuery.length > 1) {
      const matchingSuggestions = DESTINATIONS
        .filter(dest => 
          dest.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
        .slice(0, 5);
      
      setFilters(prev => ({
        ...prev,
        suggestions: matchingSuggestions,
        showSuggestions: matchingSuggestions.length > 0
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false
      }));
    }
  }, [filters.searchQuery]);

  // Notification des changements
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: value
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: suggestion,
      suggestions: [],
      showSuggestions: false
    }));
    searchInputRef?.blur();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleBudgetToggle = (budgetId: string) => {
    setFilters(prev => ({
      ...prev,
      budgetRange: prev.budgetRange.includes(budgetId)
        ? prev.budgetRange.filter(id => id !== budgetId)
        : [...prev.budgetRange, budgetId]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      budgetRange: [],
      suggestions: [],
      showSuggestions: false
    });
  };

  const hasActiveFilters = filters.searchQuery || filters.categories.length > 0 || filters.budgetRange.length > 0;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #eaeaea'
    }}>
      {/* Barre de recherche avec autocomplétion */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={setSearchInputRef}
            type="text"
            placeholder="Rechercher une destination, ville, pays..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => filters.suggestions.length > 0 && setFilters(prev => ({ ...prev, showSuggestions: true }))}
            onBlur={() => setTimeout(() => setFilters(prev => ({ ...prev, showSuggestions: false })), 150)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#357edd';
              e.target.style.boxShadow = '0 0 0 2px rgba(53, 126, 221, 0.2)';
              if (filters.suggestions.length > 0) {
                setFilters(prev => ({ ...prev, showSuggestions: true }));
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
              e.target.style.boxShadow = 'none';
              setTimeout(() => setFilters(prev => ({ ...prev, showSuggestions: false })), 150);
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            color: '#666',
            pointerEvents: 'none'
          }}>
            🔍
          </div>
        </div>

        {/* Suggestions d'autocomplétion */}
        {filters.showSuggestions && filters.suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            marginTop: '4px'
          }}>
            {filters.suggestions.map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < filters.suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <span style={{ color: '#333' }}>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtres par catégories */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Catégories
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '2px solid',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: filters.categories.includes(category.id) ? '#e3f2fd' : '#f8f9fa',
                color: filters.categories.includes(category.id) ? '#1976d2' : '#666',
                borderColor: filters.categories.includes(category.id) ? '#2196f3' : 'transparent'
              }}
            >
              <span style={{ marginRight: '4px' }}>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par budget */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Budget par jour
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {BUDGET_RANGES.map(budget => (
            <button
              key={budget.id}
              onClick={() => handleBudgetToggle(budget.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '2px solid',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: filters.budgetRange.includes(budget.id) ? '#e8f5e8' : '#f8f9fa',
                color: filters.budgetRange.includes(budget.id) ? '#2e7d32' : '#666',
                borderColor: filters.budgetRange.includes(budget.id) ? '#4caf50' : 'transparent'
              }}
            >
              {budget.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barre d'état et actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid #eaeaea'
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {totalResults} récit{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              fontSize: '14px',
              color: '#357edd',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => e.target.style.color = '#2c5aa0'}
            onMouseLeave={(e) => e.target.style.color = '#357edd'}
          >
            Effacer tous les filtres
          </button>
        )}
      </div>
    </div>
  );
};

export type { FilterState };