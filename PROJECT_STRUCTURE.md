# Event Management Project - Cấu Trúc Dự Án

## 📋 Tổng Quan
Event Management là một ứng dụng quản lý sự kiện với kiến trúc **Serverless** trên AWS. Dự án được chia thành 2 phần chính: Backend (BE) và Frontend (FE).

---

## 🏗️ Backend (BE) - Kiến Trúc Serverless

### Công Nghệ Stack
- **Framework**: AWS Lambda (.NET/C#)
- **IaC**: AWS SAM (Serverless Application Model)
- **Template**: `template.yaml`
- **Language**: C# (.NET)

### Cấu Trúc Thư Mục BE

```
BE/
├── EventManagement.Serverless.sln          # Solution chính
├── template.yaml                           # AWS SAM template (định nghĩa infrastructure)
└── src/
    ├── Functions/                          # Các Lambda Functions
    │   ├── EventManagement.AnalyticsLambda/        # Xử lý phân tích dữ liệu
    │   ├── EventManagement.AttendanceCertificateLambda/  # Quản lý chứng chỉ tham dự
    │   ├── EventManagement.EventLambda/            # Quản lý sự kiện
    │   ├── EventManagement.NotificationLambda/     # Gửi thông báo
    │   ├── EventManagement.RegistrationTicketLambda/    # Quản lý vé đăng ký
    │   └── EventManagement.UserProfileLambda/      # Quản lý hồ sơ người dùng
    └── Shared/                             # Code chung, dùng chung cho tất cả Lambda
        ├── EventManagement.Shared.csproj
        ├── Configurations/                 # Cấu hình chung
        ├── Constants/                      # Hằng số
        ├── DTOs/                          # Data Transfer Objects
        ├── Helpers/                       # Hàm trợ giúp
        ├── Models/                        # Domain Models
        ├── Repositories/                  # Data Access Layer
        ├── Services/                      # Business Logic Layer
        └── Validators/                    # Validation Logic
```

### Chi Tiết Các Lambda Functions

| Lambda | Mục Đích | Routes |
|--------|----------|--------|
| **AnalyticsLambda** | Xử lý phân tích, thống kê dữ liệu sự kiện | /analytics/* |
| **AttendanceCertificateLambda** | Quản lý chứng chỉ tham dự, xuất dữ liệu | /certificates/* |
| **EventLambda** | CRUD sự kiện, quản lý thông tin sự kiện | /events/* |
| **NotificationLambda** | Gửi email/thông báo cho người dùng | /notifications/* |
| **RegistrationTicketLambda** | Quản lý đăng ký, vé tham dự | /registrations/* |
| **UserProfileLambda** | Quản lý thông tin cá nhân người dùng | /users/* |

### Shared Layer - Cấu Trúc Chung
- **DTOs**: Định nghĩa các đối tượng truyền dữ liệu (Request/Response)
- **Models**: Các entity domain (Event, User, Registration, etc.)
- **Services**: Business logic (EventService, UserService, etc.)
- **Repositories**: Truy cập database (Pattern Repository)
- **Validators**: Validation rules cho input
- **Helpers**: Utilities, extensions
- **Constants**: Hằng số, enums
- **Configurations**: Settings, configs

---

## 🎨 Frontend (FE) - React + TypeScript

### Công Nghệ Stack
- **Framework**: React 18+ 
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **HTTP Client**: Axios (với `axiosInstance.ts`)
- **Auth**: Cognito (AWS)

### Cấu Trúc Thư Mục FE

```
FE/
├── package.json                    # Dependencies, scripts
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── index.html                     # Entry HTML
├── eslint.config.js              # ESLint configuration
├── public/                        # Static assets
└── src/
    ├── main.tsx                  # Application entry point
    ├── App.tsx                   # Root component
    ├── App.css                   # Global styles
    ├── index.css                 # Global CSS
    ├── assets/                   # Images, icons, etc.
    ├── components/               # React Components (theo feature)
    │   ├── analytics/            # Components phân tích dữ liệu
    │   ├── attendance/           # Components tham dự
    │   ├── auth/                 # Components đăng nhập/đăng ký
    │   ├── certificates/         # Components chứng chỉ
    │   ├── common/               # Shared components (Button, Modal, etc.)
    │   ├── events/               # Components sự kiện
    │   ├── layout/               # Layout components (Header, Sidebar, Footer)
    │   ├── notifications/        # Components thông báo
    │   ├── registrations/        # Components đăng ký
    │   ├── tickets/              # Components vé
    │   └── user/                 # Components hồ sơ người dùng
    ├── pages/                    # Page-level components
    │   ├── admin/                # Admin pages
    │   ├── auth/                 # Auth pages (login, register)
    │   ├── public/               # Public pages
    │   └── user/                 # User pages
    └── services/                 # API Services (Backend integration)
        ├── analyticsService.ts
        ├── attendanceService.ts
        ├── axiosInstance.ts      # Axios config (interceptors, headers)
        ├── certificateService.ts
        ├── cognitoAuthService.ts # AWS Cognito auth
        ├── eventService.ts
        ├── notificationService.ts
        ├── registrationService.ts
        ├── ticketService.ts
        ├── uploadService.ts      # File upload
        └── userProfileService.ts
```

### Component Organization Pattern
- **Feature-based structure**: Các thư mục theo features (events, users, analytics, etc.)
- **Shared components**: `common/` - Button, Modal, Form, etc.
- **Layout components**: `layout/` - Header, Sidebar, Navigation
- **Page-level**: `pages/` - Full page views (Admin, User, Public, Auth)

### Services Pattern
- Mỗi service gọi API endpoint tương ứng
- `axiosInstance.ts`: Centralized Axios config (headers, interceptors, base URL)
- `cognitoAuthService.ts`: Xử lý authentication với AWS Cognito
- `uploadService.ts`: Handle file uploads

---

## 🔄 Luồng Tương Tác FE ↔ BE

```
Frontend (React)
    ↓
    │ HTTP Requests (Axios)
    ↓
API Gateway (AWS)
    ↓
Lambda Functions (BE)
    ↓
Shared Layer (Services, Repositories)
    ↓
Database
    ↑
    │ Response (JSON)
    ↑
Frontend (Display UI)
```

---

## 📊 API Endpoints Structure

| Feature | Lambda | Endpoints |
|---------|--------|-----------|
| **Events** | EventLambda | `/events` (GET, POST, PUT, DELETE) |
| **User Profiles** | UserProfileLambda | `/users` (GET, POST, PUT) |
| **Analytics** | AnalyticsLambda | `/analytics/*` |
| **Notifications** | NotificationLambda | `/notifications` |
| **Registrations** | RegistrationTicketLambda | `/registrations`, `/tickets` |
| **Certificates** | AttendanceCertificateLambda | `/certificates` |

---

## 🔑 Key Components

### Backend
- **Lambda Functions**: Serverless entry points cho mỗi feature
- **DTOs**: Request/Response contracts
- **Services**: Business logic
- **Repositories**: Database access
- **Validators**: Input validation
- **AWS SAM**: Infrastructure as Code

### Frontend
- **React Components**: UI building blocks (theo feature)
- **Services**: API integration layer
- **Axios Instance**: HTTP client with interceptors
- **Cognito Auth**: User authentication
- **Vite**: Fast build & dev server
- **TypeScript**: Type-safe code

---

## 🎯 Design Patterns

### Backend
- **Repository Pattern**: Data access layer abstraction
- **Service Layer**: Business logic separation
- **DTO Pattern**: Data contracts
- **Shared Services**: Code reuse across Lambda functions

### Frontend
- **Component-based**: Reusable React components
- **Service Layer**: API abstraction
- **Feature-based Organization**: Scalable structure
- **Axios Interceptors**: Global error handling, auth tokens

---

## 📝 Notes
- **Serverless**: Mỗi Lambda function là một microservice độc lập
- **Shared Code**: `Shared` project được tái sử dụng bởi tất cả Lambda functions
- **Frontend Routes**: Được định nghĩa bằng React Router (cấu trúc theo pages/)
- **Authentication**: AWS Cognito cho user auth
- **Type Safety**: TypeScript cho FE, C# cho BE

