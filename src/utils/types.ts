export interface User {
  id: string;
  pseudo: string;
  email: string;
  dateInscription?: string;
}

export interface BonPlan {
  id: string;
  titre: string;
  ville?: string;
  pays?: string;
  contenu: string;
  imageUrl?: string;
  images?: string[];
  auteur?: User;
  dateCreation: string;
  likes?: string[];
  rating?: number;
  views?: number;
  comments?: any[];
  type?: string;
  budget?: number;
  duree?: string;
  description?: string;
  categories?: string[];
}

export interface SOSRequest {
  id: string;
  userId: string;
  userName: string;
  userPseudo: string;
  message: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  category: string;
  status: 'active' | 'helped' | 'resolved';
  responses?: SOSResponse[];
  helpers?: any[];
}

export interface SOSResponse {
  id: string;
  helperId: string;
  helperPseudo: string;
  message: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  isExpert?: boolean;
}