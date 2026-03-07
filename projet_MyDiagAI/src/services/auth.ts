// Authentication Service for Flask backend

const API_BASE_URL =  'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && (data.message || data.error) ? (data.message || data.error) : 'Identifiants incorrects';
    throw new Error(message);
  }

  // Persist auth data
  if (data && data.token) {
    localStorage.setItem('authToken', data.token);
  }
  if (data && data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data as AuthResponse;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result && (result.message || result.error) ? (result.message || result.error) : 'Erreur lors de l\'inscription';
    throw new Error(message);
  }

  if (result && result.token) {
    localStorage.setItem('authToken', result.token);
  }
  if (result && result.user) {
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  return result as AuthResponse;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
