// Authentication Types
export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  manager: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

// Risk Types
export interface Risk {
  id: number;
  projectId: string;
  stt: number; // STT - Số thứ tự
  name: string; // Tên rủi ro
  what: string; // WHAT - Nội dung rủi ro
  when: string; // WHEN - Khi nào xảy ra
  how: string; // HOW - Nguyên nhân
  solution: string; // SOLUTION - Giải pháp
  lastUpdated: string;
}

export interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

export interface Stats {
  total: number;
  critical: number;
  high: number;
  avgRiskScore: string;
}

export interface FormData {
  stt: number;
  name: string;
  what: string;
  when: string;
  how: string;
  solution: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  manager: string;
  budget: number;
}
