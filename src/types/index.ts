export interface Admin {
  username: string;
  password: string;
}

export interface Reseller {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  credits: number;
}

export interface Key {
  id: string;
  gameName: 'PUBG MOBILE' | 'LAST ISLAND OF SURVIVAL' | 'STANDOFF2';
  keyValue: string;
  deviceLimit: 1 | 2 | 100;
  expiryDays: number;
  createdAt: string;
  createdBy: string;
}

export interface KeyVerification {
  id: string;
  keyId: string;
  gameName: Key['gameName'];
  deviceIp: string;
  verifiedAt: string;
  expiresAt: string;
}

export interface ApiUsage {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST';
  timestamp: string;
  ip: string;
  success: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Admin | Reseller | null;
  userType: 'admin' | 'reseller' | null;
}