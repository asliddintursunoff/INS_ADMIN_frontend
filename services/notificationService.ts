import { apiClient } from '@/lib/apiClient';
import { AttendanceNotification } from '@/types';

export interface GetNotificationsParams {
  st_year_id?: string;
  absence_greater_than?: number;
  major_id?: string;
}

export const notificationService = {
  getNotifications: async (params: GetNotificationsParams): Promise<AttendanceNotification[]> => {
    const response = await apiClient.get<AttendanceNotification[]>('/notifications/attendance', {
      params,
    });
    return response.data;
  },

  markAsSeen: async (attendanceInfoId: string): Promise<void> => {
    await apiClient.post('/notifications/attendance/seen', {
      attendance_info_id: attendanceInfoId,
    });
  },
};
