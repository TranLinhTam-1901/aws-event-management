import React, { useState, useEffect } from 'react';
import { AppButton } from '../common/AppButton';
import { EventBannerUpload } from './EventBannerUpload';
import { useNavigate, useParams } from "react-router-dom";
import eventService from "../../services/eventService";
import categoryService from "../../services/categoryService";
import type { EventCreateRequest, Event } from "../../services/eventService";
import type { Category } from "../../services/categoryService";
import { getEventBannerSrc } from '../../utils/eventStatusUtils';

const toDatetimeLocalValue = (value: string): string => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toUtcISOString = (value: string): string => {
  if (!value) {
    return value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export const EventForm: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EventCreateRequest>({
    title: "",
    description: "",
    location: "",
    bannerUrl: "",
    category: "",
    categoryId: "",
    speakerName: "",
    prerequisites: "",
    requiredTools: "",
    startTime: "",
    endTime: "",
    maxSlots: 1,
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [registeredCount, setRegisteredCount] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAdminCategories();
        setCategories(data.filter((item) => item.isActive));
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const event: Event = await eventService.getAdminEventById(eventId);
        setFormData({
          title: event.title,
          description: event.description,
          location: event.location,
          bannerUrl: event.bannerUrl,
          category: event.category,
          categoryId: event.categoryId,
          speakerName: event.speakerName,
          prerequisites: event.prerequisites,
          requiredTools: event.requiredTools,
          startTime: toDatetimeLocalValue(event.startTime),
          endTime: toDatetimeLocalValue(event.endTime),
          maxSlots: event.maxSlots,
        });
        setRegisteredCount(event.registeredCount);
        setPreviewUrl(getEventBannerSrc(event));
      } catch (error) {
        console.error(error);
        alert("Tải sự kiện để chỉnh sửa không thành công.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      const selected = categories.find((item) => item.categoryId === value);
      setFormData({
        ...formData,
        categoryId: value,
        category: selected?.name ?? '',
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: name === 'maxSlots' ? Number(value) : value,
    });
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    setPreviewUrl(formData.bannerUrl ? getEventBannerSrc({ bannerUrl: formData.bannerUrl }) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerUrl = formData.bannerUrl;

      if (selectedFile) {
        const uploadInfo = await eventService.getBannerUploadUrl(
          selectedFile.type,
          eventId
        );
        await eventService.uploadBannerToS3(uploadInfo.uploadUrl, selectedFile);
        bannerUrl = uploadInfo.bannerUrl;
      }

      const payload = {
        ...formData,
        bannerUrl,
        startTime: toUtcISOString(formData.startTime),
        endTime: toUtcISOString(formData.endTime),
      };

      if (eventId) {
        await eventService.updateEvent(eventId, payload);
        alert("Cập nhật sự kiện thành công!");
      } else {
        await eventService.createEvent(payload);
        alert("Tạo sự kiện thành công!");
      }

      navigate("/admin/events");
    } catch (error) {
      console.error(error);
      alert("Lưu sự kiện không thành công.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tiêu đề sự kiện"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Mô tả sự kiện"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Địa điểm tổ chức"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ảnh banner
        </label>
        <EventBannerUpload
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>
        {!categories.length && (
          <p className="text-sm text-amber-600 mt-1">
            Chưa có danh mục hoạt động. Tạo danh mục trước.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên diễn giả</label>
        <input
          type="text"
          name="speakerName"
          value={formData.speakerName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tên diễn giả"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu trước</label>
        <textarea
          name="prerequisites"
          value={formData.prerequisites}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Những điều cần biết trước khi tham gia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Công cụ cần thiết</label>
        <textarea
          name="requiredTools"
          value={formData.requiredTools}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Công cụ hoặc phần mềm cần sử dụng"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tối đa</label>
        <input
          type="number"
          name="maxSlots"
          value={formData.maxSlots}
          onChange={handleChange}
          min={eventId ? Math.max(registeredCount, 1) : 1}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Số lượng chỗ ngồi tối đa"
        />
        {eventId && registeredCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Đã có {registeredCount} người đăng ký — số slot tối thiểu là {registeredCount}.
          </p>
        )}
      </div>

      <AppButton variant="primary" type="submit" disabled={loading}>
        {loading
          ? 'Đang lưu...'
          : eventId
            ? 'Cập nhật sự kiện'
            : 'Tạo sự kiện'}
      </AppButton>
    </form>
  );
};
