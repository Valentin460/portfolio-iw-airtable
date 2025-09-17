// Types pour les projets
export interface Project {
  id: string;
  airtableId: number;
  title: string;
  description: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  picture?: string | null;
}

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour l'authentification
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

// Types pour le contexte d'authentification
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isLoading: boolean;
}
