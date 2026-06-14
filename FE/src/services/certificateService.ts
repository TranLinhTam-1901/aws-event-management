import axiosInstance from './axiosInstance';

export interface Certificate {
  certificateId: string;
  eventId: string;
  ticketId: string;
  userId: string;
  fullName: string;
  email: string;
  certificateUrl: string;
  status: string;
  generatedAt: string;
  eventTitle?: string;
}

export interface CreateCertificateRequest {
  eventId: string;
  ticketId: string;
}

class CertificateService {
  async getUserCertificates(): Promise<Certificate[]> {
    const response = await axiosInstance.get('/users/me/certificates');
    return response.data;
  }

  async getCertificateById(certificateId: string): Promise<Certificate> {
    const response = await axiosInstance.get(`/certificates/${certificateId}`);
    return response.data;
  }

  async createCertificate(data: CreateCertificateRequest): Promise<Certificate> {
    const response = await axiosInstance.post('/admin/events/:eventId/certificates', data);
    return response.data;
  }

  async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async generateEventCertificates(eventId: string): Promise<void> {
    await axiosInstance.post(`/admin/events/${eventId}/generate-certificates`);
  }
}

export default new CertificateService();
