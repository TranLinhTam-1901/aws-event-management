# AWS Event Management Platform

## Giới thiệu

**AWS Event Management Platform** là hệ thống quản lý sự kiện được xây dựng theo kiến trúc **AWS Serverless Architecture**.

Nền tảng hỗ trợ toàn bộ vòng đời của một sự kiện từ khâu tạo sự kiện, đăng ký tham gia, phát hành vé điện tử QR, điểm danh, cấp chứng nhận đến theo dõi số liệu thống kê sau sự kiện.

### Đối tượng sử dụng

* Trường đại học
* Câu lạc bộ sinh viên
* Trung tâm đào tạo
* Cộng đồng công nghệ
* Doanh nghiệp tổ chức workshop, seminar, training

### Chức năng chính

* Quản lý sự kiện
* Đăng ký tham gia trực tuyến
* Phát hành vé QR Code
* Điểm danh bằng QR Code
* Cấp chứng nhận tham gia
* Gửi email và thông báo tự động
* Dashboard và phân tích dữ liệu

\---

## Kiến trúc tổng thể

```txt
User / Admin
    ↓
CloudFront
    ↓
S3 Static Frontend
    ↓
Cognito
    ↓
API Gateway
    ↓
AWS Lambda
    ↓
DynamoDB
    ↓
SNS / SES / EventBridge
```

Backend được xây dựng theo hướng **Serverless Modular Architecture**, trong đó mỗi Lambda phụ trách một nhóm nghiệp vụ riêng biệt.

\---

## Dịch vụ AWS sử dụng

|Dịch vụ|Vai trò|
|-|-|
|CloudFront|CDN cho Frontend|
|S3|Lưu trữ và host website|
|Cognito|Xác thực và phân quyền|
|API Gateway|Điểm vào của API|
|Lambda|Xử lý nghiệp vụ Backend|
|DynamoDB|Cơ sở dữ liệu NoSQL|
|SES|Gửi email|
|SNS|Gửi thông báo|
|EventBridge|Tác vụ theo lịch|
|CloudWatch|Monitoring và Logging|

\---

## Công nghệ sử dụng

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Ant Design
* Tailwind CSS

### Backend

* .NET 9
* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB

### Cloud Infrastructure

* Amazon S3
* Amazon CloudFront
* Amazon Cognito
* Amazon SES
* Amazon SNS
* Amazon EventBridge
* Amazon CloudWatch

\---

## Ghi chú

Dự án được phát triển với mục tiêu học tập, nghiên cứu và triển khai kiến trúc Serverless trên AWS, đồng thời mô phỏng quy trình quản lý sự kiện thực tế trên nền tảng điện toán đám mây.

