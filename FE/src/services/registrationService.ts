import axiosInstance from './axiosInstance';

export interface Registration {
  registrationId: string;
  eventId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
}

export interface RegisterResponse {
  registrationId: string;
  ticketId: string;
  status: string;
  message: string;
}

class RegistrationService {
  async registerEvent(eventId: string, data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post(`/events/${eventId}/register`, data);
    return response.data;
  }

  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    const response = await axiosInstance.get(`/admin/events/${eventId}/registrations`);
    return response.data;
  }

  async getRegistrationById(registrationId: string): Promise<Registration> {
    const response = await axiosInstance.get(`/registrations/${registrationId}`);
    return response.data;
  }
}

export default new RegistrationService();
