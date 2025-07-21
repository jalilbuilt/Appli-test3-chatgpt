import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from "@/utils/types";

export type { User };

interface UserContextType {
  userConnecte: User | null;
  setUserConnecte: (user: User | null) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType>({
  userConnecte: null,
  setUserConnecte: () => {},
  isLoading: true,
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userConnecte, setUserConnecte] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le localStorage au démarrage
    try {
      const savedUser = localStorage.getItem('userConnecte');
      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        setUserConnecte(user);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetUser = (user: User | null) => {
    setUserConnecte(user);
    if (user) {
      localStorage.setItem('userConnecte', JSON.stringify(user));
    } else {
      localStorage.removeItem('userConnecte');
    }
  };

  return (
    <UserContext.Provider
      value={{
        userConnecte,
        setUserConnecte: handleSetUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};