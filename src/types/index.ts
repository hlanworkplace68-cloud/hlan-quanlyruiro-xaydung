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
  severity?: 'low' | 'medium' | 'high' | 'critical'; // Mức độ nghiêm trọng
  probability?: number; // 0-1
  impact?: number; // 1-10
  riskScore?: number; // probability * impact
  status?: 'active' | 'monitored' | 'resolved';
  lastUpdated: string;
  createdAt: string;
  createdBy?: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  riskId?: number;
  userId: string;
  username: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'risk' | 'project';
  entityName: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  timestamp: string;
  ipAddress?: string;
}

export interface AlertRule {
  id: string;
  projectId: string;
  name: string;
  condition: 'high_risk_count' | 'critical_risk' | 'risk_not_resolved' | 'severity_threshold';
  threshold: number;
  enabled: boolean;
  notificationChannels: ('in_app' | 'email' | 'sms' | 'telegram')[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'error';
  read: boolean;
  riskId?: number;
  projectId?: string;
  timestamp: string;
  actions?: {
    label: string;
    url: string;
  }[];
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
