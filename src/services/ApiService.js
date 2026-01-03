import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  // Admin APIs
  async getCandidates() {
    const response = await this.api.get('/admin/candidates');
    return response.data;
  }

  async createCandidate(candidateData) {
    const response = await this.api.post('/admin/create-candidate', candidateData);
    return response.data;
  }

  async uploadTask(formData) {
    const response = await this.api.post('/admin/upload-task', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAdminTasks() {
    const response = await this.api.get('/admin/tasks');
    return response.data;
  }

  // Candidate APIs
  async getCandidateTasks() {
    const response = await this.api.get('/candidate/tasks');
    return response.data;
  }

  async downloadTask(taskId) {
    const response = await this.api.get(`/candidate/download/${taskId}`, {
      responseType: 'blob',
    });
    return response;
  }

  async submitTask(taskId, formData) {
    const response = await this.api.post(`/candidate/submit/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new ApiService();