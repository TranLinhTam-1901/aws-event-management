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

export interface Ticket {
  ticketId: string;
  eventId: string;
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

class RegistrationService {
  async registerEvent(eventId: string, data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post(`/events/${eventId}/register`, data);
    return {
      registrationId: response.data.registrationId ?? response.data.RegistrationId ?? '',
      ticketId: response.data.ticketId ?? response.data.TicketId ?? '',
      status: response.data.status ?? response.data.Status ?? '',
      message: response.data.message ?? response.data.Message ?? '',
    };
  }

  async getMyTickets(): Promise<Ticket[]> {
    const response = await axiosInstance.get('/my-tickets');
    const raw = Array.isArray(response.data) ? response.data : [];

    return raw.map((item: Record<string, string>) => ({
      ticketId: item.ticketId ?? item.TicketId ?? '',
      eventId: item.eventId ?? item.EventId ?? '',
      registrationId: item.registrationId ?? item.RegistrationId ?? '',
      fullName: item.fullName ?? item.FullName ?? '',
      email: item.email ?? item.Email ?? '',
      phone: item.phone ?? item.Phone ?? '',
      status: item.status ?? item.Status ?? '',
      createdAt: item.createdAt ?? item.CreatedAt ?? '',
    }));
  }

  async hasRegisteredForEvent(eventId: string): Promise<boolean> {
    const tickets = await this.getMyTickets();
    return tickets.some(
      (ticket) =>
        ticket.eventId === eventId &&
        ticket.status.toLowerCase() !== 'cancelled'
    );
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
