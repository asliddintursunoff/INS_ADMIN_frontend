import { apiClient } from '@/lib/apiClient';
import { SuperUser, GroupType, AcademicYear, MatrixData } from '@/types';

export const superUserService = {
  getSuperUsers: async (): Promise<SuperUser[]> => {
    const response = await apiClient.get<SuperUser[]>('/superuser/super-users');
    return response.data;
  },

  getSuperUser: async (userId: string): Promise<SuperUser> => {
    const response = await apiClient.get<SuperUser>(`/superuser/super-user`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  deleteSuperUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/superuser/super-user`, {
      params: { user_id: userId },
    });
  },

  register: async (data: any): Promise<void> => {
    await apiClient.post('/superuser/register', data);
  },

  getMatrix: async (program: GroupType, year: AcademicYear): Promise<MatrixData> => {
    const response = await apiClient.get<MatrixData>('/superuser/matrix', {
      params: { program, year },
    });
    return response.data;
  },

  getMatrixExcel: async (program: GroupType, year: AcademicYear): Promise<Blob> => {
    const response = await apiClient.get('/superuser/matrix/excel', {
      params: { program, year },
      responseType: 'blob',
    });
    return response.data;
  },
};
