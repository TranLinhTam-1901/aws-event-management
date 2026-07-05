import axiosInstance from './axiosInstance'; // Chỉnh lại đường dẫn đúng vị trí thật

export interface EventListItem {
  eventId: string;
  title: string;
  startTime: string;
  status: string;
}

export const getAdminEvents = async (): Promise<EventListItem[]> => {
  const response = await axiosInstance.get('/admin/events');
  // API của EventLambda trả EventResponseDto[] với field PascalCase gốc từ C#,
  // nhưng axios/JSON.parse tự nhận đúng key JSON thật trả về (camelCase nếu backend serialize camelCase).
  // Nếu field không khớp (ví dụ EventId thay vì eventId), cần map lại ở đây.
  return response.data;
};