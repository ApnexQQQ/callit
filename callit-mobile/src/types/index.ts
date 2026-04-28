export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  user: User;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  category: string;
  predictionText: string;
  outcomeDate: string;
  status: 'pending' | 'resolved_true' | 'resolved_false';
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  predictionId: string;
  text: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
