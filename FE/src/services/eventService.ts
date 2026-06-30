import axiosInstance from './axiosInstance';
import axios from 'axios';

export interface Event {
  eventId: string;
  title: string;
  description: string;
  location: string;

  startTime: string;
  endTime: string;

  status: string;
  isVisible: boolean;
  bannerUrl: string;
  bannerDisplayUrl: string;

  category: string;
  categoryId: string;
  speakerName: string;
  prerequisites: string;
  requiredTools: string;

  maxSlots: number;
  registeredCount: number;
  availableSlots: number;
  isFull: boolean;
}

export interface EventCreateRequest {
  title: string;
  description: string;
  location: string;

  startTime: string;
  endTime: string;

  bannerUrl: string;

  category: string;
  categoryId: string;

  speakerName: string;
  prerequisites: string;
  requiredTools: string;

  maxSlots: number;
}

interface BackendEvent {
  EventId?: string;
  Title?: string;
  Description?: string;
  Location?: string;
  StartTime?: string;
  EndTime?: string;
  Status?: string;
  IsVisible?: boolean;
  BannerUrl?: string;
  BannerDisplayUrl?: string;
  Category?: string;
  CategoryId?: string;
  SpeakerName?: string;
  Prerequisites?: string;
  RequiredTools?: string;
  MaxSlots?: number;
  RegisteredCount?: number;
  AvailableSlots?: number;
  IsFull?: boolean;
}

class EventService {
  private normalizeEvent(raw: BackendEvent & Partial<Event>): Event {
    const maxSlots = raw.maxSlots ?? raw.MaxSlots ?? 0;
    const registeredCount = raw.registeredCount ?? raw.RegisteredCount ?? 0;
    const bannerUrl = raw.bannerUrl ?? raw.BannerUrl ?? '';
    const bannerDisplayUrl =
      raw.bannerDisplayUrl ??
      raw.BannerDisplayUrl ??
      bannerUrl;

    return {
      eventId: raw.eventId ?? raw.EventId ?? '',
      title: raw.title ?? raw.Title ?? '',
      description: raw.description ?? raw.Description ?? '',
      location: raw.location ?? raw.Location ?? '',
      startTime: raw.startTime ?? raw.StartTime ?? '',
      endTime: raw.endTime ?? raw.EndTime ?? '',
      status: raw.status ?? raw.Status ?? '',
      isVisible: raw.isVisible ?? raw.IsVisible ?? true,
      bannerUrl,
      bannerDisplayUrl,
      category: raw.category ?? raw.Category ?? '',
      categoryId: raw.categoryId ?? raw.CategoryId ?? '',
      speakerName: raw.speakerName ?? raw.SpeakerName ?? '',
      prerequisites: raw.prerequisites ?? raw.Prerequisites ?? '',
      requiredTools: raw.requiredTools ?? raw.RequiredTools ?? '',
      maxSlots,
      registeredCount,
      availableSlots:
        raw.availableSlots ??
        raw.AvailableSlots ??
        Math.max(maxSlots - registeredCount, 0),
      isFull: raw.isFull ?? raw.IsFull ?? registeredCount >= maxSlots,
    };
  }

  private normalizeEvents(raw: unknown): Event[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((item) => this.normalizeEvent(item));
  }

  async getPublicEvents(): Promise<Event[]> {
    const response = await axiosInstance.get('/events');

    return this.normalizeEvents(response.data);
  }

  async getAdminEvents(): Promise<Event[]> {
    const response = await axiosInstance.get('/admin/events');

    return this.normalizeEvents(response.data);
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await axiosInstance.get(`/events/${eventId}`);

    return this.normalizeEvent(response.data);
  }

  async getAdminEventById(eventId: string): Promise<Event> {
    const response = await axiosInstance.get(`/admin/events/${eventId}`);

    return this.normalizeEvent(response.data);
  }

  async createEvent(data: EventCreateRequest): Promise<Event> {
    const response = await axiosInstance.post('/admin/events', data);

    return this.normalizeEvent(response.data);
  }

  async updateEvent(
    eventId: string,
    data: EventCreateRequest
  ): Promise<Event> {
    const response = await axiosInstance.put(
      `/admin/events/${eventId}`,
      data
    );

    return this.normalizeEvent(response.data);
  }

  async setEventVisibility(
    eventId: string,
    isVisible: boolean
  ): Promise<void> {
    await axiosInstance.patch(`/admin/events/${eventId}/visibility`, {
      isVisible,
    });
  }

  async getBannerUploadUrl(
    contentType: string,
    eventId?: string
  ): Promise<{ uploadUrl: string; bannerUrl: string }> {
    const response = await axiosInstance.get('/admin/events/banner-upload-url', {
      params: { contentType, eventId },
    });

    return {
      uploadUrl: response.data.uploadUrl ?? response.data.UploadUrl,
      bannerUrl: response.data.bannerUrl ?? response.data.BannerUrl,
    };
  }

  async uploadBannerToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    });
  }
}

export default new EventService();
