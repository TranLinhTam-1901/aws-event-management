export type NormalizedEventStatus = 'Active' | 'Ended' | 'Cancelled' | 'Draft';

export const normalizeEventStatus = (status: string): NormalizedEventStatus => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'Active';
    case 'ENDED':
      return 'Ended';
    case 'CANCELLED':
      return 'Cancelled';
    case 'DRAFT':
      return 'Draft';
    default:
      return 'Active';
  }
};

export const getEventStatusLabel = (status: string): string => {
  switch (normalizeEventStatus(status)) {
    case 'Active':
      return 'Active';
    case 'Ended':
      return 'Ended';
    case 'Cancelled':
      return 'Cancelled';
    case 'Draft':
      return 'Draft';
    default:
      return status;
  }
};

export const getEventStatusBadgeClass = (status: string): string => {
  switch (normalizeEventStatus(status)) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Ended':
      return 'bg-gray-100 text-gray-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const canRegisterForEvent = (
  status: string,
  isFull: boolean,
  isAlreadyRegistered = false
): boolean =>
  normalizeEventStatus(status) === 'Active' && !isFull && !isAlreadyRegistered;

export const REGISTRATION_MESSAGES = {
  ended: 'Sự kiện đã kết thúc. Không thể đăng ký.',
  cancelled: 'Sự kiện đã bị hủy. Không thể đăng ký.',
  full: 'Sự kiện đã hết slot đăng ký.',
  alreadyRegistered: 'Bạn đã đăng ký sự kiện này rồi.',
  unavailable: 'Đăng ký hiện không khả dụng.',
  success: 'Đăng ký thành công! Bạn có thể xem vé tại trang Vé của tôi.',
} as const;

export const canAdminToggleVisibility = (status: string): boolean =>
  normalizeEventStatus(status) === 'Active';

export const getEventBannerSrc = (event: {
  bannerDisplayUrl?: string;
  bannerUrl?: string;
}): string => event.bannerDisplayUrl || event.bannerUrl || '';
