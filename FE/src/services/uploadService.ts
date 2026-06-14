import axiosInstance from './axiosInstance';

export interface UploadResponse {
  url: string;
  message: string;
}

class UploadService {
  async uploadFile(file: File, uploadType: 'banner' | 'certificate' | 'document'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  }

  async uploadEventBanner(eventId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      `/admin/events/${eventId}/banner`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data.bannerUrl;
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url;
  }
}

export default new UploadService();
