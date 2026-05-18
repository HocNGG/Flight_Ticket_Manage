# Hướng Dẫn Phân Biệt Role Admin/User — Tài Liệu cho Frontend

## 1. Tổng Quan Hệ Thống Role

Backend có **3 role** được lưu trong DB (bảng `users`, cột `role`):

| Role | Giá trị trong DB | Mô tả |
|------|-----------------|-------|
| **Passenger** (User thường) | `"passenger"` | Đăng ký mới tự động có role này |
| **Admin** | `"admin"` | Phải set thủ công trong DB |
| **Staff** | `"staff"` | Phải set thủ công trong DB |

> [!WARNING]
> **Không có API đăng ký admin.** Admin/Staff phải được tạo thẳng trong database, không thể tự đăng ký qua `/api/auth/register`.

---

## 2. Luồng Đăng Nhập & Cách Lấy Role

### Bước 1: Đăng nhập
```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
```

### Bước 2: Response trả về
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Bước 3: Lấy Role từ `/api/users/me`

> [!IMPORTANT]
> **JWT token KHÔNG chứa role** — `JwtService.java` chỉ đặt `email` vào subject, không đặt role vào claims. FE phải gọi API `/api/users/me` sau khi login để lấy role.

```
GET /api/users/me
Headers: Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "email": "admin@example.com",
    "fullName": "Admin Name",
    "phone": "0123456789"
  }
}
```

> [!WARNING]
> **Vấn đề hiện tại:** Response của `/api/users/me` **CHƯA trả về `role`**! Chỉ trả về `email`, `fullName`, `phone`. Cần BE cập nhật UserDTO để thêm field `role`.

---

## 3. Giải Pháp: BE Cần Cập Nhật

### Thay đổi cần thiết trong BE

`GET /api/users/me` cần trả về `role` trong response:

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "email": "admin@example.com",
    "fullName": "Admin Name",
    "phone": "0123456789",
    "role": "admin"        // ← THÊM FIELD NÀY
  }
}
```

**File cần sửa:** `UserController.java` + DTO tương ứng (UserDTO/UserProfileResponse).

---

## 4. Cách FE Implement (Sau Khi BE Fix)

### AuthContext / useAuth hook

```typescript
// types.ts
export type UserRole = 'passenger' | 'admin' | 'staff';

export interface UserProfile {
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

// useAuth.ts
const login = async (email: string, password: string) => {
  // 1. Đăng nhập lấy tokens
  const { data } = await axios.post('/api/auth/login', { email, password });
  const { accessToken, refreshToken } = data.data;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // 2. Lấy thông tin user + role
  const profileRes = await axios.get('/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const userProfile = profileRes.data.data; // { email, fullName, phone, role }
  
  setUser(userProfile);
  
  // 3. Redirect theo role
  if (userProfile.role === 'admin' || userProfile.role === 'staff') {
    navigate('/admin/dashboard');
  } else {
    navigate('/');
  }
};
```

### Protected Route

```typescript
// ProtectedRoute.tsx
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
};

// App.tsx routing
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin', 'staff']}>
    <AdminLayout />
  </ProtectedRoute>
} />
```

---

## 5. Phân Quyền API — Tóm Tắt Theo Role

### 🟢 PUBLIC (Không cần token)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/auth/verify-email?token=` | Xác thực email |
| POST | `/api/auth/request-password-reset` | Yêu cầu reset pass |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/flights` | Tìm kiếm chuyến bay |
| GET | `/api/flights/{id}` | Chi tiết chuyến bay |
| GET | `/api/flights/{id}/seats` | Sơ đồ ghế |
| GET | `/api/airlines` | Danh sách hãng bay |
| GET | `/api/airports` | Danh sách sân bay |
| GET | `/api/bookings/code/{code}` | Tra cứu booking theo mã |
| GET | `/api/bookings/{id}/detail` | Chi tiết booking (public) |

---

### 🔵 PASSENGER (Cần token, role = "passenger")

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users/me` | Lấy thông tin cá nhân |
| POST | `/api/bookings` | Tạo đặt chỗ |
| GET | `/api/bookings` | Xem booking của mình |
| GET | `/api/bookings/{id}` | Chi tiết booking của mình |
| POST | `/api/bookings/{id}/cancel` | Yêu cầu hủy booking |
| POST | `/api/payments/zalopay/create-url` | Tạo link thanh toán |

---

### 🔴 ADMIN (Cần token, role = "admin")

#### Tất cả quyền của Passenger CỘNG THÊM:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/bookings/search?name={keyword}` | Tìm kiếm booking theo tên/mã |
| PUT | `/api/bookings/{id}/cancel/approve` | Duyệt yêu cầu hủy |
| POST | `/api/flights` | Tạo chuyến bay |
| PUT | `/api/flights/{id}` | Cập nhật chuyến bay |
| DELETE | `/api/flights/{id}` | Xóa chuyến bay |
| POST | `/api/airlines` | Tạo hãng bay |
| PUT | `/api/airlines/{id}` | Cập nhật hãng bay |
| DELETE | `/api/airlines/{id}` | Xóa hãng bay |
| POST | `/api/airports` | Tạo sân bay |
| PUT | `/api/airports/{id}` | Cập nhật sân bay |
| DELETE | `/api/airports/{id}` | Xóa sân bay |
| POST | `/api/aircrafts` | Tạo máy bay |
| PUT | `/api/aircrafts/{id}` | Cập nhật máy bay |
| DELETE | `/api/aircrafts/{id}` | Xóa máy bay |
| POST/PUT/DELETE | `/api/routes/**` | Quản lý tuyến bay |
| POST/PUT/DELETE | `/api/seats/**` | Quản lý ghế |
| POST/PUT/DELETE | `/api/seat-classes/**` | Quản lý hạng ghế |

---

### 🟡 STAFF (Cần token, role = "staff")

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| PUT | `/api/bookings/{id}/cancel/approve` | Duyệt yêu cầu hủy |

---

## 6. Lưu Ý Quan Trọng Về Security Hiện Tại

> [!CAUTION]
> **SecurityConfig hiện tại đang `permitAll()` hầu hết các endpoint!** BE chưa thực sự enforce role ở tầng HTTP. 
> 
> Điều này có nghĩa là về mặt kỹ thuật, một user thường vẫn có thể gọi API admin (nếu biết URL). Tuy nhiên, **FE vẫn nên implement route guard đúng cách** để đảm bảo UX và chuẩn bị cho khi BE enforce role đầy đủ.

```java
// SecurityConfig.java hiện tại — chưa phân quyền theo role
.requestMatchers("/api/flights/**").permitAll()  // Cả POST/PUT/DELETE đều public!
.requestMatchers("/api/bookings/**").permitAll()
// ...
```

---

## 7. Flow Hoàn Chỉnh Cho FE

```
User nhập email/password
        ↓
POST /api/auth/login
        ↓
Lưu accessToken + refreshToken vào localStorage
        ↓
GET /api/users/me (kèm Authorization header)
        ↓
Lưu { email, fullName, phone, role } vào Context/Store
        ↓
┌─────────────────────────────────────┐
│ role === "admin" || "staff"          │ → Redirect /admin/dashboard
│ role === "passenger"                 │ → Redirect / (trang chủ)
└─────────────────────────────────────┘
        ↓
Route guard check role trước mỗi trang admin
```

---

## 8. Checklist Để FE Hoạt Động Đúng

- [ ] **BE cần sửa:** Thêm `role` vào response của `GET /api/users/me`
- [ ] FE: Sau login, gọi ngay `/api/users/me` để lấy role
- [ ] FE: Lưu `{ accessToken, refreshToken, userProfile }` vào state/localStorage
- [ ] FE: Implement `ProtectedRoute` component check role
- [ ] FE: Redirect admin/staff → `/admin/dashboard`, passenger → `/`
- [ ] FE: Ẩn/hiện menu items dựa trên `user.role`
- [ ] FE: Khi token hết hạn → dùng refreshToken hoặc redirect về `/login`
