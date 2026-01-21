import axios, { AxiosInstance } from 'axios';
import { 
  User, 
  LoginResponse, 
  Student, 
  StudentFormData,
  Trainer,
  TrainerFormData,
  Course,
  CourseFormData,
  Registration,
  RegistrationFormData,
  Grade,
  GradeFormData
} from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/logout');
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/etudiants');
    return response.data;
  },
  
  getById: async (id: number): Promise<Student> => {
    const response = await api.get(`/etudiants/${id}`);
    return response.data;
  },
  
  create: async (data: StudentFormData): Promise<Student> => {
    const response = await api.post('/etudiants', data);
    return response.data;
  },
  
  update: async (id: number, data: StudentFormData): Promise<Student> => {
    const response = await api.put(`/etudiants/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/etudiants/${id}`);
  },
};

// Trainers API
export const trainersApi = {
  getAll: async (): Promise<Trainer[]> => {
    const response = await api.get('/formateurs');
    return response.data;
  },
  
  getById: async (id: number): Promise<Trainer> => {
    const response = await api.get(`/formateurs/${id}`);
    return response.data;
  },
  
  create: async (data: TrainerFormData): Promise<Trainer> => {
    const response = await api.post('/formateurs', data);
    return response.data;
  },
  
  update: async (id: number, data: TrainerFormData): Promise<Trainer> => {
    const response = await api.put(`/formateurs/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/formateurs/${id}`);
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get('/cours');
    return response.data;
  },
  
  getById: async (id: number): Promise<Course> => {
    const response = await api.get(`/cours/${id}`);
    return response.data;
  },
  
  create: async (data: CourseFormData): Promise<Course> => {
    const response = await api.post('/cours', data);
    return response.data;
  },
  
  update: async (id: number, data: CourseFormData): Promise<Course> => {
    const response = await api.put(`/cours/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/cours/${id}`);
  },
};

// Registrations API
export const registrationsApi = {
  getAll: async (): Promise<Registration[]> => {
    const response = await api.get('/inscriptions');
    return response.data;
  },
  
  create: async (data: RegistrationFormData): Promise<Registration> => {
    const response = await api.post('/inscriptions', data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<RegistrationFormData>): Promise<Registration> => {
    const response = await api.put(`/inscriptions/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inscriptions/${id}`);
  },
};

// Grades API
export const gradesApi = {
  getAll: async (): Promise<Grade[]> => {
    const response = await api.get('/notes');
    return response.data;
  },
  
  create: async (data: GradeFormData): Promise<Grade> => {
    const response = await api.post('/notes', data);
    return response.data;
  },
  
  update: async (id: number, data: GradeFormData): Promise<Grade> => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

export default api;
