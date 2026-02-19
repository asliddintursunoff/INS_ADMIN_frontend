import { apiClient } from '@/lib/apiClient';
import { LoginResponse, SuperUser } from '@/types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post<LoginResponse>('/superuser/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getMe: async (): Promise<SuperUser> => {
    const response = await apiClient.get<SuperUser>('/superuser/me');
    return response.data;
  },
};
