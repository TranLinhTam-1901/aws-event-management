import axiosInstance from './axiosInstance';

export interface Ticket {
  ticketId: string;
  eventId: string;
  registrationId: string;
  userId: string;
  fullName: string;
  email: string;
  status: string;
  qrCodeUrl: string;
  createdAt: string;
  eventTitle?: string;
  eventStartTime?: string;
}

class TicketService {
  async getUserTickets(): Promise<Ticket[]> {
    const response = await axiosInstance.get('/users/me/tickets');
    return response.data;
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    const response = await axiosInstance.get(`/tickets/${ticketId}`);
    return response.data;
  }

  async lookupTicket(ticketId: string): Promise<Ticket> {
    const response = await axiosInstance.get(`/admin/tickets/${ticketId}`);
    return response.data;
  }

  async downloadQRCode(ticketId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/tickets/${ticketId}/qr`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new TicketService();
