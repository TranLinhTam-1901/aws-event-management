import axiosInstance from "./axiosInstance";

// Cấu trúc chuẩn hóa khớp 100% với JSON camelCase từ AWS Lambda trả về
export interface Ticket {
  ticketId: string;
  eventId: string;
  userId: string;
  userEmail: string;       
  userFullName: string;    
  createdAt: string;
  status: string;
  eventTitle?: string;
}

export const ticketService = {
  // Đăng ký vé: POST /events/{eventId}/register
  registerTicket: async (eventId: string): Promise<Ticket> => {
    // Ép kiểu trực tiếp theo chuẩn camelCase trả về từ BE
    const response = await axiosInstance.post<{ message: string; ticketId: Ticket }>(
      `/events/${eventId}/register`,
    );
    
    // Kiểm tra và Log để debug nếu cấu trúc trả về bị bọc hoặc phẳng
    console.log("Xử lý Đăng ký - Response Data:", response.data);

    if (!response.data || !response.data.ticketId) {
      throw new Error("Cấu trúc phản hồi API không hợp lệ, thiếu object 'ticket'");
    }

    return response.data.ticketId;
  },

  // Lấy danh sách vé: GET /my-tickets
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await axiosInstance.get<Ticket[]>("/my-tickets");
    
    console.log("Xử lý Danh sách - Response Data:", response.data);

    if (!Array.isArray(response.data)) return [];
    return response.data;
  },
};