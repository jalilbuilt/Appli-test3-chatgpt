import React, { useState, useEffect } from 'react';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
}

export interface FilterState {
  searchQuery: string;
  categories: string[];
  budgetRange: string[];
  suggestions: string[];
  showSuggestions: boolean;
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

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, totalResults }) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    budgetRange: [],
    suggestions: [],
    showSuggestions: false
  });

  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Barre de recherche avec autocomplétion */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            ref={setSearchInputRef}
            type="text"
            placeholder="Rechercher une destination, ville, pays..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => filters.suggestions.length > 0 && setFilters(prev => ({ ...prev, showSuggestions: true }))}
            onBlur={() => setTimeout(() => setFilters(prev => ({ ...prev, showSuggestions: false })), 150)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Suggestions d'autocomplétion */}
        {filters.showSuggestions && filters.suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            {filters.suggestions.map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <span className="text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtres par catégories */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.categories.includes(category.id)
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par budget */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Budget par jour</h3>
        <div className="flex flex-wrap gap-2">
          {BUDGET_RANGES.map(budget => (
            <button
              key={budget.id}
              onClick={() => handleBudgetToggle(budget.id)}
              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.budgetRange.includes(budget.id)
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {budget.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barre d'état et actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {totalResults} récit{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Effacer tous les filtres
          </button>
        )}
      </div>
    </div>
  );
};