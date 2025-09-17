import { Project, User, AuthResponse, LoginData, RegisterData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }


  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(loginData)
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(registerData)
    });
    return this.handleResponse<AuthResponse>(response);
  }


  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ user: User }>(response);
  }

  async updateProfile(userData: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<{ message: string; user: User }>(response);
  }

  async deleteAccount(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }


  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Project[]>(response);
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Project>(response);
  }

  async searchProjects(keywords: string): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects/search/${encodeURIComponent(keywords)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Project[]>(response);
  }


  async likeProject(projectId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async unlikeProject(projectId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/like`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }


  async healthCheck(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return this.handleResponse<{ message: string; timestamp: string }>(response);
  }
}

export const apiService = new ApiService();
