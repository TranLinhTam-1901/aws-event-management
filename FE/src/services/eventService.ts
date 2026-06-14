import axiosInstance from './axiosInstance';

export interface Event {
  eventId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  availableSlots: number;
  bannerUrl: string;
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// export interface EventCreateRequest {
//   title: string;
//   description: string;
//   location: string;
//   startTime: string;
//   endTime: string;
//   totalSlots: number;
// }

class eventService {
  async getPublicEvents(): Promise<Event[]> {
    const response = await axiosInstance.get('/events');
    
    return response.data;
  }

  // async getEventById(eventId: string): Promise<Event> {
  //   const response = await axiosInstance.get(`/events/${eventId}`);
  //   return response.data;
  // }

  // async createEvent(data: EventCreateRequest): Promise<Event> {
  //   const response = await axiosInstance.post('/admin/events', data);
  //   return response.data;
  // }

  // async updateEvent(eventId: string, data: EventCreateRequest): Promise<Event> {
  //   const response = await axiosInstance.put(`/admin/events/${eventId}`, data);
  //   return response.data;
  // }

  // async deleteEvent(eventId: string): Promise<void> {
  //   await axiosInstance.delete(`/admin/events/${eventId}`);
  // }

  // async updateEventStatus(eventId: string, status: string): Promise<void> {
  //   await axiosInstance.patch(`/admin/events/${eventId}/status`, { status });
  // }

  // async uploadBanner(eventId: string, file: File): Promise<string> {
  //   const formData = new FormData();
  //   formData.append('file', file);
    
  //   const response = await axiosInstance.post(
  //     `/admin/events/${eventId}/banner`,
  //     formData,
  //     { headers: { 'Content-Type': 'multipart/form-data' } }
  //   );
    
  //   return response.data.bannerUrl;
  // }
}

export default new eventService();
