# EventFunction Progress

## Mục tiêu
- Đồng bộ cấu hình API Gateway cho EventFunction với các route hiện có trong Lambda handler và frontend.
- Giữ nguyên cấu trúc Serverless hiện tại trong template.yaml.

## Phân tích hiện trạng
- Handler của Event Lambda hỗ trợ các route:
  - GET /events
  - GET /events/{eventId}
  - POST /admin/events
  - PUT /admin/events/{eventId}
  - DELETE /admin/events/{eventId}
  - PATCH /admin/events/{eventId}/status
- Frontend đang gọi đúng các endpoint trên, nên cần expose các endpoint này trong template.

## Thay đổi đã thực hiện
- Bổ sung các event API cho EventFunction trong template.yaml:
  - GetEvents
  - GetEventById
  - CreateEvent
  - UpdateEvent
  - DeleteEvent
  - UpdateEventStatus
- Đặt GET /events và GET /events/{eventId} là public bằng cách tắt authorizer.
- Giữ các route admin mặc định dùng Cognito authorizer từ Globals.

## Ghi chú
- Nếu sau này cần route riêng cho public admin hoặc phân quyền chi tiết hơn, có thể thay đổi Auth ở từng event.
- Nên deploy lại stack bằng SAM để API Gateway cập nhật route mới.
