export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Metric {
  id: string;
  source: string;
  name: string;
  value: number;
  unit?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  source: string;
  metricName: string;
  threshold: number;
  triggeredValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  message: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}
